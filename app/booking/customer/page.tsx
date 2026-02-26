'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CustomerForm from '@/components/CustomerForm'

export default function CustomerDetailsPage() {
  const router = useRouter()
  const [hasData, setHasData] = useState(false)
  const [profile, setProfile] = useState<{ name: string; mobile: string } | null>(null)

  useEffect(() => {
    const location = sessionStorage.getItem('bookingLocation')
    const dateTime = sessionStorage.getItem('bookingDateTime')
    if (!location || !dateTime) {
      router.push('/booking/location')
      return
    }
    setHasData(true)
    // Pre-fill from logged-in profile when auth is enabled
    fetch('/api/user/me')
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.name && data?.user?.mobile) {
          setProfile({ name: data.user.name, mobile: data.user.mobile })
        }
      })
      .catch(() => {})
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
          <CustomerForm onSubmit={handleSubmit} defaultName={profile?.name} defaultMobile={profile?.mobile} />
          <p className="mt-4 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
            <Link href="/terms" className="text-primary-600 hover:underline">Terms &amp; Conditions</Link>
            {' · '}
            <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
            {' · '}
            <Link href="/refund" className="text-primary-600 hover:underline">Refund Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
