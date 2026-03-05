import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrAssignBillNo } from '@/lib/billNo'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        location: true,
        user: { select: { id: true, name: true, mobile: true, role: true } },
        services: {
          include: {
            service: true,
          },
        },
        payment: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    const billNo = await getOrAssignBillNo(booking.id)
    const totalAmount = booking.payment?.totalAmount ?? booking.services.reduce((sum, bs) => sum + bs.price, 0)
    const amountPaid = booking.payment?.amountPaid ?? 0
    const dueAmount = Math.max(0, totalAmount - amountPaid)

    return NextResponse.json({
      token: booking.token,
      billNo,
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
        quantity: bs.quantity ?? 1,
      })),
      paymentStatus: booking.payment?.paymentStatus || 'PENDING',
      totalAmount,
      amountPaid,
      dueAmount,
      onlineAmount: booking.payment?.onlineAmount ?? 0,
      cashAmount: booking.payment?.cashAmount ?? 0,
      customerName: booking.user?.name ?? null,
      customerMobile: booking.user?.mobile ?? null,
    })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}
