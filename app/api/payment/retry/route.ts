import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createPhonePePayment } from '@/lib/phonepe'

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')

/**
 * Retry payment for an existing booking (e.g. after payment failed).
 * Returns PhonePe payment URL. Only for bookings with PENDING or FAILED payment.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 })
    }

    const payment = await prisma.payment.findFirst({
      where: { bookingId },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.paymentStatus === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment already completed', redirectUrl: `${APP_URL}/booking/confirmation?bookingId=${bookingId}` },
        { status: 400 }
      )
    }

    const amount = payment.amount
    const redirectUrl = `${APP_URL}/api/payment/callback?bookingId=${encodeURIComponent(bookingId)}`
    const amountPaisa = Math.round(amount * 100)
    const paymentUrl = await createPhonePePayment(bookingId, amountPaisa, redirectUrl)

    if (!paymentUrl) {
      return NextResponse.json(
        { error: 'Failed to create payment link. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ paymentUrl })
  } catch (error) {
    console.error('Payment retry error:', error)
    return NextResponse.json(
      { error: 'Failed to retry payment' },
      { status: 500 }
    )
  }
}
