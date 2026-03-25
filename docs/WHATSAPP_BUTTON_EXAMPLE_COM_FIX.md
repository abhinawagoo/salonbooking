# Fix: Receipt button opens `https://www.example.com/TOKEN`

## Cause

WhatsApp **does not** take the invoice URL from your server code when the button uses a **dynamic URL** with a **fixed base** in the template.

Meta stores a pattern like:

`https://www.example.com/{{1}}`

The app only sends the **token** (e.g. `0Q88YUVXQMGRU4VN`). WhatsApp builds the final link by combining Meta’s **base URL** + your token →  
`https://www.example.com/0Q88YUVXQMGRU4VN`

So the wrong domain comes from the **Message template** in Meta, not from this repo.

## Fix (required): Update the template in Meta

1. Open **[Meta Business Suite](https://business.facebook.com)** → **WhatsApp accounts** → **Message templates**.
2. Open your **invoice / receipt** template (e.g. `invoice_receipt`).
3. Edit the **View Invoice** (or **Receipt**) button.
4. Set **Website URL** to your real site and query param, for example:

   **`https://shahnazsalonsasaram.com/booking/invoice?token={{1}}`**

   - Use **your** domain (with or without `www`, but match what you use in production).
   - Keep `{{1}}` as the **only** dynamic part (the booking token).

5. Save and **submit for review** if Meta asks for re-approval.

6. Ensure **sample URL** for review looks like:

   `https://shahnazsalonsasaram.com/booking/invoice?token=SAMPLETOKEN123`

## App configuration

Set your public site URL so links generated on the server are correct (emails, logs, full-URL mode):

```env
NEXT_PUBLIC_APP_URL="https://shahnazsalonsasaram.com"
```

(No trailing slash.)

`WHATSAPP_INVOICE_BUTTON_FULL_URL` should stay **`false`** when the Meta URL uses `?token={{1}}` and the API sends **only the token**.

## After Meta approves the change

Redeploy if you changed env. Test a real payment and tap **View Invoice** — it should open your domain, not `example.com`.
