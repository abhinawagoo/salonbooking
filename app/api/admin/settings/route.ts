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
    let settings = await prisma.siteCustomization.findUnique({
      where: { id: 1 },
    })
    if (!settings) {
      settings = await prisma.siteCustomization.create({
        data: {
          id: 1,
          brandName: 'Salon',
          menuLabel: 'Services',
        },
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
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { brandName, menuLabel, heroVideoUrls, galleryImageUrls } = body

    const heroArr = Array.isArray(heroVideoUrls) ? heroVideoUrls.slice(0, 5) : []
    const galleryArr = Array.isArray(galleryImageUrls) ? galleryImageUrls.slice(0, 5) : []

    const settings = await prisma.siteCustomization.upsert({
      where: { id: 1 },
      update: {
        ...(brandName !== undefined && { brandName: String(brandName).trim() || 'Salon' }),
        ...(menuLabel !== undefined && { menuLabel: String(menuLabel).trim() || 'Services' }),
        ...(heroVideoUrls !== undefined && { heroVideoUrls: JSON.stringify(heroArr) }),
        ...(galleryImageUrls !== undefined && { galleryImageUrls: JSON.stringify(galleryArr) }),
      },
      create: {
        id: 1,
        brandName: (brandName && String(brandName).trim()) || 'Salon',
        menuLabel: (menuLabel && String(menuLabel).trim()) || 'Services',
        heroVideoUrls: JSON.stringify(heroArr),
        galleryImageUrls: JSON.stringify(galleryArr),
      },
    })

    return NextResponse.json({
      brandName: settings.brandName,
      menuLabel: settings.menuLabel,
      heroVideoUrls: parseJsonArray(settings.heroVideoUrls),
      galleryImageUrls: parseJsonArray(settings.galleryImageUrls),
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
