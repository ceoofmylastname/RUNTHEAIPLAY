import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getPrisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";

export const runtime = "edge";

// ─────────────────────────────────────────────────────────
// Funnel v2 payload — matches the 5-step application funnel
// ─────────────────────────────────────────────────────────
type Payload = {
  contact?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  answers?: {
    role?: string;
    aiUse?: string;
    primaryPlatform?: string;
    monthlyRevenue?: string;
    aiExperience?: string;
    biggestBlocker?: string;
    whyIn?: string;
    referralSource?: string;
    referralName?: string;
  };
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// At least 20 chars for the long-form textareas (matches client-side validation)
const MIN_LONGFORM = 20;

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return bad("Invalid JSON payload.");
  }

  const c = body.contact ?? {};
  const a = body.answers ?? {};

  // ── Contact validation ──
  const firstName = c.firstName?.trim();
  const lastName = c.lastName?.trim();
  const email = c.email?.trim().toLowerCase();
  const phone = c.phone?.trim();

  if (!firstName || !lastName) return bad("First and last name are required.");
  if (!email || !EMAIL_RE.test(email)) return bad("Valid email required.");
  if (!phone || phone.replace(/\D/g, "").length < 10) {
    return bad("Phone must be 10+ digits.");
  }

  // ── Application validation ──
  const role = a.role?.trim();
  const aiUse = a.aiUse?.trim();
  const primaryPlatform = a.primaryPlatform?.trim();
  const monthlyRevenue = a.monthlyRevenue?.trim();
  const aiExperience = a.aiExperience?.trim();
  const biggestBlocker = a.biggestBlocker?.trim();
  const whyIn = a.whyIn?.trim();
  const referralSource = a.referralSource?.trim();
  const referralName = a.referralName?.trim() || null;

  if (!role) return bad("Role/title required.");
  if (!aiUse || aiUse.length < MIN_LONGFORM) {
    return bad("AI use answer too short — please describe in more detail.");
  }
  if (!primaryPlatform) return bad("Pick your primary platform.");
  if (!monthlyRevenue) return bad("Pick your revenue band.");
  if (!aiExperience) return bad("Pick your AI experience.");
  if (!biggestBlocker || biggestBlocker.length < MIN_LONGFORM) {
    return bad("Biggest blocker answer too short — please describe in more detail.");
  }
  if (!whyIn || whyIn.length < MIN_LONGFORM) {
    return bad("Why-in answer too short — tell us what you'll bring.");
  }
  if (!referralSource) return bad("Pick how you found us.");

  console.log("[waitlist] POST received — payload validated:", {
    email,
    firstName,
    role,
    primaryPlatform,
    monthlyRevenue,
    referralSource,
  });

  try {
    console.log("[waitlist] getting Prisma client (D1)…");
    const prisma = getPrisma();

    console.log("[waitlist] querying for existing user…");
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    const isNew = !existing;
    console.log("[waitlist] existing user check:", { isNew });

    console.log("[waitlist] upserting user + application…");
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        firstName,
        lastName,
        email,
        phone,
        application: {
          create: {
            role: role!,
            aiUse: aiUse!,
            primaryPlatform: primaryPlatform!,
            monthlyRevenue: monthlyRevenue!,
            aiExperience: aiExperience!,
            biggestBlocker: biggestBlocker!,
            whyIn: whyIn!,
            referralSource: referralSource!,
            referralName,
          },
        },
      },
      update: {
        firstName,
        lastName,
        phone,
        application: {
          upsert: {
            create: {
              role: role!,
              aiUse: aiUse!,
              primaryPlatform: primaryPlatform!,
              monthlyRevenue: monthlyRevenue!,
              aiExperience: aiExperience!,
              biggestBlocker: biggestBlocker!,
              whyIn: whyIn!,
              referralSource: referralSource!,
              referralName,
            },
            update: {
              role: role!,
              aiUse: aiUse!,
              primaryPlatform: primaryPlatform!,
              monthlyRevenue: monthlyRevenue!,
              aiExperience: aiExperience!,
              biggestBlocker: biggestBlocker!,
              whyIn: whyIn!,
              referralSource: referralSource!,
              referralName,
            },
          },
        },
      },
      include: { application: true },
    });

    console.log("[waitlist] ✓ DB upsert succeeded:", { userId: user.id });

    if (isNew) {
      try {
        const { ctx } = getRequestContext();
        ctx.waitUntil(sendWelcomeEmail({ to: email, firstName }));
        console.log("[waitlist] new user — email queued via ctx.waitUntil");
      } catch (waitErr) {
        console.warn(
          "[waitlist] ctx.waitUntil unavailable, falling back to void:",
          waitErr
        );
        void sendWelcomeEmail({ to: email, firstName });
      }
    } else {
      console.log("[waitlist] existing user — skipping welcome email");
    }

    return NextResponse.json({ ok: true, id: user.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[waitlist] POST FAILED — full error context:", {
      email,
      firstName,
      error: msg,
      stack,
    });
    return bad("Could not save submission.", 500);
  }
}
