'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const AUTO_ADVANCE_MS = 5000
const SWIPE_THRESHOLD = 50

interface HomeLandingBannerProps {
  slides: { imageUrl: string }[]
  onNext?: () => void
}

export default function HomeLandingBanner({ slides, onNext }: HomeLandingBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const justSwipedRef = useRef(false)

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slides.length)
    onNext?.()
  }, [slides.length, onNext])

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(goNext, AUTO_ADVANCE_MS)
    return () => clearInterval(timer)
  }, [slides.length, goNext])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
    justSwipedRef.current = false
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null || slides.length <= 1) return
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      justSwipedRef.current = true
      if (diff > 0) goNext()
      else goPrev()
    }
    setTouchStart(null)
  }

  const handleClick = () => {
    if (justSwipedRef.current) return
    goNext()
  }

  if (slides.length === 0) {
    return (
      <div className="w-full h-full min-h-[200px] rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-br from-rose-100 via-amber-50 to-orange-100 flex items-center justify-center">
        <p className="text-gray-600">Add a banner in Admin → Customize</p>
      </div>
    )
  }

  return (
    <div
      className="relative w-full h-full min-h-0 flex-1 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => e.key === 'Enter' && handleClick()}
          className={`absolute inset-0 transition-opacity duration-400 cursor-pointer ${
            i === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <img
            src={slide.imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover rounded-[1.5rem] sm:rounded-[2rem]"
            draggable={false}
          />
        </div>
      ))}

      {/* Prev / Next buttons */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goPrev() }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goNext() }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`block w-2 h-2 rounded-full transition-all ring-1 ring-white/50 ${
                i === activeIndex ? 'bg-rose-400 w-4' : 'bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
