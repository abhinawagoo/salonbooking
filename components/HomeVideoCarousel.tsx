'use client'

import { useState, useRef, useEffect } from 'react'

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

  if (videos.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <p className="text-gray-500 text-sm">Add videos in Admin → Customize → Home Videos</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
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
            className="w-full h-full object-cover"
            muted
            playsInline
            onEnded={handleEnded}
            preload="auto"
          />
        </div>
      ))}
      {videos.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {videos.map((_, i) => (
            <span
              key={i}
              className={`block w-2 h-2 rounded-full transition-all ${
                i === activeIndex ? 'bg-white w-4' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
