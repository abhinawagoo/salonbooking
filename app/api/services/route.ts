import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
      },
      orderBy: { name: 'asc' },
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
