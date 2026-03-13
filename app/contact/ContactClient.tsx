'use client'

import { Phone, Mail, MapPin } from 'lucide-react'
import Link from 'next/link'
import { SEO } from '@/lib/seo'

const SUPPORT_EMAIL = 'support@shahnazsalonsasaram.com'

export default function ContactClient() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Contact {SEO.siteName}
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          Visit our salon in Sasaram, Bihar or get in touch.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Phone size={20} />
              Phone
            </h2>
            <a
              href={`tel:${SEO.telephone.replace(/\s/g, '')}`}
              className="text-teal-600 hover:text-teal-700 font-medium"
            >
              {SEO.telephone}
            </a>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail size={20} />
              Email
            </h2>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-teal-600 hover:text-teal-700 font-medium"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={20} />
            Location
          </h2>
          <p className="text-gray-600 mb-2">
            {SEO.address.locality}, {SEO.address.region} {SEO.address.postalCode}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {SEO.areaServed}
          </p>
          <Link
            href="/booking/location"
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium"
          >
            Book Appointment
          </Link>
        </div>

        <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
          <h2 className="font-semibold text-gray-900 p-4 border-b border-gray-200">
            Find us on Map
          </h2>
          <div className="aspect-video w-full">
            <iframe
              src="https://maps.google.com/maps?q=Sasaram,Bihar,India&output=embed&z=14"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${SEO.siteName} location in Sasaram, Bihar`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
