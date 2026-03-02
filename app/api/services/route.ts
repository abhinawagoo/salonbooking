import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Cache for 60s: good performance + data updates within 1 min when admin deactivates services
const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
}

export async function GET(request: Request) {
  try {
    if (!prisma?.service) {
      console.error('Prisma client missing service delegate – run "npx prisma generate" and restart the dev server')
      return NextResponse.json({ error: 'Failed to fetch services' }, { status: 503 })
    }
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        ...(categoryId ? { categoryId } : {}),
        AND: [
          { OR: [{ categoryId: null }, { category: { isActive: true } }] },
          { OR: [{ subCategoryId: null }, { subCategory: { isActive: true } }] },
        ],
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(services, { headers: CACHE_HEADERS })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}
