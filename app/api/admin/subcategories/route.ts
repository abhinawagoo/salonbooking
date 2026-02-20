import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { categoryId, name, slug, description, order, imageUrl } = body
    if (!categoryId || !name || !slug) {
      return NextResponse.json(
        { error: 'categoryId, name, and slug are required' },
        { status: 400 }
      )
    }
    const last = await prisma.subCategory.findFirst({
      where: { categoryId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })
    const subcategory = await prisma.subCategory.create({
      data: {
        categoryId,
        name: name.trim(),
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        description: description?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        order: order ?? (last ? last.order + 1 : 0),
      },
    })
    return NextResponse.json(subcategory, { status: 201 })
  } catch (error) {
    console.error('Error creating subcategory:', error)
    return NextResponse.json(
      { error: 'Failed to create subcategory' },
      { status: 500 }
    )
  }
}
