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
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Your Details</h1>
          <p className="text-gray-600 mt-1">Please provide your contact information</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <CustomerForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  )
}
