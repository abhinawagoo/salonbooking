'use client'

import { numberToWords } from '@/lib/numberToWords'
import { formatCurrency } from '@/lib/currency'

const SAC_CODE = '9984'
const GST_RATE = 0.18
const DEFAULT_TERMS = 'Goods once sold will not be taken back or exchanged'

export interface TaxInvoiceService {
  id: string
  name: string
  price: number
}

export interface TaxInvoiceData {
  salonName: string
  phone?: string
  address?: string
  website?: string
  logoUrl?: string
  invoiceNo: string
  invoiceDate: string
  customerName?: string
  customerMobile?: string
  services: TaxInvoiceService[]
  totalAmount: number
  amountPaid?: number
  dueAmount?: number
  terms?: string
}

export default function TaxInvoice({ data }: { data: TaxInvoiceData }) {
  const terms = data.terms || DEFAULT_TERMS
  const amountPaid = data.amountPaid ?? 0
  const dueAmount = data.dueAmount ?? Math.max(0, data.totalAmount - amountPaid)

  let totalTaxable = 0
  let totalTax = 0
  data.services.forEach((s) => {
    const taxable = Math.round((s.price / (1 + GST_RATE)) * 100) / 100
    totalTaxable += taxable
    totalTax += s.price - taxable
  })
  totalTax = Math.round(totalTax * 100) / 100

  return (
    <div
      className="tax-invoice bg-white text-gray-800 rounded-lg overflow-hidden"
      style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: 24,
        border: '1px solid #E5E0D8',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-8" style={{ marginBottom: 8 }}>
        <div className="flex gap-4">
          {data.logoUrl && (
            <img
              src={data.logoUrl}
              alt=""
              className="w-16 h-16 object-cover rounded"
              style={{ flexShrink: 0 }}
            />
          )}
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-gray-900">
              {data.salonName}
            </h1>
            {data.phone && <p className="text-sm text-gray-600 mt-1">{data.phone}</p>}
            {data.address && <p className="text-sm text-gray-600">{data.address}</p>}
            {data.website && (
              <p className="text-sm text-gray-600 mt-0.5">
                <a
                  href={data.website.startsWith('http') ? data.website : `https://${data.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  {data.website.replace(/^https?:\/\//, '')}
                </a>
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-gray-900">TAX INVOICE</h2>
        </div>
      </div>

      {/* Info Row - 60% reduced spacing above/below */}
      <div className="flex justify-between text-sm" style={{ marginTop: 8, marginBottom: 8 }}>
        <span className="font-medium text-gray-700">Invoice No: {data.invoiceNo}</span>
        <span className="font-medium text-gray-700">Invoice Date: {data.invoiceDate}</span>
      </div>

      {/* Bill To Box */}
      <div
        className="rounded-lg p-4 mb-5"
        style={{
          marginBottom: 20,
          border: '1px solid #E5E0D8',
          backgroundColor: '#FAFAF9',
        }}
      >
        <p className="text-sm font-semibold text-gray-900 mb-2">Bill To</p>
        {data.customerName && <p className="text-sm text-gray-700">{data.customerName}</p>}
        {data.customerMobile && <p className="text-sm text-gray-600">Mobile: {data.customerMobile}</p>}
      </div>

      {/* Table with Subtotal */}
      <div className="overflow-x-auto" style={{ marginBottom: 20 }}>
        <table className="w-full text-sm border-collapse" style={{ border: '1px solid #E5E0D8', borderRadius: 8, overflow: 'hidden', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ backgroundColor: '#F3EEE6' }}>
              <th className="text-left font-semibold text-gray-900" style={{ padding: 10, width: '5%' }}>No</th>
              <th className="text-left font-semibold text-gray-900" style={{ padding: 10, width: '35%' }}>Services</th>
              <th className="text-left font-semibold text-gray-900" style={{ padding: 10, width: '10%' }}>SAC</th>
              <th className="text-left font-semibold text-gray-900" style={{ padding: 10, width: '10%' }}>Qty</th>
              <th className="text-right font-semibold text-gray-900" style={{ padding: 10, width: '14%' }}>Rate</th>
              <th className="text-right font-semibold text-gray-900" style={{ padding: 10, width: '14%' }}>Tax</th>
              <th className="text-right font-semibold text-gray-900" style={{ padding: 10, width: '12%' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.services.map((s, i) => {
              const taxable = Math.round((s.price / (1 + GST_RATE)) * 100) / 100
              const tax = Math.round((s.price - taxable) * 100) / 100
              return (
                <tr key={s.id} style={{ borderBottom: '1px solid #E5E0D8' }}>
                  <td className="text-gray-600 align-middle" style={{ padding: 10 }}>{i + 1}</td>
                  <td className="text-gray-600 align-middle" style={{ padding: 10, wordBreak: 'break-word', maxWidth: 0 }}>{s.name}</td>
                  <td className="text-gray-600 align-middle" style={{ padding: 10 }}>{SAC_CODE}</td>
                  <td className="text-gray-600 align-middle" style={{ padding: 10 }}>1 PCS</td>
                  <td className="text-right text-gray-700 font-medium align-middle" style={{ padding: 10 }}>{formatCurrency(taxable, 2)}</td>
                  <td className="text-right text-gray-700 font-medium align-middle" style={{ padding: 10 }}>{formatCurrency(tax, 2)}</td>
                  <td className="text-right font-semibold align-middle" style={{ padding: 10 }}>{formatCurrency(s.price)}</td>
                </tr>
              )
            })}
            <tr style={{ backgroundColor: '#F3EEE6' }} className="font-semibold">
              <td style={{ padding: 10 }}>SUBTOTAL</td>
              <td style={{ padding: 10 }} colSpan={3}></td>
              <td style={{ padding: 10, textAlign: 'right' }}></td>
              <td style={{ padding: 10, textAlign: 'right' }}>{formatCurrency(totalTax, 2)}</td>
              <td style={{ padding: 10, textAlign: 'right' }}>{formatCurrency(data.totalAmount)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bottom Grid: Terms (left) | Totals (right) */}
      <div className="flex justify-between gap-8" style={{ marginTop: 20, marginBottom: 24 }}>
        <div className="flex-1 max-w-md">
          <p className="text-xs font-medium text-gray-600 mb-1">Terms & Conditions</p>
          <p className="text-sm text-gray-600">{terms}</p>
        </div>
        <div
          className="rounded-lg p-4 flex-shrink-0"
          style={{
            minWidth: 220,
            border: '1px solid #E5E0D8',
            backgroundColor: '#FAFAF9',
          }}
        >
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Taxable Amount</span>
              <span className="font-medium">{formatCurrency(totalTaxable, 2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">CGST @9%</span>
              <span className="font-medium">{formatCurrency(totalTaxable * 0.09, 2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">SGST @9%</span>
              <span className="font-medium">{formatCurrency(totalTaxable * 0.09, 2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200">
              <span className="text-gray-900">Total Amount</span>
              <span className="text-gray-900">{formatCurrency(data.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Received Amount</span>
              <span className="font-medium">{formatCurrency(amountPaid)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Balance</span>
              <span className="font-medium">{formatCurrency(dueAmount)}</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-0.5">Total Amount (in words):</p>
              <p className="text-xs font-semibold text-gray-900">{numberToWords(data.totalAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Box - bottom right */}
      <div className="flex justify-end mt-6">
        <div
          className="rounded-lg flex flex-col justify-end pb-2 pl-3 pt-2"
          style={{
            width: 140,
            height: 56,
            border: '1px solid #E5E0D8',
          }}
        >
          <span className="text-xs text-gray-600">Signature</span>
          <span className="text-xs font-semibold text-gray-900">{data.salonName}</span>
        </div>
      </div>
    </div>
  )
}
