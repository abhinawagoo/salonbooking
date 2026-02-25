import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/** GET: Returns all home videos (admin) */
export async function GET() {
  try {
    const videos = await prisma.homeVideo.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(videos)
  } catch (error) {
    console.error('Error fetching home videos:', error)
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}

/** POST: Create new home video */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { videoUrl, title, isActive, order } = body

    if (!videoUrl || typeof videoUrl !== 'string' || !videoUrl.trim()) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 })
    }

    const last = await prisma.homeVideo.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    })
    const nextOrder = order !== undefined ? Number(order) : (last?.order ?? -1) + 1

    const video = await prisma.homeVideo.create({
      data: {
        videoUrl: videoUrl.trim(),
        title: title?.trim() || null,
        isActive: isActive !== false,
        order: nextOrder,
      },
    })
    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error('Error creating home video:', error)
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
  }
}
