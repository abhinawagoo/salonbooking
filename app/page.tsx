'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import ServiceCard from '@/components/ServiceCard'
import ServiceModal from '@/components/ServiceModal'
import CartBar from '@/components/CartBar'
import { useRouter } from 'next/navigation'
import { setUserRole } from '@/lib/auth'
import { ChevronRight } from 'lucide-react'
import { PLACEHOLDER_IMAGE } from '@/lib/placeholders'

const HERO_VIDEO_URL = process.env.NEXT_PUBLIC_HERO_VIDEO_URL

function HeroVideoCarousel({ urls }: { urls: string[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const scrollToAndPlay = useCallback((index: number) => {
    const video = videoRefs.current[index]
    if (!video) return
    videoRefs.current.forEach((v, i) => { if (v && i !== index) v.pause() })
    const card = video.closest('[data-video-card]') as HTMLElement | null
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
    video.play().catch(() => {})
  }, [])

  const handleEnded = useCallback(
    (index: number) => {
      const next = (index + 1) % urls.length
      scrollToAndPlay(next)
    },
    [urls.length, scrollToAndPlay]
  )

  useEffect(() => {
    if (urls.length > 0) {
      videoRefs.current[0]?.play().catch(() => {})
    }
  }, [urls.length])

  return (
    <div
      ref={scrollRef}
      className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 sm:pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scroll-smooth"
    >
      {urls.map((url, i) => (
        <div
          key={i}
          data-video-card
          className="flex-shrink-0 w-[85vw] sm:w-[400px] snap-start rounded-xl overflow-hidden bg-gray-900 shadow-lg"
        >
          <video
            ref={(el) => { videoRefs.current[i] = el }}
            src={url}
            muted
            playsInline
            autoPlay={i === 0}
            loop={false}
            onEnded={() => handleEnded(i)}
            className="w-full aspect-video object-cover"
            preload="auto"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      ))}
    </div>
  )
}

function GalleryImage({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className="flex-shrink-0 w-40 h-28 sm:w-48 sm:h-32 rounded-xl overflow-hidden bg-gray-200 snap-start relative">
      <img src={PLACEHOLDER_IMAGE} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
      <img
        src={url}
        alt=""
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}

interface Service {
  id: string
  name: string
  description?: string
  price: number
  duration: number
  imageUrl?: string
  categoryId?: string
  subCategoryId?: string
}

interface SubCategory {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  order: number
  services: Service[]
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  order: number
  services: Service[]
  subcategories?: SubCategory[]
}

interface SiteSettings {
  brandName: string
  menuLabel: string
  heroBannerImageUrl: string | null
  heroVideoUrls: string[]
  galleryImageUrls: string[]
}

export default function HomePage() {
  const router = useRouter()
  const [settings, setSettings] = useState<SiteSettings>({
    brandName: 'Salon',
    menuLabel: 'Services',
    heroBannerImageUrl: null,
    heroVideoUrls: [],
    galleryImageUrls: [],
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [allServices, setAllServices] = useState<Service[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null)
  const [subcategoryPopupCategory, setSubcategoryPopupCategory] = useState<Category | null>(null)
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [modalService, setModalService] = useState<Service | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setUserRole('CUSTOMER')
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) =>
        setSettings({
          brandName: data.brandName ?? 'Salon',
          menuLabel: data.menuLabel ?? 'Services',
          heroBannerImageUrl: data.heroBannerImageUrl ?? null,
          heroVideoUrls: Array.isArray(data.heroVideoUrls) ? data.heroVideoUrls : [],
          galleryImageUrls: Array.isArray(data.galleryImageUrls) ? data.galleryImageUrls : [],
        })
      )
      .catch(() => {})
    fetchCategories()
    fetchAllServices()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch {
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAllServices = async () => {
    try {
      const res = await fetch('/api/services')
      if (!res.ok) throw new Error('Failed to fetch services')
      const data = await res.json()
      setAllServices(Array.isArray(data) ? data : [])
    } catch {
      setAllServices([])
    }
  }

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)
  const selectedSubcategory = selectedCategory?.subcategories?.find((s) => s.id === selectedSubcategoryId)

  const displayServices = (() => {
    if (selectedSubcategoryId && selectedSubcategory) {
      return selectedSubcategory.services ?? []
    }
    if (selectedCategoryId && selectedCategory) {
      const subs = selectedCategory.subcategories ?? []
      if (subs.length > 0) {
        return subs.flatMap((s) => s.services ?? [])
      }
      if ((selectedCategory.services ?? []).length > 0) return selectedCategory.services!
      return allServices.filter((s) => s.categoryId === selectedCategoryId)
    }
    return allServices
  })()

  const handleCategoryClick = (cat: Category) => {
    const subs = cat.subcategories ?? []
    if (subs.length > 0) {
      setSubcategoryPopupCategory(cat)
      setSelectedCategoryId(null)
      setSelectedSubcategoryId(null)
    } else {
      setSubcategoryPopupCategory(null)
      setSelectedCategoryId(cat.id)
      setSelectedSubcategoryId(null)
    }
  }

  const handleSubcategorySelect = (sub: SubCategory | null) => {
    if (subcategoryPopupCategory) {
      setSelectedCategoryId(subcategoryPopupCategory.id)
      setSelectedSubcategoryId(sub?.id ?? null)
      setSubcategoryPopupCategory(null)
    }
  }

  const handleServiceClick = (service: Service) => {
    setModalService(service)
  }

  const handleAddService = () => {
    if (modalService && !selectedServices.some((s) => s.id === modalService.id)) {
      setSelectedServices([...selectedServices, modalService])
    }
    setModalService(null)
  }

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices((prev) => prev.filter((s) => s.id !== serviceId))
  }

  const handleContinue = () => {
    sessionStorage.setItem('selectedServices', JSON.stringify(selectedServices))
    router.push('/cart')
  }

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0)
  const hasHeroBanner = !!settings.heroBannerImageUrl

  return (
    <div className="min-h-screen bg-gray-50 pb-28 sm:pb-24">
      {/* Hero banner - 30% viewport height, image or gradient; mobile-friendly */}
      <section className="relative w-full h-[30vh] min-h-[140px] max-h-[280px] sm:max-h-[320px] bg-gray-900 text-white overflow-hidden">
        {/* Background: banner image or gradient */}
        {hasHeroBanner ? (
          <>
            <img
              src={settings.heroBannerImageUrl!}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/45 z-[1]" aria-hidden />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-900 z-[1]" />
        )}
      </section>

      {/* Videos – just below banner: auto-play, auto-scroll to next when video ends */}
      {(() => {
        const videoUrls =
          (settings.heroVideoUrls?.length ?? 0) > 0
            ? settings.heroVideoUrls
            : HERO_VIDEO_URL
              ? [HERO_VIDEO_URL]
              : []
        return videoUrls.length > 0 ? (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <HeroVideoCarousel urls={videoUrls} />
          </section>
        ) : null
      })()}

      {/* Gallery (custom photos from admin) - scroll on mobile */}
      {settings.galleryImageUrls?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Gallery</h2>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 sm:pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
            {settings.galleryImageUrls.map((url, i) => (
              <GalleryImage key={i} url={url} />
            ))}
          </div>
        </section>
      )}

      {/* Main: sticky Services header + scrollable content */}
      <div id="services" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-[88px]">
        {/* Sticky header: Services + category pills – stays at top when scrolling (mobile) */}
        <div className="lg:hidden sticky top-14 z-40 bg-gray-50 pt-6 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
          <h2 className="text-base font-bold text-gray-900 mb-2 sm:mb-3">{settings.menuLabel}</h2>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => { setSelectedCategoryId(null); setSelectedSubcategoryId(null); setSubcategoryPopupCategory(null) }}
              className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors min-h-[32px] sm:min-h-[36px] touch-manipulation ${
                !selectedCategoryId
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors min-h-[32px] sm:min-h-[36px] touch-manipulation ${
                  selectedCategoryId === cat.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 pb-6 sm:pb-8">
          {/* Desktop: left sidebar - categories */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">{settings.menuLabel.toUpperCase()}</h2>
                <p className="text-xs text-gray-500 mt-0.5">Choose a category</p>
              </div>
              <nav className="py-2">
                <button
                  type="button"
                  onClick={() => { setSelectedCategoryId(null); setSelectedSubcategoryId(null); setSubcategoryPopupCategory(null) }}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between text-sm font-medium transition-colors ${
                    !selectedCategoryId
                      ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  All Services
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
                {categories.map((cat) => {
                  const count = (cat.subcategories?.reduce((s, sub) => s + (sub.services?.length ?? 0), 0) ?? 0) || (cat.services?.length ?? 0)
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryClick(cat)}
                      className={`w-full text-left px-4 py-3 flex items-center justify-between text-sm font-medium transition-colors ${
                        selectedCategoryId === cat.id
                          ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                          : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                      }`}
                    >
                      {cat.name}
                      <span className="text-xs text-gray-400">({count})</span>
                      <ChevronRight size={16} className="text-gray-400" />
                    </button>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Main content - service cards (2-col grid on mobile, Yes Madam style) */}
          <main className="flex-1 min-w-0">
            <div className="mb-3 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                {selectedSubcategory
                  ? `${selectedCategory?.name} › ${selectedSubcategory.name}`
                  : selectedCategory
                    ? selectedCategory.name
                    : `All ${settings.menuLabel}`}
              </h2>
              <p className="text-gray-500 mt-0.5 sm:mt-1 text-xs sm:text-base">
                {selectedSubcategory
                  ? selectedSubcategory.description || `${selectedSubcategory.name} services`
                  : selectedCategory
                    ? selectedCategory.description || `${selectedCategory.name} services`
                    : 'Choose a category above or pick from all services.'}
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 animate-pulse overflow-hidden">
                    <div className="aspect-[4/3] bg-gray-200" />
                    <div className="p-3 sm:p-5 space-y-2">
                      <div className="h-4 sm:h-5 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-8 sm:h-10 bg-gray-200 rounded w-full mt-2 sm:mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayServices.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
                <p className="text-gray-500 text-base sm:text-lg">No services in this category yet.</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-2">Select another category or view All.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
                {displayServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    id={service.id}
                    name={service.name}
                    description={service.description}
                    price={service.price}
                    duration={service.duration}
                    imageUrl={service.imageUrl}
                    onAdd={() => handleServiceClick(service)}
                    isSelected={selectedServices.some((s) => s.id === service.id)}
                    onRemove={() => handleRemoveService(service.id)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Subcategory selection popup */}
      {subcategoryPopupCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Select subcategory</h3>
              <p className="text-sm text-gray-500 mt-0.5">{subcategoryPopupCategory.name}</p>
            </div>
            <div className="overflow-y-auto flex-1 p-4 sm:p-6">
              <button
                type="button"
                onClick={() => handleSubcategorySelect(null)}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-left mb-2"
              >
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-medium">All</div>
                <div>
                  <p className="font-medium text-gray-900">All {subcategoryPopupCategory.name}</p>
                  <p className="text-xs text-gray-500">View all services in this category</p>
                </div>
              </button>
              {(subcategoryPopupCategory.subcategories ?? []).map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => handleSubcategorySelect(sub)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-left mb-2"
                >
                  {sub.imageUrl ? (
                    <img src={sub.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-medium">{sub.name.charAt(0)}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{sub.name}</p>
                    <p className="text-xs text-gray-500">{(sub.services?.length ?? 0)} services</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSubcategoryPopupCategory(null)}
                className="w-full py-2.5 text-gray-600 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {modalService && (
        <ServiceModal
          service={modalService}
          isOpen
          onClose={() => setModalService(null)}
          onAdd={handleAddService}
          isSelected={modalService ? selectedServices.some((s) => s.id === modalService.id) : false}
          onRemove={() => modalService && handleRemoveService(modalService.id)}
        />
      )}

      {selectedServices.length > 0 && (
        <div id="cart-bar">
          <CartBar
            itemCount={selectedServices.length}
            totalPrice={totalPrice}
            onContinue={handleContinue}
          />
        </div>
      )}
    </div>
  )
}
