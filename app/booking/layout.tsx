'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AUTH_DISABLED_FOR_NOW } from '@/lib/auth'

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  const authDisabled = AUTH_DISABLED_FOR_NOW || process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'

  useEffect(() => {
    if (authDisabled) {
      setChecking(false)
      return
    }
    // Invoice page is token-based - no login required
    if (pathname?.startsWith('/booking/invoice')) {
      setChecking(false)
      return
    }
    // Require login before booking - user must create profile (verify mobile) first
    fetch('/api/user/me')
      .then((r) => r.json())
      .then((data) => {
        if (!data?.user) {
          const returnTo = pathname || '/booking/location'
          router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`)
          return
        }
        setChecking(false)
      })
      .catch(() => {
        router.replace(`/login?returnTo=${encodeURIComponent(pathname || '/booking/location')}`)
      })
  }, [authDisabled, pathname, router])

  if (authDisabled) {
    return <>{children}</>
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto" />
          <p className="mt-4 text-gray-600">Verifying...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
