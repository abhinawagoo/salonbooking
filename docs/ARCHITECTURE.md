# Salon Booking – Architecture & Development Guide

This doc summarizes the architecture, build, and how to update the project. Use it with `.cursor/rules/` for consistent changes.

---

## 1. Tech Stack

| Layer      | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router) |
| UI        | React 18, Tailwind CSS, lucide-react |
| Database  | SQLite (dev) / PostgreSQL (prod) via Prisma |
| Storage   | Cloudflare R2 (optional); fallback `public/uploads/` |
| Payment   | PhonePe gateway |
| Auth      | Role-based (CUSTOMER, STAFF, ADMIN) via `lib/auth.ts` |

---

## 2. Folder Structure

```
salonbooking/
├── app/
│   ├── page.tsx                 # Home: services, hero, gallery
│   ├── layout.tsx, globals.css
│   ├── booking/                 # Customer booking flow
│   │   ├── location/            # 1. Choose location
│   │   ├── date-time/           # 2. Slots (by location)
│   │   ├── customer/            # 3. Name, mobile
│   │   ├── services/            # 4. Add services
│   │   ├── payment/             # 5. Payment
│   │   ├── confirmation/       # After payment
│   │   └── invoice/             # View/download bill
│   ├── admin/                   # Admin dashboard
│   │   ├── page.tsx             # Services list + quick actions
│   │   ├── bookings/            # All bookings, filter by location
│   │   ├── reports/             # Sales by location & period
│   │   ├── customize/           # Brand, hero videos, gallery, locations link
│   │   ├── locations/          # Max 2 locations (name, address, mobile, image)
│   │   └── categories/          # Menu categories
│   ├── staff/                   # Staff: today’s bookings, location filter
│   └── api/                     # API routes (see below)
├── components/                  # Reusable UI
│   ├── ServiceCard.tsx, ServiceModal.tsx, CartBar.tsx
│   ├── CustomerForm.tsx, DateTimePicker.tsx
│   ├── PaymentScreen.tsx, ConfirmationScreen.tsx
│   └── Navigation.tsx
├── lib/
│   ├── prisma.ts               # Prisma client
│   ├── auth.ts                 # Role (CUSTOMER/STAFF/ADMIN)
│   ├── r2.ts                   # R2 upload/delete
│   ├── generateInvoice.ts      # PDF bill
│   ├── placeholders.ts         # Default image while loading
│   ├── slots.ts                # Slot logic
│   └── notify.ts               # Notifications
├── prisma/
│   ├── schema.prisma           # Models
│   └── seed.js                 # Seed data
├── docs/
│   ├── ARCHITECTURE.md         # This file
│   └── UPLOADS_R2.md           # R2 setup
└── .cursor/rules/              # Cursor AI rules (.mdc)
```

---

## 3. Key Flows

### 3.1 Customer Booking

1. **Location** (`/booking/location`) – Pick salon; store `bookingLocation` in sessionStorage.
2. **Date & time** (`/booking/date-time`) – Needs `bookingLocation`; calls `/api/slots/availability?locationId=...`; store `bookingDateTime`.
3. **Customer** (`/booking/customer`) – Name, mobile; store `customerDetails`.
4. **Services** (`/booking/services`) – Add services; can preload from sessionStorage; store for payment.
5. **Payment** (`/booking/payment`) – POST `/api/booking` with `locationId`, date, time, user, services; then redirect to confirmation.

Missing steps redirect to `/booking/location`.

### 3.2 Admin

- **Services**: CRUD at `/admin`; service image upload (R2 or local).
- **Locations**: Max 2; edit in Customize → “Manage locations” or `/admin/locations`.
- **Customize**: Brand name, menu label, hero videos (max 5, MP4, max 30s), gallery images; no “R2” wording in UI.
- **Reports**: `/admin/reports` – filter by location and period (day/week/month/year).

### 3.3 Uploads

- **Upload**: POST `/api/admin/upload` with `file` and `type` (service | hero | gallery). Hero: MP4 only; others: images. Returns `{ url }`.
- **Delete**: POST `/api/admin/upload/delete` with `{ url }`; deletes from R2 when URL is R2; local files are not deleted from disk.

---

## 4. Database (Prisma)

- **User**: id, name, mobile (unique), role (CUSTOMER|STAFF|ADMIN).
- **Location**: id, name, slug, address, mobile, imageUrl; used for booking and bills.
- **Booking**: locationId (optional for legacy), userId, date, timeSlot, durationMinutes, status, token; relations: location, user, services, payment.
- **Service**: categoryId, name, price, duration, imageUrl, isActive.
- **Payment**: bookingId, amountPaid, totalAmount, paymentStatus, etc.

Use `include` or `select` per relation, not both. After schema change: `npx prisma generate` and `npx prisma db push` (or migrate).

---

## 5. Build & Run

```bash
# Install
npm install

# DB (first time or after schema change)
npx prisma generate
npx prisma db push
npm run db:seed   # optional

# Dev
npm run dev       # http://localhost:3000

# Production build
npm run build
npm run start
```

---

## 6. Making Changes (Best Practices)

1. **New API route**: Add `app/api/.../route.ts`; use `NextResponse.json()` and proper status codes; use `lib/prisma` and try/catch.
2. **New page**: Add `app/.../page.tsx`; use `'use client'` only if you need state/events; keep booking flow order (location → date-time → customer → services → payment).
3. **Schema change**: Edit `prisma/schema.prisma`, then `prisma generate` and `db push` (or create migration).
4. **New env var**: Add to `.env` and document in `.env.example`; use in server code only (no `NEXT_PUBLIC_` unless needed in browser).
5. **UI**: Prefer Tailwind; keep touch targets ≥ 44px; use placeholder images until load; don’t mention “R2” or storage backend in user-facing text.
6. **Cursor**: Rules in `.cursor/rules/*.mdc` apply by description/globs; keep rules short and focused.

---

## 7. Quick Reference

| Task              | Where / Command |
|-------------------|-----------------|
| Booking flow      | `app/booking/*` in order; sessionStorage keys: bookingLocation, bookingDateTime, customerDetails, selectedServices |
| Slots by location| `GET /api/slots/availability?locationId=...&startDate=...&endDate=...` |
| Create booking   | `POST /api/booking` with locationId, date, timeSlot, userId, services |
| Admin reports    | `GET /api/admin/reports?locationId=...&period=day|week|month|year&date=YYYY-MM-DD` |
| Upload           | POST `/api/admin/upload` (type: service | hero | gallery); delete: POST `/api/admin/upload/delete` with `{ url }` |
| Locations        | Max 2; admin only; used in booking, bills, reports |

---

## 8. Related Docs

- **README.md** – Setup and high-level features.
- **docs/UPLOADS_R2.md** – R2 bucket setup and env vars.
- **.cursor/rules/** – Cursor rules for architecture, API, pages, Prisma.
