-- Run this in your DB (e.g. Neon SQL editor) if User table is missing email / marketingConsent.
-- Fixes P2022 when using auth (OTP verify) before running full migrations.

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "marketingConsent" BOOLEAN NOT NULL DEFAULT true;
