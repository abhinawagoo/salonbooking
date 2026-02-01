import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }
    const booking = await prisma.booking.findFirst({
      where: { token },
      include: {
        location: true,
        user: true,
        services: { include: { service: true } },
        payment: true,
      },
    })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    const totalAmount = booking.payment?.totalAmount ?? booking.services.reduce((s, bs) => s + bs.price, 0)
    const amountPaid = booking.payment?.amountPaid ?? 0
    const dueAmount = Math.max(0, totalAmount - amountPaid)
    return NextResponse.json({
      token: booking.token,
      date: booking.date,
      timeSlot: booking.timeSlot,
      locationName: booking.location?.name ?? null,
      locationAddress: booking.location?.address ?? null,
      locationMobile: booking.location?.mobile ?? null,
      locationImageUrl: booking.location?.imageUrl ?? null,
      services: booking.services.map((bs) => ({
        id: bs.service.id,
        name: bs.service.name,
        price: bs.price,
      })),
      paymentStatus: booking.payment?.paymentStatus || 'PENDING',
      totalAmount,
      amountPaid,
      dueAmount,
      onlineAmount: booking.payment?.onlineAmount ?? 0,
      cashAmount: booking.payment?.cashAmount ?? 0,
      customerName: booking.user.name,
      customerMobile: booking.user.mobile,
    })
  } catch (error) {
    console.error('Error fetching booking by token:', error)
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 })
  }
}
