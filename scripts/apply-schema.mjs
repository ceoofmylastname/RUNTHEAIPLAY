// One-shot schema bootstrap for Supabase via the transaction pooler.
// Use this only when you can't reach the IPv6 direct host or session pooler.
// Each DDL statement runs as its own transaction (compatible with PgBouncer).
//
// Usage:
//   node scripts/apply-schema.mjs            # apply
//   node scripts/apply-schema.mjs --reset    # drop + apply (DESTRUCTIVE)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SQL_PATH = path.resolve(__dirname, "../prisma/schema.sql");

const prisma = new PrismaClient();

function splitStatements(sql) {
  // Strip comments, then split on `;` followed by newline. Good enough for
  // Prisma-generated DDL (no DO blocks, no functions, no inline `;`).
  const noComments = sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");
  return noComments
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function main() {
  const reset = process.argv.includes("--reset");

  if (reset) {
    console.log("⚠️  --reset: dropping existing tables…");
    await prisma.$executeRawUnsafe(
      `DROP TABLE IF EXISTS "AssessmentAnswers" CASCADE;`
    );
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "User" CASCADE;`);
    console.log("   ✓ tables dropped");
  }

  if (!fs.existsSync(SQL_PATH)) {
    throw new Error(
      `Missing ${SQL_PATH}. Generate with:\n  npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/schema.sql`
    );
  }

  const sql = fs.readFileSync(SQL_PATH, "utf8");
  const statements = splitStatements(sql);
  console.log(`→ Applying ${statements.length} statement(s) to Supabase…`);

  for (const [i, stmt] of statements.entries()) {
    const preview = stmt.replace(/\s+/g, " ").slice(0, 80);
    process.stdout.write(`   [${i + 1}/${statements.length}] ${preview}… `);
    try {
      await prisma.$executeRawUnsafe(stmt);
      console.log("✓");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Idempotency: ignore "already exists" errors so reruns are safe.
      if (/already exists/i.test(msg)) {
        console.log("· already exists, skipping");
        continue;
      }
      console.log("✗");
      throw err;
    }
  }

  console.log("✓ Schema applied to Supabase.");
}

main()
  .catch((err) => {
    console.error("\n✗ Failed:", err.message ?? err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
