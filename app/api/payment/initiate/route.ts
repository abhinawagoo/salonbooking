import { NextResponse } from 'next/server'
import { createPhonePePayment } from '@/lib/phonepe'

// PhonePe PG v2: OAuth + POST /checkout/v2/pay
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bookingId, amount } = body

    if (!bookingId || amount == null) {
      return NextResponse.json({ error: 'bookingId and amount required' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const redirectUrl = `${appUrl}/api/payment/callback?bookingId=${encodeURIComponent(bookingId)}`

    const amountPaisa = Math.round(Number(amount) * 100)
    const paymentUrl = await createPhonePePayment(bookingId, amountPaisa, redirectUrl)

    if (paymentUrl) {
      return NextResponse.json({ paymentUrl })
    }

    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error initiating payment:', error)
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    )
  }
}
