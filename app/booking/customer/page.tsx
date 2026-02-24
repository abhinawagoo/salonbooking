'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CustomerForm from '@/components/CustomerForm'

export default function CustomerDetailsPage() {
  const router = useRouter()
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    const location = sessionStorage.getItem('bookingLocation')
    const dateTime = sessionStorage.getItem('bookingDateTime')
    if (!location || !dateTime) {
      router.push('/booking/location')
      return
    }
    setHasData(true)
  }, [router])

  const handleSubmit = (data: { name: string; mobile: string; notes?: string }) => {
    sessionStorage.setItem('customerDetails', JSON.stringify(data))
    router.push('/booking/services')
  }

  if (!hasData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4 sm:py-5">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Your Details</h1>
          <p className="text-gray-500 mt-1 text-sm">We&apos;ll use this to confirm your booking</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 sm:py-8 pb-[env(safe-area-inset-bottom)]">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <CustomerForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  )
}
