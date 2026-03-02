import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deleteFromR2ByUrl } from '@/lib/r2'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, slug, description, order, isActive, imageUrl } = body
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name.trim()
    if (slug !== undefined) updateData.slug = slug.trim().toLowerCase().replace(/\s+/g, '-')
    if (description !== undefined) updateData.description = description?.trim() || null
    if (order !== undefined) updateData.order = parseInt(String(order), 10)
    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive)
      if (!Boolean(isActive)) {
        await prisma.subCategory.updateMany({
          where: { categoryId: params.id },
          data: { isActive: false },
        })
        await prisma.service.updateMany({
          where: {
            OR: [
              { categoryId: params.id },
              { subCategory: { categoryId: params.id } },
            ],
          },
          data: { isActive: false },
        })
      }
    }
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl?.trim() || null
      const existing = await prisma.category.findUnique({
        where: { id: params.id },
        select: { imageUrl: true },
      })
      const newUrl = imageUrl?.trim() || null
      if (existing?.imageUrl && existing.imageUrl !== newUrl) {
        await deleteFromR2ByUrl(existing.imageUrl)
      }
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: updateData,
    })
    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.category.findUnique({
      where: { id: params.id },
      select: { imageUrl: true },
    })
    if (existing?.imageUrl) await deleteFromR2ByUrl(existing.imageUrl)
    await prisma.category.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
