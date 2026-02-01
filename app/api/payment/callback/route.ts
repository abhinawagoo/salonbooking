import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { response } = body

    // Decode response
    const decodedResponse = JSON.parse(Buffer.from(response, 'base64').toString('utf-8'))
    
    const saltKey = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6cc41fdb'
    const saltIndex = process.env.PHONEPE_SALT_INDEX || '1'

    // Verify checksum
    const checksumString = `/pg/v1/status/${decodedResponse.data.merchantId}/${decodedResponse.data.transactionId}` + saltKey
    const checksum = crypto.createHash('sha256').update(checksumString).digest('hex') + '###' + saltIndex

    if (checksum !== decodedResponse.checksum) {
      return NextResponse.json({ error: 'Invalid checksum' }, { status: 400 })
    }

    // Update payment status and amounts when online payment succeeds
    const bookingId = decodedResponse.data.merchantUserId
    const paymentStatus = decodedResponse.code === 'PAYMENT_SUCCESS' ? 'COMPLETED' : 'FAILED'

    const payment = await prisma.payment.findFirst({
      where: { bookingId },
    })
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const paidAmount = paymentStatus === 'COMPLETED' ? payment.amount : 0
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymentStatus,
        gatewayReference: decodedResponse.data.transactionId,
        gatewayResponse: JSON.stringify(decodedResponse),
        ...(paymentStatus === 'COMPLETED' && {
          amountPaid: { increment: paidAmount },
          onlineAmount: { increment: paidAmount },
        }),
      },
    })

    // Return redirect URL
    const redirectUrl = paymentStatus === 'COMPLETED'
      ? `/booking/confirmation?bookingId=${bookingId}`
      : `/booking/payment?error=payment_failed`

    return NextResponse.json({ redirectUrl, paymentStatus })
  } catch (error) {
    console.error('Error processing payment callback:', error)
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  // Handle PhonePe redirect
  const { searchParams } = new URL(request.url)
  const bookingId = searchParams.get('bookingId')
  
  if (bookingId) {
    // Redirect to confirmation page with bookingId
    const confirmationUrl = new URL(`/booking/confirmation?bookingId=${bookingId}`, request.url)
    // Add a flag to indicate payment completion
    confirmationUrl.searchParams.set('payment', 'completed')
    return NextResponse.redirect(confirmationUrl)
  }
  
  return NextResponse.redirect(new URL('/', request.url))
}
