import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromCookie } from '@/lib/auth-jwt'
import { getSlotsInRange, isWithinClosingTime, MAX_BOOKINGS_PER_SLOT, parseBusinessHours, getDayConfig } from '@/lib/slots'
import { format, startOfDay, endOfDay } from 'date-fns'

export const dynamic = 'force-dynamic'

/** PATCH: Reschedule a booking (user's own booking only). */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = getAuthFromCookie()
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = params
    const body = await request.json()
    const { date, timeSlot, locationId: newLocationId } = body

    if (!date || !timeSlot || typeof timeSlot !== 'string') {
      return NextResponse.json(
        { error: 'date and timeSlot are required' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        location: true,
        services: { include: { service: true } },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    if (booking.userId !== auth.userId) {
      return NextResponse.json({ error: 'Not authorized to reschedule this booking' }, { status: 403 })
    }
    if (booking.status !== 'BOOKED') {
      return NextResponse.json(
        { error: 'Only active bookings can be rescheduled. Cancelled or completed bookings cannot be changed.' },
        { status: 400 }
      )
    }

    const targetLocationId = (newLocationId && typeof newLocationId === 'string') ? newLocationId.trim() || null : booking.locationId
    if (!targetLocationId) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 })
    }

    const locationExists = await prisma.location.findUnique({
      where: { id: targetLocationId, isActive: true },
      select: { id: true },
    })
    if (!locationExists) {
      return NextResponse.json({ error: 'Invalid or inactive location' }, { status: 400 })
    }

    const newDate = new Date(date)
    const today = new Date()
    if (newDate < startOfDay(today)) {
      return NextResponse.json({ error: 'Cannot reschedule to a past date' }, { status: 400 })
    }

    const totalDuration = booking.durationMinutes ?? (booking.services.reduce((s, bs) => s + (bs.service?.duration ?? 30) * (bs.quantity ?? 1), 0) || 30)
    const location = await prisma.location.findUnique({
      where: { id: targetLocationId },
      select: { businessHoursJson: true, closedDatesJson: true },
    })
    const businessHours = parseBusinessHours(location?.businessHoursJson ?? null)
    const closedDates: string[] = location?.closedDatesJson
      ? (() => {
          try {
            const p = JSON.parse(location.closedDatesJson)
            return Array.isArray(p) ? p.map(String) : []
          } catch {
            return []
          }
        })()
      : []

    const dateStr = format(newDate, 'yyyy-MM-dd')
    if (closedDates.includes(dateStr)) {
      return NextResponse.json({ error: 'Salon is closed on this date' }, { status: 400 })
    }
    const dayConfig = getDayConfig(businessHours, newDate.getDay())
    if (!dayConfig.isOpen || !dayConfig.closeTime) {
      return NextResponse.json({ error: 'Salon is closed on this day' }, { status: 400 })
    }
    if (!isWithinClosingTime(timeSlot, totalDuration, dayConfig.closeTime)) {
      return NextResponse.json({ error: 'Selected time would end after closing' }, { status: 400 })
    }

    const startOfDate = startOfDay(newDate)
    const endOfDate = endOfDay(newDate)
    const existingBookings = await prisma.booking.findMany({
      where: {
        locationId: targetLocationId,
        date: { gte: startOfDate, lte: endOfDate },
        status: { not: 'CANCELLED' },
        id: { not: id },
      },
      select: { timeSlot: true, durationMinutes: true },
    })

    const slotCounts: Record<string, number> = {}
    existingBookings.forEach((b) => {
      const dur = b.durationMinutes ?? 30
      getSlotsInRange(b.timeSlot, dur).forEach((slot) => {
        slotCounts[slot] = (slotCounts[slot] || 0) + 1
      })
    })

    const slotsNeeded = getSlotsInRange(timeSlot, totalDuration)
    const isAvailable = slotsNeeded.every((s) => (slotCounts[s] || 0) < MAX_BOOKINGS_PER_SLOT)
    if (!isAvailable) {
      return NextResponse.json({ error: 'This time slot is no longer available. Please choose another.' }, { status: 400 })
    }

    await prisma.booking.update({
      where: { id },
      data: { date: newDate, timeSlot, locationId: targetLocationId },
    })

    return NextResponse.json({ ok: true, date: newDate.toISOString(), timeSlot, locationId: targetLocationId })
  } catch (error) {
    console.error('Reschedule error:', error)
    return NextResponse.json({ error: 'Failed to reschedule' }, { status: 500 })
  }
}
