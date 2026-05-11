-- ────────────────────────────────────────────────────────────────────
-- v2 migration: drop AssessmentAnswers, create ApplicationAnswers
-- ────────────────────────────────────────────────────────────────────
-- Run this in your Cloudflare D1 console:
--   Workers & Pages → D1 → runtheaiplay-db → Console → paste → Execute
--
-- The User table is preserved (your existing rows stay).
-- The old AssessmentAnswers table (5 A/B/C answers) is dropped and
-- replaced with ApplicationAnswers (9 long-form answers from the new
-- 5-step funnel). Existing users will still appear in the admin but
-- with empty application data until they re-submit.
-- ────────────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS "AssessmentAnswers";

CREATE TABLE "ApplicationAnswers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "aiUse" TEXT NOT NULL,
    "primaryPlatform" TEXT NOT NULL,
    "monthlyRevenue" TEXT NOT NULL,
    "aiExperience" TEXT NOT NULL,
    "biggestBlocker" TEXT NOT NULL,
    "whyIn" TEXT NOT NULL,
    "referralSource" TEXT NOT NULL,
    "referralName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApplicationAnswers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ApplicationAnswers_userId_key" ON "ApplicationAnswers"("userId");
