import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone } from 'lucide-react'
import { SEO } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Bridal Makeup Sasaram Bihar | Shahsharam Ladies Salon',
  description:
    'Shahsharam Ladies Salon offers professional bridal makeup in Sasaram Bihar. Wedding makeup, party makeup, pre-bridal skincare, and complete bridal beauty packages. Book your bridal makeup in Sasaram today.',
  keywords:
    'Bridal Makeup Sasaram, Wedding Makeup Sasaram Bihar, Bridal Makeup Artist Sasaram, Party Makeup Sasaram, Pre-bridal Makeup Sasaram, Shahsharam Ladies Salon',
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

export default function BridalMakeupSasaramPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <article className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Bridal Makeup in Sasaram Bihar – Shahsharam Ladies Salon
          </h1>

          <p className="text-gray-600 leading-relaxed mb-8">
            Shahsharam Ladies Salon offers professional bridal makeup services in Sasaram. Our experienced makeup artists create stunning wedding looks, from traditional to contemporary styles. We provide pre-bridal skincare, makeup trials, and complete wedding day beauty packages to make your special day unforgettable.
          </p>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Complete Bridal Makeup Packages in Sasaram
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our bridal makeup packages include pre-bridal facials, skin glow treatments, makeup trials, and full wedding day makeup. We use premium products to ensure long-lasting, camera-ready looks that last through your entire celebration.
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
              Party Makeup and Occasion Makeup in Sasaram
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Beyond weddings, we offer party makeup, engagement makeup, and occasion makeup for festivals and special events. Our artists tailor each look to match your outfit, skin tone, and personal style.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Why Choose Shahsharam for Bridal Makeup in Sasaram
            </h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Experienced bridal makeup artists</li>
              <li>Premium, long-lasting makeup products</li>
              <li>Pre-bridal skincare and glow treatments</li>
              <li>Makeup trials before your wedding day</li>
              <li>On-time service for wedding day</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Book Your Bridal Makeup in Sasaram
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Reserve your bridal makeup appointment at Shahsharam Ladies Salon. Call us or book online to schedule your trial and wedding day makeup.
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
