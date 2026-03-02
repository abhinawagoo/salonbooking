import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromCookie } from '@/lib/auth-jwt'
import { AUTH_DISABLED_FOR_NOW } from '@/lib/auth'
import { getSlotsInRange, isWithinClosingTime, MAX_BOOKINGS_PER_SLOT, parseBusinessHours, getDayConfig } from '@/lib/slots'
import { buildBookingNotificationPayload, sendBookingNotification } from '@/lib/notify'
import { normalizeMobileForDb } from '@/lib/phone'
import { createPhonePePayment } from '@/lib/phonepe'
import { nanoid } from 'nanoid'

type UserRow = { id: string; name: string; mobile: string; role: string }

function generateToken() {
  return Math.random().toString(36).substring(2, 10).toUpperCase() + 
         Math.random().toString(36).substring(2, 10).toUpperCase()
}

async function initiatePhonePePayment(bookingId: string, amount: number): Promise<string | null> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const redirectUrl = `${appUrl}/api/payment/callback?bookingId=${encodeURIComponent(bookingId)}`
  const amountPaisa = Math.round(amount * 100)
  return createPhonePePayment(bookingId, amountPaisa, redirectUrl)
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

    // Require login when auth is enabled - user must create profile (verify mobile) before booking
    const authRequired = !AUTH_DISABLED_FOR_NOW && process.env.NEXT_PUBLIC_DISABLE_AUTH !== 'true'
    const auth = getAuthFromCookie()
    if (authRequired && !auth) {
      return NextResponse.json(
        { error: 'Please login to book an appointment. Verify your mobile number first.' },
        { status: 401 }
      )
    }

    const mobile = normalizeMobileForDb(customerDetails.mobile || '')
    if (authRequired && auth && auth.mobile !== mobile) {
      return NextResponse.json(
        { error: 'Booking must be made with your verified mobile number. Please use the same number you logged in with.' },
        { status: 400 }
      )
    }

    let user: UserRow | null = null

    if (auth && auth.mobile === mobile) {
      const byId = await prisma.$queryRaw<UserRow[]>`
        SELECT id, name, mobile, role FROM "User" WHERE id = ${auth.userId} LIMIT 1
      `
      if (byId.length > 0) user = byId[0]
    }
    if (!user) {
      const byMobile = await prisma.$queryRaw<UserRow[]>`
        SELECT id, name, mobile, role FROM "User" WHERE mobile = ${mobile} LIMIT 1
      `
      if (byMobile.length > 0) user = byMobile[0]
    }
    if (!user) {
      // When auth required, user must exist (created via login) - no auto-create
      if (authRequired) {
        return NextResponse.json(
          { error: 'Please login first to book an appointment. Verify your mobile number.' },
          { status: 401 }
        )
      }
      const id = nanoid(24)
      await prisma.$executeRaw`
        INSERT INTO "User" (id, name, mobile, role, "createdAt", "updatedAt")
        VALUES (${id}, ${customerDetails.name || 'Guest'}, ${mobile}, 'CUSTOMER', now(), now())
      `
      user = { id, name: customerDetails.name || 'Guest', mobile, role: 'CUSTOMER' }
    } else if (customerDetails.name && customerDetails.name !== user.name) {
      await prisma.$executeRaw`
        UPDATE "User" SET name = ${customerDetails.name}, "updatedAt" = now() WHERE id = ${user.id}
      `
      user = { ...user, name: customerDetails.name }
    }

    // Get service details (services may contain duplicates for quantity)
    const serviceIds = services as string[]
    const uniqueIds = [...new Set(serviceIds)] as string[]
    const serviceDetails = await prisma.service.findMany({
      where: {
        id: { in: uniqueIds },
        isActive: true,
      },
    })

    const serviceMap = new Map(serviceDetails.map((s) => [s.id, s]))
    const invalidIds = serviceIds.filter((id) => !serviceMap.has(id))
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: 'Some services are invalid or inactive' },
        { status: 400 }
      )
    }

    // Total service duration (minutes) - sum duration for each instance
    const totalDurationMinutes = Math.max(
      30,
      serviceIds.reduce((sum, id) => sum + (serviceMap.get(id)?.duration ?? 0), 0)
    )

    // Validate: day is open and time is within business hours (per location)
    const bookingDate = new Date(date)
    const dayOfWeek = bookingDate.getDay()
    const locationWithHours = await prisma.location.findUnique({
      where: { id: locationId },
      select: { businessHoursJson: true, closedDatesJson: true },
    })
    const businessHours = parseBusinessHours(locationWithHours?.businessHoursJson ?? null)
    const closedDates: string[] = (() => {
      if (!locationWithHours?.closedDatesJson) return []
      try {
        const parsed = JSON.parse(locationWithHours.closedDatesJson)
        return Array.isArray(parsed) ? parsed.map(String) : []
      } catch {
        return []
      }
    })()
    const bookingDateStr = bookingDate.toISOString().slice(0, 10)
    if (closedDates.includes(bookingDateStr)) {
      return NextResponse.json(
        { error: 'The salon is closed on this date. Please choose another date.' },
        { status: 400 }
      )
    }
    const dayConfig = getDayConfig(businessHours, dayOfWeek)
    if (!dayConfig.isOpen) {
      return NextResponse.json(
        { error: 'The salon is closed on this day. Please choose another date.' },
        { status: 400 }
      )
    }
    const closeTime = dayConfig.closeTime || '18:00'
    if (!isWithinClosingTime(timeSlot, totalDurationMinutes, closeTime)) {
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

    // Calculate total amount - sum price for each service instance
    const totalAmount = serviceIds.reduce((sum, id) => sum + (serviceMap.get(id)?.price ?? 0), 0)
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
          create: serviceIds.map((serviceId) => {
            const s = serviceMap.get(serviceId)!
            return { serviceId: s.id, price: s.price }
          }),
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

    // Use test payment only when explicitly enabled; otherwise try PhonePe (works in dev if credentials set)
    const useTestPayment = process.env.USE_TEST_PAYMENT === 'true'
    let paymentUrl: string | null = null
    if (!useTestPayment) {
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
    // Skip staff notifications in dev when NOTIFY_STAFF_ON_BOOKING=false (avoids #131030 for seeded staff numbers)
    const notifyStaff = process.env.NOTIFY_STAFF_ON_BOOKING !== 'false'
    if (notifyStaff) {
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
    }
    
    return NextResponse.json({
      bookingId: booking.id,
      token: bookingToken,
      paymentUrl,
      useTestPayment: useTestPayment,
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
