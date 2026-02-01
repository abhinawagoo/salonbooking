'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ConfirmationScreen from '@/components/ConfirmationScreen'

interface Service {
  id: string
  name: string
  price: number
}

export default function ConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [bookingData, setBookingData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [redirectCountdown, setRedirectCountdown] = useState(10)

  // Clear all session storage and prevent back navigation
  useEffect(() => {
    // Clear all booking-related session storage immediately
    sessionStorage.removeItem('selectedServices')
    sessionStorage.removeItem('customerDetails')
    sessionStorage.removeItem('bookingDateTime')

    // Prevent browser back button - redirect to home if user tries to go back
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault()
      window.history.pushState(null, '', window.location.href)
      router.replace('/')
    }
    
    // Push current state to prevent back navigation
    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)

    // Also handle browser back button via beforeunload
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('selectedServices')
      sessionStorage.removeItem('customerDetails')
      sessionStorage.removeItem('bookingDateTime')
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [router])

  // Auto-redirect to homepage after 10 seconds
  useEffect(() => {
    if (!isLoading && bookingData) {
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            router.replace('/')
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isLoading, bookingData, router])

  useEffect(() => {
    const bookingId = searchParams.get('bookingId')
    if (bookingId) {
      fetchBookingDetails(bookingId)
    } else {
      // Try to get from session storage (for demo purposes)
      const services = sessionStorage.getItem('selectedServices')
      const dateTime = sessionStorage.getItem('bookingDateTime')
      const customerDetails = sessionStorage.getItem('customerDetails')
      if (services && dateTime) {
        const servicesData = JSON.parse(services)
        const dateTimeData = JSON.parse(dateTime)
        const customer = customerDetails ? JSON.parse(customerDetails) : {}
        const total = servicesData.reduce((sum: number, s: Service) => sum + s.price, 0)
        setBookingData({
          token: 'DEMO-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          date: new Date(dateTimeData.date),
          timeSlot: dateTimeData.timeSlot,
          services: servicesData,
          paymentStatus: 'Completed',
          totalAmount: total,
          amountPaid: total,
          dueAmount: 0,
          onlineAmount: total,
          cashAmount: 0,
          customerName: customer.name,
          customerMobile: customer.mobile,
        })
        setIsLoading(false)
      } else {
        router.replace('/')
      }
    }
  }, [searchParams, router])

  const fetchBookingDetails = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/booking/${bookingId}`)
      const data = await response.json()
      setBookingData(data)
    } catch (error) {
      console.error('Error fetching booking:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (!bookingData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ConfirmationScreen
        bookingToken={bookingData.token}
        date={typeof bookingData.date === 'string' ? new Date(bookingData.date) : bookingData.date}
        timeSlot={bookingData.timeSlot}
        services={bookingData.services}
        paymentStatus={bookingData.paymentStatus}
        totalAmount={bookingData.totalAmount}
        amountPaid={bookingData.amountPaid}
        dueAmount={bookingData.dueAmount}
        onlineAmount={bookingData.onlineAmount}
        cashAmount={bookingData.cashAmount}
        customerName={bookingData.customerName}
        customerMobile={bookingData.customerMobile}
        locationName={bookingData.locationName}
        locationAddress={bookingData.locationAddress}
        locationMobile={bookingData.locationMobile}
        locationImageUrl={bookingData.locationImageUrl}
        redirectCountdown={redirectCountdown}
      />
    </div>
  )
}
