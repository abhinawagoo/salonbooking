'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, X, Save, Image as ImageIcon, Video, MapPin, ChevronRight } from 'lucide-react'
import { setUserRole } from '@/lib/auth'

const MAX_VIDEOS = 5
const MAX_IMAGES = 5

interface Settings {
  brandName: string
  menuLabel: string
  heroVideoUrls: string[]
  galleryImageUrls: string[]
}

export default function AdminCustomizePage() {
  const [settings, setSettings] = useState<Settings>({
    brandName: 'Salon',
    menuLabel: 'Services',
    heroVideoUrls: [],
    galleryImageUrls: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    setUserRole('ADMIN')
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      setSettings({
        brandName: data.brandName ?? 'Salon',
        menuLabel: data.menuLabel ?? 'Services',
        heroVideoUrls: Array.isArray(data.heroVideoUrls) ? data.heroVideoUrls : [],
        galleryImageUrls: Array.isArray(data.galleryImageUrls) ? data.galleryImageUrls : [],
      })
    } catch {
      setSettings((s) => ({ ...s }))
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error('Failed to save')
      alert('Customization saved!')
    } catch {
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const checkVideoDuration = (file: File): Promise<number> =>
    new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url)
        resolve(video.duration)
      }
      video.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Could not read video'))
      }
      video.src = url
    })

  const handleFileUpload = async (type: 'video' | 'image', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const list = type === 'video' ? settings.heroVideoUrls : settings.galleryImageUrls
    if (list.length >= (type === 'video' ? MAX_VIDEOS : MAX_IMAGES)) {
      alert(`Maximum ${type === 'video' ? MAX_VIDEOS : MAX_IMAGES} ${type}s allowed.`)
      return
    }
    if (type === 'video') {
      try {
        const duration = await checkVideoDuration(file)
        if (duration > 30) {
          alert('Video must be 30 seconds or shorter.')
          e.target.value = ''
          return
        }
      } catch {
        alert('Could not read video. Try another file.')
        e.target.value = ''
        return
      }
      setUploadingVideo(true)
    } else {
      setUploadingImage(true)
    }
    try {
      const formData = new FormData()
      formData.set('file', file)
      formData.set('type', type === 'video' ? 'hero' : 'gallery')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      const url = data.url || ''
      if (type === 'video') {
        setSettings((s) => ({ ...s, heroVideoUrls: [...s.heroVideoUrls, url].slice(0, MAX_VIDEOS) }))
      } else {
        setSettings((s) => ({ ...s, galleryImageUrls: [...s.galleryImageUrls, url].slice(0, MAX_IMAGES) }))
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadingVideo(false)
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const removeUrl = async (type: 'video' | 'image', index: number) => {
    const url = type === 'video' ? settings.heroVideoUrls[index] : settings.galleryImageUrls[index]
    if (url) {
      try {
        await fetch('/api/admin/upload/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        })
      } catch {
        // continue to remove from UI
      }
    }
    if (type === 'video') {
      setSettings((s) => ({ ...s, heroVideoUrls: s.heroVideoUrls.filter((_, i) => i !== index) }))
    } else {
      setSettings((s) => ({ ...s, galleryImageUrls: s.galleryImageUrls.filter((_, i) => i !== index) }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/admin"
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Back to admin"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Customize</h1>
              <p className="text-gray-500 text-sm truncate">Brand, menu, videos, gallery & locations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <form onSubmit={handleSave} className="space-y-4 sm:space-y-6">
          {/* Brand & Menu */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Brand & Menu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand / Salon Name</label>
                <input
                  type="text"
                  value={settings.brandName}
                  onChange={(e) => setSettings((s) => ({ ...s, brandName: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g. My Salon"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Menu Label</label>
                <input
                  type="text"
                  value={settings.menuLabel}
                  onChange={(e) => setSettings((s) => ({ ...s, menuLabel: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g. Services or Menu"
                />
              </div>
            </div>
          </div>

          {/* Hero Videos (max 5, MP4 only) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Video size={20} />
              Hero Videos (up to {MAX_VIDEOS})
            </h2>
            <p className="text-sm text-gray-500 mb-4">Shown in the hero banner. MP4 only, max 30 seconds.</p>
            <div className="flex flex-wrap gap-4">
              {settings.heroVideoUrls.map((url, i) => (
                <div key={i} className="relative group flex flex-col">
                  <div className="w-36 h-20 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                    <Video className="text-gray-500" size={24} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate max-w-[144px]" title={url}>Video {i + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeUrl('video', i)}
                    className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow"
                    title="Remove video"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {settings.heroVideoUrls.length < MAX_VIDEOS && (
                <label className="w-36 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-colors shrink-0">
                  <input
                    type="file"
                    accept="video/mp4"
                    className="hidden"
                    onChange={(e) => handleFileUpload('video', e)}
                    disabled={uploadingVideo}
                  />
                  {uploadingVideo ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent" />
                  ) : (
                    <Upload size={24} className="text-gray-400" />
                  )}
                </label>
              )}
            </div>
          </div>

          {/* Locations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <MapPin size={20} />
              Locations
            </h2>
            <p className="text-sm text-gray-500 mb-4">Manage salon locations (name, address, mobile, image). Max 2. Used in booking and on bills.</p>
            <Link
              href="/admin/locations"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-medium text-sm transition-colors"
            >
              Manage locations
              <ChevronRight size={18} />
            </Link>
          </div>

          {/* Gallery Photos (4–5) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <ImageIcon size={20} />
              Gallery Photos (up to {MAX_IMAGES})
            </h2>
            <p className="text-sm text-gray-500 mb-4">Photos shown on the site. JPEG, PNG or WebP.</p>
            <div className="flex flex-wrap gap-4">
              {settings.galleryImageUrls.map((url, i) => (
                <div key={i} className="relative group">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeUrl('image', i)}
                    className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow"
                    title="Remove photo"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {settings.galleryImageUrls.length < MAX_IMAGES && (
                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-colors shrink-0">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => handleFileUpload('image', e)}
                    disabled={uploadingImage}
                  />
                  {uploadingImage ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent" />
                  ) : (
                    <Upload size={24} className="text-gray-400" />
                  )}
                </label>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Link
              href="/admin"
              className="px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium min-h-[44px] flex items-center justify-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2 disabled:opacity-50 text-sm font-medium min-h-[44px]"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
