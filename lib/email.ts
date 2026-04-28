import { render } from "@react-email/render";
import { Resend } from "resend";
import { WelcomeEmail } from "@/emails/WelcomeEmail";

type SendWelcomeArgs = {
  to: string;
  firstName?: string;
};

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (resendClient) return resendClient;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error(
      "[email] FATAL: RESEND_API_KEY is not set in environment. Email send is being skipped. Add this env var in Cloudflare Pages → Settings → Environment Variables (Production)."
    );
    return null;
  }
  resendClient = new Resend(key);
  return resendClient;
}

/**
 * Renders and sends the welcome email. Never throws — failures are logged
 * to console.error / console.log, all visible in Cloudflare Pages →
 * Deployments → [latest] → Functions → Real-time logs.
 *
 * Resend sandbox note: until you verify a domain at https://resend.com/domains,
 * delivery is restricted to the email address registered with your Resend
 * account. Other recipients return 403 with "You can only send testing emails
 * to your own email address". We log this and move on.
 */
export async function sendWelcomeEmail({
  to,
  firstName,
}: SendWelcomeArgs): Promise<void> {
  // Loud start log so we can see in Functions real-time logs whether this
  // function was even reached (vs failing earlier in the API route).
  console.log("[email] sendWelcomeEmail() called", {
    to,
    firstName,
    hasApiKey: Boolean(process.env.RESEND_API_KEY),
    fromEnv: process.env.EMAIL_FROM ?? "(unset → fallback to onboarding@resend.dev)",
  });

  const resend = getResend();
  if (!resend) return;

  const from =
    process.env.EMAIL_FROM ?? "Run The AI Play <onboarding@resend.dev>";

  try {
    console.log("[email] rendering WelcomeEmail React component…");
    const html = await render(WelcomeEmail({ firstName }));
    const text = await render(WelcomeEmail({ firstName }), { plainText: true });

    const subject = firstName
      ? `Access granted, ${firstName}. Welcome to Run The AI Play.`
      : "Access granted. Welcome to Run The AI Play.";

    console.log("[email] calling Resend resend.emails.send()…", { from, to });

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("[email] Resend REJECTED send (look here for the reason):", {
        to,
        from,
        statusCode: (error as { statusCode?: number }).statusCode,
        name: error.name,
        message: error.message,
      });
      return;
    }

    console.log("[email] ✓ Welcome email accepted by Resend", {
      to,
      from,
      resendId: data?.id,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[email] Unexpected send failure (exception thrown):", {
      to,
      from,
      error: msg,
      stack,
    });
  }
}
