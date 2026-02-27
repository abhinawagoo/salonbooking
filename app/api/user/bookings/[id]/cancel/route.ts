import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromCookie } from '@/lib/auth-jwt'

export const dynamic = 'force-dynamic'

/** PATCH: Cancel a booking (user's own booking only). */
export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = getAuthFromCookie()
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = params

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: { userId: true, status: true },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    if (booking.userId !== auth.userId) {
      return NextResponse.json({ error: 'Not authorized to cancel this booking' }, { status: 403 })
    }
    if (booking.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Booking is already cancelled' }, { status: 400 })
    }
    if (booking.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Completed bookings cannot be cancelled' }, { status: 400 })
    }

    await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Cancel error:', error)
    return NextResponse.json({ error: 'Failed to cancel' }, { status: 500 })
  }
}
