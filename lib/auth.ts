import { cookies } from "next/headers";

const COOKIE_NAME = "rtap_admin";

export function getAdminPassword(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) {
    throw new Error(
      "ADMIN_PASSWORD environment variable is not set. Add it to your .env file."
    );
  }
  return pw;
}

export function isAdminAuthenticated(): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const token = cookies().get(COOKIE_NAME)?.value;
  return Boolean(token) && token === expected;
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
