import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone } from 'lucide-react'
import { SEO } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Facial Services Sasaram Bihar | Shahsharam Ladies Salon',
  description:
    'Shahsharam Ladies Salon offers facial services in Sasaram Bihar. Deep cleansing facial, cleanup, skin glow, anti-aging treatments, and customized skincare. Best facial in Sasaram for women.',
  keywords:
    'Facial Sasaram, Facial Services Sasaram Bihar, Cleanup Sasaram, Skin Treatment Sasaram, Facial for Women Sasaram, Shahsharam Ladies Salon',
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

export default function FacialServicesSasaramPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <article className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Facial Services in Sasaram Bihar – Shahsharam Ladies Salon
          </h1>

          <p className="text-gray-600 leading-relaxed mb-8">
            Shahsharam Ladies Salon provides professional facial and skincare services in Sasaram. From deep cleansing facials to anti-aging treatments, we offer a range of facial services tailored for women. Our trained therapists use quality products to give you healthy, glowing skin.
          </p>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Types of Facials We Offer in Sasaram
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We offer deep cleansing facial, cleanup, skin glow facial, anti-aging facial, and customized facials based on your skin type. Each treatment includes cleansing, exfoliation, massage, and moisturizing for refreshed, radiant skin.
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
              Skincare and Cleanup Services in Sasaram
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our cleanup services remove dirt, oil, and dead skin cells. We also provide skin treatments for acne, pigmentation, and dull skin. Regular facials help maintain skin health and a youthful glow.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Why Choose Shahsharam for Facials in Sasaram
            </h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Experienced skincare therapists</li>
              <li>Quality facial products</li>
              <li>Customized treatments for your skin type</li>
              <li>Clean and hygienic environment</li>
              <li>Affordable facial packages</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Book Your Facial in Sasaram
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Schedule your facial appointment at Shahsharam Ladies Salon. Visit us or call to book your skin treatment and experience the best facial services in Sasaram.
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
