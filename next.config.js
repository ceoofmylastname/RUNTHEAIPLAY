// Next.js config for Cloudflare Pages via @cloudflare/next-on-pages.
// `setupDevPlatform()` wires up local D1 + bindings during `next dev` so
// API routes can call `getRequestContext()` without crashing.
if (process.env.NODE_ENV === "development") {
  // Lazy require so the prod build doesn't pull this module in.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { setupDevPlatform } = require("@cloudflare/next-on-pages/next-dev");
  setupDevPlatform();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
