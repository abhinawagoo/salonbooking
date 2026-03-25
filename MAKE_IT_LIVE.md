# Make it live – Vercel + Neon (free)

Follow these steps to get your salon booking app live. Your repo is already on GitHub: **https://github.com/abhinawagoo/salonbooking**

---

## 1. Create a database (Neon – free)

1. Go to **[neon.tech](https://neon.tech)** and sign in with GitHub.
2. **Create a project** (e.g. name: `salonbooking`).
3. Copy the **connection string** (PostgreSQL). It looks like:
   ```text
   postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
4. Keep this URL; you’ll add it to Vercel in step 3.

---

## 2. Deploy on Vercel

1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub.
2. Click **Add New…** → **Project**.
3. **Import** the repo: `abhinawagoo/salonbooking`.
4. Leave **Framework Preset**: Next.js and **Root Directory** as is. Click **Deploy** (the first deploy may fail until env vars and DB are set; that’s OK).

---

## 3. Add environment variables

1. In Vercel: your project → **Settings** → **Environment Variables**.
2. Add these (for **Production** and **Preview**):

| Name | Value |
|------|--------|
| `DATABASE_URL` | Your Neon connection string from step 1 |
| `JWT_SECRET` | A long random string (e.g. `openssl rand -base64 32`) |
| `NEXT_PUBLIC_APP_URL` | `https://your-app-name.vercel.app` (replace with your actual Vercel URL) |
| `PHONEPE_MERCHANT_ID` | Your PhonePe merchant ID (or leave empty for test payment) |
| `PHONEPE_SALT_KEY` | Your PhonePe salt key |
| `PHONEPE_SALT_INDEX` | `1` |
| `PHONEPE_ENV` | `sandbox` (use `production` when you go live with real payments) |
| `WHATSAPP_ACCESS_TOKEN` | Meta → App → WhatsApp → temporary/permanent token (invoice + OTP) |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp → API Setup → Phone number ID |
| `WHATSAPP_INVOICE_TEMPLATE_NAME` | Must match your approved Utility template name (e.g. `invoice_receipt`) |
| `WHATSAPP_TEMPLATE_LANG` | Must match template language in Meta (`en` or `en_US`) |
| `WHATSAPP_INVOICE_TEMPLATE_LEGACY` | `false` for the Shahnaz invoice template (see `docs/WHATSAPP_INVOICE_UTILITY_TEMPLATE.md`) |
| `WHATSAPP_INVOICE_BUTTON_FULL_URL` | `false` — button sends **token** only when Meta URL is `...?token={{1}}` |
| `WHATSAPP_INVOICE_HEADER_DOCUMENT_URL` | Only if Meta template expects **dynamic** PDF header; omit if header is static in Meta |

Optional later: R2, MSG91, etc. (see `.env.example`).

**Invoice WhatsApp after payment:** set `NEXT_PUBLIC_APP_URL` to your real domain (e.g. `https://shahnazsalonsasaram.com`) so invoice links in WhatsApp are correct. Full checklist: `docs/WHATSAPP_INVOICE_UTILITY_TEMPLATE.md` → Production checklist.

3. **Redeploy**: Deployments → … on latest → **Redeploy**.

---

## 4. Apply database schema and seed (one time)

From your **local** project (with the repo cloned):

```bash
# Install Vercel CLI if you haven’t
npm i -g vercel

# Log in and link this folder to your Vercel project
vercel login
vercel link

# Pull production env (includes DATABASE_URL) into .env.local
vercel env pull .env.local

# Apply schema and seed (uses DATABASE_URL from .env.local)
npm run deploy:db
```

After this, your Neon database has tables and default data (locations, admin user, etc.).

---

## 5. Open your live app

- App URL: **https://your-app-name.vercel.app**
- Admin: go to `/admin` and log in with the seeded admin (see `prisma/seed.js` for default mobile/password if you use test login).

---

## Checklist

- [ ] Neon project created, `DATABASE_URL` copied
- [ ] Vercel project imported from GitHub
- [ ] All env vars set in Vercel (especially `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`)
- [ ] Redeployed after adding env vars
- [ ] Ran `vercel env pull .env.local`, then `npx prisma db push` and `npm run db:seed`
- [ ] Opened the app URL and tested booking flow

---

## Local development after going live

Your Prisma schema now uses **PostgreSQL**. For local dev:

- Use the **same Neon DB** (e.g. in `.env` or `.env.local` with the Neon URL), or  
- Create a **second Neon project** and use its URL in `.env.local` so production and dev stay separate.

---

## Optional: custom domain

In Vercel: **Settings** → **Domains** → add your domain and follow the DNS steps. Then set `NEXT_PUBLIC_APP_URL` to that domain.

---

For more detail (Railway, PhonePe production, R2, etc.) see **DEPLOYMENT.md** and **QUICK_DEPLOY.md**.
