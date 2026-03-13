/**
 * SEO configuration for Shahsharam Salon – Sasaram, Bihar
 * Update these values to match your production domain and details.
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.shahnazsalonsasaram.com'

export const SEO = {
  siteName: 'Shahsharam Salon',
  title: "Shahsharam Salon – Best Salon & Beauty Parlour in Sasaram Bihar",
  description:
    "Shahsharam Salon is a professional salon and beauty parlour in Sasaram, Bihar offering haircuts, styling, grooming, and hair spa services. Visit the best salon in Sasaram today.",
  keywords:
    'Shahsharam Salon Sasaram, Best Salon in Sasaram Bihar, Beauty Parlour Sasaram, Salon Sasaram, Haircut Sasaram, Hair Styling Sasaram, Hair Spa Sasaram, Salon near me Sasaram',
  ogTitle: "Shahsharam Salon – Best Salon in Sasaram Bihar",
  ogDescription: 'Professional salon and beauty parlour services in Sasaram Bihar.',
  telephone: '+918877799982',
  address: {
    locality: 'Sasaram',
    region: 'Bihar',
    postalCode: '821115',
    country: 'IN',
  },
  areaServed: 'Sasaram Bihar',
  priceRange: '₹₹',
  openingHours: 'Mo-Su 09:00-21:00',
  bannerAlt: "Shahsharam Salon best salon and beauty parlour in Sasaram Bihar",
  galleryAlt: 'Professional haircut at Shahsharam Salon Sasaram',
  baseUrl: BASE_URL.replace(/\/$/, ''),
  /** Used in structured data and og:image. Add /public/banner.jpg or set ogImageUrl in production. */
  ogImageUrl: `${BASE_URL.replace(/\/$/, '')}/banner.jpg`,
}
