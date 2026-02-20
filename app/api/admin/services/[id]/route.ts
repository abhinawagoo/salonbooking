import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, price, duration, imageUrl, isActive, categoryId, subCategoryId } = body

    // Services must be under subcategories when category has subcategories
    const catId = categoryId ?? (await prisma.service.findUnique({ where: { id: params.id }, select: { categoryId: true } }))?.categoryId
    if (catId) {
      const category = await prisma.category.findUnique({
        where: { id: catId },
        include: { subcategories: { select: { id: true } } },
      })
      const subId = subCategoryId ?? (await prisma.service.findUnique({ where: { id: params.id }, select: { subCategoryId: true } }))?.subCategoryId
      if (category?.subcategories?.length && !subId) {
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
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (isActive !== undefined) updateData.isActive = isActive
    if (categoryId !== undefined) updateData.categoryId = categoryId?.trim() || null
    if (subCategoryId !== undefined) updateData.subCategoryId = subCategoryId?.trim() || null

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
    await prisma.service.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    )
  }
}
