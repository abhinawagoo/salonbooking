'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const SCROLL_OFFSET_PX = 88

function scrollToHashTarget() {
  if (typeof window === 'undefined') return
  const hash = window.location.hash
  if (!hash) return
  const id = hash.slice(1)
  if (!id) return
  const el = document.getElementById(id)
  if (!el) return
  const y = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET_PX
  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
}

/** On load, pathname change, and hash change, scroll to the hash target with a small offset for better UX. */
export default function ScrollToHash() {
  const pathname = usePathname()

  useEffect(() => {
    scrollToHashTarget()
  }, [pathname])

  useEffect(() => {
    const t = setTimeout(scrollToHashTarget, 150)
    const onHashChange = () => scrollToHashTarget()
    window.addEventListener('hashchange', onHashChange)
    return () => {
      clearTimeout(t)
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [])

  return null
}
