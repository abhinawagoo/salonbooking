'use client'

import { useState, useEffect } from 'react'
import { setUserRole } from '@/lib/auth'
import HomeLandingBanner from '@/components/HomeLandingBanner'
import HomeVideoCarousel from '@/components/HomeVideoCarousel'
import { SEO } from '@/lib/seo'

interface SiteSettings {
  brandName: string
  heroBannerImageUrl: string | null
  galleryImageUrls: string[]
}

interface HomeVideo {
  id: string
  videoUrl: string
  title?: string | null
  order: number
}

export default function HomeClient() {
  const [settings, setSettings] = useState<SiteSettings>({
    brandName: 'Salon',
    heroBannerImageUrl: null,
    galleryImageUrls: [],
  })
  const [videos, setVideos] = useState<HomeVideo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUserRole('CUSTOMER')
    sessionStorage.removeItem('selectedServices')
    Promise.all([
      fetch('/api/settings').then((r) => r.json()),
      fetch('/api/home/videos').then((r) => r.json()),
    ])
      .then(([settingsData, videosData]) => {
        setSettings({
          brandName: settingsData.brandName ?? 'Salon',
          heroBannerImageUrl: settingsData.heroBannerImageUrl ?? null,
          galleryImageUrls: Array.isArray(settingsData.galleryImageUrls) ? settingsData.galleryImageUrls : [],
        })
        setVideos(Array.isArray(videosData) ? videosData : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const bannerSlides = [
    ...(settings.heroBannerImageUrl ? [{ imageUrl: settings.heroBannerImageUrl, alt: SEO.bannerAlt }] : []),
    ...(settings.galleryImageUrls?.slice(0, 4) ?? []).map((url) => ({ imageUrl: url, alt: SEO.galleryAlt })),
  ]

  if (loading) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-teal-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-80px)] bg-gradient-to-br from-rose-50/80 via-white to-amber-50/50 relative overflow-hidden">
        <div className="flex-1 flex flex-col gap-4 sm:gap-5 px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 min-h-0">
          {bannerSlides.length > 0 && (
            <div className="flex-[0.45] min-h-0 overflow-visible">
              <HomeLandingBanner slides={bannerSlides} />
            </div>
          )}
          <div className={`${bannerSlides.length > 0 ? 'flex-[0.55]' : 'flex-1'} min-h-0 overflow-visible`}>
            <HomeVideoCarousel videos={videos} />
          </div>
        </div>
      </div>
    </>
  )
}
