-- Deprecated: staff notify numbers now live on Location.staffBookingNotifyPhones (see add-location-staff-notify-phones.sql).
-- Kept for DBs that ran this earlier; new installs can skip and use drop-site-customization-staff-phones.sql after migrating data.
ALTER TABLE "SiteCustomization" ADD COLUMN IF NOT EXISTS "staffBookingNotifyPhones" TEXT;
