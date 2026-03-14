'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

const SWIPE_THRESHOLD = 50

interface HomeVideo {
  id: string
  videoUrl: string
  title?: string | null
  order: number
}

interface HomeVideoCarouselProps {
  videos: HomeVideo[]
}

export default function HomeVideoCarousel({ videos }: HomeVideoCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const justSwipedRef = useRef(false)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const goPrev = useCallback(() => setActiveIndex((i) => (i - 1 + videos.length) % videos.length), [videos.length])
  const goNext = useCallback(() => setActiveIndex((i) => (i + 1) % videos.length), [videos.length])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
    justSwipedRef.current = false
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null || videos.length <= 1) return
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
    if (videos.length > 1) goNext()
  }

  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, videos.length)
  }, [videos.length])

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (v) {
        if (i === activeIndex) {
          v.play().catch(() => {})
        } else {
          v.pause()
          v.currentTime = 0
        }
      }
    })
  }, [activeIndex])

  const handleEnded = () => {
    goNext()
  }

  if (videos.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#F8F3FA]/80 rounded-2xl sm:rounded-[1.5rem] md:rounded-[2rem]">
        <p className="text-[#6B5B73] text-sm">Add videos in Admin → Customize → Home Videos</p>
      </div>
    )
  }

  return (
    <div
      className="relative w-full h-full min-h-0 bg-transparent"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Video container - curved corners, scales with viewport */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        className="w-full h-full min-h-0 rounded-2xl sm:rounded-[1.5rem] md:rounded-[2rem] overflow-hidden relative cursor-pointer"
      >
        <div
          className="flex h-full min-h-0 transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {videos.map((v, i) => (
            <div key={v.id} className="min-w-full flex-shrink-0 h-full min-h-0 flex items-center justify-center bg-black/5">
              <video
                ref={(el) => { videoRefs.current[i] = el }}
                src={v.videoUrl}
                className="w-full h-full max-w-full max-h-full object-contain rounded-2xl sm:rounded-[1.5rem] md:rounded-[2rem]"
                muted
                playsInline
                autoPlay
                onEnded={handleEnded}
                preload={i === 0 ? 'auto' : 'metadata'}
              />
            </div>
          ))}
        </div>

        {/* Dots indicator */}
        {videos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {videos.map((_, i) => (
              <span
                key={i}
                className={`block w-2 h-2 rounded-full transition-all ${
                  i === activeIndex ? 'bg-[#EC738A] w-4' : 'bg-[#E6D6E6]'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
