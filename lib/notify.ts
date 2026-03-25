/**
 * Booking notifications: WhatsApp (template) or SMS with bill link.
 * Supports:
 * - WhatsApp Cloud API (direct, no BSP): Preferred when WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID set.
 * - MSG91 (India): WhatsApp + SMS, cheap, no markup over Meta for WhatsApp.
 * - 360dialog: Direct Meta BSP, WhatsApp only (use MSG91 for SMS fallback).
 */

import { sendBookingConfirmationWhatsApp } from './whatsapp-cloud'
import { toE164 } from './phone'
import { getPublicInvoiceUrl } from './invoiceUrl'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export interface BookingNotificationPayload {
  customerName: string
  customerMobile: string
  bookingToken: string
  date: string
  timeSlot: string
  servicesSummary: string
  totalAmount: number
  invoiceLink: string
}

function buildInvoiceLink(token: string): string {
  return getPublicInvoiceUrl(token)
}

function buildSmsMessage(p: BookingNotificationPayload, isStaff: boolean): string {
  const who = isStaff ? 'New booking (staff):' : 'Your booking is confirmed.'
  return `${who} Token: ${p.bookingToken}. Date: ${p.date} at ${p.timeSlot}. Services: ${p.servicesSummary}. Total: ₹${p.totalAmount}. View/Download bill: ${p.invoiceLink}`
}

/** MSG91 SMS – works in India, cheap. */
async function sendSmsMsg91(mobile: string, message: string): Promise<boolean> {
  const authkey = process.env.MSG91_AUTH_KEY
  const sender = process.env.MSG91_SENDER_ID || 'SALON'
  if (!authkey) {
    console.warn('MSG91_AUTH_KEY not set, skipping SMS')
    return false
  }
  const to = toE164(mobile)
  const url = `https://api.msg91.com/api/sendhttp.php?authkey=${encodeURIComponent(authkey)}&mobiles=${encodeURIComponent(to)}&message=${encodeURIComponent(message)}&sender=${encodeURIComponent(sender)}&route=4&country=91`
  try {
    const res = await fetch(url)
    const text = await res.text()
    if (!res.ok) {
      console.error('MSG91 SMS error:', res.status, text)
      return false
    }
    return true
  } catch (e) {
    console.error('MSG91 SMS request failed:', e)
    return false
  }
}

/** 360dialog – direct Meta BSP, WhatsApp template only. */
async function sendWhatsApp360dialog(mobile: string, templateName: string, params: string[]): Promise<boolean> {
  const apiKey = process.env.DIALOG360_API_KEY
  if (!apiKey) {
    console.warn('DIALOG360_API_KEY not set, skipping WhatsApp')
    return false
  }
  const to = toE164(mobile)
  const body = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: process.env.DIALOG360_TEMPLATE_LANG || 'en' },
      components: [
        {
          type: 'body',
          parameters: params.map((value) => ({ type: 'text', text: value })),
        },
      ],
    },
  }
  try {
    const res = await fetch('https://waba-v2.360dialog.io/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      console.error('360dialog WhatsApp error:', res.status, data)
      return false
    }
    return true
  } catch (e) {
    console.error('360dialog WhatsApp request failed:', e)
    return false
  }
}

/** MSG91 WhatsApp outbound template. See https://docs.msg91.com/whatsapp/template-bulk */
async function sendWhatsAppMsg91(mobile: string, templateId: string, params: Record<string, string>): Promise<boolean> {
  const authkey = process.env.MSG91_AUTH_KEY
  const flowId = process.env.MSG91_WHATSAPP_TEMPLATE_ID || templateId
  if (!authkey) {
    console.warn('MSG91_AUTH_KEY not set, skipping WhatsApp')
    return false
  }
  const recipient = toE164(mobile)
  const body = {
    authkey,
    recipient,
    template_id: flowId,
    ...params,
  }
  try {
    const res = await fetch('https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const text = await res.text()
      console.error('MSG91 WhatsApp error:', res.status, text)
      return false
    }
    return true
  } catch (e) {
    console.error('MSG91 WhatsApp request failed:', e)
    return false
  }
}

