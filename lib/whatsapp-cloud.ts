/**
 * WhatsApp Cloud API – direct integration (no BSP).
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates
 * Requires: Meta App, WhatsApp Business API, Phone Number ID, Access Token.
 * For business-initiated messages (post-payment) you must use an approved template.
 */

const GRAPH_API = 'https://graph.facebook.com/v21.0'

function getConfig() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  return { token, phoneId }
}

/** Normalize mobile to E.164 (e.g. 919876543210) */
function toE164(mobile: string): string {
  const digits = mobile.replace(/\D/g, '').replace(/^0/, '')
  return digits.length === 10 ? `91${digits}` : digits
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
      console.error('WhatsApp Cloud error:', res.status, msg)
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

  const components: Record<string, unknown>[] = [
    {
      type: 'body',
      parameters: [{ type: 'text', text: otp }],
      add_security_recommendation: true,
    },
  ]
  if (expiryMinutes > 0 && expiryMinutes <= 90) {
    components.push({
      type: 'footer',
      code_expiration_minutes: expiryMinutes,
    })
  }

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
      console.error('WhatsApp Cloud OTP error:', res.status, msg)
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
 * Send booking confirmation to customer via WhatsApp Cloud API (direct, no BSP).
 * Template body params: {{1}} name, {{2}} token, {{3}} date, {{4}} time, {{5}} services, {{6}} amount, {{7}} invoice link.
 * Create template in Meta: "Hi {{1}}, your booking is confirmed. Token: {{2}}. Date: {{3}} at {{4}}. Services: {{5}}. Total: {{6}}. View invoice: {{7}}"
 */
export async function sendBookingConfirmationWhatsApp(
  mobile: string,
  customerName: string,
  bookingToken: string,
  date: string,
  timeSlot: string,
  servicesSummary: string,
  totalAmount: string,
  invoiceLink: string
): Promise<{ ok: boolean; error?: string }> {
  const templateName = process.env.WHATSAPP_BOOKING_TEMPLATE_NAME || 'booking_confirmation'
  return sendWhatsAppTemplate(mobile, templateName, [
    customerName,
    bookingToken,
    date,
    timeSlot,
    servicesSummary,
    totalAmount,
    invoiceLink,
  ])
}
