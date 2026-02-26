# WhatsApp Cloud API – Troubleshooting

## Error #131030: Recipient phone number not in allowed list

**Cause:** Your WhatsApp app is in **Development mode**. Meta only allows sending to numbers you've explicitly added.

**Fix:**
1. Go to [Meta Developer Console](https://developers.facebook.com) → Your App → **WhatsApp** → **API Setup**
2. Find **"To"** field / **"Manage phone number list"**
3. Add the recipient's phone number (with country code, e.g. `919876543210`)

**Alternative:** Submit your app for production review. Once approved, you can send to any number.

---

## Error #132001: Template name does not exist in the translation

**Cause:** The template name in your request doesn't match what's in Meta, or the language code is wrong.

**Fix:**
1. Go to Meta Business Manager → WhatsApp → **Message Templates**
2. Check the exact template name (case-sensitive)
3. Set in `.env`:
   - `WHATSAPP_BOOKING_TEMPLATE_NAME` – for booking confirmation
   - `WHATSAPP_OTP_TEMPLATE_NAME` – for OTP
   - `WHATSAPP_INVOICE_TEMPLATE_NAME` – for invoice link
4. Ensure `WHATSAPP_TEMPLATE_LANG` matches your template (e.g. `en`, `en_US`)

---

## Phone number format

Numbers are stored in the DB as **10 digits** (India). When sending to WhatsApp, we convert to **E.164** (`919876543210`). This is handled automatically by `lib/phone.ts`.
