import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const OTP_EXPIRY_MINUTES = 10
const DEV_OTP = '1234' // For development; in production use real SMS
const DEV_BYPASS = process.env.NODE_ENV !== 'production' // No DB/SMS in dev; use demo OTP 1234

function generateOtp(): string {
  if (process.env.NODE_ENV !== 'production') return DEV_OTP
  return String(Math.floor(1000 + Math.random() * 9000))
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const mobile = String(body.mobile || '').replace(/\D/g, '').slice(-10)

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

    // TODO: Send OTP via MSG91 or similar
    // await sendOtpSms(mobile, otp)

    return NextResponse.json({ success: true, message: 'OTP sent' })
  } catch (e) {
    console.error('OTP send error:', e)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
