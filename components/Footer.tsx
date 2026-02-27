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

  if (pathname?.startsWith('/booking')) {
    return null
  }

  return (
    <footer className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white/90 mt-auto border-t border-white/10">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Accordion: About */}
        <div className="border-b border-white/20">
          <button
            type="button"
            onClick={() => setAboutOpen((o) => !o)}
            className="w-full flex items-center justify-between py-4 text-left font-medium text-white"
          >
            <span>About {BRAND_NAME}</span>
            <ChevronDown
              size={20}
              className={`transition-transform ${aboutOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {aboutOpen && (
            <div className="pb-4 text-sm text-white/80 space-y-2">
              <p>
                {BRAND_NAME} offers premium salon services. Book your appointment online for a seamless experience.
              </p>
              <a
                href={WEBSITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-pink-400 hover:text-pink-300 hover:underline"
              >
                {WEBSITE_URL.replace(/^https?:\/\//, '')}
                <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>

        {/* Accordion: Quick Links */}
        <div className="border-b border-white/20">
          <button
            type="button"
            onClick={() => setQuickLinksOpen((o) => !o)}
            className="w-full flex items-center justify-between py-4 text-left font-medium text-white"
          >
            <span>Quick Links</span>
            <ChevronDown
              size={20}
              className={`transition-transform ${quickLinksOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {quickLinksOpen && (
            <nav className="pb-4 flex flex-col gap-2 text-sm">
              <Link href="/" className="text-white/80 hover:text-white">
                Home
              </Link>
              <Link href="/services" className="text-white/80 hover:text-white">
                Services
              </Link>
              <Link href="/booking/location" className="text-white/80 hover:text-white">
                Book Appointment
              </Link>
              <Link href="/terms" className="text-white/80 hover:text-white">
                Terms &amp; Conditions
              </Link>
              <Link href="/privacy" className="text-white/80 hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/refund" className="text-white/80 hover:text-white">
                Refund &amp; Cancellation
              </Link>
            </nav>
          )}
        </div>

        {/* Support box */}
        <div className="mt-4 p-4 rounded-xl bg-white/10 border border-white/20 text-center">
          <p className="text-sm font-medium text-white mb-1">
            Facing issues? Reach us at:
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:+918877799982"
              className="inline-flex items-center gap-1.5 text-pink-400 font-medium hover:text-pink-300 hover:underline"
            >
              <Phone size={16} />
              +91 8877799982
            </a>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-1.5 text-pink-400 font-medium hover:text-pink-300 hover:underline"
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
              className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center text-white/90 hover:border-white/60 hover:text-white transition-colors"
              aria-label={social.name}
            >
              <span className="text-sm font-semibold">{social.icon}</span>
            </a>
          ))}
        </div>
        )}

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-white/20 text-center text-xs text-white/60 leading-relaxed">
          <p>
            Copyright 2017–2025 © {BRAND_NAME} | {WEBSITE_URL.replace(/^https?:\/\//, '')}
          </p>
          <p className="mt-1">
            <Link href="/terms" className="hover:text-white/90 underline">
              Terms &amp; Conditions
            </Link>
            {' · '}
            <Link href="/privacy" className="hover:text-white/90 underline">
              Privacy Policy
            </Link>
            {' · '}
            <Link href="/refund" className="hover:text-white/90 underline">
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
