import type { Metadata } from 'next'
import GalleryClient from './GalleryClient'
import { SEO } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Gallery',
  description: `View our salon gallery - professional haircuts and styling at ${SEO.siteName} in Sasaram, Bihar.`,
}

export default function GalleryPage() {
  return <GalleryClient />
}
