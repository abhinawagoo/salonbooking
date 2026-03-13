import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  parseISO,
} from 'date-fns'

export const dynamic = 'force-dynamic'
export type ReportPeriod = 'day' | 'week' | 'month' | 'year'

function getDateRange(period: ReportPeriod, dateStr: string): { from: Date; to: Date } {
  let date: Date
  try {
    date = parseISO(dateStr)
    if (Number.isNaN(date.getTime())) date = new Date()
  } catch {
    date = new Date()
  }
  switch (period) {
    case 'day':
      return { from: startOfDay(date), to: endOfDay(date) }
    case 'week':
      return { from: startOfWeek(date, { weekStartsOn: 1 }), to: endOfWeek(date, { weekStartsOn: 1 }) }
    case 'month':
      return { from: startOfMonth(date), to: endOfMonth(date) }
    case 'year':
      return { from: startOfYear(date), to: endOfYear(date) }
    default:
      return { from: startOfDay(date), to: endOfDay(date) }
  }
}

/** GET: Sales/bookings report by location and period (day, week, month, year) or custom date range (fromDate, toDate) */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('locationId') || undefined
    const period = (searchParams.get('period') as ReportPeriod) || 'day'
    const dateStr = searchParams.get('date') || new Date().toISOString().slice(0, 10)
    const fromDateParam = searchParams.get('fromDate')
    const toDateParam = searchParams.get('toDate')

    let from: Date
    let to: Date
    if (fromDateParam && toDateParam) {
      from = startOfDay(parseISO(fromDateParam))
      to = startOfDay(parseISO(toDateParam))
      if (from > to) [from, to] = [to, from]
    } else {
      const range = getDateRange(period, dateStr)
      from = range.from
      to = range.to
    }

    const where = {
      date: { gte: from, lte: to },
      status: { not: 'CANCELLED' as const },
      payment: { paymentStatus: 'COMPLETED' as const },
      ...(locationId ? { locationId } : {}),
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        location: { select: { id: true, name: true } },
        user: { select: { name: true, mobile: true } },
        services: { include: { service: { select: { name: true } } } },
        payment: { select: { totalAmount: true, amountPaid: true, onlineAmount: true, cashAmount: true, paymentStatus: true } },
      },
      orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
    })

    const totalBookings = bookings.length
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.payment?.amountPaid ?? 0), 0)

    const byLocation: { locationId: string; locationName: string; totalBookings: number; totalRevenue: number }[] = []
    if (!locationId) {
      const map = new Map<string, { locationName: string; totalBookings: number; totalRevenue: number }>()
      for (const b of bookings) {
        const locId = b.locationId || '_none'
        const locName = b.location?.name ?? 'No location'
        const existing = map.get(locId)
        const paid = b.payment?.amountPaid ?? 0
        if (existing) {
          existing.totalBookings += 1
          existing.totalRevenue += paid
        } else {
          map.set(locId, { locationName: locName, totalBookings: 1, totalRevenue: paid })
        }
      }
      map.forEach((v, locationId) => byLocation.push({ locationId, ...v }))
    }

    return NextResponse.json({
      period,
      dateFrom: from.toISOString(),
      dateTo: to.toISOString(),
      locationId: locationId || null,
      summary: { totalBookings, totalRevenue },
      byLocation: byLocation.length ? byLocation : undefined,
      bookings: bookings.map((b) => ({
        id: b.id,
        token: b.token,
        date: b.date,
        timeSlot: b.timeSlot,
        status: b.status,
        locationName: b.location?.name,
        customerName: b.user.name,
        customerMobile: b.user.mobile,
        totalAmount: b.payment?.totalAmount ?? b.services.reduce((s, bs) => s + bs.price, 0),
        amountPaid: b.payment?.amountPaid ?? 0,
        paymentStatus: b.payment?.paymentStatus,
      })),
    })
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    )
  }
}
