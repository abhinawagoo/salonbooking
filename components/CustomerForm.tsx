'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'

interface CustomerFormProps {
  onSubmit: (data: { name: string; mobile: string; notes?: string }) => void
}

export default function CustomerForm({ onSubmit }: CustomerFormProps) {
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [notes, setNotes] = useState('')

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 10)
    setMobile(v)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const digits = mobile.replace(/\D/g, '').slice(-10)
    if (name.trim() && digits.length === 10) {
      onSubmit({ name: name.trim(), mobile: digits, notes: notes.trim() })
    }
  }

  const isValid = mobile.replace(/\D/g, '').length === 10

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-1.5">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none min-h-[48px] text-gray-900 placeholder:text-gray-400 transition-shadow"
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <label htmlFor="mobile" className="block text-sm font-semibold text-gray-800 mb-1.5">
          WhatsApp Number <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">
          We&apos;ll send your booking confirmation & invoice via WhatsApp
        </p>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 bg-white">
          <div className="flex items-center px-4 bg-gray-50 border-r border-gray-200 text-gray-700 font-medium shrink-0 min-h-[48px]">
            +91
          </div>
          <input
            type="tel"
            id="mobile"
            inputMode="numeric"
            value={mobile}
            onChange={handleMobileChange}
            required
            maxLength={10}
            autoComplete="tel-national"
            className="flex-1 px-4 py-3.5 min-w-0 min-h-[48px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
            placeholder="9876543210"
          />
        </div>
        {mobile.length > 0 && mobile.length < 10 && (
          <p className="text-xs text-amber-600 mt-1.5">Enter all 10 digits</p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-semibold text-gray-800 mb-1.5">
          Notes <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none resize-none text-gray-900 placeholder:text-gray-400 min-h-[88px]"
          placeholder="Any special requests or notes..."
        />
      </div>

      <button
        type="submit"
        disabled={!isValid || !name.trim()}
        className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[48px] shadow-sm hover:shadow-md touch-manipulation flex items-center justify-center gap-2"
      >
        <MessageCircle size={20} className="opacity-90" />
        Continue to Services
      </button>
    </form>
  )
}
