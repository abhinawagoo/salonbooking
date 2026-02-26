'use client'

import { useState, useMemo } from 'react'
import { format, addDays, isSameDay, startOfDay, isBefore, isAfter, setHours, setMinutes } from 'date-fns'
import { TIME_SLOTS, getSlotsInRange, isWithinClosingTime, MAX_BOOKINGS_PER_SLOT, parseBusinessHours, getDayConfig, getSlotsBetween } from '@/lib/slots'

interface DateTimePickerProps {
  onSelect: (date: Date, timeSlot: string) => void
  slotCounts?: Record<string, number>
  /** Total service duration in minutes. Used to block slots so the appointment fits before closing. */
  durationMinutes?: number
  /** JSON string of business hours from admin. When null, uses default (Mon-Sat 9-6). */
  businessHoursJson?: string | null
  /** JSON array of closed dates (yyyy-MM-dd). When null, no specific dates are closed. */
  closedDatesJson?: string | null
}

export default function DateTimePicker({ onSelect, slotCounts = {}, durationMinutes = 30, businessHoursJson, closedDatesJson }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const duration = Math.max(30, durationMinutes)
  const availableDates = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i))

  const businessHours = useMemo(() => parseBusinessHours(businessHoursJson ?? null), [businessHoursJson])
  const closedDates = useMemo((): string[] => {
    if (!closedDatesJson) return []
    try {
      const parsed = JSON.parse(closedDatesJson)
      return Array.isArray(parsed) ? parsed.map(String) : []
    } catch {
      return []
    }
  }, [closedDatesJson])

  // Get time slots to show for a given date (based on open/close for that day)
  const getTimeSlotsForDate = (date: Date): string[] => {
    const dayOfWeek = date.getDay()
    const dayConfig = getDayConfig(businessHours, dayOfWeek)
    if (!dayConfig.isOpen || !dayConfig.openTime || !dayConfig.closeTime) return []
    const allSlots = getSlotsBetween(dayConfig.openTime, dayConfig.closeTime)
    return allSlots.filter((slot) => isWithinClosingTime(slot, duration, dayConfig.closeTime))
  }

  // Check if date is closed (past dates, closed day, specific closed dates, or past closing time today)
  const isDateClosed = (date: Date) => {
    const today = new Date()
    const dateStart = startOfDay(date)
    const todayStart = startOfDay(today)
    
    // Past dates are closed
    if (isBefore(dateStart, todayStart)) return true
    
    // Admin-defined closed dates (festivals, holidays, etc.)
    const dateStr = format(date, 'yyyy-MM-dd')
    if (closedDates.includes(dateStr)) return true
    
    const dayOfWeek = date.getDay()
    const dayConfig = getDayConfig(businessHours, dayOfWeek)
    if (!dayConfig.isOpen) return true
    
    // Today: check if current time is past closing time
    if (isSameDay(date, today)) {
      const now = new Date()
      const [ch, cm] = (dayConfig.closeTime || '18:00').split(':').map(Number)
      const closingTime = setMinutes(setHours(new Date(now), ch), cm)
      return isAfter(now, closingTime)
    }
    
    return false
  }

  const getSlotBookingCount = (date: Date, timeSlot: string): number => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const key = `${dateStr}_${timeSlot}`
    return slotCounts[key] || 0
  }

  const isSlotAvailable = (date: Date, timeSlot: string): boolean => {
    if (isDateClosed(date)) return false
    const dayConfig = getDayConfig(businessHours, date.getDay())
    const closeTime = dayConfig.closeTime || '18:00'
    if (!isWithinClosingTime(timeSlot, duration, closeTime)) return false
    if (isSameDay(date, new Date())) {
      const now = new Date()
      const [hours, minutes] = timeSlot.split(':').map(Number)
      const slotTime = setMinutes(setHours(new Date(now), hours), minutes)
      const [ch, cm] = closeTime.split(':').map(Number)
      const closingTime = setMinutes(setHours(new Date(now), ch), cm)
      if (isAfter(slotTime, closingTime) || isAfter(now, slotTime)) return false
    }
    const slotsInRange = getSlotsInRange(timeSlot, duration)
    return slotsInRange.every((slot) => getSlotBookingCount(date, slot) < MAX_BOOKINGS_PER_SLOT)
  }

  const getSlotStatus = (date: Date, timeSlot: string): 'available' | 'limited' | 'full' | 'closed' => {
    if (isDateClosed(date)) return 'closed'
    const dayConfig = getDayConfig(businessHours, date.getDay())
    const closeTime = dayConfig.closeTime || '18:00'
    if (!isWithinClosingTime(timeSlot, duration, closeTime)) return 'closed'
    if (isSameDay(date, new Date())) {
      const now = new Date()
      const [hours, minutes] = timeSlot.split(':').map(Number)
      const slotTime = setMinutes(setHours(new Date(now), hours), minutes)
      const [ch, cm] = closeTime.split(':').map(Number)
      const closingTime = setMinutes(setHours(new Date(now), ch), cm)
      if (isAfter(slotTime, closingTime) || isAfter(now, slotTime)) return 'closed'
    }
    const slotsInRange = getSlotsInRange(timeSlot, duration)
    const maxCountInRange = Math.max(0, ...slotsInRange.map((s) => getSlotBookingCount(date, s)))
    if (maxCountInRange >= MAX_BOOKINGS_PER_SLOT) return 'full'
    if (maxCountInRange >= 2) return 'limited'
    return 'available'
  }

  const handleTimeSelect = (timeSlot: string) => {
    if (!isSlotAvailable(selectedDate!, timeSlot)) return
    
    setSelectedTime(timeSlot)
    if (selectedDate) {
      onSelect(selectedDate, timeSlot)
    }
  }

  const handleDateSelect = (date: Date) => {
    if (isDateClosed(date)) return
    setSelectedDate(date)
    setSelectedTime(null)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Select Date</h3>
        <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5 sm:gap-2">
          {availableDates.map((date) => {
            const isSelected = selectedDate && isSameDay(date, selectedDate)
            const isToday = isSameDay(date, new Date())
            const isClosed = isDateClosed(date)
            
            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateSelect(date)}
                disabled={isClosed}
                className={`p-2 sm:p-3 rounded-lg border-2 transition-colors min-h-[48px] sm:min-h-[60px] ${
                  isClosed
                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                    : isSelected
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-primary-300'
                } ${isToday && !isClosed ? 'ring-2 ring-primary-300' : ''}`}
              >
                <div className="text-xs text-gray-500">{format(date, 'EEE')}</div>
                <div className="font-semibold">{format(date, 'd')}</div>
                <div className="text-xs text-gray-500">{format(date, 'MMM')}</div>
                {isClosed && (
                  <div className="text-xs text-red-500 mt-1">Closed</div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {selectedDate && !isDateClosed(selectedDate) && (
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Select Time</h3>
          <div className="mb-3 sm:mb-4 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-100 border-2 border-orange-500 rounded"></div>
              <span>Limited (1-2 bookings)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded"></div>
              <span>Full (3 bookings)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border-2 border-gray-400 rounded"></div>
              <span>Closed</span>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
            {(selectedDate ? getTimeSlotsForDate(selectedDate) : []).map((timeSlot) => {
              const status = getSlotStatus(selectedDate, timeSlot)
              const count = getSlotBookingCount(selectedDate, timeSlot)
              const isSelected = selectedTime === timeSlot
              const isAvailable = status === 'available' || status === 'limited'
              
              const getSlotStyles = () => {
                if (status === 'closed') {
                  return 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                }
                if (status === 'full') {
                  return 'border-red-300 bg-red-50 text-red-700 cursor-not-allowed'
                }
                if (status === 'limited') {
                  return isSelected
                    ? 'border-orange-600 bg-orange-100 text-orange-900'
                    : 'border-orange-300 bg-orange-50 text-orange-700 hover:border-orange-400'
                }
                // available
                return isSelected
                  ? 'border-green-600 bg-green-50 text-green-900'
                  : 'border-green-300 bg-green-50 text-green-700 hover:border-green-400'
              }
              
              return (
                <button
                  key={timeSlot}
                  onClick={() => handleTimeSelect(timeSlot)}
                  disabled={!isAvailable}
                  className={`p-3 rounded-lg border-2 transition-colors min-h-[48px] relative ${getSlotStyles()}`}
                  title={
                    status === 'closed' 
                      ? 'Closed' 
                      : status === 'full'
                      ? 'Full (3 bookings)'
                      : count > 0
                      ? `${count} booking${count > 1 ? 's' : ''}`
                      : 'Available'
                  }
                >
                  <div className="font-medium">{timeSlot}</div>
                  {count > 0 && status !== 'closed' && (
                    <div className="text-xs mt-1 opacity-75">
                      {count}/{MAX_BOOKINGS_PER_SLOT}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {selectedDate && selectedTime && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Selected:</p>
          <p className="font-semibold text-primary-700">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {selectedTime}
          </p>
        </div>
      )}
    </div>
  )
}
