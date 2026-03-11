import type { Metadata } from 'next'
import ContactClient from './ContactClient'
import { SEO } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Contact',
  description: `Contact ${SEO.siteName} - Best salon and beauty parlour in Sasaram, Bihar. Visit us or book an appointment online.`,
}

export default function ContactPage() {
  return <ContactClient />
}
