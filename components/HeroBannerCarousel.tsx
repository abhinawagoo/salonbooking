'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HeroBannerCarouselProps {
  slides: { imageUrl: string; title?: string; subtitle?: string }[]
  brandName: string
}

export default function HeroBannerCarousel({ slides, brandName }: HeroBannerCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (slides.length <= 1) return
    intervalRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % slides.length)
    }, 5000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [slides.length])

  const goTo = (i: number) => {
    setActiveIndex(i)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        setActiveIndex((idx) => (idx + 1) % slides.length)
      }, 5000)
    }
  }

  if (slides.length === 0) {
    return (
      <section className="relative w-full aspect-[4/3] sm:aspect-[21/9] max-h-[320px] sm:max-h-[400px] bg-gradient-to-br from-rose-100 via-amber-50 to-orange-100 overflow-hidden">
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12">
          <p className="text-gray-600 text-sm sm:text-base">Get now with</p>
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mt-1">{brandName}</h2>
        </div>
      </section>
    )
  }

  return (
    <section className="relative w-full aspect-[4/3] sm:aspect-[21/9] max-h-[320px] sm:max-h-[400px] overflow-hidden rounded-b-2xl sm:rounded-b-3xl">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-500 ${
            i === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={slide.imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo((activeIndex - 1 + slides.length) % slides.length)}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/30 hover:bg-white/50 text-white transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            onClick={() => goTo((activeIndex + 1) % slides.length)}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/30 hover:bg-white/50 text-white transition-colors"
            aria-label="Next"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === activeIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
