'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, Sparkles, User, LogOut, History } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { getUserRole, type UserRole } from '@/lib/auth'

interface LoggedInUser {
  id: string
  name: string
  mobile: string
  role: string
}

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [userRole, setUserRole] = useState<UserRole>('CUSTOMER')
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setUserRole(getUserRole())
  }, [pathname])

  const authDisabled = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'
  useEffect(() => {
    if (authDisabled) {
      setLoggedInUser(null)
      return
    }
    fetch('/api/user/me')
      .then((r) => r.json())
      .then((data) => setLoggedInUser(data.user || null))
      .catch(() => setLoggedInUser(null))
  }, [pathname, authDisabled])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setLoggedInUser(null)
    setProfileOpen(false)
    router.refresh()
  }

  if (pathname?.startsWith('/booking') || pathname?.startsWith('/login')) {
    return null
  }

  const isHome = pathname === '/'
  const barBg = isHome ? 'bg-black/10' : 'bg-black/15'

  return (
    <nav className="sticky top-0 z-50 w-full pt-2 px-2 sm:pt-4 sm:px-4">
      <div className={`relative max-w-6xl md:mx-auto rounded-b-xl sm:rounded-b-2xl border border-t-0 border-white/20 ${barBg} backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.15)]`}>
        <div className="flex items-center justify-between min-h-[52px] sm:h-14 px-3 sm:px-4 gap-3">
          <Link
            href="/"
            className="text-base sm:text-lg font-bold text-white min-w-0 drop-shadow-md shrink-0 truncate"
          >
            Shahnaz Salon
          </Link>

          {/* Profile (top right) or Login – hidden when auth disabled */}
          <div className="relative flex items-center gap-2 shrink-0" ref={profileRef}>
            {!authDisabled && loggedInUser ? (
              <>
                <button
                  type="button"
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-colors touch-manipulation"
                  aria-label="Profile"
                  aria-expanded={profileOpen}
                >
                  <User size={20} />
                </button>
                {profileOpen && (
                  <div className="absolute right-2 sm:right-4 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-medium text-gray-900 truncate">{loggedInUser.name}</p>
                      <p className="text-xs text-gray-500 truncate">{loggedInUser.mobile}</p>
                    </div>
                    <Link
                      href="/profile/bookings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <History size={18} />
                      My Bookings
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : !authDisabled ? (
              <Link
                href={`/login?returnTo=${encodeURIComponent(pathname || '/')}`}
                className="flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-full text-sm font-medium border border-white/30"
              >
                <User size={18} />
                <span className="hidden sm:inline">Login</span>
              </Link>
            ) : null}

            {/* Services + Book (mobile and desktop) */}
            <div className="flex items-center gap-2 flex-1 justify-end shrink-0">
              <Link
                href="/#services"
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 sm:px-4 rounded-full font-semibold text-sm shadow-md hover:shadow-lg transition-all min-h-[44px] touch-manipulation ${
                  pathname === '/' ? 'bg-white/20 text-white border border-white/30' : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                }`}
              >
                <Sparkles size={18} /> Services
              </Link>
              <Link
                href="/booking/location"
                className="inline-flex items-center justify-center gap-1.5 bg-white text-gray-900 px-3 py-2.5 sm:px-4 rounded-full font-semibold text-sm shadow-lg hover:bg-gray-100 transition-all min-h-[44px] touch-manipulation"
              >
                <Calendar size={18} /> Book
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
