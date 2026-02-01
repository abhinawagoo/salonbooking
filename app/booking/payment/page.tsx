'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PaymentScreen from '@/components/PaymentScreen'

interface Service {
  id: string
  name: string
  price: number
  duration: number
}

export default function PaymentPage() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [hasData, setHasData] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const location = sessionStorage.getItem('bookingLocation')
    const servicesData = sessionStorage.getItem('selectedServices')
    const customer = sessionStorage.getItem('customerDetails')
    const dateTime = sessionStorage.getItem('bookingDateTime')
    
    if (!location || !servicesData || !customer || !dateTime) {
      router.push('/booking/location')
      return
    }
    
    setServices(JSON.parse(servicesData))
    setHasData(true)
  }, [router])

  const handlePaymentInitiate = async (paymentType: 'FULL' | 'ADVANCE', paymentMethod?: string) => {
    setIsProcessing(true)
    try {
      const customerDetails = JSON.parse(sessionStorage.getItem('customerDetails') || '{}')
      const dateTime = JSON.parse(sessionStorage.getItem('bookingDateTime') || '{}')
      
      const location = JSON.parse(sessionStorage.getItem('bookingLocation') || '{}')
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationId: location.id,
          services: services.map(s => s.id),
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
      
      // If PhonePe URL is available, redirect to it
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

  const totalAmount = services.reduce((sum, service) => sum + service.price, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-light text-gray-900 mb-3">Payment</h1>
          <p className="text-lg text-gray-500 font-light">Complete your booking with secure payment</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {isProcessing ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 shadow-sm text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
            <p className="text-xl font-light text-gray-900 mb-2">Processing Payment...</p>
            <p className="text-sm text-gray-500 font-light">Please wait while we process your payment</p>
          </div>
        ) : (
          <PaymentScreen
            services={services}
            totalAmount={totalAmount}
            onPaymentInitiate={handlePaymentInitiate}
          />
        )}
      </div>
    </div>
  )
}
