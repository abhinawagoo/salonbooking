import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPhonePeOrderStatus } from '@/lib/phonepe'
import { sendInvoiceWhatsApp } from '@/lib/whatsapp-cloud'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// PhonePe PG v2: user is redirected here after payment. We use Order Status API to confirm.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bookingId = searchParams.get('bookingId')

  if (!bookingId) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const base = new URL(request.url).origin

  try {
    const status = await getPhonePeOrderStatus(bookingId)
    const state = status?.state?.toUpperCase()

    const payment = await prisma.payment.findFirst({
      where: { bookingId },
      include: { booking: { select: { token: true, user: { select: { name: true, mobile: true } } } } },
    })
    if (!payment) {
      return NextResponse.redirect(`${base}/booking/payment?error=payment_not_found`)
    }

    const isSuccess = state === 'COMPLETED' || state === 'PAID'
    if (isSuccess) {
      const paidAmount = payment.amount
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          paymentStatus: 'COMPLETED',
          gatewayReference: status?.orderId ?? undefined,
          gatewayResponse: JSON.stringify(status),
          amountPaid: { increment: paidAmount },
          onlineAmount: { increment: paidAmount },
        },
      })
      // Send invoice link to customer via WhatsApp Cloud API (direct, no BSP)
      const token = payment.booking?.token
      const user = payment.booking?.user
      if (token && user?.mobile && process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
        const invoiceLink = `${APP_URL}/booking/invoice?token=${encodeURIComponent(token)}`
        sendInvoiceWhatsApp(user.mobile, user.name || 'Customer', invoiceLink).catch((e) =>
          console.error('Invoice WhatsApp failed:', e)
        )
      }
      return NextResponse.redirect(`${base}/booking/confirmation?bookingId=${bookingId}&payment=completed`)
    }

    if (state === 'FAILED' || state === 'CANCELLED' || state === 'EXPIRED') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          paymentStatus: 'FAILED',
          gatewayResponse: JSON.stringify(status),
        },
      })
    }

    return NextResponse.redirect(`${base}/booking/payment?error=payment_failed&bookingId=${bookingId}`)
  } catch (e) {
    console.error('Payment callback error:', e)
    return NextResponse.redirect(`${base}/booking/payment?error=callback_failed&bookingId=${bookingId}`)
  }
}
