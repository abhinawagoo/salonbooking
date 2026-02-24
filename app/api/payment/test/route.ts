import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendInvoiceWhatsApp } from '@/lib/whatsapp-cloud'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Test payment endpoint - simulates successful payment for development
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bookingId } = body

    // Allow test payment when USE_TEST_PAYMENT=true (set in Vercel for production testing)
    const allowTestPayment = process.env.USE_TEST_PAYMENT === 'true' || process.env.NODE_ENV === 'development'
    if (!allowTestPayment) {
      return NextResponse.json(
        { error: 'Test payment not available. Set USE_TEST_PAYMENT=true in Vercel for testing.' },
        { status: 403 }
      )
    }

    const payment = await prisma.payment.findFirst({
      where: { bookingId },
      include: { booking: { select: { token: true, user: { select: { name: true, mobile: true } } } } },
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

    if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
      const b = payment.booking
      if (b?.token && b?.user?.mobile) {
        const invoiceLink = `${APP_URL}/booking/invoice?token=${encodeURIComponent(b.token)}`
        sendInvoiceWhatsApp(b.user.mobile, b.user.name || 'Customer', invoiceLink).catch((e) =>
          console.error('Invoice WhatsApp failed:', e)
        )
      }
    }

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
