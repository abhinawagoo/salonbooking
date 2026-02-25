'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Mail, ExternalLink } from 'lucide-react'

const BRAND_NAME = 'Shahnaz Salon'
const WEBSITE_URL = 'https://www.sasaramshahnazsalon.com'
const SUPPORT_EMAIL = 'support@sasaramshahnazsalon.com'

// Placeholder social links – update later in env or admin
const SOCIAL_LINKS = [
  { name: 'Facebook', href: 'https://facebook.com', icon: 'f' },
  { name: 'Instagram', href: 'https://instagram.com', icon: '📷' },
  { name: 'X (Twitter)', href: 'https://x.com', icon: '𝕏' },
  { name: 'LinkedIn', href: 'https://linkedin.com', icon: 'in' },
]

export default function Footer() {
  const pathname = usePathname()
  const [aboutOpen, setAboutOpen] = useState(false)
  const [quickLinksOpen, setQuickLinksOpen] = useState(false)

  if (pathname?.startsWith('/booking') || pathname === '/') {
    return null
  }

  return (
    <footer className="bg-gray-100 text-gray-700 mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Accordion: About */}
        <div className="border-b border-gray-300">
          <button
            type="button"
            onClick={() => setAboutOpen((o) => !o)}
            className="w-full flex items-center justify-between py-4 text-left font-medium text-gray-800"
          >
            <span>About {BRAND_NAME}</span>
            <ChevronDown
              size={20}
              className={`transition-transform ${aboutOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {aboutOpen && (
            <div className="pb-4 text-sm text-gray-600 space-y-2">
              <p>
                {BRAND_NAME} offers premium salon services. Book your appointment online for a seamless experience.
              </p>
              <a
                href={WEBSITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary-600 hover:underline"
              >
                {WEBSITE_URL.replace(/^https?:\/\//, '')}
                <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>

        {/* Accordion: Quick Links */}
        <div className="border-b border-gray-300">
          <button
            type="button"
            onClick={() => setQuickLinksOpen((o) => !o)}
            className="w-full flex items-center justify-between py-4 text-left font-medium text-gray-800"
          >
            <span>Quick Links</span>
            <ChevronDown
              size={20}
              className={`transition-transform ${quickLinksOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {quickLinksOpen && (
            <nav className="pb-4 flex flex-col gap-2 text-sm">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link href="/#services" className="text-gray-600 hover:text-gray-900">
                Services
              </Link>
              <Link href="/booking/location" className="text-gray-600 hover:text-gray-900">
                Book Appointment
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-gray-900">
                Terms &amp; Conditions
              </Link>
            </nav>
          )}
        </div>

        {/* Support box */}
        <div className="mt-4 p-4 rounded-xl bg-primary-50 border border-primary-100 text-center">
          <p className="text-sm font-medium text-gray-800 mb-1">
            Facing issues? Reach us out at:
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex items-center gap-1.5 text-primary-600 font-medium hover:underline"
          >
            <Mail size={16} />
            {SUPPORT_EMAIL}
          </a>
        </div>

        {/* App download */}
        <div className="mt-6 text-center">
          <p className="text-sm font-medium text-gray-800 mb-3">
            Experience the {BRAND_NAME} Mobile App
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              <span className="text-green-400">▶</span>
              Get it on Google Play
            </a>
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              <span>🍎</span>
              Download on the App Store
            </a>
          </div>
        </div>

        {/* Social */}
        <div className="mt-6 text-center">
          <p className="text-sm font-medium text-gray-800 mb-3">
            Show some love ❤️ on social media
          </p>
          <div className="flex justify-center gap-4">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-500 hover:text-gray-900 transition-colors"
                aria-label={social.name}
              >
                <span className="text-sm font-semibold">{social.icon}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-300 text-center text-xs text-gray-500 leading-relaxed">
          <p>
            Copyright 2017–2025 © {BRAND_NAME} | {WEBSITE_URL.replace(/^https?:\/\//, '')}
          </p>
          <p className="mt-1">
            <Link href="/terms" className="hover:text-gray-700 underline">
              Terms &amp; Conditions
            </Link>
            {' · '}
            Powered by {BRAND_NAME}
          </p>
        </div>
      </div>
    </footer>
  )
}
