/**
 * Public invoice page URL for a booking token.
 * Uses NEXT_PUBLIC_APP_URL — must be your live domain in production (e.g. https://shahnazsalonsasaram.com).
 */
export function getPublicInvoiceUrl(token: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
  return `${base}/booking/invoice?token=${encodeURIComponent(token)}`
}
