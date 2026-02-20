/**
 * PhonePe PG – current API (OAuth + v2).
 * Sandbox: https://api-preprod.phonepe.com/apis/pg-sandbox/<Endpoint>
 * Production: Auth → https://api.phonepe.com/apis/identity-manager/<Endpoint>
 *             Other → https://api.phonepe.com/apis/pg/<Endpoint>
 * API: Authorization POST /v1/oauth/token | Create Payment POST /checkout/v2/pay
 *      Order Status GET /checkout/v2/order/{merchantOrderId}/status
 */

const SANDBOX_PG = 'https://api-preprod.phonepe.com/apis/pg-sandbox'
const SANDBOX_AUTH = 'https://api-preprod.phonepe.com/apis/pg-sandbox'
const PROD_PG = 'https://api.phonepe.com/apis/pg'
const PROD_AUTH = 'https://api.phonepe.com/apis/identity-manager'

function getEnv(): 'sandbox' | 'production' {
  const v = process.env.PHONEPE_ENV || 'sandbox'
  return v === 'production' ? 'production' : 'sandbox'
}

export function getPgBaseUrl(): string {
  return getEnv() === 'production' ? PROD_PG : SANDBOX_PG
}

export function getAuthBaseUrl(): string {
  return getEnv() === 'production' ? PROD_AUTH : SANDBOX_AUTH
}

let cachedToken: { access_token: string; expires_at: number } | null = null

/** Get OAuth token (cached until ~60s before expiry). */
export async function getPhonePeAccessToken(): Promise<string | null> {
  const clientId = process.env.PHONEPE_CLIENT_ID
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET
  const clientVersion = process.env.PHONEPE_CLIENT_VERSION || '1'
  if (!clientId || !clientSecret) {
    console.warn('PhonePe: PHONEPE_CLIENT_ID or PHONEPE_CLIENT_SECRET not set')
    return null
  }

  const now = Math.floor(Date.now() / 1000)
  if (cachedToken && cachedToken.expires_at > now + 60) {
    return cachedToken.access_token
  }

  const authUrl = `${getAuthBaseUrl()}/v1/oauth/token`
  const body = new URLSearchParams({
    client_id: clientId,
    client_version: clientVersion,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
  })

  const res = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('PhonePe OAuth error:', res.status, text)
    return null
  }

  const data = (await res.json()) as {
    access_token?: string
    expires_at?: number
    issued_at?: number
  }
  const token = data.access_token
  const expiresAt = data.expires_at ?? now + 3600
  if (token) {
    cachedToken = { access_token: token, expires_at: expiresAt }
    return token
  }
  return null
}

/** Create payment (v2). Returns redirect URL (tokenUrl) for PayPage – use in iframe or redirect. */
export async function createPhonePePayment(
  merchantOrderId: string,
  amountPaisa: number,
  redirectUrl: string,
  options?: { expireAfterSeconds?: number }
): Promise<string | null> {
  const token = await getPhonePeAccessToken()
  if (!token) return null

  const baseUrl = getPgBaseUrl()
  const payUrl = `${baseUrl}/checkout/v2/pay`
  const expireAfter = options?.expireAfterSeconds
  const payload: Record<string, unknown> = {
    merchantOrderId,
    amount: Math.max(100, amountPaisa),
    paymentFlow: {
      type: 'PG_CHECKOUT',
      merchantUrls: {
        redirectUrl,
      },
    },
  }
  if (expireAfter != null && expireAfter >= 300 && expireAfter <= 3600) {
    payload.expireAfter = expireAfter
  }

  const res = await fetch(payUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `O-Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = (await res.json()) as {
    redirectUrl?: string
    orderId?: string
    state?: string
    code?: string
    message?: string
  }

  if (data.redirectUrl) return data.redirectUrl
  console.error('PhonePe create payment failed:', data.code ?? data.message ?? res.status)
  return null
}

/** Order status (v2). Returns state e.g. COMPLETED, PENDING, FAILED. */
export async function getPhonePeOrderStatus(merchantOrderId: string): Promise<{
  state?: string
  orderId?: string
  code?: string
  message?: string
} | null> {
  const token = await getPhonePeAccessToken()
  if (!token) return null

  const baseUrl = getPgBaseUrl()
  const url = `${baseUrl}/checkout/v2/order/${encodeURIComponent(merchantOrderId)}/status`

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `O-Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('PhonePe order status error:', res.status, text)
    return null
  }

  const data = (await res.json()) as { state?: string; orderId?: string; code?: string; message?: string }
  return data
}
