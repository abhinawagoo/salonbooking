/**
 * Convert 24h time slot (e.g. "09:00", "14:30") to 12h AM/PM for display.
 */
export function formatTime12h(timeSlot: string): string {
  const [h, m] = (timeSlot || '09:00').split(':').map(Number)
  const hour = h % 12 || 12
  const ampm = h < 12 ? 'AM' : 'PM'
  return `${hour}:${String(m || 0).padStart(2, '0')} ${ampm}`
}
