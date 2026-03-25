import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendInvoiceWhatsApp } from '@/lib/whatsapp-cloud'
import { getOrAssignBillNo } from '@/lib/billNo'
import crypto from 'crypto'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * PhonePe S2S Webhook (recommended for verifying payment).
 * Docs: https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/webhook
 * Events: checkout.order.completed | checkout.order.failed | pg.refund.completed | pg.refund.failed
 * Auth: Authorization header = SHA256(username:password) (hex). Configure the same username/password in PhonePe Dashboard → Webhook.
 * Security: use long random strings (not your email); see .env.example. Comparison uses timing-safe equality.
 */
function verifyWebhookAuth(request: Request): boolean {
  const username = process.env.PHONEPE_WEBHOOK_USERNAME
  const password = process.env.PHONEPE_WEBHOOK_PASSWORD
  if (!username || !password) return false
  const expectedHex = crypto
    .createHash('sha256')
    .update(`${username}:${password}`)
    .digest('hex')
  const header = request.headers.get('Authorization') ?? ''
  const receivedHex = header.replace(/^SHA256\s+/i, '').trim().toLowerCase()
  if (!/^[0-9a-f]{64}$/i.test(receivedHex)) return false
  const a = Buffer.from(expectedHex, 'hex')
  const b = Buffer.from(receivedHex, 'hex')
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export async function POST(request: Request) {
  try {
    if (!verifyWebhookAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const event = body.event as string | undefined
    const payload = body.payload as Record<string, unknown> | undefined
    const state = payload?.state as string | undefined
    const merchantOrderId = payload?.merchantOrderId as string | undefined

    if (!event || !payload) {
      return NextResponse.json({ error: 'Bad payload' }, { status: 400 })
    }

    // Order events – use payload.state only (per docs)
    if (event === 'checkout.order.completed' || event === 'checkout.order.failed') {
      if (!merchantOrderId) {
        return NextResponse.json({ ok: true })
      }
      const bookingId = merchantOrderId
      const payment = await prisma.payment.findFirst({
        where: { bookingId },
      })
      if (!payment) {
        return NextResponse.json({ ok: true })
      }

      const isSuccess = state === 'COMPLETED' || state === 'PAID'
      const paymentStatus = isSuccess ? 'COMPLETED' : 'FAILED'
      const paidAmount = isSuccess ? payment.amount : 0

      // Idempotent: only update amounts if not already completed (avoids double-count when webhook + callback both fire)
      const alreadyCompleted = payment.paymentStatus === 'COMPLETED'
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          paymentStatus,
          gatewayReference: (payload.orderId as string) ?? undefined,
          gatewayResponse: JSON.stringify(body),
          ...(isSuccess && !alreadyCompleted && {
            amountPaid: paidAmount,
            onlineAmount: paidAmount,
          }),
        },
      })
      // Send invoice link to customer via WhatsApp Cloud API (direct, no BSP)
      if (isSuccess && process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
        const b = await prisma.booking.findUnique({
          where: { id: bookingId },
          select: { token: true, user: { select: { name: true, mobile: true } } },
        })
        if (b?.token && b?.user?.mobile) {
          const invoiceLink = `${APP_URL}/booking/invoice?token=${encodeURIComponent(b.token)}`
          const amountPaid = payment.amount
          void (async () => {
            try {
              const billNo = await getOrAssignBillNo(bookingId)
              const p = await prisma.payment.findFirst({ where: { bookingId } })
              const balanceDue = Math.max(0, (p?.totalAmount ?? 0) - (p?.amountPaid ?? 0))
              await sendInvoiceWhatsApp(b.user.mobile, b.user.name || 'Customer', amountPaid, new Date(), invoiceLink, {
                billNo,
                balanceDue,
                bookingToken: b.token,
              })
            } catch (e) {
              console.error('Invoice WhatsApp failed:', e)
            }
          })()
        }
      }
      return NextResponse.json({ ok: true })
    }

    // Refund events – optional: update refund state in your DB if you store it
    if (event === 'pg.refund.completed' || event === 'pg.refund.failed') {
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('PhonePe webhook error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
