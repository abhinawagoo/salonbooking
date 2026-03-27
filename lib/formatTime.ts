/**
 * Convert 24h time slot (e.g. "09:00", "14:30") to 12h AM/PM for display.
 */
export function formatTime12h(timeSlot: string): string {
  const raw = (timeSlot || '09:00').trim()
  const [hs, ms] = raw.split(':')
  let h = Number.parseInt(hs ?? '9', 10)
  let m = Number.parseInt((ms ?? '0').replace(/\D/g, '').slice(0, 2) || '0', 10)
  if (Number.isNaN(h) || h < 0 || h > 23) h = 9
  if (Number.isNaN(m) || m < 0 || m > 59) m = 0
  const hour = h % 12 || 12
  const ampm = h < 12 ? 'AM' : 'PM'
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}
