import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone } from 'lucide-react'
import { SEO } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Hair Styling Sasaram Bihar | Shahsharam Ladies Salon',
  description:
    'Shahsharam Ladies Salon offers hair styling services in Sasaram Bihar. Haircuts, hair spa, hair treatments, styling for women. Best hair salon in Sasaram for cuts, coloring, and styling.',
  keywords:
    'Hair Styling Sasaram, Haircut Sasaram Bihar, Hair Spa Sasaram, Hair Treatment Sasaram, Ladies Hair Salon Sasaram, Shahsharam Ladies Salon',
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

export default function HairStylingSasaramPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <article className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Hair Styling in Sasaram Bihar – Shahsharam Ladies Salon
          </h1>

          <p className="text-gray-600 leading-relaxed mb-8">
            Shahsharam Ladies Salon is your destination for professional hair styling in Sasaram. We offer haircuts, hair spa, hair treatments, and styling services for women. Our skilled stylists help you achieve the look you want, whether it is a simple trim, a new hairstyle, or deep conditioning treatment.
          </p>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Hair Cutting and Styling Services in Sasaram
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our salon provides expert haircuts for women, from classic cuts to modern styles. We also offer hair styling for occasions, blow-dry, and setting. Our stylists understand different hair types and face shapes to recommend the best look for you.
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
              Hair Spa and Hair Treatments in Sasaram
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We offer hair spa, deep conditioning, and hair treatments for damaged or dry hair. Our treatments nourish your hair, reduce frizz, and add shine. Regular hair spa helps maintain healthy, strong hair.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Why Choose Shahsharam for Hair Styling in Sasaram
            </h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Experienced hair stylists</li>
              <li>Quality hair care products</li>
              <li>Wide range of styling options</li>
              <li>Hair spa and treatment packages</li>
              <li>Clean, comfortable salon environment</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Book Your Hair Styling Appointment in Sasaram
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Visit Shahsharam Ladies Salon for the best hair styling in Sasaram. Book online or call us to schedule your haircut, hair spa, or styling appointment.
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
