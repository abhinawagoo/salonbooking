'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Mail, Phone, ExternalLink } from 'lucide-react'

const BRAND_NAME = 'Shahnaz Salon'
const WEBSITE_URL = 'https://www.sasaramshahnazsalon.com'
const SUPPORT_EMAIL = 'support@sasaramshahnazsalon.com'

export default function Footer() {
  const pathname = usePathname()
  const [aboutOpen, setAboutOpen] = useState(false)
  const [quickLinksOpen, setQuickLinksOpen] = useState(false)
  const [socialLinks, setSocialLinks] = useState<{ name: string; href: string; icon: string }[]>([])

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((s) => {
        const links: { name: string; href: string; icon: string }[] = []
        if (s.facebookUrl) links.push({ name: 'Facebook', href: s.facebookUrl, icon: 'f' })
        if (s.instagramUrl) links.push({ name: 'Instagram', href: s.instagramUrl, icon: '📷' })
        setSocialLinks(links)
      })
      .catch(() => {})
  }, [])

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
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
                Privacy Policy
              </Link>
              <Link href="/refund" className="text-gray-600 hover:text-gray-900">
                Refund &amp; Cancellation
              </Link>
            </nav>
          )}
        </div>

        {/* Support box */}
        <div className="mt-4 p-4 rounded-xl bg-primary-50 border border-primary-100 text-center">
          <p className="text-sm font-medium text-gray-800 mb-1">
            Facing issues? Reach us at:
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:+918877799982"
              className="inline-flex items-center gap-1.5 text-primary-600 font-medium hover:underline"
            >
              <Phone size={16} />
              +91 8877799982
            </a>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-1.5 text-primary-600 font-medium hover:underline"
            >
              <Mail size={16} />
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>

        {/* Social: Instagram & Facebook (from admin customize) */}
        {socialLinks.length > 0 && (
        <div className="mt-6 flex justify-center gap-4">
          {socialLinks.map((social) => (
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
        )}

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
            <Link href="/privacy" className="hover:text-gray-700 underline">
              Privacy Policy
            </Link>
            {' · '}
            <Link href="/refund" className="hover:text-gray-700 underline">
              Refund &amp; Cancellation
            </Link>
            {' · '}
            Powered by {BRAND_NAME}
          </p>
        </div>
      </div>
    </footer>
  )
}
