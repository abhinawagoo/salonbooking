'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const AUTO_ADVANCE_MS = 5000
const SWIPE_THRESHOLD = 50

interface HomeLandingBannerProps {
  slides: { imageUrl: string }[]
  /** Called when user clicks/taps anywhere on banner - advances to next */
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

  // Auto-advance slides
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
      <div className="w-full h-full min-h-[200px] bg-gradient-to-br from-rose-100 via-amber-50 to-orange-100 flex items-center justify-center">
        <p className="text-gray-600">Add a banner in Admin → Customize</p>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-full min-h-0 flex-1 flex overflow-hidden cursor-pointer touch-manipulation focus:outline-none focus:ring-0"
      aria-label="Next banner"
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-400 ${
            i === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={slide.imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        </div>
      ))}
    </button>
  )
}
