'use client'

// TODO: Re-enable when login/signup is implemented. Auth disabled for now (AUTH_DISABLED_FOR_NOW in lib/auth.ts)
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, MapPin, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import { formatTime12h } from '@/lib/formatTime'
import { AUTH_DISABLED_FOR_NOW } from '@/lib/auth'

interface BookingItem {
  id: string
  token: string
  date: string
  timeSlot: string
  status: string
  locationName?: string
  locationAddress?: string
  services: { name: string; price: number }[]
  totalAmount: number
  amountPaid: number
  paymentStatus: string
}

export default function ProfileBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (AUTH_DISABLED_FOR_NOW || process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true') {
      router.replace('/')
      return
    }
    fetch('/api/user/bookings')
      .then((r) => {
        if (r.status === 401) {
          router.push('/login?returnTo=/profile/bookings')
          return null
        }
        return r.json()
      })
      .then((data) => {
        if (Array.isArray(data)) setBookings(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6 flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">My Bookings</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-600">No bookings yet.</p>
            <Link
              href="/booking/location"
              className="inline-block mt-4 text-primary-600 font-medium hover:underline"
            >
              Book an appointment
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-mono text-sm font-medium text-gray-500">
                    #{b.token}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      b.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : b.status === 'CANCELLED'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    {format(new Date(b.date), 'EEEE, MMM d, yyyy')} at {formatTime12h(b.timeSlot)}
                  </div>
                  {(b.locationName || b.locationAddress) && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin size={16} className="shrink-0 mt-0.5" />
                      <span>{b.locationName}{b.locationAddress ? ` · ${b.locationAddress}` : ''}</span>
                    </div>
                  )}
                  <div className="text-sm">
                    <p className="font-medium text-gray-700 mb-1">Services</p>
                    <ul className="text-gray-600 space-y-0.5">
                      {b.services.map((s, i) => (
                        <li key={i}>
                          {s.name} — ₹{s.price}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center gap-2 text-sm pt-2 border-t border-gray-100">
                    <CreditCard size={16} />
                    <span>Total ₹{b.totalAmount}</span>
                    <span className="text-gray-500">· Paid ₹{b.amountPaid}</span>
                    <span className="text-gray-500">· {b.paymentStatus}</span>
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                  <Link
                    href={`/booking/invoice?token=${encodeURIComponent(b.token)}`}
                    className="text-sm font-medium text-primary-600 hover:underline"
                  >
                    View invoice
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
