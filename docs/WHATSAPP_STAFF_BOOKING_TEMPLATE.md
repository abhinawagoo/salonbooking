# Staff booking alert (WhatsApp template)

After **payment completes successfully** (first time the booking is marked paid), the app notifies managers using the WhatsApp Cloud API template **`staff_booking_alert`** (override with `WHATSAPP_STAFF_BOOKING_TEMPLATE_NAME` in `.env`). The same moment the customer receives the **invoice_receipt** message (payment callback, webhook, or test payment).

Configure **manager numbers per location** in **Admin → Locations** → edit a location → **Staff WhatsApp — booking alerts** (one 10-digit Indian mobile per line). Only staff listed on **that** location receive alerts for bookings **at that** branch. If the list is empty, the app falls back to users with **Staff** or **Admin** role (they get the regular **booking_confirmation** template instead).

Set `NOTIFY_STAFF_ON_BOOKING=false` in `.env` to disable all staff booking WhatsApp (customer invoice is unchanged).

## Create the template in Meta

1. Meta Business Suite → WhatsApp Manager → **Message templates** → **Create template**.
2. **Category:** Utility (or Marketing if your use case fits).
3. **Name:** `staff_booking_alert` (must match `.env` or default).
4. **Language:** Same as `WHATSAPP_TEMPLATE_LANG` (e.g. `en` or `en_US`).

### Body (7 variables)

Use exactly **seven** numbered placeholders in order:

| Variable | App sends |
|----------|-----------|
| `{{1}}` | Salon / location name |
| `{{2}}` | Customer name |
| `{{3}}` | Customer mobile (10 digits) |
| `{{4}}` | Date (`DD/MM/YYYY`) |
| `{{5}}` | Time (12h, e.g. `10:30 AM`) |
| `{{6}}` | Services summary (truncated) |
| `{{7}}` | Amount (e.g. `Rs. 500`) |

**Example body text (copy into Meta):**

```text
New booking — {{1}}

Name: {{2}}
Mobile: {{3}}
Date: {{4}}
Time: {{5}}
Services: {{6}}
Total: {{7}}

Reply on WhatsApp or check admin panel for full details.
```

- **No header** and **no buttons** are sent by the app; keep the template **body-only** unless you extend the code to add components.

### Samples for Meta review

Provide sample values when Meta asks, e.g.:

- `{{1}}` — Shahnaz Salon Main Road  
- `{{2}}` — Priya Sharma  
- `{{3}}` — 9876543210  
- `{{4}}` — 25/03/2026  
- `{{5}}` — 10:30 AM  
- `{{6}}` — Haircut (₹350), Facial (₹500)  
- `{{7}}` — Rs. 850  

After approval, add manager numbers on each location in **Admin → Locations** and ensure each number is allowed in **Development** mode (Meta → WhatsApp → API Setup → recipient list).

**Database:** apply `prisma/add-location-staff-notify-phones.sql` if the `Location.staffBookingNotifyPhones` column is missing. If you previously used the global Customize list, run `prisma/drop-site-customization-staff-phones.sql` after copying numbers into each location (optional cleanup).
