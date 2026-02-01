'use client'

import { useState } from 'react'

interface CustomerFormProps {
  onSubmit: (data: { name: string; mobile: string; notes?: string }) => void
}

export default function CustomerForm({ onSubmit }: CustomerFormProps) {
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && mobile.trim()) {
      onSubmit({ name: name.trim(), mobile: mobile.trim(), notes: notes.trim() })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[48px]"
          placeholder="Enter your name"
        />
      </div>

      <div>
        <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
          Mobile Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="mobile"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          required
          pattern="[0-9]{10}"
          maxLength={10}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[48px]"
          placeholder="Enter 10-digit mobile number"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          placeholder="Any special requests or notes..."
        />
      </div>

      <button
        type="submit"
        className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors min-h-[48px]"
      >
        Continue to Date & Time
      </button>
    </form>
  )
}