export type NotifyProvider = 'msg91' | '360dialog'

function getProvider(): NotifyProvider | null {
  const p = (process.env.NOTIFY_PROVIDER || '').toLowerCase()
  if (p === 'msg91' || p === '360dialog') return p as NotifyProvider
  if (process.env.MSG91_AUTH_KEY) return 'msg91'
  if (process.env.DIALOG360_API_KEY) return '360dialog'
  return null
}

function isWhatsAppCloudConfigured(): boolean {
  return !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)
}

/**
 * Send booking notification to one recipient (customer or staff).
 * Prefer WhatsApp Cloud API (direct) when configured; else MSG91/360dialog; fallback SMS.
 */
export async function sendBookingNotification(
  mobile: string,
  payload: BookingNotificationPayload,
  recipientType: 'customer' | 'staff'
): Promise<{ whatsapp: boolean; sms: boolean }> {
  const result = { whatsapp: false, sms: false }
  const invoiceLink = payload.invoiceLink || buildInvoiceLink(payload.bookingToken)
  const isStaff = recipientType === 'staff'
  const smsMessage = buildSmsMessage({ ...payload, invoiceLink }, isStaff)

  // 1. Try WhatsApp Cloud API first (direct, no BSP)
  if (isWhatsAppCloudConfigured()) {
    const wa = await sendBookingConfirmationWhatsApp(
      mobile,
      payload.customerName,
      payload.bookingToken,
      payload.date,
      payload.timeSlot,
      payload.servicesSummary,
      `₹${payload.totalAmount}`,
      invoiceLink
    )
    result.whatsapp = wa.ok
  }

  // 2. Fallback to BSP (MSG91 / 360dialog) if WhatsApp Cloud not used or failed
  if (!result.whatsapp) {
    const provider = getProvider()
    if (provider) {
      const templateName = process.env.NOTIFY_WHATSAPP_TEMPLATE_NAME || 'booking_confirmation'
      const templateParams = [
        payload.customerName,
        payload.bookingToken,
        payload.date,
        payload.timeSlot,
        payload.servicesSummary,
        `₹${payload.totalAmount}`,
        invoiceLink,
      ]
      if (provider === '360dialog') {
        result.whatsapp = await sendWhatsApp360dialog(mobile, templateName, templateParams)
      } else if (provider === 'msg91' && process.env.MSG91_WHATSAPP_TEMPLATE_ID) {
        result.whatsapp = await sendWhatsAppMsg91(mobile, process.env.MSG91_WHATSAPP_TEMPLATE_ID, {
          '1': payload.customerName,
          '2': payload.bookingToken,
          '3': payload.date,
          '4': payload.timeSlot,
          '5': payload.servicesSummary,
          '6': `₹${payload.totalAmount}`,
          '7': invoiceLink,
        })
      }
    }
  }

  // 3. SMS fallback (MSG91)
  if (!result.whatsapp || process.env.NOTIFY_ALWAYS_SMS === 'true') {
    result.sms = await sendSmsMsg91(mobile, smsMessage)
  }

  return result
}

/**
 * Build payload from booking + user for notifications.
 */
export function buildBookingNotificationPayload(
  booking: {
    token: string
    date: Date
    timeSlot: string
    services: { service: { name: string }; price: number }[]
    user: { name: string; mobile: string }
  },
  paymentTotal: number
): BookingNotificationPayload {
  const date = typeof booking.date === 'string' ? booking.date : booking.date.toISOString().slice(0, 10)
  const servicesSummary = booking.services.map((s) => {
    const qty = (s as { quantity?: number }).quantity ?? 1
    return `${s.service.name}${qty > 1 ? ` ×${qty}` : ''} (₹${s.price})`
  }).join(', ')
  return {
    customerName: booking.user.name,
    customerMobile: booking.user.mobile,
    bookingToken: booking.token,
    date,
    timeSlot: booking.timeSlot,
    servicesSummary: servicesSummary.slice(0, 200),
    totalAmount: paymentTotal,
    invoiceLink: buildInvoiceLink(booking.token),
  }
}
