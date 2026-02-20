'use client'

import { CheckCircle, Calendar, Clock, CreditCard, Download, Printer, Home } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import { generateInvoicePDF } from '@/lib/generateInvoice'

interface Service {
  id: string
  name: string
  price: number
}

interface ConfirmationScreenProps {
  bookingToken: string
  date: Date
  timeSlot: string
  services: Service[]
  paymentStatus: string
  totalAmount: number
  amountPaid?: number
  dueAmount?: number
  onlineAmount?: number
  cashAmount?: number
  customerName?: string
  customerMobile?: string
  locationName?: string
  locationAddress?: string
  locationMobile?: string
  locationImageUrl?: string
  redirectCountdown?: number
}

export default function ConfirmationScreen({
  bookingToken,
  date,
  timeSlot,
  services,
  paymentStatus,
  totalAmount,
  amountPaid = 0,
  dueAmount = 0,
  onlineAmount = 0,
  cashAmount = 0,
  customerName,
  customerMobile,
  locationName,
  locationAddress,
  locationMobile,
  locationImageUrl,
  redirectCountdown
}: ConfirmationScreenProps) {
  const router = useRouter()

  const handleDownloadInvoice = async () => {
    let settings: { brandName?: string; invoiceWebsite?: string; invoiceUpiId?: string; invoiceTerms?: string } = {}
    try {
      settings = await fetch('/api/settings').then((r) => r.json())
    } catch {
      // use defaults
    }
    let qrDataUrl: string | undefined
    if (settings.invoiceUpiId) {
      try {
        const upiUrl = `upi://pay?pa=${settings.invoiceUpiId}&pn=${encodeURIComponent(settings.brandName || 'Salon')}&am=${totalAmount}&tn=Invoice-${bookingToken}`
        qrDataUrl = await QRCode.toDataURL(upiUrl, { width: 120, margin: 1 })
      } catch {
        // skip
      }
    }
    const payload = {
      bookingToken,
      date,
      timeSlot,
      services,
      paymentStatus,
      totalAmount,
      amountPaid,
      dueAmount,
      onlineAmount,
      cashAmount,
      customerName,
      customerMobile,
      locationName,
      locationAddress,
      locationMobile,
      locationImageUrl,
      brandName: settings.brandName,
      website: settings.invoiceWebsite,
      upiId: settings.invoiceUpiId,
      terms: settings.invoiceTerms,
      qrDataUrl,
      invoiceNumber: bookingToken,
    }
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

  const handlePrint = () => {
    window.print()
  }

  const handleGoHome = () => {
    router.replace('/')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center py-8 no-print">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <CheckCircle className="text-green-600" size={48} />
        </div>
        <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600">Your appointment has been successfully booked</p>
        {redirectCountdown !== undefined && redirectCountdown > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Redirecting to homepage in {redirectCountdown} seconds...
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-3 justify-center">
          <button
            onClick={handleDownloadInvoice}
            className="bg-black text-white px-6 py-3 rounded-full font-light hover:bg-gray-800 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Download size={18} />
            Download Invoice
          </button>
          <button
            onClick={handlePrint}
            className="bg-white text-black border-2 border-black px-6 py-3 rounded-full font-light hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Printer size={18} />
            Print
          </button>
          <button
            onClick={handleGoHome}
            className="bg-primary-600 text-white px-6 py-3 rounded-full font-light hover:bg-primary-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Home size={18} />
            Back to Home
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <Calendar className="text-primary-600" size={24} />
          <div>
            <p className="text-sm text-gray-500">Appointment Date & Time</p>
            <p className="font-semibold text-lg">
              {(() => {
                const d = date instanceof Date ? date : new Date(date as string)
                if (Number.isNaN(d.getTime())) return timeSlot ? `— at ${timeSlot}` : '—'
                return `${format(d, 'EEEE, MMMM d, yyyy')} at ${timeSlot}`
              })()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <CreditCard className="text-primary-600" size={24} />
          <div>
            <p className="text-sm text-gray-500">Booking Token</p>
            <p className="font-semibold text-lg font-mono">{bookingToken}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-3">Services</p>
          <div className="space-y-2">
            {services.map((service) => (
              <div key={service.id} className="flex justify-between items-center py-2">
                <p className="font-medium">{service.name}</p>
                <p className="text-gray-600">₹{service.price}</p>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <p className="font-semibold">Total Amount</p>
              <p className="font-bold text-primary-600 text-lg">₹{totalAmount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <p className="text-sm text-gray-600">
            <strong>Payment Status:</strong> {paymentStatus}
          </p>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Amount Paid</span>
            <span className="font-medium text-green-700">₹{amountPaid}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Due Amount</span>
            <span className="font-medium text-amber-700">₹{dueAmount}</span>
          </div>
          {(onlineAmount > 0 || cashAmount > 0) && (
            <div className="text-xs text-gray-500 pt-1 border-t border-gray-200 mt-2">
              {onlineAmount > 0 && <span>Online: ₹{onlineAmount}</span>}
              {onlineAmount > 0 && cashAmount > 0 && ' · '}
              {cashAmount > 0 && <span>Cash: ₹{cashAmount}</span>}
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 no-print">
        <p className="text-sm text-blue-800">
          <strong>Important:</strong> Please arrive 10 minutes before your appointment time. 
          Show your booking token at the salon.
        </p>
      </div>
    </div>
  )
}
