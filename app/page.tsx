'use client'

import { useState, useEffect, useRef } from 'react'
import ServiceCard from '@/components/ServiceCard'
import ServiceModal from '@/components/ServiceModal'
import CartBar from '@/components/CartBar'
import { useRouter } from 'next/navigation'
import { setUserRole } from '@/lib/auth'
import { ChevronRight, ChevronLeft, Play, ChevronDown } from 'lucide-react'
import { PLACEHOLDER_IMAGE } from '@/lib/placeholders'

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
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  order: number
  services: Service[]
}

interface SiteSettings {
  brandName: string
  menuLabel: string
  heroVideoUrls: string[]
  galleryImageUrls: string[]
}

const HERO_VIDEO_DURATION_MS = 8000
// Static hero videos for now; admin can add direct MP4 links via Admin → Customize (hero videos)
const DEFAULT_HERO_VIDEOS = [
  'https://pub-d258b226bfee42f09be50feec338e732.r2.dev/36e606be-80c0-4276-bb11-2953cbc270f1/documents/7754525-hd_1920_1080_30fps.mp4',
  'https://pub-d258b226bfee42f09be50feec338e732.r2.dev/36e606be-80c0-4276-bb11-2953cbc270f1/documents/12057394_4096_2160_24fps.mp4',
  'https://pub-d258b226bfee42f09be50feec338e732.r2.dev/36e606be-80c0-4276-bb11-2953cbc270f1/documents/4786785-uhd_3840_2160_30fps.mp4',
]

