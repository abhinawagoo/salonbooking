# 🚀 Quick Deploy Guide

## Deploy to Vercel in 5 Minutes

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Salon booking system ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/salonbooking.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### Step 3: Add Environment Variables

In Vercel dashboard → Your Project → Settings → Environment Variables:

**Required Variables:**
```
DATABASE_URL=your-postgres-connection-string
JWT_SECRET=generate-random-string-here
PHONEPE_MERCHANT_ID=your-merchant-id
PHONEPE_SALT_KEY=your-salt-key
PHONEPE_SALT_INDEX=1
PHONEPE_ENV=sandbox
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Step 4: Add Database

**Option A: Vercel Postgres (Easiest)**
1. In Vercel dashboard → **Storage** → **Create Database** → **Postgres**
2. Vercel automatically sets `DATABASE_URL`
3. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Commit and push the change

**Option B: External Database**
- Use [Supabase](https://supabase.com) (free tier available)
- Or [Railway](https://railway.app) PostgreSQL
- Copy connection string to `DATABASE_URL`

### Step 5: Run Migrations

After first deployment, run migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma generate
npx prisma db push
npm run db:seed
```

Or use Vercel's Postgres - it handles migrations automatically!

### Step 6: Update PhonePe Settings

1. Get PhonePe sandbox credentials from their dashboard
2. Update environment variables in Vercel
3. Set `PHONEPE_ENV=sandbox` for testing
4. Test payment flow
5. Switch to `production` when ready

## ✅ That's It!

Your app will be live at: `https://your-app.vercel.app`

## 🔧 Troubleshooting

**Build fails?**
- Check Node.js version (needs 18+)
- Verify all dependencies in `package.json`

**Database errors?**
- Ensure `DATABASE_URL` is set correctly
- Check database is accessible (not behind firewall)
- Run `npx prisma generate` locally first

**Payment not working?**
- Verify PhonePe credentials
- Check `NEXT_PUBLIC_APP_URL` matches your Vercel URL
- Test in sandbox mode first

## 📱 Next Steps

- [ ] Test booking flow end-to-end
- [ ] Add custom domain (optional)
- [ ] Set up production PhonePe credentials
- [ ] Configure email notifications (optional)
- [ ] Add analytics (optional)

---

**Need help?** Check `DEPLOYMENT.md` for detailed instructions.
