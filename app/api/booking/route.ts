import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { getSlotsInRange, isWithinClosingTime, MAX_BOOKINGS_PER_SLOT } from '@/lib/slots'
import { buildBookingNotificationPayload, sendBookingNotification } from '@/lib/notify'

function generateToken() {
  return Math.random().toString(36).substring(2, 10).toUpperCase() + 
         Math.random().toString(36).substring(2, 10).toUpperCase()
}

async function initiatePhonePePayment(bookingId: string, amount: number) {
  try {
    const merchantId = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT'
    const saltKey = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6cc41fdb'
    const saltIndex = process.env.PHONEPE_SALT_INDEX || '1'
    const env = process.env.PHONEPE_ENV || 'sandbox'
    
    const baseUrl = env === 'production' 
      ? 'https://api.phonepe.com/apis/hermes'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox'

    const payload = {
      merchantId,
      merchantTransactionId: `TXN${Date.now()}`,
      amount: amount * 100, // Amount in paise
      merchantUserId: bookingId,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback?bookingId=${bookingId}`,
      redirectMode: 'POST',
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback`,
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    }

    const payloadString = JSON.stringify(payload)
    const base64Payload = Buffer.from(payloadString).toString('base64')
    const stringToHash = base64Payload + '/pg/v1/pay' + saltKey
    const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex')
    const xVerify = sha256Hash + '###' + saltIndex

    const response = await fetch(`${baseUrl}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        request: base64Payload,
      }),
    })

    const data = await response.json()
    
    if (data.success && data.data.instrumentResponse.redirectInfo.url) {
      return data.data.instrumentResponse.redirectInfo.url
    }
    
    return null
  } catch (error) {
    console.error('Error initiating PhonePe payment:', error)
    return null
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { locationId, services, customerDetails, date, timeSlot, paymentType } = body

    if (!locationId) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      )
    }

    const location = await prisma.location.findUnique({
      where: { id: locationId, isActive: true },
    })
    if (!location) {
      return NextResponse.json(
        { error: 'Invalid or inactive location' },
        { status: 400 }
      )
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { mobile: customerDetails.mobile },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: customerDetails.name,
          mobile: customerDetails.mobile,
          role: 'CUSTOMER',
        },
      })
    } else {
      // Update name if provided
      if (customerDetails.name) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { name: customerDetails.name },
        })
      }
    }

    // Get service details
    const serviceDetails = await prisma.service.findMany({
      where: {
        id: { in: services },
        isActive: true,
      },
    })

    if (serviceDetails.length !== services.length) {
      return NextResponse.json(
        { error: 'Some services are invalid or inactive' },
        { status: 400 }
      )
    }

    // Total service duration (minutes)
    const totalDurationMinutes = Math.max(30, serviceDetails.reduce((sum, s) => sum + s.duration, 0))

    // Validate: service must finish by closing + buffer
    if (!isWithinClosingTime(timeSlot, totalDurationMinutes)) {
      return NextResponse.json(
        { error: 'Selected time would end after salon closing. Please choose an earlier slot.' },
        { status: 400 }
      )
    }

    // Build occupancy for this date: each existing booking occupies [timeSlot, timeSlot + duration)
    const bookingDateObj = new Date(date)
    const startOfBookingDate = new Date(bookingDateObj)
    startOfBookingDate.setHours(0, 0, 0, 0)
    const endOfBookingDate = new Date(bookingDateObj)
    endOfBookingDate.setHours(23, 59, 59, 999)

    const existingBookings = await prisma.booking.findMany({
      where: {
        locationId,
        date: { gte: startOfBookingDate, lte: endOfBookingDate },
        status: { not: 'CANCELLED' },
      },
      select: { timeSlot: true, durationMinutes: true },
    })

    const slotCounts: Record<string, number> = {}
    existingBookings.forEach((b) => {
      const duration = b.durationMinutes ?? 30
      getSlotsInRange(b.timeSlot, duration).forEach((slot) => {
        slotCounts[slot] = (slotCounts[slot] || 0) + 1
      })
    })

    const newBookingSlots = getSlotsInRange(timeSlot, totalDurationMinutes)
    const wouldExceed = newBookingSlots.some((slot) => (slotCounts[slot] || 0) >= MAX_BOOKINGS_PER_SLOT)
    if (wouldExceed) {
      return NextResponse.json(
        { error: `This time is no longer available (slot full for the service duration). Please choose another time.` },
        { status: 400 }
      )
    }

    // Calculate total amount
    const totalAmount = serviceDetails.reduce((sum, service) => sum + service.price, 0)
    const advanceAmount = paymentType === 'ADVANCE' ? totalAmount * 0.3 : totalAmount

    // Generate booking token
    const bookingToken = generateToken()

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        locationId,
        userId: user.id,
        date: new Date(date),
        timeSlot,
        durationMinutes: totalDurationMinutes,
        status: 'BOOKED',
        notes: customerDetails.notes,
        token: bookingToken,
        services: {
          create: serviceDetails.map((service) => ({
            serviceId: service.id,
            price: service.price,
          })),
        },
        payment: {
          create: {
            amount: advanceAmount,
            totalAmount,
            amountPaid: 0,
            onlineAmount: 0,
            cashAmount: 0,
            paymentType: paymentType === 'ADVANCE' ? 'ADVANCE' : 'FULL',
            paymentStatus: 'PENDING',
          },
        },
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        payment: true,
      },
    })

    // In development, skip PhonePe and use test payment
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.USE_TEST_PAYMENT === 'true'
    
    let paymentUrl = null
    if (!isDevelopment) {
      // Initiate PhonePe payment only in production
      paymentUrl = await initiatePhonePePayment(booking.id, advanceAmount)
    }

    // Notify customer and staff: WhatsApp (template) or SMS with booking details + bill link
    const totalAmountForNotify = booking.payment?.totalAmount ?? totalAmount
    const payload = buildBookingNotificationPayload(
      {
        token: booking.token,
        date: booking.date,
        timeSlot: booking.timeSlot,
        services: booking.services,
        user: { name: user.name, mobile: user.mobile },
      },
      totalAmountForNotify
    )
    sendBookingNotification(user.mobile, payload, 'customer').catch((e) =>
      console.error('Notify customer failed:', e)
    )
    prisma.user
      .findMany({ where: { role: { in: ['STAFF', 'ADMIN'] } }, select: { mobile: true } })
      .then((staff) => {
        staff.forEach((s) => {
          if (s.mobile && s.mobile !== user.mobile) {
            sendBookingNotification(s.mobile, payload, 'staff').catch((e) =>
              console.error('Notify staff failed:', e)
            )
          }
        })
      })
      .catch((e) => console.error('Fetch staff for notify failed:', e))
    
    return NextResponse.json({
      bookingId: booking.id,
      token: bookingToken,
      paymentUrl,
      useTestPayment: isDevelopment, // Flag to indicate test payment should be used
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
