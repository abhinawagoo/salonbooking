'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Cart page removed - redirect to booking flow.
 * Services → Book Appointment now goes directly to /booking/location.
 * Auth is handled by the booking layout (redirects to login if needed).
 */
export default function CartRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    const hasServices = typeof window !== 'undefined' && sessionStorage.getItem('selectedServices')
    router.replace(hasServices ? '/booking/location' : '/services')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-gray-900" />
    </div>
  )
}
