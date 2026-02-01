import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function parseJsonArray(str: string | null): string[] {
  if (!str) return []
  try {
    const arr = JSON.parse(str)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export async function GET() {
  try {
    const settings = await prisma.siteCustomization.findUnique({
      where: { id: 1 },
    })
    if (!settings) {
      return NextResponse.json({
        brandName: 'Salon',
        menuLabel: 'Services',
        heroVideoUrls: [],
        galleryImageUrls: [],
      })
    }
    return NextResponse.json({
      brandName: settings.brandName,
      menuLabel: settings.menuLabel,
      heroVideoUrls: parseJsonArray(settings.heroVideoUrls),
      galleryImageUrls: parseJsonArray(settings.galleryImageUrls),
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { brandName: 'Salon', menuLabel: 'Services', heroVideoUrls: [], galleryImageUrls: [] }
    )
  }
}
