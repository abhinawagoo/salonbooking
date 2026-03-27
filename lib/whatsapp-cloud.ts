/**
 * WhatsApp Cloud API – direct integration (no BSP).
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates
 * Requires: Meta App, WhatsApp Business API, Phone Number ID, Access Token.
 * For business-initiated messages (post-payment) you must use an approved template.
 */

import { toE164 } from '@/lib/phone'
import { formatTime12h } from '@/lib/formatTime'

const GRAPH_API = 'https://graph.facebook.com/v21.0'

function getConfig() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  return { token, phoneId }
}

function logWhatsAppError(status: number, msg: string, to: string) {
  if (msg.includes('131030')) {
    console.warn(
      `[WhatsApp #131030] Recipient ${to} not in allowed list. ` +
        'In Development mode, add numbers at: Meta Developer Console → WhatsApp → API Setup → "To" field → Manage phone number list'
    )
  } else if (msg.includes('132001')) {
    console.warn(
      `[WhatsApp #132001] Template not found. Check WHATSAPP_BOOKING_TEMPLATE_NAME / WHATSAPP_OTP_TEMPLATE_NAME and language code in Meta.`
    )
  } else if (msg.includes('132012')) {
    console.warn(
      `[WhatsApp #132012] Template parameter/header mismatch. If the error mentions DOCUMENT header: ` +
        'your Meta template has a dynamic PDF header — set WHATSAPP_INVOICE_HEADER_DOCUMENT_URL (HTTPS) or set WHATSAPP_INVOICE_META_HAS_HEADER_DOCUMENT=true with NEXT_PUBLIC_APP_URL (uses /invoice-header-placeholder.pdf). ' +
        'Or remove the document header from the template in Meta.'
    )
  } else {
    console.error('WhatsApp Cloud error:', status, msg)
  }
}

/**
 * Send hello_world template (Meta sample, no params) – for testing when business verification pending.
 * Set USE_WHATSAPP_HELLO_WORLD_TEST=true to use this instead of invoice/booking templates.
 */
export async function sendHelloWorldWhatsApp(mobile: string): Promise<{ ok: boolean; error?: string }> {
  const { token, phoneId } = getConfig()
  if (!token || !phoneId) {
    console.warn('WhatsApp Cloud: WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID not set')
    return { ok: false, error: 'Not configured' }
  }

  const to = toE164(mobile)
  const url = `${GRAPH_API}/${phoneId}/messages`

  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: 'hello_world',
      language: { code: 'en_US' },
    },
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
    const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } }
    if (!res.ok) {
      const msg = data.error?.message || res.statusText
      logWhatsAppError(res.status, msg, to)
      return { ok: false, error: msg }
    }
    return { ok: true }
  } catch (e) {
    console.error('WhatsApp Cloud hello_world request failed:', e)
    return { ok: false, error: String(e) }
  }
}

/**
 * Send template message via WhatsApp Cloud API.
 * Template must be pre-approved in Meta Business Manager.
 * Body params: {{1}}, {{2}}, etc. Pass as array.
 */
export async function sendWhatsAppTemplate(
  mobile: string,
  templateName: string,
  bodyParams: string[],
  options?: { languageCode?: string }
): Promise<{ ok: boolean; error?: string }> {
  const { token, phoneId } = getConfig()
  if (!token || !phoneId) {
    console.warn('WhatsApp Cloud: WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID not set')
    return { ok: false, error: 'Not configured' }
  }

  const to = toE164(mobile)
  const url = `${GRAPH_API}/${phoneId}/messages`

  const body: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: options?.languageCode || process.env.WHATSAPP_TEMPLATE_LANG || 'en' },
      components: [
        {
          type: 'body',
          parameters: bodyParams.map((text) => ({ type: 'text', text })),
        },
      ],
    },
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
    const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } }
    if (!res.ok) {
      const msg = data.error?.message || res.statusText
      logWhatsAppError(res.status, msg, to)
      return { ok: false, error: msg }
    }
    return { ok: true }
  } catch (e) {
    console.error('WhatsApp Cloud request failed:', e)
    return { ok: false, error: String(e) }
  }
}

/**
 * Send OTP via WhatsApp Cloud API (authentication template).
 * Requires an approved authentication template in Meta (e.g. Copy Code type).
 * Template body: "{{1}} is your verification code." – pass OTP as first param.
 * Set WHATSAPP_OTP_TEMPLATE_NAME in .env (default: otp_verification).
 */
