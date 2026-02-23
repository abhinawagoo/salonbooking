'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'

const BRAND_NAME = 'Shahnaz Salon'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/'

  useEffect(() => {
    router.replace(returnTo)
  }, [router, returnTo])

  const [mobile, setMobile] = useState('')
  const [marketingConsent, setMarketingConsent] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const digits = mobile.replace(/\D/g, '').slice(-10)
    if (digits.length < 10) {
      setError('Enter a valid 10-digit mobile number')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: digits, marketingConsent }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP')
      router.push(`/login/otp?mobile=${encodeURIComponent(digits)}&returnTo=${encodeURIComponent(returnTo)}&marketingConsent=${marketingConsent}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex justify-end p-4">
        <Link
          href={returnTo}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
          aria-label="Close"
        >
          <X size={24} />
        </Link>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">{BRAND_NAME}</h1>
          <p className="text-gray-500 text-sm text-center mb-8">Salon &amp; Spa</p>
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">Log in / Sign up</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number *
              </label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 shrink-0">
                  <span className="text-lg">🇮🇳</span>
                  <span className="font-medium">+91</span>
                </div>
                <input
                  id="mobile"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Mobile Number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[44px]"
                />
              </div>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">
                I want to receive newsletters, promotions, offers, and event updates via Email, SMS, RCS, and WhatsApp.
              </span>
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 transition-colors min-h-[48px]"
            >
              {loading ? 'Sending...' : 'CONTINUE'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-500 mt-6">
            By proceeding, you agree to {BRAND_NAME}&apos;s{' '}
            <Link href="/terms" className="text-primary-600 hover:underline">
              Terms &amp; Conditions
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
