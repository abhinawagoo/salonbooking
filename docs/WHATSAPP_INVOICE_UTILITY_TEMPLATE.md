# WhatsApp invoice template – Meta mapping & production

**Button opens `example.com`?** See **`docs/WHATSAPP_BUTTON_EXAMPLE_COM_FIX.md`** — fix the button URL in Meta (not only in code).

## Variable mapping (final)

| Place | Variable | App sends | Example |
|-------|----------|-----------|---------|
| Body {{1}} | Name | Customer name | `Abhinav` |
| Body {{2}} | Invoice | Bill number | `BILL-000001` |
| Body {{3}} | Amount | Paid amount | `Rs. 350` |
| Body {{4}} | Balance | Balance due | `Rs. 0` |
| Body {{5}} | Appointment date | From booking (DD/MM/YYYY) | `27/03/2026` |
| Body {{6}} | Appointment time | From booking slot (12h) | `2:30 PM` |
| Button {{1}} | Token | **Booking token only** (not full URL) | `T9KFZHT0978MUGTN` |

In Meta, the button URL must be:

`https://shahnazsalonsasaram.com/booking/invoice?token={{1}}`

Where `{{1}}` is replaced by the token value. The app sends **only** the token string for the button parameter.

---

## No header (image / PDF)

The app **does not** send any `header` component for invoice messages — only **body** variables and the **URL** button.  
In Meta, create the template **without** a header (body + button only) so it matches the API.

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
