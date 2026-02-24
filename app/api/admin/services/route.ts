import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, price, duration, imageUrl, categoryId, subCategoryId } = body

    // Validation
    if (!name || !price || !duration) {
      return NextResponse.json(
        { error: 'Name, price, and duration are required' },
        { status: 400 }
      )
    }

    // When subCategoryId is set, always derive categoryId from the subcategory's parent
    let finalCategoryId = categoryId?.trim() || null
    let finalSubCategoryId = subCategoryId?.trim() || null

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

    const service = await prisma.service.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: parseFloat(price),
        duration: parseInt(duration),
        imageUrl: imageUrl?.trim() || null,
        categoryId: finalCategoryId,
        subCategoryId: finalSubCategoryId,
        isActive: true,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error: any) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create service' },
      { status: 500 }
    )
  }
}
