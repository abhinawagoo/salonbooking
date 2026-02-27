import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deleteFromR2ByUrl } from '@/lib/r2'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, slug, description, order, imageUrl, isActive } = body
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name.trim()
    if (slug !== undefined) updateData.slug = slug.trim().toLowerCase().replace(/\s+/g, '-')
    if (description !== undefined) updateData.description = description?.trim() || null
    if (order !== undefined) updateData.order = parseInt(String(order), 10)
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl?.trim() || null
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)

    if (imageUrl !== undefined) {
      const existing = await prisma.subCategory.findUnique({
        where: { id },
        select: { imageUrl: true },
      })
      const newUrl = imageUrl?.trim() || null
      if (existing?.imageUrl && existing.imageUrl !== newUrl) {
        await deleteFromR2ByUrl(existing.imageUrl)
      }
    }

    const subcategory = await prisma.subCategory.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(subcategory)
  } catch (error) {
    console.error('Error updating subcategory:', error)
    return NextResponse.json(
      { error: 'Failed to update subcategory' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const existing = await prisma.subCategory.findUnique({
      where: { id },
      select: { imageUrl: true },
    })
    if (existing?.imageUrl) await deleteFromR2ByUrl(existing.imageUrl)
    await prisma.subCategory.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting subcategory:', error)
    return NextResponse.json(
      { error: 'Failed to delete subcategory' },
      { status: 500 }
    )
  }
}
