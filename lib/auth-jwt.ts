import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'salon_auth'
const JWT_EXPIRY_DAYS = 90 // Long-lived so we don't ask for OTP often

export interface AuthPayload {
  userId: string
  mobile: string
  name: string
  role: string
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return secret
}

export function createAuthToken(payload: AuthPayload): string {
  return jwt.sign(
    payload,
    getSecret(),
    { expiresIn: `${JWT_EXPIRY_DAYS}d` }
  )
}

export function verifyAuthToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, getSecret()) as AuthPayload
    return decoded
  } catch {
    return null
  }
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: JWT_EXPIRY_DAYS * 24 * 60 * 60,
    path: '/',
  }
}

export function getAuthFromCookie(): AuthPayload | null {
  const c = cookies()
  const token = c.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyAuthToken(token)
}

export { COOKIE_NAME }