export async function sendOtpWhatsApp(mobile: string, otp: string): Promise<{ ok: boolean; error?: string }> {
  const { token, phoneId } = getConfig()
  if (!token || !phoneId) {
    console.warn('WhatsApp Cloud: WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID not set')
    return { ok: false, error: 'Not configured' }
  }

  const templateName = process.env.WHATSAPP_OTP_TEMPLATE_NAME || 'otp_verification'
  const lang = process.env.WHATSAPP_TEMPLATE_LANG || 'en'
  const expiryMinutes = parseInt(process.env.WHATSAPP_OTP_EXPIRY_MINUTES || '10', 10) || 10

  const to = toE164(mobile)
  const url = `${GRAPH_API}/${phoneId}/messages`

  // Copy Code template: body + button (button needs OTP param for copy-to-clipboard)
  const components: Record<string, unknown>[] = [
    {
      type: 'body',
      parameters: [{ type: 'text', text: otp }],
    },
    {
      type: 'button',
      sub_type: 'url',
      index: '0',
      parameters: [{ type: 'text', text: otp }],
    },
  ]

  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: lang },
      components,
    },
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
    const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } }
    if (!res.ok) {
      const msg = data.error?.message || res.statusText
      logWhatsAppError(res.status, msg, to)
      return { ok: false, error: msg }
    }
    return { ok: true }
  } catch (e) {
    console.error('WhatsApp Cloud OTP request failed:', e)
    return { ok: false, error: String(e) }
  }
}

export type SendInvoiceWhatsAppOptions = {
  /** Bill number e.g. BILL-000152 (utility template). */
  billNo?: string
  /** Outstanding balance in INR (utility template {{4}}). Defaults to 0 when omitted. */
  balanceDue?: number
  /**
   * Booking token for button {{1}} when Meta URL is like ...?token={{1}} (utility template).
   * If omitted, token is parsed from `invoiceLink` query string.
   */
  bookingToken?: string
}

function extractTokenFromInvoiceLink(invoiceLink: string): string {
  try {
    const u = new URL(invoiceLink)
    const t = u.searchParams.get('token')
    if (t) return decodeURIComponent(t)
  } catch {
    // ignore
  }
  return invoiceLink.trim()
}

/**
 * Send invoice/receipt link after payment (WhatsApp Cloud API).
 *
 * **Utility template (default)** – see `docs/WHATSAPP_INVOICE_UTILITY_TEMPLATE.md`
 * Body: {{1}} name, {{2}} invoice, {{3}} amount, {{4}} balance.
 * Button: dynamic URL suffix — token only (…?token={{1}}), unless WHATSAPP_INVOICE_BUTTON_FULL_URL=true.
 *
 * **Legacy template** – set `WHATSAPP_INVOICE_TEMPLATE_LEGACY=true`
 * Body: Hi {{1}}, your {{2}} bill payment of {{3}} … date {{4}}.
 */
