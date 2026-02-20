'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Download, Calendar, CreditCard, FileText, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import QRCode from 'qrcode'
import { generateInvoicePDF } from '@/lib/generateInvoice'
import { numberToWords } from '@/lib/numberToWords'

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
  const [invoiceSettings, setInvoiceSettings] = useState<{ brandName?: string; website?: string; upiId?: string; terms?: string }>({})

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setError('Missing booking token')
      setLoading(false)
      return
    }
    Promise.all([
      fetch(`/api/booking/by-token?token=${encodeURIComponent(token)}`).then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'Booking not found' : 'Failed to load')
        return res.json()
      }),
      fetch('/api/settings').then((r) => r.json()).catch(() => ({})),
    ])
      .then(([data, settings]) => {
        setBookingData({
          ...data,
          date: typeof data.date === 'string' ? data.date : data.date?.slice?.(0, 10),
        })
        setInvoiceSettings({
          brandName: settings.brandName,
          website: settings.invoiceWebsite ?? settings.website,
          upiId: settings.invoiceUpiId,
          terms: settings.invoiceTerms,
        })
      })
      .catch((e) => setError(e.message || 'Something went wrong'))
      .finally(() => setLoading(false))
  }, [searchParams])

  const handleDownloadBill = async () => {
    if (!bookingData) return
    const date = typeof bookingData.date === 'string' ? new Date(bookingData.date) : new Date(bookingData.date)
    let qrDataUrl: string | undefined
    if (invoiceSettings.upiId) {
      try {
        const upiUrl = `upi://pay?pa=${invoiceSettings.upiId}&pn=${encodeURIComponent(invoiceSettings.brandName || 'Salon')}&am=${bookingData.totalAmount}&tn=Invoice-${bookingData.token}`
        qrDataUrl = await QRCode.toDataURL(upiUrl, { width: 120, margin: 1 })
      } catch {
        // skip QR
      }
    }
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
      brandName: invoiceSettings.brandName,
      website: invoiceSettings.website,
      upiId: invoiceSettings.upiId,
      terms: invoiceSettings.terms,
      qrDataUrl,
      invoiceNumber: bookingData.token,
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

        {/* Tax Invoice preview - matches PDF format */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-amber-200/60">
          <div className="p-6 space-y-4">
            {/* Header */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex gap-3">
                {bookingData.locationImageUrl && (
                  <img src={bookingData.locationImageUrl} alt="" className="w-16 h-16 rounded-lg object-cover" />
                )}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 uppercase">{(invoiceSettings.brandName || bookingData.locationName || 'SALON')}</h2>
                  {bookingData.locationMobile && <p className="text-sm text-gray-600">{bookingData.locationMobile}</p>}
                  {bookingData.locationAddress && <p className="text-sm text-gray-500">{bookingData.locationAddress}</p>}
                  {invoiceSettings.website && <p className="text-sm text-gray-500">{invoiceSettings.website}</p>}
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-base font-bold text-gray-900">TAX INVOICE</h3>
                <p className="text-sm text-gray-600">Invoice No.: {bookingData.token}</p>
                <p className="text-sm text-gray-600">Invoice Date: {format(dateObj, 'dd/MM/yyyy')}</p>
              </div>
            </div>

            {/* Bill To */}
            <div className="bg-amber-50/80 rounded p-3">
              <p className="text-xs font-bold text-gray-700 mb-1">Bill To</p>
              <p className="font-medium">{bookingData.customerName}</p>
              <p className="text-sm text-gray-600">Mobile: {bookingData.customerMobile}</p>
            </div>

            {/* Services table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-amber-50/80">
                    <th className="text-left py-2 px-2">No</th>
                    <th className="text-left py-2 px-2">SERVICES</th>
                    <th className="text-left py-2 px-2">SAC</th>
                    <th className="text-left py-2 px-2">Qty.</th>
                    <th className="text-right py-2 px-2">Rate</th>
                    <th className="text-right py-2 px-2">Tax</th>
                    <th className="text-right py-2 px-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingData.services.map((s, i) => {
                    const taxable = Math.round((s.price / 1.18) * 100) / 100
                    const tax = Math.round((s.price - taxable) * 100) / 100
                    return (
                      <tr key={s.id} className="border-t border-gray-100">
                        <td className="py-2 px-2">{i + 1}</td>
                        <td className="py-2 px-2">{s.name}</td>
                        <td className="py-2 px-2">9984</td>
                        <td className="py-2 px-2">1 PCS</td>
                        <td className="py-2 px-2 text-right">{taxable.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right">{tax.toFixed(2)} (18%)</td>
                        <td className="py-2 px-2 text-right font-medium">₹{s.price}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="bg-amber-50/80 rounded p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Total Amount</span>
                <span className="font-bold">₹{bookingData.totalAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Received Amount</span>
                <span>₹{bookingData.amountPaid}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Balance</span>
                <span>₹{bookingData.dueAmount}</span>
              </div>
            </div>

            {invoiceSettings.terms && (
              <p className="text-xs text-gray-500">Terms & Conditions: {invoiceSettings.terms}</p>
            )}

            <div className="flex justify-between items-end pt-4 border-t">
              <div>
                <p className="text-xs text-gray-500">Amount in words</p>
                <p className="text-sm font-medium">{numberToWords(bookingData.totalAmount)}</p>
              </div>
              {invoiceSettings.upiId && (
                <div className="text-right text-xs text-gray-500">
                  <p>UPI ID: {invoiceSettings.upiId}</p>
                </div>
              )}
            </div>
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
