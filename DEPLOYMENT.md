# Deployment Guide - Salon Booking System

This guide will help you deploy your salon booking system to production.

## 🚀 Quick Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

### Step 1: Prepare Your Code

1. **Commit your code to Git:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Salon booking system"
   ```

2. **Push to GitHub:**
   ```bash
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to [Vercel](https://vercel.com)** and sign up/login
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure Environment Variables:**

   Add these in Vercel dashboard → Settings → Environment Variables:

   ```
   DATABASE_URL=your-production-database-url
   JWT_SECRET=your-random-secret-key
   PHONEPE_MERCHANT_ID=your-merchant-id
   PHONEPE_SALT_KEY=your-salt-key
   PHONEPE_SALT_INDEX=1
   PHONEPE_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

5. **Click "Deploy"**

### Step 3: Set Up Production Database

#### Option A: Use Vercel Postgres (Recommended)

1. In Vercel dashboard, go to **Storage** → **Create Database** → **Postgres**
2. Copy the connection string
3. Update `DATABASE_URL` in environment variables
4. Update `prisma/schema.prisma` to use PostgreSQL:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
5. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

#### Option B: Use External PostgreSQL (Supabase, Railway, etc.)

1. Create a PostgreSQL database on your preferred provider
2. Get the connection string
3. Update `DATABASE_URL` in environment variables
4. Update schema to PostgreSQL (as above)
5. Run migrations

### Step 4: Run Database Migrations

After deployment, you need to run migrations. You can do this via Vercel CLI:

```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local
npx prisma migrate deploy
```

Or use Vercel's built-in Postgres and it will handle migrations automatically.

## 🔧 Alternative: Deploy to Railway

### Step 1: Create Railway Account

1. Go to [Railway](https://railway.app)
2. Sign up with GitHub

### Step 2: Deploy

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect Next.js

### Step 3: Add PostgreSQL Database

1. Click "New" → "Database" → "PostgreSQL"
2. Railway will automatically set `DATABASE_URL`
3. Add other environment variables in Settings → Variables

### Step 4: Configure Environment Variables

Add all required variables (same as Vercel above)

## 📋 Environment Variables Checklist

Make sure these are set in your production environment:

- ✅ `DATABASE_URL` - Production database connection string
- ✅ `JWT_SECRET` - Random secret for JWT tokens
- ✅ `PHONEPE_MERCHANT_ID` - Your PhonePe merchant ID
- ✅ `PHONEPE_SALT_KEY` - Your PhonePe salt key
- ✅ `PHONEPE_SALT_INDEX` - Usually "1"
- ✅ `PHONEPE_ENV` - Set to "production"
- ✅ `NEXT_PUBLIC_APP_URL` - Your production URL

## 🔐 PhonePe Production Setup

1. **Get Production Credentials:**
   - Contact PhonePe support for production merchant ID and salt key
   - They'll provide sandbox credentials for testing first

2. **Update Environment Variables:**
   - Set `PHONEPE_ENV=production`
   - Use production merchant ID and salt key

3. **Test Payment Flow:**
   - Use test mode first
   - Verify callback URLs are correct
   - Test with small amounts

## 🗄️ Database Migration Steps

### For SQLite → PostgreSQL Migration:

1. **Export data from SQLite:**
   ```bash
   npx prisma db pull
   npx prisma db seed
   ```

2. **Update schema.prisma:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

4. **Push schema to PostgreSQL:**
   ```bash
   npx prisma db push
   ```

5. **Seed production database:**
   ```bash
   npm run db:seed
   ```

## ✅ Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Environment variables set correctly
- [ ] Test booking flow end-to-end
- [ ] Test payment integration (sandbox first)
- [ ] Verify admin dashboard works
- [ ] Check staff dashboard functionality
- [ ] Test on mobile devices
- [ ] Set up custom domain (optional)
- [ ] Enable SSL/HTTPS (automatic on Vercel/Railway)
- [ ] Set up monitoring/error tracking (optional)

## 🐛 Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check database is accessible from Vercel/Railway IPs
- Ensure SSL is enabled if required

### Payment Issues

- Verify PhonePe credentials are correct
- Check callback URLs match your production URL
- Test in sandbox mode first
- Check PhonePe dashboard for transaction logs

### Build Errors

- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs in deployment dashboard

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- PhonePe Docs: https://developer.phonepe.com

---

**Ready to deploy?** Start with Vercel - it's the fastest way to get your app live! 🚀
