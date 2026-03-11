import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone } from 'lucide-react'
import { SEO } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Best Ladies Salon in Sasaram Bihar | Shahsharam Ladies Salon',
  description:
    'Shahsharam Ladies Salon is one of the best beauty salons in Sasaram Bihar offering hair styling, bridal makeup, facial, skincare, and beauty services for women. Visit the best ladies salon in Sasaram today.',
  keywords:
    'Best Ladies Salon in Sasaram Bihar, Beauty Parlour Sasaram, Bridal Makeup Sasaram, Facial Services Sasaram, Hair Styling Sasaram, Shahsharam Ladies Salon',
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

export default function BestLadiesSalonPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <article className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Best Ladies Salon in Sasaram Bihar – Shahsharam Ladies Salon
          </h1>

          <p className="text-gray-600 leading-relaxed mb-8">
            Shahsharam Ladies Salon is a professional beauty salon in Sasaram offering modern beauty treatments, hair styling, bridal makeup, and skincare services for women. We provide a complete range of beauty and grooming services to help you look and feel your best.
          </p>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Professional Hair Styling Services in Sasaram
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our salon offers expert hair styling services for women including haircuts, hair styling, hair spa, and hair treatments. Whether you need a simple trim, a new look, or deep conditioning treatment, our experienced stylists deliver the best results.
            </p>
            <div className="aspect-video max-w-md rounded-lg bg-gray-100 overflow-hidden mb-4">
              <img
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3C/svg%3E"
                alt="Hair styling for women at Shahsharam Ladies Salon Sasaram"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Bridal Makeup Services in Sasaram
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Shahsharam Ladies Salon offers bridal makeup, party makeup, and wedding beauty packages. Our bridal makeup artists create stunning looks for your special day, including pre-bridal skincare, makeup trials, and complete wedding day beauty services.
            </p>
            <div className="aspect-video max-w-md rounded-lg bg-gray-100 overflow-hidden mb-4">
              <img
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3C/svg%3E"
                alt="Bridal makeup at Shahsharam Ladies Salon in Sasaram Bihar"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Facial and Skincare Treatments
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We provide facial, cleanup, skin treatments, and beauty care for women. Our skincare services include deep cleansing facials, anti-aging treatments, and customized skin care routines to keep your skin healthy and glowing.
            </p>
            <div className="aspect-video max-w-md rounded-lg bg-gray-100 overflow-hidden mb-4">
              <img
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3C/svg%3E"
                alt="Facial treatment at Shahsharam Beauty Salon Sasaram"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Why Shahsharam Ladies Salon is the Best Beauty Salon in Sasaram
            </h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Experienced beauty professionals</li>
              <li>High quality beauty products</li>
              <li>Clean and hygienic environment</li>
              <li>Affordable beauty services</li>
              <li>Modern beauty treatments</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Visit Shahsharam Ladies Salon in Sasaram
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Book your appointment today and experience the best beauty services in Sasaram. Visit our salon or call us to schedule your visit.
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
              <Link href="/bridal-makeup-sasaram" className="text-teal-600 hover:text-teal-700 hover:underline">
                Bridal Makeup Sasaram
              </Link>
              <Link href="/facial-services-sasaram" className="text-teal-600 hover:text-teal-700 hover:underline">
                Facial Services Sasaram
              </Link>
              <Link href="/hair-styling-sasaram" className="text-teal-600 hover:text-teal-700 hover:underline">
                Hair Styling Sasaram
              </Link>
              <Link href="/beauty-parlour-sasaram" className="text-teal-600 hover:text-teal-700 hover:underline">
                Beauty Parlour Sasaram
              </Link>
            </div>
          </nav>
        </div>
      </article>
    </>
  )
}
