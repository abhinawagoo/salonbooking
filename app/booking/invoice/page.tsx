'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Download, Calendar, CreditCard, FileText, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { generateInvoicePDF } from '@/lib/generateInvoice'

interface Service {
  id: string
  name: string
  price: number
}

function InvoicePageContent() {
  const searchParams = useSearchParams()
  const [bookingData, setBookingData] = useState<{
    token: string
    date: string
    timeSlot: string
    locationName?: string
    locationAddress?: string
    locationMobile?: string
    locationImageUrl?: string
    services: Service[]
    paymentStatus: string
    totalAmount: number
    amountPaid: number
    dueAmount: number
    onlineAmount: number
    cashAmount: number
    customerName?: string
    customerMobile?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setError('Missing booking token')
      setLoading(false)
      return
    }
    fetch(`/api/booking/by-token?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'Booking not found' : 'Failed to load')
        return res.json()
      })
      .then((data) => {
        setBookingData({
          ...data,
          date: typeof data.date === 'string' ? data.date : data.date?.slice?.(0, 10),
        })
      })
      .catch((e) => setError(e.message || 'Something went wrong'))
      .finally(() => setLoading(false))
  }, [searchParams])

  const handleDownloadBill = () => {
    if (!bookingData) return
    const date = typeof bookingData.date === 'string' ? new Date(bookingData.date) : new Date(bookingData.date)
    const payload = {
      bookingToken: bookingData.token,
      date,
      timeSlot: bookingData.timeSlot,
      locationName: bookingData.locationName,
      locationAddress: bookingData.locationAddress,
      locationMobile: bookingData.locationMobile,
      locationImageUrl: bookingData.locationImageUrl,
      services: bookingData.services,
      paymentStatus: bookingData.paymentStatus,
      totalAmount: bookingData.totalAmount,
      amountPaid: bookingData.amountPaid,
      dueAmount: bookingData.dueAmount,
      onlineAmount: bookingData.onlineAmount,
      cashAmount: bookingData.cashAmount,
      customerName: bookingData.customerName,
      customerMobile: bookingData.customerMobile,
    }
    if (bookingData.locationImageUrl) {
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
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
            generateInvoicePDF({ ...payload, locationImageDataUrl: dataUrl })
          } else {
            generateInvoicePDF(payload)
          }
        } catch {
          generateInvoicePDF(payload)
        }
      }
      img.onerror = () => generateInvoicePDF(payload)
      img.src = bookingData.locationImageUrl
    } else {
      generateInvoicePDF(payload)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto" />
          <p className="mt-4 text-gray-600">Loading booking...</p>
        </div>
      </div>
    )
  }

  if (error || !bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Booking not found</h1>
          <p className="text-gray-600">{error || 'Invalid or expired link.'}</p>
          <a href="/" className="inline-block mt-6 text-primary-600 hover:underline">
            Back to home
          </a>
        </div>
      </div>
    )
  }

  const dateObj = typeof bookingData.date === 'string' ? new Date(bookingData.date) : new Date(bookingData.date)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your booking & bill</h1>
          <p className="text-gray-600 mt-1">View details and download your bill</p>
          <button
            onClick={handleDownloadBill}
            className="mt-4 bg-black text-white px-6 py-3 rounded-full font-light hover:bg-gray-800 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl mx-auto"
          >
            <Download size={18} />
            Generate / Download bill
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <Calendar className="text-primary-600" size={24} />
            <div>
              <p className="text-sm text-gray-500">Date & time</p>
              <p className="font-semibold">
                {format(dateObj, 'EEEE, MMMM d, yyyy')} at {bookingData.timeSlot}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <CreditCard className="text-primary-600" size={24} />
            <div>
              <p className="text-sm text-gray-500">Booking token</p>
              <p className="font-mono font-semibold">{bookingData.token}</p>
            </div>
          </div>
          {(bookingData.locationName || bookingData.locationAddress || bookingData.locationMobile || bookingData.locationImageUrl) && (
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              {bookingData.locationImageUrl ? (
                <img src={bookingData.locationImageUrl} alt={bookingData.locationName || 'Location'} className="w-14 h-14 rounded-lg object-cover" />
              ) : (
                <MapPin className="text-primary-600 shrink-0" size={24} />
              )}
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-semibold">{bookingData.locationName}</p>
                {bookingData.locationAddress && (
                  <p className="text-sm text-gray-500">{bookingData.locationAddress}</p>
                )}
                {bookingData.locationMobile && (
                  <p className="text-sm text-gray-500">📞 {bookingData.locationMobile}</p>
                )}
              </div>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500 mb-2">Services</p>
            <div className="space-y-2">
              {bookingData.services.map((s) => (
                <div key={s.id} className="flex justify-between">
                  <span>{s.name}</span>
                  <span>₹{s.price}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t font-semibold">
                <span>Total</span>
                <span>₹{bookingData.totalAmount}</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-sm">
            <p><strong>Payment:</strong> {bookingData.paymentStatus}</p>
            <p>Paid: ₹{bookingData.amountPaid} · Due: ₹{bookingData.dueAmount}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InvoicePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <InvoicePageContent />
    </Suspense>
  )
}
