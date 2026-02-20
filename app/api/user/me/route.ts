import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromCookie } from '@/lib/auth-jwt'

export async function GET() {
  const auth = getAuthFromCookie()
  if (!auth) {
    return NextResponse.json({ user: null }, { status: 200 })
  }
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, name: true, mobile: true, email: true, role: true, marketingConsent: true },
  })
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 })
  }
  return NextResponse.json({ user })
}
