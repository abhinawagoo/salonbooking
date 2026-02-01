'use client'

import { useState, useEffect } from 'react'
import { format, isToday, isAfter } from 'date-fns'
import Link from 'next/link'
import { CheckCircle, Clock, Phone, User, Banknote, Download, Copy, MapPin, BarChart3 } from 'lucide-react'
import { setUserRole } from '@/lib/auth'
import { generateInvoicePDF } from '@/lib/generateInvoice'

interface Location {
  id: string
  name: string
  slug: string
  address: string | null
  mobile: string | null
  imageUrl: string | null
}

interface Booking {
  id: string
  token: string
  date: string
  timeSlot: string
  status: string
  location?: { id: string; name: string; address: string | null; mobile: string | null; imageUrl: string | null } | null
  user: {
    name: string
    mobile: string
  }
  services: Array<{
    service: {
      name: string
    }
    price: number
  }>
  payment: {
    paymentStatus: string
    amount: number
    totalAmount: number
    amountPaid: number
    onlineAmount: number
    cashAmount: number
  } | null
}

export default function StaffDashboard() {
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocationId, setSelectedLocationId] = useState<string>('')
  const [todayBookings, setTodayBookings] = useState<Booking[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cashModal, setCashModal] = useState<Booking | null>(null)
  const [cashInput, setCashInput] = useState('')
  const [paymentSaving, setPaymentSaving] = useState(false)
  const [copiedMobile, setCopiedMobile] = useState<string | null>(null)

  useEffect(() => {
    setUserRole('STAFF')
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => setLocations(Array.isArray(data) ? data : []))
      .catch(() => [])
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [selectedLocationId])

  const fetchBookings = async () => {
    try {
      const url = selectedLocationId
        ? `/api/staff/bookings/today?locationId=${encodeURIComponent(selectedLocationId)}`
        : '/api/staff/bookings/today'
      const response = await fetch(url)
      const data = await response.json()
      
      const today = data.filter((b: Booking) => isToday(new Date(b.date)))
      const upcoming = data.filter((b: Booking) => 
        isAfter(new Date(b.date), new Date()) && !isToday(new Date(b.date))
      )
      
      setTodayBookings(today)
      setUpcomingBookings(upcoming)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkCompleted = async (bookingId: string) => {
    try {
      await fetch(`/api/staff/booking/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      })
      fetchBookings()
    } catch (error) {
      console.error('Error updating booking:', error)
      alert('Failed to update booking status')
    }
  }

  const handleDownloadInvoice = (booking: Booking) => {
    const totalAmount = booking.payment?.totalAmount ?? booking.services.reduce((s, bs) => s + bs.price, 0)
    const amountPaid = booking.payment?.amountPaid ?? 0
    const dueAmount = Math.max(0, totalAmount - amountPaid)
    const payload = {
      bookingToken: booking.token,
      date: new Date(booking.date),
      timeSlot: booking.timeSlot,
      locationName: booking.location?.name,
      locationAddress: booking.location?.address ?? undefined,
      locationMobile: booking.location?.mobile ?? undefined,
      locationImageUrl: booking.location?.imageUrl ?? undefined,
      services: booking.services.map((bs, idx) => ({
        id: `s-${idx}`,
        name: bs.service.name,
        price: bs.price,
      })),
      paymentStatus: booking.payment?.paymentStatus ?? 'PENDING',
      totalAmount,
      amountPaid,
      dueAmount,
      onlineAmount: booking.payment?.onlineAmount ?? 0,
      cashAmount: booking.payment?.cashAmount ?? 0,
      customerName: booking.user.name,
      customerMobile: booking.user.mobile,
    }
    const locationImageUrl = booking.location?.imageUrl
    if (locationImageUrl) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(img, 0, 0)
            generateInvoicePDF({ ...payload, locationImageDataUrl: canvas.toDataURL('image/jpeg', 0.9) })
          } else {
            generateInvoicePDF(payload)
          }
        } catch {
          generateInvoicePDF(payload)
        }
      }
      img.onerror = () => generateInvoicePDF(payload)
      img.src = locationImageUrl
    } else {
      generateInvoicePDF(payload)
    }
  }

  const handleCopyMobile = async (mobile: string) => {
    try {
      await navigator.clipboard.writeText(mobile)
      setCopiedMobile(mobile)
      setTimeout(() => setCopiedMobile(null), 2000)
    } catch {
      alert('Could not copy')
    }
  }

  const handleRecordCash = async () => {
    if (!cashModal) return
    const amount = parseFloat(cashInput)
    if (isNaN(amount) || amount <= 0) {
      alert('Enter a valid amount')
      return
    }
    setPaymentSaving(true)
    try {
      const res = await fetch(`/api/booking/${cashModal.id}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addCash: amount }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to record cash')
      }
      setCashModal(null)
      setCashInput('')
      fetchBookings()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to record cash')
    } finally {
      setPaymentSaving(false)
    }
  }

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-semibold text-primary-600">{booking.token}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              booking.status === 'COMPLETED'
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {booking.status}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {format(new Date(booking.date), 'EEEE, MMMM d, yyyy')} at {booking.timeSlot}
          </div>
        </div>
        {booking.status === 'BOOKED' && (
          <button
            onClick={() => handleMarkCompleted(booking.id)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Mark Completed
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <User className="text-gray-400" size={18} />
          <div className="flex-1 min-w-0">
            <div className="font-medium">{booking.user.name}</div>
            <div className="text-sm text-gray-500 flex items-center gap-2 flex-wrap">
              <a
                href={`tel:${booking.user.mobile}`}
                className="inline-flex items-center gap-1 text-primary-600 hover:underline"
              >
                <Phone size={14} />
                {booking.user.mobile}
              </a>
              <button
                type="button"
                onClick={() => handleCopyMobile(booking.user.mobile)}
                className="inline-flex items-center gap-1 p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                title="Copy number"
              >
                <Copy size={14} />
              </button>
              {copiedMobile === booking.user.mobile && (
                <span className="text-xs text-green-600 font-medium">Copied!</span>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Services:</div>
          <div className="space-y-1">
            {booking.services.map((bs, idx) => (
              <div key={idx} className="text-sm text-gray-600 flex justify-between">
                <span>{bs.service.name}</span>
                <span>₹{bs.price}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between font-semibold">
            <span>Total:</span>
            <span className="text-primary-600">
              ₹{booking.payment?.totalAmount ?? booking.services.reduce((sum, bs) => sum + bs.price, 0)}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Paid:</span>
            <span className="font-medium text-green-700">₹{booking.payment?.amountPaid ?? 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Due:</span>
            <span className="font-medium text-amber-700">
              ₹{Math.max(0, (booking.payment?.totalAmount ?? booking.services.reduce((s, bs) => s + bs.price, 0)) - (booking.payment?.amountPaid ?? 0))}
            </span>
          </div>
          {(booking.payment?.onlineAmount !== undefined && booking.payment.onlineAmount > 0) && (
            <div className="text-xs text-gray-500">Online: ₹{booking.payment.onlineAmount}</div>
          )}
          {(booking.payment?.cashAmount !== undefined && booking.payment.cashAmount > 0) && (
            <div className="text-xs text-gray-500">Cash: ₹{booking.payment.cashAmount}</div>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              booking.payment?.paymentStatus === 'COMPLETED'
                ? 'bg-green-100 text-green-800'
                : booking.payment?.paymentStatus === 'FAILED'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {booking.payment?.paymentStatus || 'PENDING'}
            </span>
            {booking.payment && (
              <button
                type="button"
                onClick={() => { setCashModal(booking); setCashInput('') }}
                className="inline-flex items-center gap-1 px-2 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-xs font-medium hover:bg-amber-200"
              >
                <Banknote size={14} />
                Record cash
              </button>
            )}
            <button
              type="button"
              onClick={() => handleDownloadInvoice(booking)}
              className="inline-flex items-center gap-1 px-2 py-1.5 bg-gray-100 text-gray-800 rounded-lg text-xs font-medium hover:bg-gray-200"
              title="Download invoice"
            >
              <Download size={14} />
              Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
            <p className="text-gray-600 mt-1">View and manage today's appointments</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-gray-500" />
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 min-w-[160px] text-sm"
              >
                <option value="">All locations</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
            <Link
              href="/admin/reports"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 flex items-center gap-2 text-sm"
            >
              <BarChart3 size={18} />
              Reports
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="text-primary-600" size={24} />
            Today's Appointments ({todayBookings.length})
          </h2>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : todayBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-md">
              No appointments scheduled for today
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todayBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </div>

        {upcomingBookings.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Upcoming Appointments ({upcomingBookings.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Record cash modal */}
      {cashModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Record cash payment</h3>
            <p className="text-sm text-gray-600 mb-4">
              Booking {cashModal.token} — Total: ₹{cashModal.payment?.totalAmount ?? cashModal.services.reduce((s, bs) => s + bs.price, 0)}
            </p>
            <p className="text-sm text-gray-700 mb-2">Amount already paid: ₹{cashModal.payment?.amountPaid ?? 0}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cash amount to add (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={cashInput}
              onChange={(e) => setCashInput(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4"
              placeholder="0"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setCashModal(null); setCashInput('') }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRecordCash}
                disabled={paymentSaving}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {paymentSaving ? 'Saving...' : 'Record cash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
