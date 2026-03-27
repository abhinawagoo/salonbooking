/**
 * Booking notifications via **WhatsApp Cloud API only** (Meta direct).
 * Configure WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID.
 */

import { format } from 'date-fns'
import { sendBookingConfirmationWhatsApp, sendStaffBookingAlertWhatsApp } from './whatsapp-cloud'
import { formatTime12h } from './formatTime'
import { getPublicInvoiceUrl } from './invoiceUrl'

export { parseStaffBookingNotifyPhones } from './phone'

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

function isWhatsAppCloudConfigured(): boolean {
  return !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)
}

/**
 * Send staff/manager booking alert template to numbers configured per location (Admin → Locations).
 */
export async function notifyStaffManagersForBooking(
  phones: string[],
  args: {
    locationName: string
    customerName: string
    customerMobile: string
    dateStr: string
    timeSlot: string
    servicesSummary: string
    totalAmount: number
  }
): Promise<void> {
  if (!phones.length || !isWhatsAppCloudConfigured()) return
  const dateDisplay = format(new Date(args.dateStr + 'T12:00:00'), 'dd/MM/yyyy')
  const timeDisplay = formatTime12h(args.timeSlot)
  const amountDisplay = `Rs. ${Math.round(args.totalAmount)}`
  for (const mobile of phones) {
    if (!mobile) continue
    const wa = await sendStaffBookingAlertWhatsApp(mobile, {
      locationName: args.locationName,
      customerName: args.customerName,
      customerMobile: args.customerMobile,
      dateDisplay,
      timeDisplay,
      servicesSummary: args.servicesSummary.slice(0, 200),
      amountDisplay,
    })
    if (!wa.ok) console.error('Staff booking WhatsApp failed:', mobile, wa.error)
  }
}

/**
 * Send booking notification (customer or staff) via WhatsApp Cloud API only.
 */
export async function sendBookingNotification(
  mobile: string,
  payload: BookingNotificationPayload,
  _recipientType: 'customer' | 'staff'
): Promise<{ whatsapp: boolean; sms: boolean }> {
  const result = { whatsapp: false, sms: false }
  const invoiceLink = payload.invoiceLink || buildInvoiceLink(payload.bookingToken)

  if (!isWhatsAppCloudConfigured()) {
    console.warn('notify: WhatsApp Cloud not configured (WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID)')
    return result
  }

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
