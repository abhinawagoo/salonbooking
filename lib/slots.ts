/**
 * Salon slot configuration. Used by availability API, booking API, and DateTimePicker.
 */

export const SLOT_INTERVAL_MINUTES = 30

export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30',
]

/** Salon closing time (6 PM). Bookings must *finish* by closing + buffer. */
export const CLOSING_TIME = { hour: 18, minute: 0 }

/** Extra minutes after closing the salon can work (e.g. finish last appointment). */
export const CLOSING_BUFFER_MINUTES = 60

export const MAX_BOOKINGS_PER_SLOT = 3

/**
 * Get all 30-min slot strings that fall within [startSlot, startSlot + durationMinutes).
 * e.g. getSlotsInRange('10:00', 90) => ['10:00', '10:30', '11:00']
 */
export function getSlotsInRange(startSlot: string, durationMinutes: number): string[] {
  const slots: string[] = []
  const idx = TIME_SLOTS.indexOf(startSlot)
  if (idx === -1) return slots
  const numSlots = Math.ceil(durationMinutes / SLOT_INTERVAL_MINUTES)
  for (let i = 0; i < numSlots && idx + i < TIME_SLOTS.length; i++) {
    slots.push(TIME_SLOTS[idx + i])
  }
  return slots
}

/**
 * Check if a booking ending at (startSlot + durationMinutes) is within closing + buffer.
 * Uses TIME_SLOTS to resolve end slot; if end would be past last slot, invalid.
 */
/** Service must finish by closing + buffer. Last allowed end slot is 19:00 (18:00 + 60 min buffer). */
export function isWithinClosingTime(startSlot: string, durationMinutes: number): boolean {
  const slots = getSlotsInRange(startSlot, durationMinutes)
  if (slots.length === 0) return false
  const lastSlot = slots[slots.length - 1]
  const lastIdx = TIME_SLOTS.indexOf(lastSlot)
  const maxEndSlotIndex = TIME_SLOTS.indexOf('19:00') // 19:00 = 18:00 + 60 min buffer
  if (maxEndSlotIndex === -1) return lastIdx <= TIME_SLOTS.length - 1
  return lastIdx <= maxEndSlotIndex
}
