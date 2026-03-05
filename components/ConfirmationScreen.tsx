'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, Download, Printer, Home, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { formatTime12h } from '@/lib/formatTime'
import TaxInvoice from '@/components/TaxInvoice'

interface Service {
  id: string
  name: string
  price: number
  quantity?: number
}

interface ConfirmationScreenProps {
  bookingToken: string
  billNo?: string
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
}

export default function ConfirmationScreen({
  bookingToken,
  billNo,
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
}: ConfirmationScreenProps) {
  const router = useRouter()
  const [invoiceSettings, setInvoiceSettings] = useState<{ brandName?: string; website?: string; terms?: string }>({})
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((s) => setInvoiceSettings({
        brandName: s.brandName,
        website: s.invoiceWebsite ?? s.website,
        terms: s.invoiceTerms ?? '',
      }))
      .catch(() => {})
  }, [])

  const handleDownloadInvoice = async () => {
    setDownloading(true)
    try {
      let settings: { brandName?: string; invoiceWebsite?: string; invoiceTerms?: string } = {}
      try {
        settings = await fetch('/api/settings').then((r) => r.json())
      } catch {
        // use defaults
      }
      const payload = {
        bookingToken,
        date: date instanceof Date ? date : new Date(date as string),
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
        terms: settings.invoiceTerms ?? '',
        invoiceNumber: billNo ?? bookingToken,
      }
      const res = await fetch('/api/invoice/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to generate PDF')
      }
      const blob = await res.blob()
      const filename = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] ?? `Tax-Invoice-${bookingToken}.pdf`
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to download PDF')
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleGoHome = () => {
    router.replace('/')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 min-w-0">
      <div className="text-center py-8 print:hidden">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <CheckCircle className="text-green-600" size={48} />
        </div>
        <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600">Your appointment has been successfully booked</p>
        <p className="mt-2 text-base font-medium text-gray-800">
          {format(date instanceof Date ? date : new Date(date as string), 'EEEE, MMMM d, yyyy')} at {formatTime12h(timeSlot)}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3 justify-center">
          <button
            onClick={handleDownloadInvoice}
            disabled={downloading}
            className="bg-black text-white px-6 py-3 rounded-full font-light hover:bg-gray-800 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            {downloading ? 'Generating...' : 'Download Invoice'}
          </button>
          <button
            onClick={handlePrint}
            className="bg-white text-black border-2 border-black px-6 py-3 rounded-full font-light hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Printer size={18} />
            Print
          </button>
          <Link
            href={`/booking/invoice?token=${encodeURIComponent(bookingToken)}`}
            className="bg-gray-100 text-gray-800 border border-gray-300 px-6 py-3 rounded-full font-light hover:bg-gray-200 transition-all duration-200 flex items-center gap-2"
          >
            <FileText size={18} />
            View invoice
          </Link>
          <button
            onClick={handleGoHome}
            className="bg-primary-600 text-white px-6 py-3 rounded-full font-light hover:bg-primary-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Home size={18} />
            Back to Home
          </button>
        </div>
      </div>

      {/* Tax Invoice - matches PDF format */}
      <TaxInvoice
        data={{
          salonName: (invoiceSettings.brandName || locationName || 'SALON').toUpperCase(),
          phone: locationMobile ?? undefined,
          address: locationAddress ?? undefined,
          website: invoiceSettings.website ?? undefined,
          logoUrl: locationImageUrl ?? undefined,
          invoiceNo: billNo ?? bookingToken,
          invoiceDate: format(date instanceof Date ? date : new Date(date as string), 'dd/MM/yyyy'),
          appointmentTime: formatTime12h(timeSlot),
          customerName: customerName ?? undefined,
          customerMobile: customerMobile ?? undefined,
          services,
          totalAmount,
          amountPaid,
          dueAmount,
          terms: invoiceSettings.terms,
        }}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 print:hidden">
        <p className="text-sm text-blue-800">
          <strong>Important:</strong> Please arrive 10 minutes before your appointment time. 
          Show your booking token at the salon.
        </p>
      </div>
    </div>
  )
}
