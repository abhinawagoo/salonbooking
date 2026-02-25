import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/** GET: Returns active home videos ordered by position (order field) */
export async function GET() {
  try {
    const videos = await prisma.homeVideo.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: { id: true, videoUrl: true, title: true, order: true },
    })
    return NextResponse.json(videos)
  } catch (error) {
    console.error('Error fetching home videos:', error)
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}
