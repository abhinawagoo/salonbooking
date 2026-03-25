# WhatsApp invoice template – Meta mapping & production

## Variable mapping (final)

| Place | Variable | App sends | Example |
|-------|----------|-----------|---------|
| Body {{1}} | Name | Customer name | `Abhinav` |
| Body {{2}} | Invoice | Bill number | `BILL-000001` |
| Body {{3}} | Amount | Paid amount | `Rs. 350` |
| Body {{4}} | Balance | Balance due | `Rs. 0` |
| Button {{1}} | Token | **Booking token only** (not full URL) | `T9KFZHT0978MUGTN` |

In Meta, the button URL must be:

`https://shahnazsalonsasaram.com/booking/invoice?token={{1}}`

Where `{{1}}` is replaced by the token value. The app sends **only** the token string for the button parameter.

---

## Header: document vs image

- If your **approved template** uses a **Document** header (PDF) that is **static** (you uploaded the sample in Meta and there is **no** variable in the header):  
  **Do not** set `WHATSAPP_INVOICE_HEADER_DOCUMENT_URL` in production. Meta will show your static PDF; the API must **not** send a `header` document component (or it can fail).

- If Meta expects a **dynamic** document in the header (variable in header):  
  Set `WHATSAPP_INVOICE_HEADER_DOCUMENT_URL` to a **public HTTPS** PDF URL and `WHATSAPP_INVOICE_HEADER_DOCUMENT_FILENAME` (e.g. `Receipt.pdf`).

- If the template uses **Image** header instead: set `WHATSAPP_INVOICE_HEADER_IMAGE_URL` only if your template expects dynamic image from API; **do not** set both document and image.

**Rule:** Match what Meta approved — header type (none / static / dynamic) must match what the API sends.

---

## Production environment (Vercel / host)

Set these for **Production**:

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_APP_URL` | `https://shahnazsalonsasaram.com` (no trailing slash) |
| `WHATSAPP_ACCESS_TOKEN` | Meta permanent token |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Phone Number ID |
| `WHATSAPP_INVOICE_TEMPLATE_NAME` | Exact template name in Meta |
| `WHATSAPP_TEMPLATE_LANG` | Same as template (`en` or `en_US`) |
| `WHATSAPP_INVOICE_TEMPLATE_LEGACY` | `false` |
| `WHATSAPP_INVOICE_BUTTON_FULL_URL` | `false` (use token only for button) |

**Optional (only if needed):**

| Variable | When |
|----------|------|
| `WHATSAPP_INVOICE_HEADER_DOCUMENT_URL` | Only if template has **dynamic** document header |
| `WHATSAPP_INVOICE_HEADER_DOCUMENT_FILENAME` | Filename shown in WhatsApp (default `Receipt.pdf`) |
| `WHATSAPP_INVOICE_HEADER_IMAGE_URL` | Only if template has **dynamic** image header |
| `WHATSAPP_INVOICE_BUTTON_FULL_URL` | `true` only if your Meta button expects the **full** URL instead of token |

After changes, **redeploy**.

---

## Body text (reference – must match Meta)

Your approved copy should look like:

```
Hi {{1}},

Thank you for visiting Shahnaz Salon 💇‍♀️

Invoice Number: {{2}}
Amount Paid: {{3}}
Balance Due: {{4}}

You can view your full invoice using the button below.
```

**Sample values for Meta review:** Name `Customer`, Invoice `BILL-001`, Amount `Rs. 350`, Balance `Rs. 0`.

**Button sample URL** (for Meta review form):

`https://shahnazsalonsasaram.com/booking/invoice?token=T9KFZHT0978MUGTN`

---

## Legacy template

Old “bill payment received” text with different variables:

```env
WHATSAPP_INVOICE_TEMPLATE_LEGACY=true
```

Legacy uses **full URL** on the button unless you override.

---

## Troubleshooting

- **#100 Invalid parameter** – Language code mismatch; button sent full URL but token expected (or reverse); header sent when template has no dynamic header; parameter length over limits.
- **Button opens wrong page** – Check `NEXT_PUBLIC_APP_URL` and that Meta URL base matches your domain.
