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
  } else {
    console.error('WhatsApp Cloud error:', status, msg)
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

/**
 * Send invoice link to customer after payment (via WhatsApp Cloud API).
 * Uses template with body params: {{1}} customer name, {{2}} invoice link.
 * Create template in Meta: "Hi {{1}}, your booking payment is confirmed. View & download invoice: {{2}}"
 */
export async function sendInvoiceWhatsApp(
  mobile: string,
  customerName: string,
  invoiceLink: string
): Promise<{ ok: boolean; error?: string }> {
  const templateName = process.env.WHATSAPP_INVOICE_TEMPLATE_NAME || 'invoice_ready'
  return sendWhatsAppTemplate(mobile, templateName, [customerName, invoiceLink])
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
 */
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
