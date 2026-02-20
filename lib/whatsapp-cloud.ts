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
