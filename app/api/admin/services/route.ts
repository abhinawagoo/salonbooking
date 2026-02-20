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

    // Services must be under subcategories when category has subcategories
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { subcategories: { select: { id: true } } },
      })
      if (category?.subcategories?.length && !subCategoryId) {
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
        categoryId: categoryId?.trim() || null,
        subCategoryId: subCategoryId?.trim() || null,
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
