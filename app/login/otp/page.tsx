'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'

const BRAND_NAME = 'Shahnaz Salon'

export default function OtpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mobile = searchParams.get('mobile') || ''
  const returnTo = searchParams.get('returnTo') || '/'
  const marketingConsent = searchParams.get('marketingConsent') !== 'false'
  const [otp, setOtp] = useState<string[]>(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true') {
      router.replace('/')
      return
    }
    if (!mobile || mobile.length < 10) {
      router.push('/login')
      return
    }
  }, [mobile, router])

  const maskedMobile = mobile.length >= 10
    ? `${mobile.slice(0, 4)}****${mobile.slice(-2)}`
    : ''

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 4).split('')
      const next = [...otp]
      digits.forEach((d, i) => {
        if (index + i < 4) next[index + i] = d
      })
      setOtp(next)
      const focusIndex = Math.min(index + digits.length, 3)
      inputRefs.current[focusIndex]?.focus()
      return
    }
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    if (digit && index < 3) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 4) {
      setError('Enter 4-digit OTP')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp: code, marketingConsent }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Invalid OTP')
      router.push(returnTo)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  if (!mobile) return null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex justify-end p-4">
        <Link
          href="/login"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
          aria-label="Close"
        >
          <X size={24} />
        </Link>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">
            {BRAND_NAME}
          </h1>
          <p className="text-gray-500 text-sm text-center mb-8">
            Salon &amp; Spa
          </p>
          <p className="text-center font-semibold text-gray-900 mb-2">
            We have sent OTP to {maskedMobile || mobile}
          </p>
          <p className="text-center text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg py-2 px-3 mb-4">
            Demo (no SMS): use OTP <strong>1234</strong>
          </p>
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center gap-2 sm:gap-3">
              {[0, 1, 2, 3].map((i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={otp[i]}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-12 sm:w-14 sm:h-14 text-center text-lg font-semibold border-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                  style={{
                    borderColor: otp[i] ? 'rgb(34, 197, 94)' : 'rgb(209, 213, 219)',
                  }}
                />
              ))}
            </div>
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 transition-colors min-h-[48px]"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
