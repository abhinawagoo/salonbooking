# Role-Based Access Control

The application now has role-based navigation and access control.

## How It Works

### Role Assignment
- **Customer**: Default role when accessing home page (`/`)
- **Staff**: Assigned when accessing `/staff` page
- **Admin**: Assigned when accessing `/admin` or `/admin/bookings` pages

Roles are stored in `localStorage` and persist across page refreshes.

### Navigation Visibility

#### Customer View (`/`)
- ✅ Book Appointment (visible)
- ❌ Staff (hidden)
- ❌ Admin (hidden)

#### Staff View (`/staff`)
- ✅ Book Appointment (visible)
- ✅ Staff (visible)
- ❌ Admin (hidden)

#### Admin View (`/admin`)
- ✅ Book Appointment (visible)
- ✅ Staff (visible)
- ✅ Admin (visible)

## Accessing Different Roles

### For Testing/Demo:

1. **Customer Role** (Default):
   - Just visit `/` - automatically set to CUSTOMER
   - Only sees "Book Appointment" in navigation

2. **Staff Role**:
   - Visit `/staff` - automatically set to STAFF
   - Sees "Book Appointment" and "Staff" in navigation
   - Admin link is hidden

3. **Admin Role**:
   - Visit `/admin` or `/admin/bookings` - automatically set to ADMIN
   - Sees all navigation links
   - Has access to "View Bookings" button in admin dashboard

## Admin Dashboard Features

- **View Bookings Button**: Prominent button in header to navigate to bookings page
- **Quick Actions Section**: Card-based navigation to bookings and future features
- **Service Management**: Full CRUD operations for services

## Future Enhancement

When OTP authentication is implemented:
- Roles will be fetched from database based on logged-in user
- More secure role checking
- Session-based authentication instead of localStorage

---

**Note**: Currently using localStorage for role management. This is fine for demos but should be replaced with proper authentication in production.
