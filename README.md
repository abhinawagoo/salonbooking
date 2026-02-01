# Salon Booking & Payment System

A modern web-based salon booking system with visual service selection, booking flow, and PhonePe payment integration.

## Features

- **Visual Service Selection**: Image-based service menu with card layout
- **Booking Flow**: Service → Customer Details → Date/Time → Payment → Confirmation
- **Payment Integration**: PhonePe payment gateway (sandbox/production)
- **Admin Dashboard**: Manage services, view bookings, track payments
- **Staff Dashboard**: View today's appointments, mark as completed
- **Mobile-First UI**: Touch-friendly, responsive design

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Payment**: PhonePe Gateway
- **Storage**: Cloudflare R2 (optional) for uploads

## Architecture & Future Changes

- **Full architecture, build, and update guide**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) – folder map, flows, DB, build commands, and best practices.
- **Cursor rules** (`.cursor/rules/*.mdc`) – project conventions for AI and humans: architecture, API routes, pages, Prisma, components. Use these when making or reviewing changes.

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd salonbooking
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your database URL and PhonePe credentials:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/salonbooking?schema=public"
JWT_SECRET="your-secret-key"
PHONEPE_MERCHANT_ID="your-merchant-id"
PHONEPE_SALT_KEY="your-salt-key"
PHONEPE_SALT_INDEX=1
PHONEPE_ENV="sandbox"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. (Optional) Seed sample data:
```bash
npm run db:seed
```

This will create sample services and admin/staff users:
- Admin: Mobile `9999999999`
- Staff: Mobile `8888888888`

You can also add services through the admin dashboard at `/admin`

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
salonbooking/
├── app/
│   ├── api/              # API routes
│   │   ├── services/     # Public service endpoints
│   │   ├── booking/      # Booking endpoints
│   │   ├── payment/      # Payment endpoints
│   │   ├── admin/       # Admin endpoints
│   │   └── staff/       # Staff endpoints
│   ├── admin/            # Admin dashboard pages
│   ├── staff/            # Staff dashboard pages
│   ├── booking/          # Booking flow pages
│   ├── page.tsx          # Home page (service selection)
│   └── layout.tsx        # Root layout
├── components/           # React components
├── lib/                  # Utility functions
├── prisma/               # Database schema
└── public/               # Static assets
```

## User Roles

### Customer
- Browse and select services
- Book appointments
- Make advance or full payment

### Staff
- View today's bookings
- View upcoming bookings
- Mark bookings as completed
- See payment status

### Admin
- Full access
- Manage services (add/edit/delete)
- View all bookings
- Track payments

## Booking Flow

1. **Service Selection** (`/`): Browse services, click "Add" to view details
2. **Customer Details** (`/booking/customer`): Enter name and mobile number
3. **Date & Time** (`/booking/date-time`): Select appointment slot
4. **Payment** (`/booking/payment`): Choose full or advance payment
5. **Confirmation** (`/booking/confirmation`): View booking details and token

## API Endpoints

### Public
- `GET /api/services` - Get all active services
- `POST /api/booking` - Create a new booking
- `POST /api/payment/initiate` - Initiate payment
- `POST /api/payment/callback` - Payment callback handler

### Admin
- `GET /api/admin/services` - Get all services
- `POST /api/admin/services` - Create service
- `PUT /api/admin/services/:id` - Update service
- `DELETE /api/admin/services/:id` - Delete service
- `GET /api/admin/bookings` - Get all bookings

### Staff
- `GET /api/staff/bookings/today` - Get today's and upcoming bookings
- `PUT /api/staff/booking/:id/status` - Update booking status

## PhonePe Integration

The system integrates with PhonePe payment gateway. Configure your credentials in `.env`:

- `PHONEPE_MERCHANT_ID`: Your PhonePe merchant ID
- `PHONEPE_SALT_KEY`: Your PhonePe salt key
- `PHONEPE_SALT_INDEX`: Salt index (usually 1)
- `PHONEPE_ENV`: `sandbox` or `production`

## Database Schema

- **User**: Customer, staff, and admin users
- **Service**: Salon services with pricing and duration
- **Booking**: Appointment bookings
- **BookingService**: Many-to-many relationship between bookings and services
- **Payment**: Payment records linked to bookings

## Development

- Run development server: `npm run dev`
- Generate Prisma client: `npm run db:generate`
- Push database changes: `npm run db:push`
- Open Prisma Studio: `npm run db:studio`

## Production Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations: `npx prisma migrate deploy`
4. Build the application: `npm run build`
5. Start the server: `npm start`

## Future Enhancements

- WhatsApp notifications
- SMS reminders
- Multi-language support
- Membership plans
- Analytics dashboard
- Multi-branch support

## License

MIT
