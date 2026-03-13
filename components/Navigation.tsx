'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, LogOut, History } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { getUserRole, AUTH_DISABLED_FOR_NOW, type UserRole } from '@/lib/auth'

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

  const authDisabled = AUTH_DISABLED_FOR_NOW || process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'
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

  const btnClass = 'inline-flex items-center justify-center px-3 py-2.5 sm:px-5 rounded-full font-semibold text-sm transition-all duration-200 min-h-[44px] touch-manipulation whitespace-normal text-center'

  return (
    <nav className="sticky top-0 z-50 w-full">
      <div className="relative w-full rounded-none sm:rounded-b-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
        {/* Gradient background inspired by sign: blue to amber */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800/95 via-slate-900/95 to-amber-900/30" />
        <div className="absolute inset-0 backdrop-blur-xl" />
        <div className="relative border-b border-white/10 sm:rounded-b-2xl">
          <div className="flex items-center justify-between min-h-[52px] sm:min-h-[60px] px-3 sm:px-6 gap-2 sm:gap-4 max-w-6xl mx-auto">
            <Link
              href="/"
              className="flex flex-col min-w-0 shrink-0 group"
            >
              <span className="text-lg sm:text-xl font-bold leading-tight tracking-tight">
                <span className="text-[#22c55e] drop-shadow-[0_0_12px_rgba(34,197,94,0.4)] group-hover:text-[#4ade80] transition-colors">Shahnaz</span>
                <span className="text-[#f472b6] drop-shadow-[0_0_12px_rgba(244,114,182,0.4)] group-hover:text-[#f9a8d4] transition-colors"> Salon</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-white/80 font-medium tracking-tight uppercase leading-none mt-1 text-right self-end">
                Only for ladies
              </span>
            </Link>

            {/* Services + Book Appointment + Profile (rightmost) */}
            <div className="relative flex items-center gap-2 sm:gap-3 shrink-0">
              <Link
                href="/services"
                className={`${btnClass} bg-white/20 hover:bg-white/30 text-white border border-white/30`}
              >
                Services
              </Link>
              <Link
                href="/booking/location"
                className={`${btnClass} bg-white/20 hover:bg-white/30 text-white border border-white/30`}
              >
                <span>Book<br className="sm:hidden" /> Appointment</span>
              </Link>

              {/* Profile or Login – rightmost, hidden when auth disabled */}
              <div className="relative" ref={profileRef}>
                {!authDisabled && loggedInUser ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setProfileOpen((o) => !o)}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all duration-200 touch-manipulation ring-2 ring-transparent hover:ring-white/20"
                      aria-label="Profile"
                      aria-expanded={profileOpen}
                    >
                      <User size={20} />
                    </button>
                    {profileOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 overflow-hidden">
                        <Link
                          href="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <p className="font-semibold text-gray-900 truncate">{loggedInUser.name === 'Guest' ? 'Guest' : loggedInUser.name}</p>
                          <p className="text-xs text-gray-500 truncate">+91 {loggedInUser.mobile}</p>
                          <p className="text-xs text-primary-600 mt-0.5">View profile →</p>
                        </Link>
                        <Link
                          href="/profile/bookings"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-700 transition-colors"
                        >
                          <History size={18} />
                          My Bookings
                        </Link>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left transition-colors"
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
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all duration-200"
                  >
                    <User size={18} />
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
