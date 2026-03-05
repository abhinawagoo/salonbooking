-- Add quantity column to BookingService (default 1 for existing rows)
ALTER TABLE "BookingService" ADD COLUMN IF NOT EXISTS "quantity" INTEGER NOT NULL DEFAULT 1;
