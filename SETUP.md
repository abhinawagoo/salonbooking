# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and update:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A random secret key for JWT tokens
- `PHONEPE_*`: PhonePe credentials (use sandbox for testing)
- `NEXT_PUBLIC_APP_URL`: Your app URL (http://localhost:3000 for local)

### 3. Set Up Database
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 4. Seed Sample Data (Optional)
```bash
npm run db:seed
```

This creates:
- 8 sample services (Haircut, Hair Color, Hair Spa, Facial, etc.)
- Admin user (mobile: 9999999999)
- Staff user (mobile: 8888888888)

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Access Points

- **Customer Booking**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Staff Dashboard**: http://localhost:3000/staff
- **Admin Bookings**: http://localhost:3000/admin/bookings

## PhonePe Sandbox Testing

For testing payments, use PhonePe sandbox credentials:
- Merchant ID: `PGTESTPAYUAT`
- Salt Key: `099eb0cd-02cf-4e2a-8aca-3e6c6cc41fdb`
- Salt Index: `1`

Set `PHONEPE_ENV=sandbox` in your `.env` file.

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check `DATABASE_URL` format: `postgresql://user:password@host:port/database?schema=public`
- Verify database exists

### Prisma Issues
- Run `npm run db:generate` after schema changes
- Use `npm run db:studio` to view database in browser

### Payment Issues
- Check PhonePe credentials in `.env`
- Verify `NEXT_PUBLIC_APP_URL` matches your server URL
- Check browser console for errors

## Next Steps

1. Add your actual services through `/admin`
2. Configure PhonePe production credentials
3. Customize UI colors and branding
4. Set up authentication (OTP flow)
5. Deploy to production
