import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromCookie } from '@/lib/auth-jwt'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = getAuthFromCookie()
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: auth.userId },
    orderBy: { date: 'desc' },
    include: {
      location: { select: { name: true, address: true } },
      services: { include: { service: { select: { name: true } } } },
      payment: true,
    },
  })

  return NextResponse.json(
    bookings.map((b) => ({
      id: b.id,
      token: b.token,
      date: b.date,
      timeSlot: b.timeSlot,
      status: b.status,
      locationName: b.location?.name,
      locationAddress: b.location?.address,
      services: b.services.map((bs) => ({ name: bs.service.name, price: bs.price })),
      totalAmount: b.payment?.totalAmount ?? 0,
      amountPaid: b.payment?.amountPaid ?? 0,
      paymentStatus: b.payment?.paymentStatus ?? 'PENDING',
    }))
  )
}
