/**
 * Phone number normalization for India (+91).
 * Store in DB as 10 digits; use E.164 (919876543210) when sending to WhatsApp/SMS.
 */

const INDIA_COUNTRY_CODE = '91'

/**
 * Normalize to 10 digits for DB storage (India).
 * Strips country code, spaces, dashes; keeps last 10 digits.
 */
export function normalizeMobileForDb(mobile: string): string {
  const digits = String(mobile || '').replace(/\D/g, '').replace(/^0+/, '')
  if (digits.length >= 10) {
    return digits.slice(-10)
  }
  return digits
}

/**
 * Convert to E.164 for WhatsApp/SMS APIs (India: 919876543210).
 * Handles: 9876543210, 919876543210, +91 9876543210, 09876543210, etc.
 */
export function toE164(mobile: string): string {
  const digits = String(mobile || '').replace(/\D/g, '').replace(/^0+/, '')
  if (digits.length === 10) {
    return `${INDIA_COUNTRY_CODE}${digits}`
  }
  if (digits.length >= 12 && digits.startsWith(INDIA_COUNTRY_CODE)) {
    return digits.slice(0, 12)
  }
  if (digits.length > 10) {
    return `${INDIA_COUNTRY_CODE}${digits.slice(-10)}`
  }
  return digits
}

/** Parse JSON array or newline/comma-separated list into unique 10-digit Indian mobiles (staff booking alerts per location). */
export function parseStaffBookingNotifyPhones(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return []
  try {
    const arr = JSON.parse(raw) as unknown
    if (Array.isArray(arr)) {
      const out = new Set<string>()
      for (const x of arr) {
        const m = normalizeMobileForDb(String(x))
        if (m.length === 10) out.add(m)
      }
      return [...out]
    }
  } catch {
    // treat as plain text below
  }
  const out = new Set<string>()
  for (const line of raw.split(/[\n,;]+/)) {
    const m = normalizeMobileForDb(line.trim())
    if (m.length === 10) out.add(m)
  }
  return [...out]
}
