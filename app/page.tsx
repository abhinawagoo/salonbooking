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
      <div className="h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-rose-950 via-rose-900/95 to-slate-900">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-rose-300 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-gradient-to-br from-rose-950 via-rose-900/95 to-slate-900 px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
      {/* Banner + Video: fixed height so they display and play properly */}
      <div className="h-[calc(100vh-80px)] flex flex-col gap-4 sm:gap-5 shrink-0">
        <div className="flex-[0.45] min-h-0 rounded-2xl overflow-hidden border-2 border-rose-300/30 shadow-xl shadow-rose-950/50">
          <HomeLandingBanner slides={bannerSlides} />
        </div>
        <div className="flex-[0.55] min-h-0 rounded-2xl overflow-hidden border-2 border-rose-300/40 shadow-xl shadow-rose-950/50 p-1.5 sm:p-2 md:p-2.5 bg-rose-950/50">
          <div className="w-full h-full rounded-xl overflow-hidden">
            <HomeVideoCarousel videos={videos} />
          </div>
        </div>
      </div>
    </div>
  )
}
