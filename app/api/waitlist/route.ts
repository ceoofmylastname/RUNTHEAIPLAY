import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";

export const runtime = "nodejs";

type Payload = {
  contact?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  answers?: {
    aiWebsites?: string;
    knowledge?: string;
    copywriting?: string;
    dataSystems?: string;
    bigPicture?: string;
  };
};

const VALID_LETTERS = new Set(["A", "B", "C"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const firstName = c.firstName?.trim();
  const lastName = c.lastName?.trim();
  const email = c.email?.trim().toLowerCase();
  const phone = c.phone?.trim();

  if (!firstName || !lastName) return bad("First and last name are required.");
  if (!email || !EMAIL_RE.test(email)) return bad("Valid email required.");
  if (!phone || phone.length < 7) return bad("Valid phone required.");

  const { aiWebsites, knowledge, copywriting, dataSystems, bigPicture } = a;
  for (const [k, v] of Object.entries({
    aiWebsites,
    knowledge,
    copywriting,
    dataSystems,
    bigPicture,
  })) {
    if (!v || !VALID_LETTERS.has(v)) {
      return bad(`Missing or invalid answer: ${k}`);
    }
  }

  try {
    // Pre-check existence so we only send the welcome email on the user's
    // FIRST submission (re-submissions update their record but don't re-spam).
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    const isNew = !existing;

    const user = await prisma.user.upsert({
      where: { email },
      create: {
        firstName,
        lastName,
        email,
        phone,
        answers: {
          create: {
            aiWebsites: aiWebsites!,
            knowledge: knowledge!,
            copywriting: copywriting!,
            dataSystems: dataSystems!,
            bigPicture: bigPicture!,
          },
        },
      },
      update: {
        firstName,
        lastName,
        phone,
        answers: {
          upsert: {
            create: {
              aiWebsites: aiWebsites!,
              knowledge: knowledge!,
              copywriting: copywriting!,
              dataSystems: dataSystems!,
              bigPicture: bigPicture!,
            },
            update: {
              aiWebsites: aiWebsites!,
              knowledge: knowledge!,
              copywriting: copywriting!,
              dataSystems: dataSystems!,
              bigPicture: bigPicture!,
            },
          },
        },
      },
      include: { answers: true },
    });

    if (isNew) {
      // Fire-and-forget: never block the form response on email send.
      // sendWelcomeEmail handles its own errors and never throws.
      void sendWelcomeEmail({ to: email, firstName });
    }

    return NextResponse.json({ ok: true, id: user.id });
  } catch (err) {
    console.error("waitlist POST failed", err);
    return bad("Could not save submission.", 500);
  }
}
