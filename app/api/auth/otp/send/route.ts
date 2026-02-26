import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOtpWhatsApp } from '@/lib/whatsapp-cloud'
import { normalizeMobileForDb } from '@/lib/phone'

const OTP_EXPIRY_MINUTES = 10
const DEV_OTP = '1234' // For development; in production use real SMS
// When USE_WHATSAPP_OTP=true, send real OTP via WhatsApp even in dev (skip bypass)
const USE_WHATSAPP_OTP = process.env.USE_WHATSAPP_OTP === 'true'
const DEV_BYPASS = process.env.NODE_ENV !== 'production' && !USE_WHATSAPP_OTP

function generateOtp(): string {
  if (process.env.NODE_ENV !== 'production' && !USE_WHATSAPP_OTP) return DEV_OTP
  return String(Math.floor(1000 + Math.random() * 9000))
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const mobile = normalizeMobileForDb(body.mobile || '')

    if (mobile.length < 10) {
      return NextResponse.json({ error: 'Valid 10-digit mobile number required' }, { status: 400 })
    }

    if (DEV_BYPASS) {
      // No OTP service in dev: skip DB, no SMS; user enters 1234 on OTP page
      console.log(`[DEV] OTP bypass – use ${DEV_OTP} for ${mobile}`)
      return NextResponse.json({ success: true, message: 'OTP sent' })
    }

    const otp = generateOtp()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES)

    await prisma.otpRequest.create({
      data: { mobile, otp, expiresAt },
    })

    // Send OTP via WhatsApp Cloud API (direct, no BSP) when configured
    const useWhatsApp =
      process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID
    if (useWhatsApp) {
      const result = await sendOtpWhatsApp(mobile, otp)
      if (!result.ok) {
        console.error('WhatsApp OTP failed:', result.error)
        return NextResponse.json(
          { error: 'Failed to send OTP. Please try again.' },
          { status: 500 }
        )
      }
    } else {
      // No WhatsApp configured – OTP stored in DB. For testing, log OTP when enabled.
      const logForTesting = process.env.LOG_OTP_WHEN_NO_WHATSAPP === 'true'
      if (logForTesting) {
        console.log(`[OTP TEST] ${mobile} → ${otp} (copy from server logs)`)
      } else {
        console.warn('OTP stored but not sent – set WHATSAPP_* or LOG_OTP_WHEN_NO_WHATSAPP=true for testing')
      }
    }

    return NextResponse.json({ success: true, message: 'OTP sent' })
  } catch (e) {
    console.error('OTP send error:', e)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
