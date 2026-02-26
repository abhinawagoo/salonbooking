import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const MAX_LOCATIONS = 2

/** GET: List all locations (admin) */
export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(locations)
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}

/** POST: Create a location (only if fewer than MAX_LOCATIONS) */
export async function POST(request: NextRequest) {
  try {
    const count = await prisma.location.count()
    if (count >= MAX_LOCATIONS) {
      return NextResponse.json(
        { error: `Only ${MAX_LOCATIONS} locations are allowed. Edit existing ones instead.` },
        { status: 400 }
      )
    }
    const body = await request.json()
    const name = (body.name || '').trim()
    const address = (body.address ?? '').trim() || undefined
    const mobile = (body.mobile ?? '').toString().trim() || null
    const imageUrl = (body.imageUrl ?? '').toString().trim() || null
    const businessHoursJson = body.businessHoursJson !== undefined && body.businessHoursJson !== null
      ? String(body.businessHoursJson).trim() || null
      : null
    const closedDatesJson = body.closedDatesJson !== undefined && body.closedDatesJson !== null
      ? String(body.closedDatesJson).trim() || null
      : null
    if (!name) {
      return NextResponse.json(
        { error: 'Location name is required' },
        { status: 400 }
      )
    }
    const slug =
      name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '') || `location-${count + 1}`
    const existing = await prisma.location.findUnique({ where: { slug } })
    const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug
    const location = await prisma.location.create({
      data: {
        name,
        slug: finalSlug,
        address: address || null,
        mobile,
        imageUrl,
        businessHoursJson,
        closedDatesJson,
        isActive: true,
      },
    })
    return NextResponse.json(location)
  } catch (error) {
    console.error('Error creating location:', error)
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    )
  }
}
