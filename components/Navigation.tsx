'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Home, Settings, Users, Calendar, Sparkles, Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { getUserRole, type UserRole } from '@/lib/auth'

export default function Navigation() {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<UserRole>('CUSTOMER')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  useEffect(() => {
    setUserRole(getUserRole())
  }, [pathname])
  
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])
  
  if (pathname?.startsWith('/booking')) {
    return null
  }

  const showStaffLink = userRole === 'STAFF' || userRole === 'ADMIN'
  const showAdminLink = userRole === 'ADMIN'

  const navLink =
    'px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent text-white drop-shadow-md hover:drop-shadow-lg'
  const navLinkActive = 'bg-white/20 text-white border-white/30'
  const navLinkInactive =
    'text-white/95 hover:bg-white/15 hover:text-white hover:border-white/20'

  const navItems = (
    <>
      <Link
        href="/#services"
        className={`${navLink} flex items-center gap-2 ${
          pathname === '/' ? navLinkActive : navLinkInactive
        }`}
      >
        <Sparkles size={18} />
        Services
      </Link>
      <Link
        href="/booking/location"
        className={`${navLink} flex items-center gap-2 ${
          pathname === '/booking/location' ? navLinkActive : navLinkInactive
        }`}
      >
        <Calendar size={18} />
        Book Appointment
      </Link>
      {showStaffLink && (
        <Link
          href="/staff"
          className={`${navLink} flex items-center gap-2 ${
            pathname === '/staff' ? navLinkActive : navLinkInactive
          }`}
        >
          <Users size={18} />
          Staff
        </Link>
      )}
      {showAdminLink && (
        <Link
          href="/admin"
          className={`${navLink} flex items-center gap-2 ${
            pathname?.startsWith('/admin') ? navLinkActive : navLinkInactive
          }`}
        >
          <Settings size={18} />
          Admin
        </Link>
      )}
    </>
  )

  const isHome = pathname === '/'
  const barBg = isHome ? 'bg-black/10' : 'bg-black/15'

  return (
    <nav className="sticky top-0 z-50 w-full pt-2 px-2 sm:pt-4 sm:px-4">
      {/* Transparent liquid glass – no white; flush to top, no gap */}
      <div className={`max-w-6xl md:mx-auto rounded-b-xl sm:rounded-b-2xl border border-t-0 border-white/20 ${barBg} backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.15)]`}>
        <div className="flex items-center justify-between min-h-[52px] sm:h-14 px-3 sm:px-5">
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg font-bold text-white min-w-0 drop-shadow-md"
          >
            <Home size={20} className="flex-shrink-0 sm:w-[22px] sm:h-[22px]" />
            <span className="truncate">Salon Booking</span>
          </Link>

          {/* Desktop: inline links */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems}
          </div>

          {/* Mobile / tablet: hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-white hover:bg-white/15 transition-colors touch-manipulation drop-shadow-md"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu: same transparent glass, touch-friendly */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/20 bg-black/5 backdrop-blur-xl rounded-b-xl overflow-hidden">
            <div className="flex flex-col p-2 gap-1 [&_a]:w-full [&_a]:py-3 [&_a]:min-h-[48px] [&_a]:items-center [&_a]:justify-center">
              {navItems}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
