import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/** PUT: Update home video */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { videoUrl, title, isActive, order } = body

    const updateData: Record<string, unknown> = {}
    if (videoUrl !== undefined) updateData.videoUrl = String(videoUrl).trim()
    if (title !== undefined) updateData.title = title?.trim() || null
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)
    if (order !== undefined) updateData.order = Number(order)

    const video = await prisma.homeVideo.update({
      where: { id: params.id },
      data: updateData,
    })
    return NextResponse.json(video)
  } catch (error) {
    console.error('Error updating home video:', error)
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 })
  }
}

/** DELETE: Remove home video */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.homeVideo.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting home video:', error)
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
  }
}
