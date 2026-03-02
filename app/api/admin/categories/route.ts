import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    if (!prisma?.category) {
      console.error('Prisma client missing category delegate – run "npx prisma generate" and restart the dev server')
      return NextResponse.json({ error: 'Database client not ready' }, { status: 503 })
    }
    const categories = await prisma.category.findMany({
      include: {
        services: { select: { id: true } },
        subcategories: {
          orderBy: { order: 'asc' },
          include: { services: { select: { id: true } } },
        },
      },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!prisma?.category) {
      return NextResponse.json({ error: 'Database client not ready' }, { status: 503 })
    }
    const body = await request.json()
    const { name, slug, description, order, isActive } = body
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }
    const last = await prisma.category.findFirst({ orderBy: { order: 'desc' }, select: { order: true } })
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        description: description?.trim() || null,
        order: order ?? (last ? last.order + 1 : 0),
        isActive: isActive !== false,
      },
    })
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
