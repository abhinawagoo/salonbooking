-- Add billNo to Booking and BillSequence table for serial bill numbers.
-- Run in your DB (e.g. Neon SQL editor) if the columns/table don't exist.
-- Each booking gets one bill number (BILL-000001, BILL-000002, ...) on first invoice generation.

ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "billNo" TEXT;

CREATE TABLE IF NOT EXISTS "BillSequence" (
  "id" INTEGER NOT NULL PRIMARY KEY DEFAULT 1,
  "lastNo" INTEGER NOT NULL DEFAULT 0
);

INSERT INTO "BillSequence" ("id", "lastNo") VALUES (1, 0)
ON CONFLICT ("id") DO NOTHING;
