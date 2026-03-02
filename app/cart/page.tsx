'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Minus, Trash2 } from 'lucide-react'
import { AUTH_DISABLED_FOR_NOW } from '@/lib/auth'

interface ServiceItem {
  id: string
  name: string
  price: number
  duration: number
  quantity?: number
}

export default function CartPage() {
  const router = useRouter()
  const [items, setItems] = useState<ServiceItem[]>([])
  const [suggestions, setSuggestions] = useState<ServiceItem[]>([])
  const [loggedIn, setLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = sessionStorage.getItem('selectedServices')
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as ServiceItem[]
        setItems(Array.isArray(parsed) ? parsed.map((s) => ({ ...s, quantity: s.quantity ?? 1 })) : [])
      } catch {
        setItems([])
      }
    } else {
      setItems([])
    }
    if (AUTH_DISABLED_FOR_NOW || process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true') {
      setLoggedIn(true)
    } else {
      fetch('/api/user/me')
        .then((r) => r.json())
        .then((data) => setLoggedIn(!!data.user))
        .catch(() => setLoggedIn(false))
    }
    fetch('/api/services')
      .then((r) => r.json())
      .then((data) => Array.isArray(data) ? setSuggestions(data.slice(0, 6)) : [])
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!loading && items.length === 0) {
      router.replace('/')
    }
  }, [loading, items.length, router])

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) => {
      const next = prev
        .map((s) => (s.id === id ? { ...s, quantity: (s.quantity ?? 1) + delta } : s))
        .filter((s) => (s.quantity ?? 1) > 0)
      sessionStorage.setItem('selectedServices', JSON.stringify(next))
      return next
    })
  }

  const addSuggestion = (s: ServiceItem) => {
    const next = items.some((i) => i.id === s.id)
      ? items.map((i) => (i.id === s.id ? { ...i, quantity: (i.quantity ?? 1) + 1 } : i))
      : [...items, { ...s, quantity: 1 }]
    setItems(next)
    sessionStorage.setItem('selectedServices', JSON.stringify(next))
  }

  const total = items.reduce((sum, s) => sum + s.price * (s.quantity ?? 1), 0)
  const suggestionList = suggestions.filter((s) => !items.some((i) => i.id === s.id))

  if (loading || items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-700"
            aria-label="Back"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Service Cart</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {total > 500 && (
          <div className="rounded-xl bg-green-100 border border-green-200 px-4 py-3 flex items-center gap-2">
            <span className="text-2xl">😍</span>
            <p className="text-sm font-medium text-green-900">
              You are saving on this booking
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {items.map((s) => (
            <div
              key={s.id}
              className="p-4 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{s.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{s.duration} min</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-gray-900">₹{s.price}</span>
                    {(s.quantity ?? 1) > 1 && (
                      <span className="text-sm text-gray-500">× {s.quantity}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateQuantity(s.id, -1)}
                    className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-medium">{s.quantity ?? 1}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(s.id, 1)}
                    className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateQuantity(s.id, -(s.quantity ?? 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50"
                    aria-label="Remove all"
                    title="Remove"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {suggestionList.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-3">People also availed</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {suggestionList.map((s) => (
                <div
                  key={s.id}
                  className="shrink-0 w-40 bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <div className="h-24 bg-gray-100 flex items-center justify-center text-gray-400 text-2xl">
                    {s.name.charAt(0)}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-sm text-gray-900 line-clamp-2">{s.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.duration} min · ₹{s.price}</p>
                    <button
                      type="button"
                      onClick={() => addSuggestion(s)}
                      className="mt-2 w-full py-1.5 rounded-lg border-2 border-primary-500 text-primary-600 text-xs font-medium hover:bg-primary-50"
                    >
                      ADD
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 p-4 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-bold text-gray-900">₹{total.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          {loggedIn ? (
            <Link
              href="/booking/location"
              className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-full min-h-[48px] transition-colors"
            >
              Proceed to Book
            </Link>
          ) : (
            <Link
              href={`/login?returnTo=${encodeURIComponent('/cart')}`}
              className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-full min-h-[48px] transition-colors"
            >
              LOGIN
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
