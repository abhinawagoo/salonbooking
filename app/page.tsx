'use client'

import { useState, useEffect } from 'react'
import { setUserRole } from '@/lib/auth'
import HomeLandingBanner from '@/components/HomeLandingBanner'
import HomeVideoCarousel from '@/components/HomeVideoCarousel'

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

export default function HomePage() {
  const [settings, setSettings] = useState<SiteSettings>({
    brandName: 'Salon',
    heroBannerImageUrl: null,
    galleryImageUrls: [],
  })
  const [videos, setVideos] = useState<HomeVideo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUserRole('CUSTOMER')
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
    ...(settings.heroBannerImageUrl ? [{ imageUrl: settings.heroBannerImageUrl }] : []),
    ...(settings.galleryImageUrls?.slice(0, 4) ?? []).map((url) => ({ imageUrl: url })),
  ]

  if (loading) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-teal-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-gradient-to-br from-rose-50/80 via-white to-amber-50/50 relative overflow-hidden">
      <div className="flex-1 flex flex-col gap-4 sm:gap-5 px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 min-h-0">
        {/* Banner section */}
        {bannerSlides.length > 0 && (
          <div className="flex-[0.45] min-h-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.08)] ring-1 ring-rose-200/40">
            <HomeLandingBanner slides={bannerSlides} />
          </div>
        )}
        {/* Video section */}
        <div className={`${bannerSlides.length > 0 ? 'flex-[0.55]' : 'flex-1'} min-h-0 rounded-2xl sm:rounded-3xl overflow-hidden p-3 sm:p-4 md:p-5 bg-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] ring-1 ring-rose-200/30`}>
          <div className="w-full h-full rounded-xl sm:rounded-2xl overflow-hidden">
            <HomeVideoCarousel videos={videos} />
          </div>
        </div>
      </div>
    </div>
  )
}
