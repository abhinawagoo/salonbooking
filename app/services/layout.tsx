import type { Metadata } from 'next'
import { SEO } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Services',
  description: `Browse haircut, styling, hair spa and grooming services at ${SEO.siteName} - Best salon in Sasaram, Bihar. Book online.`,
}

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
