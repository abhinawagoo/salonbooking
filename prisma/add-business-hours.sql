-- Add businessHoursJson and closedDatesJson to Location for per-salon hours and specific closed dates.
-- Run in your DB (e.g. Neon SQL editor) if the columns don't exist.

ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "businessHoursJson" TEXT;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "closedDatesJson" TEXT;