export async function sendInvoiceWhatsApp(
  mobile: string,
  customerName: string,
  amountPaid: number,
  paymentDate: Date,
  invoiceLink: string,
  options?: SendInvoiceWhatsAppOptions
): Promise<{ ok: boolean; error?: string }> {
  if (process.env.USE_WHATSAPP_HELLO_WORLD_TEST === 'true') {
    return sendHelloWorldWhatsApp(mobile)
  }
  const { token, phoneId } = getConfig()
  if (!token || !phoneId) {
    console.warn('WhatsApp Cloud: WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID not set')
    return { ok: false, error: 'Not configured' }
  }

  const templateName = process.env.WHATSAPP_INVOICE_TEMPLATE_NAME || 'invoice_receipt'
  const lang = process.env.WHATSAPP_TEMPLATE_LANG || 'en'
  const legacy = process.env.WHATSAPP_INVOICE_TEMPLATE_LEGACY === 'true'
  const headerImageUrl = process.env.WHATSAPP_INVOICE_HEADER_IMAGE_URL?.trim()
  const appBase = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
  const placeholderDoc =
    appBase && process.env.WHATSAPP_INVOICE_META_HAS_HEADER_DOCUMENT === 'true'
      ? `${appBase}/invoice-header-placeholder.pdf`
      : ''
  const headerDocumentUrl =
    process.env.WHATSAPP_INVOICE_HEADER_DOCUMENT_URL?.trim() || placeholderDoc || ''
  const headerDocumentFilename =
    process.env.WHATSAPP_INVOICE_HEADER_DOCUMENT_FILENAME?.trim() || 'Receipt.pdf'

  const nameParam = (customerName || 'Customer').trim().slice(0, 30)
  const amountFormatted = `Rs. ${Math.round(amountPaid)}`.slice(0, 30)
  const to = toE164(mobile)
  const apiUrl = `${GRAPH_API}/${phoneId}/messages`

  const components: Record<string, unknown>[] = []

  // Header: document (PDF) takes precedence over image — must match Meta template header type
  if (!legacy && headerDocumentUrl) {
    components.push({
      type: 'header',
      parameters: [
        {
          type: 'document',
          document: { link: headerDocumentUrl, filename: headerDocumentFilename },
        },
      ],
    })
  } else if (!legacy && headerImageUrl) {
    components.push({
      type: 'header',
      parameters: [{ type: 'image', image: { link: headerImageUrl } }],
    })
  }

  if (legacy) {
    const billType = (process.env.WHATSAPP_INVOICE_BILL_TYPE || 'booking for Shahnaz Salon Sasaram').trim().slice(0, 30)
    const dateFormatted = formatPaymentDate(paymentDate).slice(0, 30)
    components.push({
      type: 'body',
      parameters: [
        { type: 'text', text: nameParam },
        { type: 'text', text: billType },
        { type: 'text', text: amountFormatted },
        { type: 'text', text: dateFormatted },
      ],
    })
  } else {
    const billNo = (options?.billNo || '—').trim().slice(0, 30)
    const balance = options?.balanceDue ?? 0
    const balanceFormatted = `Rs. ${Math.round(balance)}`.slice(0, 30)
    components.push({
      type: 'body',
      parameters: [
        { type: 'text', text: nameParam },
        { type: 'text', text: billNo },
        { type: 'text', text: amountFormatted },
        { type: 'text', text: balanceFormatted },
      ],
    })
  }

  // Button: Meta template often uses fixed domain + ?token={{1}} — send token only, not full URL
  let buttonParam: string
  if (legacy) {
    buttonParam = invoiceLink.trim()
  } else if (process.env.WHATSAPP_INVOICE_BUTTON_FULL_URL === 'true') {
    buttonParam = invoiceLink.trim()
  } else {
    buttonParam = (options?.bookingToken || extractTokenFromInvoiceLink(invoiceLink)).trim()
  }

  components.push({
    type: 'button',
    sub_type: 'url',
    index: 0,
    parameters: [{ type: 'text', text: buttonParam }],
  })

  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: lang },
      components,
    },
  }

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
    const data = (await res.json().catch(() => ({}))) as { error?: { message?: string; error_data?: { details?: string } } }
    if (!res.ok) {
      const msg = data.error?.message || res.statusText
      console.error('[WhatsApp invoice] Error:', msg, '| Full:', JSON.stringify(data))
      if (data.error?.error_data?.details) console.error('[WhatsApp] Details:', data.error.error_data.details)
      logWhatsAppError(res.status, msg, to)
      return { ok: false, error: msg }
    }
    return { ok: true }
  } catch (e) {
    console.error('WhatsApp Cloud invoice template failed:', e)
    return { ok: false, error: String(e) }
  }
}

/** Format payment date for WhatsApp template (e.g. "December 31, 2025"). */
function formatPaymentDate(d: Date): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

/**
 * Format date string (yyyy-MM-dd) to "December 31, 2025".
 */
function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

/**
 * Send booking confirmation to customer via WhatsApp Cloud API (direct, no BSP).
 * Template: Header "Your appointment is booked", Body "Hello {{1}}, Thank you for booking with Fashion Styles. Your appointment for {{2}} on {{3}} at {{4}} is confirmed."
 * Params: {{1}} name, {{2}} services, {{3}} date (December 31, 2025), {{4}} time (1:00 PM).
 * When USE_WHATSAPP_HELLO_WORLD_TEST=true, sends hello_world instead (for testing before business verification).
 */
export type StaffBookingAlertParams = {
  locationName: string
  customerName: string
  customerMobile: string
  dateDisplay: string
  timeDisplay: string
  servicesSummary: string
  amountDisplay: string
}

/**
 * Notify salon managers (numbers from Admin → Customize) when a booking is confirmed.
 * Create template in Meta (e.g. name `staff_booking_alert`, 7 body variables) — see `docs/WHATSAPP_STAFF_BOOKING_TEMPLATE.md`.
 */
