import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deleteFromR2ByUrl } from '@/lib/r2'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, price, duration, imageUrl, isActive, categoryId, subCategoryId } = body

    const existing = await prisma.service.findUnique({
      where: { id: params.id },
      select: { categoryId: true, subCategoryId: true, imageUrl: true },
    })

    let finalCategoryId = categoryId !== undefined ? (categoryId?.trim() || null) : existing?.categoryId ?? null
    let finalSubCategoryId = subCategoryId !== undefined ? (subCategoryId?.trim() || null) : existing?.subCategoryId ?? null

    // When subCategoryId is set, always derive categoryId from the subcategory's parent
    if (finalSubCategoryId) {
      const sub = await prisma.subCategory.findUnique({
        where: { id: finalSubCategoryId },
        select: { categoryId: true },
      })
      if (sub) {
        finalCategoryId = sub.categoryId
      }
    }

    // Services must be under subcategories when category has subcategories
    if (finalCategoryId) {
      const category = await prisma.category.findUnique({
        where: { id: finalCategoryId },
        include: { subcategories: { select: { id: true } } },
      })
      if (category?.subcategories?.length && !finalSubCategoryId) {
        return NextResponse.json(
          { error: 'Subcategory is required. Services belong under subcategories.' },
          { status: 400 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = parseFloat(price)
    if (duration !== undefined) updateData.duration = parseInt(duration)
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl
      const newUrl = imageUrl?.trim() || null
      if (existing?.imageUrl && existing.imageUrl !== newUrl) {
        await deleteFromR2ByUrl(existing.imageUrl)
      }
    }
    if (isActive !== undefined) updateData.isActive = isActive
    // Always sync categoryId when subCategoryId is set (derived from subcategory's parent)
    if (subCategoryId !== undefined) {
      updateData.subCategoryId = finalSubCategoryId
      updateData.categoryId = finalCategoryId
    } else if (categoryId !== undefined) {
      updateData.categoryId = finalCategoryId
    }

    const service = await prisma.service.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const count = await prisma.bookingService.count({
      where: { serviceId: params.id },
    })

    if (count === 0) {
      // No bookings: permanently delete
      const existing = await prisma.service.findUnique({
        where: { id: params.id },
        select: { imageUrl: true },
      })
      await prisma.service.delete({ where: { id: params.id } })
      if (existing?.imageUrl) {
        await deleteFromR2ByUrl(existing.imageUrl).catch(() => {})
      }
    } else {
      // Has bookings: deactivate to preserve booking history
      await prisma.service.update({
        where: { id: params.id },
        data: { isActive: false },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    )
  }
}
