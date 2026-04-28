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
    console.warn("[email] RESEND_API_KEY is not set — skipping email send.");
    return null;
  }
  resendClient = new Resend(key);
  return resendClient;
}

/**
 * Renders and sends the welcome email. Never throws — failures are logged.
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
  const resend = getResend();
  if (!resend) return;

  const from =
    process.env.EMAIL_FROM ?? "Run The AI Play <onboarding@resend.dev>";

  try {
    const html = await render(WelcomeEmail({ firstName }));
    const text = await render(WelcomeEmail({ firstName }), { plainText: true });

    const subject = firstName
      ? `Access granted, ${firstName}. Welcome to Run The AI Play.`
      : "Access granted. Welcome to Run The AI Play.";

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("[email] Resend rejected send:", {
        to,
        statusCode: (error as { statusCode?: number }).statusCode,
        name: error.name,
        message: error.message,
      });
      return;
    }

    console.log("[email] Welcome email sent:", { to, id: data?.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[email] Unexpected send failure:", { to, error: msg });
  }
}
