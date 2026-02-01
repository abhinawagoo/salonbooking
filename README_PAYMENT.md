# Payment Integration Guide

## 🧪 Test Payment Mode (Development)

The app includes a test payment system for development and demos.

### How It Works

1. **In Development Mode:**
   - Automatically uses test payment when PhonePe credentials are not configured
   - No real money is charged
   - Payment is instantly approved

2. **Test Payment Flow:**
   - User selects payment amount (Full/Advance)
   - Clicks "Pay Now"
   - Payment is processed instantly via `/api/payment/test`
   - User is redirected to confirmation page

### Enabling Test Payment

**Option 1: Automatic (Development)**
- Test payment is automatically used when `NODE_ENV=development`
- No PhonePe credentials needed

**Option 2: Force Test Payment**
- Set `USE_TEST_PAYMENT=true` in `.env`
- Works even in production (for demos/testing)

### Test Payment Endpoint

```
POST /api/payment/test
Body: { "bookingId": "..." }
```

This endpoint:
- Marks payment as COMPLETED
- Generates a test transaction ID
- Returns redirect URL to confirmation page

## 💳 PhonePe Integration (Production)

### Setup Steps

1. **Get PhonePe Credentials:**
   - Sign up at [PhonePe Developer Portal](https://developer.phonepe.com)
   - Get Merchant ID and Salt Key
   - Start with sandbox credentials for testing

2. **Configure Environment Variables:**
   ```env
   PHONEPE_MERCHANT_ID=your-merchant-id
   PHONEPE_SALT_KEY=your-salt-key
   PHONEPE_SALT_INDEX=1
   PHONEPE_ENV=sandbox  # or "production"
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

3. **Test in Sandbox:**
   - Use sandbox credentials first
   - Test with small amounts
   - Verify callback URLs work

4. **Go Live:**
   - Get production credentials from PhonePe
   - Update environment variables
   - Set `PHONEPE_ENV=production`

### Payment Flow

1. User selects services and completes booking
2. Booking is created with PENDING payment status
3. PhonePe payment URL is generated
4. User is redirected to PhonePe
5. User completes payment on PhonePe
6. PhonePe redirects back to `/api/payment/callback`
7. Payment status is updated to COMPLETED
8. User sees confirmation page

## 🔧 Adding More Payment Methods

The UI is ready for multiple payment methods. To add Razorpay:

1. **Install Razorpay SDK:**
   ```bash
   npm install razorpay
   ```

2. **Create Razorpay API Route:**
   - Similar to PhonePe implementation
   - Use Razorpay SDK to create orders
   - Handle Razorpay callbacks

3. **Update Payment Screen:**
   - Set `available: true` for Razorpay in `PaymentScreen.tsx`
   - Add Razorpay payment logic

## 📝 Payment Status Flow

- **PENDING** - Payment initiated, waiting for completion
- **COMPLETED** - Payment successful
- **FAILED** - Payment failed or cancelled
- **REFUNDED** - Payment refunded (future feature)

## 🐛 Troubleshooting

### Test Payment Not Working

- Check `NODE_ENV` is set to `development`
- Or set `USE_TEST_PAYMENT=true`
- Verify booking ID exists in database
- Check server logs for errors

### PhonePe Payment Issues

- Verify credentials are correct
- Check `NEXT_PUBLIC_APP_URL` matches your domain
- Ensure callback URLs are whitelisted in PhonePe dashboard
- Test in sandbox mode first
- Check PhonePe transaction logs

### Payment Callback Not Working

- Verify callback URL is accessible
- Check SSL certificate (HTTPS required)
- Ensure callback URL matches PhonePe configuration
- Check server logs for callback errors

---

**For demos:** Use test payment mode - it's instant and requires no setup! 🚀
