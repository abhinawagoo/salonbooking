'use client'

import { useState, useEffect } from 'react'
import { SEO } from '@/lib/seo'

export default function GalleryClient() {
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        setImages(Array.isArray(data.galleryImageUrls) ? data.galleryImageUrls : [])
      })
      .catch(() => [])
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-teal-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Gallery – {SEO.siteName}
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          Professional haircuts and grooming at our salon in Sasaram, Bihar.
        </p>
        {images.length === 0 ? (
          <p className="text-gray-500">No gallery images yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {images.map((url, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-200">
                <img
                  src={url}
                  alt={`${SEO.galleryAlt} - Image ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
