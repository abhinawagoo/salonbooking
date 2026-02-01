import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Test payment endpoint - simulates successful payment for development
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bookingId } = body

    // Allow test payment if explicitly enabled or in development
    const allowTestPayment = process.env.USE_TEST_PAYMENT === 'true' || process.env.NODE_ENV === 'development'
    
    if (!allowTestPayment && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Test payment not available in production' },
        { status: 403 }
      )
    }

    const payment = await prisma.payment.findFirst({
      where: { bookingId },
    })
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }
    const paidAmount = payment.amount
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymentStatus: 'COMPLETED',
        gatewayReference: `TEST-${Date.now()}`,
        gatewayResponse: JSON.stringify({ test: true }),
        amountPaid: { increment: paidAmount },
        onlineAmount: { increment: paidAmount },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Test payment completed',
      redirectUrl: `/booking/confirmation?bookingId=${bookingId}`,
    })
  } catch (error) {
    console.error('Error processing test payment:', error)
    return NextResponse.json(
      { error: 'Failed to process test payment' },
      { status: 500 }
    )
  }
}
