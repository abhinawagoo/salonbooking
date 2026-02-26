import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Cache for 60s: good performance + data updates within 1 min when admin deactivates services
const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            services: {
              where: { isActive: true },
              orderBy: { name: 'asc' },
            },
          },
        },
        services: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(categories, { headers: CACHE_HEADERS })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
