-- Add Facebook and Instagram URL columns to SiteCustomization.
-- Run in your DB (e.g. Neon SQL editor) if the columns don't exist.

ALTER TABLE "SiteCustomization" ADD COLUMN IF NOT EXISTS "facebookUrl" TEXT;
ALTER TABLE "SiteCustomization" ADD COLUMN IF NOT EXISTS "instagramUrl" TEXT;
