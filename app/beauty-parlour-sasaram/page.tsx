import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone } from 'lucide-react'
import { SEO } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Beauty Parlour Sasaram Bihar | Shahsharam Ladies Salon',
  description:
    'Shahsharam Ladies Salon is a leading beauty parlour in Sasaram Bihar. Hair styling, bridal makeup, facial, skincare, threading, and complete beauty services for women. Best beauty parlour in Sasaram.',
  keywords:
    'Beauty Parlour Sasaram, Beauty Parlour Sasaram Bihar, Ladies Beauty Salon Sasaram, Beauty Services Sasaram, Shahsharam Ladies Salon',
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'BeautySalon',
  name: 'Shahsharam Ladies Salon',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Sasaram',
    addressRegion: 'Bihar',
    postalCode: '821115',
    addressCountry: 'IN',
  },
  areaServed: 'Sasaram Bihar',
}

export default function BeautyParlourSasaramPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <article className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Beauty Parlour in Sasaram Bihar – Shahsharam Ladies Salon
          </h1>

          <p className="text-gray-600 leading-relaxed mb-8">
            Shahsharam Ladies Salon is a trusted beauty parlour in Sasaram offering a complete range of beauty services for women. From hair styling and bridal makeup to facials and skincare, we provide professional beauty care in a clean, welcoming environment.
          </p>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Beauty Services at Shahsharam Parlour Sasaram
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our beauty parlour offers hair styling, haircuts, hair spa, bridal makeup, party makeup, facial, cleanup, skin treatments, threading, and more. We use quality products and modern techniques to deliver the best results for our clients.
            </p>
            <div className="aspect-video max-w-md rounded-lg bg-gray-100 overflow-hidden mb-4">
              <img
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3C/svg%3E"
                alt="Beauty services at Shahsharam Ladies Salon Sasaram Bihar"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Why Shahsharam is the Best Beauty Parlour in Sasaram
            </h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Experienced beauty professionals</li>
              <li>Complete range of beauty services</li>
              <li>High quality beauty products</li>
              <li>Clean and hygienic environment</li>
              <li>Affordable beauty packages</li>
              <li>Modern beauty treatments</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Visit Our Beauty Parlour in Sasaram
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Book your appointment at Shahsharam Ladies Salon, the best beauty parlour in Sasaram. Call us or book online to experience professional beauty services.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/booking/location"
                className="inline-flex items-center justify-center px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Book Appointment
              </Link>
              <a
                href={`tel:${SEO.telephone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-teal-600 text-teal-600 rounded-lg font-medium hover:bg-teal-50 transition-colors"
              >
                <Phone size={20} />
                Call Now
              </a>
            </div>
          </section>

          <nav className="pt-8 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Explore more:</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link href="/" className="text-teal-600 hover:text-teal-700 hover:underline">
                Homepage
              </Link>
              <Link href="/gallery" className="text-teal-600 hover:text-teal-700 hover:underline">
                Gallery
              </Link>
              <Link href="/contact" className="text-teal-600 hover:text-teal-700 hover:underline">
                Contact
              </Link>
              <Link href="/best-ladies-salon-in-sasaram-bihar" className="text-teal-600 hover:text-teal-700 hover:underline">
                Best Ladies Salon Sasaram
              </Link>
            </div>
          </nav>
        </div>
      </article>
    </>
  )
}
