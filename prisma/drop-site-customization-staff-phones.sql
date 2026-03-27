-- Removes obsolete global staff list (moved to Location.staffBookingNotifyPhones). Safe if column was never added.
ALTER TABLE "SiteCustomization" DROP COLUMN IF EXISTS "staffBookingNotifyPhones";
