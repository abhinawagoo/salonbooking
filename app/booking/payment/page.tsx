'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PaymentScreen from '@/components/PaymentScreen'

interface Service {
  id: string
  name: string
  price: number
  duration: number
  quantity?: number
}

const MAX_DURATION_MINUTES = 90 // 1.5 hours

export default function PaymentPage() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [hasData, setHasData] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [totalBump, setTotalBump] = useState(false)
  const [showDurationPopup, setShowDurationPopup] = useState(false)

  const totalDurationMinutes = services.reduce(
    (sum, s) => sum + s.duration * (s.quantity ?? 1),
    0
  )

  useEffect(() => {
    const location = sessionStorage.getItem('bookingLocation')
    const servicesData = sessionStorage.getItem('selectedServices')
    const customer = sessionStorage.getItem('customerDetails')
    const dateTime = sessionStorage.getItem('bookingDateTime')
    
    if (!location || !servicesData || !customer || !dateTime) {
      router.push('/booking/location')
      return
    }
    
    const parsed = JSON.parse(servicesData) as (Service & { quantity?: number })[]
    const loaded = parsed.map((s) => ({ ...s, quantity: s.quantity ?? 1 }))
    setServices(loaded)
    setHasData(true)
    const duration = loaded.reduce((sum, s) => sum + s.duration * (s.quantity ?? 1), 0)
    if (duration > MAX_DURATION_MINUTES) setShowDurationPopup(true)
  }, [router])

  const handleServicesChange = (updated: Service[]) => {
    setServices(updated)
    sessionStorage.setItem('selectedServices', JSON.stringify(updated))
    setTotalBump(true)
    setTimeout(() => setTotalBump(false), 400)
    const duration = updated.reduce((sum, s) => sum + s.duration * (s.quantity ?? 1), 0)
    if (duration > MAX_DURATION_MINUTES) setShowDurationPopup(true)
  }

  const handlePaymentInitiate = async (paymentType: 'FULL' | 'ADVANCE', paymentMethod?: string) => {
    setIsProcessing(true)
    try {
      const customerDetails = JSON.parse(sessionStorage.getItem('customerDetails') || '{}')
      const dateTime = JSON.parse(sessionStorage.getItem('bookingDateTime') || '{}')
      
      const location = JSON.parse(sessionStorage.getItem('bookingLocation') || '{}')
      const servicesPayload = services.flatMap((s) =>
        Array((s.quantity ?? 1)).fill(null).map(() => s.id)
      )
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationId: location.id,
          services: servicesPayload,
          customerDetails,
          date: dateTime.date,
          timeSlot: dateTime.timeSlot,
          paymentType,
        }),
      })

      const data = await response.json()
      
      if (data.error) {
        alert(data.error)
        setIsProcessing(false)
        return
      }
      
      // PhonePe: redirect to PayPage (reliable; iframe can be re-enabled later with correct script for env)
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
        return
      }
      
      // Use test payment in development or when useTestPayment flag is set
      if (data.useTestPayment || !data.paymentUrl) {
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        const testResponse = await fetch('/api/payment/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: data.bookingId }),
        })
        
        const testData = await testResponse.json()
        
        if (testData.error) {
          alert(testData.error)
          setIsProcessing(false)
          return
        }
        
        if (testData.redirectUrl) {
          sessionStorage.removeItem('bookingLocation')
          sessionStorage.removeItem('selectedServices')
          sessionStorage.removeItem('customerDetails')
          sessionStorage.removeItem('bookingDateTime')
          router.replace(testData.redirectUrl)
          return
        }
      }
      
      sessionStorage.removeItem('bookingLocation')
      sessionStorage.removeItem('selectedServices')
      sessionStorage.removeItem('customerDetails')
      sessionStorage.removeItem('bookingDateTime')
      router.replace(`/booking/confirmation?bookingId=${data.bookingId}`)
    } catch (error) {
      console.error('Error initiating payment:', error)
      alert('Failed to initiate payment. Please try again.')
      setIsProcessing(false)
    }
  }

  if (!hasData) {
    return null
  }

  const totalAmount = services.reduce((sum, s) => sum + s.price * (s.quantity ?? 1), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-6">
          <h1 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-0.5 sm:mb-2">Payment</h1>
          <p className="text-xs sm:text-sm text-gray-500">Complete your booking with secure payment</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {isProcessing ? (
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-6 sm:p-12 shadow-sm text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-black mb-3 sm:mb-4"></div>
            <p className="text-base sm:text-xl font-light text-gray-900 mb-2">Processing Payment...</p>
            <p className="text-xs sm:text-sm text-gray-500 font-light">Please wait while we process your payment</p>
          </div>
        ) : (
          <>
            {showDurationPopup && totalDurationMinutes > MAX_DURATION_MINUTES && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Important</h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Your appointment duration is over 1.5 hours. Please be present at the right time for your booking. We recommend arriving <strong>10 minutes before</strong> your scheduled time.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowDurationPopup(false)}
                    className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
            <PaymentScreen
              services={services}
              totalAmount={totalAmount}
              onPaymentInitiate={handlePaymentInitiate}
              onServicesChange={handleServicesChange}
              totalBump={totalBump}
            />
            <p className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
              <Link href="/terms" className="text-primary-600 hover:underline">Terms</Link>
              {' · '}
              <Link href="/privacy" className="text-primary-600 hover:underline">Privacy</Link>
              {' · '}
              <Link href="/refund" className="text-primary-600 hover:underline">Refund Policy</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
