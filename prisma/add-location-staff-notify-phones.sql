-- Per-location WhatsApp numbers for staff booking alerts (see Location.staffBookingNotifyPhones in schema)
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "staffBookingNotifyPhones" TEXT;
