import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getRequestContext } from "@cloudflare/next-on-pages";
import type { D1Database } from "@cloudflare/workers-types";

/**
 * Per-request Prisma factory bound to the Cloudflare D1 binding "DB".
 *
 * On Cloudflare Pages, every request runs in its own edge isolate. Unlike
 * Node, there is no long-lived process where a singleton Prisma client can
 * persist between requests — and the D1 binding is only available via
 * `getRequestContext()` (which is itself per-request). So each route handler
 * calls `getPrisma()` to get a fresh client wired to the current request's
 * D1 binding.
 *
 * Cost is minimal: PrismaClient creation with an adapter is cheap and the
 * D1 connection is itself free (it's just a binding handle, not a TCP
 * connection like Postgres).
 */
export function getPrisma(): PrismaClient {
  const env = getRequestContext().env as { DB: D1Database };
  if (!env.DB) {
    throw new Error(
      "[prisma] D1 binding 'DB' is missing. Check wrangler.toml and Pages env."
    );
  }
  const adapter = new PrismaD1(env.DB);
  return new PrismaClient({ adapter });
}
