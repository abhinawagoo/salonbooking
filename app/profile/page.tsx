'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Phone, History, LogOut } from 'lucide-react'
import { AUTH_DISABLED_FOR_NOW } from '@/lib/auth'

interface UserProfile {
  id: string
  name: string
  mobile: string
  role: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const authDisabled = AUTH_DISABLED_FOR_NOW || process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'

  useEffect(() => {
    if (authDisabled) {
      setUser({ id: '', name: 'Guest', mobile: '', role: 'CUSTOMER' })
      setLoading(false)
      return
    }
    fetch('/api/user/me')
      .then((r) => {
        if (r.status === 401 || !r.ok) {
          router.push('/login?returnTo=/profile')
          return null
        }
        return r.json()
      })
      .then((data) => {
        if (data?.user) setUser(data.user)
        else router.push('/login?returnTo=/profile')
      })
      .catch(() => router.push('/login?returnTo=/profile'))
      .finally(() => setLoading(false))
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6 flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">My Profile</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile card - mobile as unique identity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                <User size={32} className="text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.name && user.name !== 'Guest' ? user.name : 'Guest'}
                </h2>
                {user.name === 'Guest' && (
                  <p className="text-xs text-amber-600 mt-0.5">Add your name when booking</p>
                )}
              </div>
            </div>
            <div className="space-y-3">
              {user.mobile ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Phone size={20} className="text-gray-500 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">WhatsApp Number (your unique identity)</p>
                    <p className="font-medium text-gray-900">+91 {user.mobile}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Use your mobile number when booking to track your appointments.</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <Link
            href="/profile/bookings"
            className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <History size={22} className="text-primary-600 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">My Bookings</p>
              <p className="text-sm text-gray-500">View and manage your appointments</p>
            </div>
            <span className="text-gray-400">→</span>
          </Link>
        </div>

        {/* Logout – hidden when auth disabled */}
        {!authDisabled && (
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-red-200 text-red-700 font-medium hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        )}
      </div>
    </div>
  )
}
