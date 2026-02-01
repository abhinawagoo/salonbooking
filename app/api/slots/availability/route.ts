import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { format, startOfDay, endOfDay } from 'date-fns'
import { getSlotsInRange } from '@/lib/slots'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const locationId = searchParams.get('locationId')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      )
    }

    const start = startOfDay(new Date(startDate))
    const end = endOfDay(new Date(endDate))

    const where = {
      date: { gte: start, lte: end },
      status: { not: 'CANCELLED' },
      ...(locationId ? { locationId } : {}),
    }

    const bookings = await prisma.booking.findMany({
      where,
      select: {
        date: true,
        timeSlot: true,
        durationMinutes: true,
      },
    })

    // Per-slot occupancy: each booking occupies every 30-min slot in [timeSlot, timeSlot + durationMinutes)
    const slotCounts: Record<string, number> = {}
    bookings.forEach((booking) => {
      const dateStr = format(new Date(booking.date), 'yyyy-MM-dd')
      const duration = booking.durationMinutes ?? 30
      const slots = getSlotsInRange(booking.timeSlot, duration)
      slots.forEach((slot) => {
        const key = `${dateStr}_${slot}`
        slotCounts[key] = (slotCounts[key] || 0) + 1
      })
    })

    return NextResponse.json(slotCounts)
  } catch (error) {
    console.error('Error fetching slot availability:', error)
    return NextResponse.json(
      { error: 'Failed to fetch slot availability' },
      { status: 500 }
    )
  }
}
