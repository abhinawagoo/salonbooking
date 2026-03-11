'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

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
    setActiveIndex((i) => (i + 1) % videos.length)
  }

  const goPrev = () => setActiveIndex((i) => (i - 1 + videos.length) % videos.length)
  const goNext = () => setActiveIndex((i) => (i + 1) % videos.length)

  if (videos.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-rose-50/50 rounded-[1.5rem] sm:rounded-[2rem]">
        <p className="text-gray-500 text-sm">Add videos in Admin → Customize → Home Videos</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-transparent">
      {/* Video container with curved border */}
      <div className="w-full h-full rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden relative">
        {videos.map((v, i) => (
          <div
            key={v.id}
            className={`absolute inset-0 transition-opacity duration-400 ${
              i === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <video
              ref={(el) => { videoRefs.current[i] = el }}
              src={v.videoUrl}
              className="w-full h-full object-contain rounded-[1.5rem] sm:rounded-[2rem]"
              muted
              playsInline
              autoPlay
              onEnded={handleEnded}
              preload={i === 0 ? 'auto' : 'metadata'}
            />
          </div>
        ))}

        {/* Prev / Next buttons */}
        {videos.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors"
              aria-label="Previous video"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors"
              aria-label="Next video"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {videos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {videos.map((_, i) => (
              <span
                key={i}
                className={`block w-2 h-2 rounded-full transition-all ${
                  i === activeIndex ? 'bg-rose-400 w-4' : 'bg-rose-300/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
