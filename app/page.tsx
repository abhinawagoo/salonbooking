import type { Metadata } from 'next'
import HomeClient from './HomeClient'
import { SEO } from '@/lib/seo'

export const metadata: Metadata = {
  title: SEO.title,
  description: SEO.description,
  keywords: SEO.keywords,
  openGraph: {
    title: SEO.ogTitle,
    description: SEO.ogDescription,
    type: 'website',
  },
}

export default function HomePage() {
  return <HomeClient />
}