export default function HomePage() {
  const router = useRouter()
  const heroVideosRef = useRef<(HTMLVideoElement | null)[]>([])
  const [settings, setSettings] = useState<SiteSettings>({
    brandName: 'Salon',
    menuLabel: 'Services',
    heroVideoUrls: [],
    galleryImageUrls: [],
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [allServices, setAllServices] = useState<Service[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [modalService, setModalService] = useState<Service | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [heroVideoIndex, setHeroVideoIndex] = useState(0)

  const heroVideoUrls = settings.heroVideoUrls?.length
    ? settings.heroVideoUrls
    : process.env.NEXT_PUBLIC_HERO_VIDEO_URL
      ? [process.env.NEXT_PUBLIC_HERO_VIDEO_URL]
      : DEFAULT_HERO_VIDEOS

  // Auto-advance carousel
  useEffect(() => {
    if (heroVideoUrls.length <= 1) return
    const t = setInterval(() => {
      setHeroVideoIndex((i) => (i + 1) % heroVideoUrls.length)
    }, HERO_VIDEO_DURATION_MS)
    return () => clearInterval(t)
  }, [heroVideoUrls.length])

  // Play only the visible video; pause others (fixes autoplay when multiple videos)
  useEffect(() => {
    if (heroVideoUrls.length === 0) return
    const timer = requestAnimationFrame(() => {
      heroVideosRef.current.forEach((el, i) => {
        if (!el) return
        if (i === heroVideoIndex) {
          el.play().catch(() => {})
        } else {
          el.pause()
        }
      })
    })
    return () => cancelAnimationFrame(timer)
  }, [heroVideoIndex, heroVideoUrls.length])

  const goPrev = () => {
    setHeroVideoIndex((i) => (i - 1 + heroVideoUrls.length) % heroVideoUrls.length)
  }
  const goNext = () => {
    setHeroVideoIndex((i) => (i + 1) % heroVideoUrls.length)
  }

  useEffect(() => {
    setUserRole('CUSTOMER')
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) =>
        setSettings({
          brandName: data.brandName ?? 'Salon',
          menuLabel: data.menuLabel ?? 'Services',
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
  const displayServices = selectedCategoryId
    ? (selectedCategory?.services ?? []).length > 0
      ? selectedCategory!.services
      : allServices.filter((s) => s.categoryId === selectedCategoryId)
    : allServices

  const handleServiceClick = (service: Service) => {
    setModalService(service)
  }

  const handleAddService = () => {
    if (modalService && !selectedServices.some((s) => s.id === modalService.id)) {
      setSelectedServices([...selectedServices, modalService])
    }
    setModalService(null)
  }

  const handleContinue = () => {
    sessionStorage.setItem('selectedServices', JSON.stringify(selectedServices))
    router.push('/booking/location')
  }

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0)
  const hasHeroVideos = heroVideoUrls.length > 0

  const scrollToServices = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })
  }

  const startBooking = () => {
    router.push('/booking/location')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 sm:pb-24">
      {/* Hero - full-screen video carousel with smooth transitions */}
      <section className="relative w-full h-screen min-h-[480px] bg-gray-900 text-white overflow-hidden">
        {/* Background: video carousel or gradient */}
        {hasHeroVideos ? (
          <>
            {heroVideoUrls.map((url, i) => (
              <video
                key={`${url}-${i}`}
                ref={(el) => {
                  heroVideosRef.current[i] = el
                  if (el && i === heroVideoIndex) el.play().catch(() => {})
                }}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                onCanPlay={(e) => {
                  if (i === heroVideoIndex) e.currentTarget.play().catch(() => {})
                }}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out"
                style={{ opacity: i === heroVideoIndex ? 1 : 0, zIndex: i === heroVideoIndex ? 1 : 0 }}
                src={url}
              />
            ))}
            <div className="absolute inset-0 bg-black/40 z-[2]" aria-hidden />

            {/* Left / right tap zones to slide carousel */}
            {heroVideoUrls.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-0 top-0 bottom-0 z-20 w-[28%] max-w-[180px] cursor-pointer touch-manipulation flex items-center justify-start pl-2 sm:pl-4 group"
                  aria-label="Previous video"
                >
                  <span className="opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity rounded-full bg-black/30 p-2">
                    <ChevronLeft size={28} className="text-white" />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-0 top-0 bottom-0 z-20 w-[28%] max-w-[180px] cursor-pointer touch-manipulation flex items-center justify-end pr-2 sm:pr-4 group"
                  aria-label="Next video"
                >
                  <span className="opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity rounded-full bg-black/30 p-2">
                    <ChevronRight size={28} className="text-white" />
                  </span>
                </button>
                {/* Dot indicators */}
                <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
                  {heroVideoUrls.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setHeroVideoIndex(i)}
                      className={`h-2 rounded-full transition-all touch-manipulation ${
                        i === heroVideoIndex ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-900 z-[1]" />
        )}

        {/* Center content - above overlay so Book appointment is clickable */}
        <div className="absolute inset-0 z-[25] flex flex-col items-center justify-center px-4 pt-16 pb-20 sm:pt-12 pointer-events-none">
          <div className="pointer-events-auto flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center drop-shadow-lg px-2">
            {settings.brandName}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mt-2 sm:mt-3 text-center max-w-md px-2">
            Book your appointment
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              startBooking()
            }}
            className="mt-6 sm:mt-8 inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-6 py-3.5 sm:px-8 sm:py-4 rounded-full font-semibold hover:bg-gray-100 shadow-xl transition-all min-h-[48px] touch-manipulation cursor-pointer"
            aria-label="Book appointment - choose location then date and time"
          >
            <Play size={20} />
            Book appointment
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              scrollToServices()
            }}
            className="mt-3 sm:mt-4 inline-flex items-center gap-1 text-white/90 hover:text-white text-sm font-medium transition-colors py-2 touch-manipulation"
          >
            Or scroll to {settings.menuLabel.toLowerCase()}
            <ChevronDown size={18} className="animate-bounce" />
          </button>
          </div>
        </div>
      </section>

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

      {/* Main: mobile horizontal categories + desktop sidebar + content */}
      <div id="services" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Mobile / tablet: horizontal category pills */}
          <div className="lg:hidden">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{settings.menuLabel}</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory touch-pan-x">
              <button
                type="button"
                onClick={() => setSelectedCategoryId(null)}
                className={`flex-shrink-0 snap-start px-4 py-2.5 rounded-full text-sm font-medium transition-colors min-h-[44px] touch-manipulation ${
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
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`flex-shrink-0 snap-start px-4 py-2.5 rounded-full text-sm font-medium transition-colors min-h-[44px] touch-manipulation ${
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
                  onClick={() => setSelectedCategoryId(null)}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between text-sm font-medium transition-colors ${
                    !selectedCategoryId
                      ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  All Services
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between text-sm font-medium transition-colors ${
                      selectedCategoryId === cat.id
                        ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                        : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                  >
                    {cat.name}
                    <span className="text-xs text-gray-400">({cat.services?.length ?? 0})</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content - service cards */}
          <main className="flex-1 min-w-0">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {selectedCategory ? selectedCategory.name.toUpperCase() : `BROWSE ALL ${settings.menuLabel.toUpperCase()}`}
              </h2>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">
                {selectedCategory
                  ? selectedCategory.description || `Select from ${selectedCategory.name} services`
                  : 'Select a category or choose from all services below.'}
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-200 animate-pulse overflow-hidden">
                    <div className="aspect-[4/3] bg-gray-200" />
                    <div className="p-5 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-10 bg-gray-200 rounded w-full mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayServices.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-500 text-lg">No services in this category yet.</p>
                <p className="text-sm text-gray-400 mt-2">Select another category or view All Services.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {modalService && (
        <ServiceModal
          service={modalService}
          isOpen
          onClose={() => setModalService(null)}
          onAdd={handleAddService}
          isSelected={modalService ? selectedServices.some((s) => s.id === modalService.id) : false}
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