export async function sendStaffBookingAlertWhatsApp(
  mobile: string,
  p: StaffBookingAlertParams
): Promise<{ ok: boolean; error?: string }> {
  if (process.env.USE_WHATSAPP_HELLO_WORLD_TEST === 'true') {
    return sendHelloWorldWhatsApp(mobile)
  }
  const templateName = process.env.WHATSAPP_STAFF_BOOKING_TEMPLATE_NAME || 'staff_booking_alert'
  const slice = (s: string, n: number) => (s || '').trim().slice(0, n)
  return sendWhatsAppTemplateBodyOnly(mobile, templateName, [
    slice(p.locationName, 60),
    slice(p.customerName, 30),
    slice(p.customerMobile, 20),
    slice(p.dateDisplay, 30),
    slice(p.timeDisplay, 30),
    slice(p.servicesSummary, 80),
    slice(p.amountDisplay, 30),
  ])
}

async function sendWhatsAppTemplateBodyOnly(
  mobile: string,
  templateName: string,
  bodyParams: string[],
  options?: { languageCode?: string }
): Promise<{ ok: boolean; error?: string }> {
  const { token, phoneId } = getConfig()
  if (!token || !phoneId) {
    console.warn('WhatsApp Cloud: WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID not set')
    return { ok: false, error: 'Not configured' }
  }

  const to = toE164(mobile)
  const url = `${GRAPH_API}/${phoneId}/messages`

  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: options?.languageCode || process.env.WHATSAPP_TEMPLATE_LANG || 'en' },
      components: [
        {
          type: 'body',
          parameters: bodyParams.map((text) => ({ type: 'text', text })),
        },
      ],
    },
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
    const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } }
    if (!res.ok) {
      const msg = data.error?.message || res.statusText
      logWhatsAppError(res.status, msg, to)
      return { ok: false, error: msg }
    }
    return { ok: true }
  } catch (e) {
    console.error('WhatsApp Cloud staff booking template failed:', e)
    return { ok: false, error: String(e) }
  }
}

export async function sendBookingConfirmationWhatsApp(
  mobile: string,
  customerName: string,
  _bookingToken: string,
  dateStr: string,
  timeSlot: string,
  servicesSummary: string,
  _totalAmount: string,
  _invoiceLink: string
): Promise<{ ok: boolean; error?: string }> {
  if (process.env.USE_WHATSAPP_HELLO_WORLD_TEST === 'true') {
    return sendHelloWorldWhatsApp(mobile)
  }
  const templateName = process.env.WHATSAPP_BOOKING_TEMPLATE_NAME || 'booking_confirmation'
  const dateFormatted = formatDateLong(dateStr)
  const timeFormatted = formatTime12h(timeSlot)
  return sendWhatsAppTemplateWithHeader(mobile, templateName, [customerName, servicesSummary, dateFormatted, timeFormatted])
}

/**
 * Send template with optional static header + body params.
 * Use when template has header like "Your appointment is booked" and body with {{1}}..{{n}}.
 */
async function sendWhatsAppTemplateWithHeader(
  mobile: string,
  templateName: string,
  bodyParams: string[],
  options?: { languageCode?: string }
): Promise<{ ok: boolean; error?: string }> {
  const { token, phoneId } = getConfig()
  if (!token || !phoneId) {
    console.warn('WhatsApp Cloud: WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID not set')
    return { ok: false, error: 'Not configured' }
  }

  const to = toE164(mobile)
  const url = `${GRAPH_API}/${phoneId}/messages`

  const hasHeader = process.env.WHATSAPP_BOOKING_TEMPLATE_HAS_HEADER !== 'false'
  const components: Record<string, unknown>[] = []
  if (hasHeader) {
    components.push({ type: 'header', parameters: [] })
  }
  components.push({
    type: 'body',
    parameters: bodyParams.map((text) => ({ type: 'text', text })),
  })

  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: options?.languageCode || process.env.WHATSAPP_TEMPLATE_LANG || 'en' },
      components,
    },
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
    const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } }
    if (!res.ok) {
      const msg = data.error?.message || res.statusText
      logWhatsAppError(res.status, msg, to)
      return { ok: false, error: msg }
    }
    return { ok: true }
  } catch (e) {
    console.error('WhatsApp Cloud request failed:', e)
    return { ok: false, error: String(e) }
  }
}
