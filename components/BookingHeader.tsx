'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, LogOut } from 'lucide-react'
import { AUTH_DISABLED_FOR_NOW } from '@/lib/auth'

export default function BookingHeader() {
  const pathname = usePathname()
  const [user, setUser] = useState<{ name: string; mobile: string } | null>(null)

  const authDisabled = AUTH_DISABLED_FOR_NOW || process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'

  useEffect(() => {
    if (authDisabled) return
    fetch('/api/user/me')
      .then((r) => r.json())
      .then((data) => setUser(data?.user || null))
      .catch(() => setUser(null))
  }, [authDisabled, pathname])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  // Don't show on invoice (token-based, no nav)
  if (pathname?.startsWith('/booking/invoice')) return null
  if (authDisabled || !user) return null

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-end gap-2">
      <Link
        href="/profile"
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        <User size={18} />
        <span className="hidden sm:inline">Profile</span>
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        <LogOut size={18} />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  )
}
