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

type SettingsRow = { brandName: string; menuLabel: string; heroVideoUrls: string | null; galleryImageUrls: string | null; invoiceWebsite: string | null; invoiceUpiId: string | null; invoiceTerms: string | null }

const defaultSettings = {
  brandName: 'Salon',
  menuLabel: 'Services',
  heroBannerImageUrl: null as string | null,
  heroVideoUrls: [] as string[],
  galleryImageUrls: [] as string[],
  invoiceWebsite: null as string | null,
  invoiceUpiId: null as string | null,
  invoiceTerms: null as string | null,
}

export async function GET() {
  try {
    let rows: SettingsRow[]
    try {
      rows = await prisma.$queryRaw<SettingsRow[]>`
        SELECT "brandName", "menuLabel", "heroVideoUrls", "galleryImageUrls",
          "invoiceWebsite", "invoiceUpiId", "invoiceTerms"
        FROM "SiteCustomization" WHERE id = 1 LIMIT 1
      `
    } catch {
      const minimal = await prisma.$queryRaw<{ brandName: string; menuLabel: string }[]>`
        SELECT "brandName", "menuLabel" FROM "SiteCustomization" WHERE id = 1 LIMIT 1
      `
      if (!minimal.length) return NextResponse.json(defaultSettings)
      return NextResponse.json({ ...defaultSettings, brandName: minimal[0].brandName, menuLabel: minimal[0].menuLabel })
    }
    if (!rows.length) return NextResponse.json(defaultSettings)
    const s = rows[0]
    return NextResponse.json({
      brandName: s.brandName,
      menuLabel: s.menuLabel,
      heroBannerImageUrl: null,
      heroVideoUrls: parseJsonArray(s.heroVideoUrls),
      galleryImageUrls: parseJsonArray(s.galleryImageUrls),
      invoiceWebsite: s.invoiceWebsite ?? null,
      invoiceUpiId: s.invoiceUpiId ?? null,
      invoiceTerms: s.invoiceTerms ?? null,
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { brandName, menuLabel, heroVideoUrls, galleryImageUrls, invoiceWebsite, invoiceUpiId, invoiceTerms } = body

    const heroArr = Array.isArray(heroVideoUrls) ? heroVideoUrls.slice(0, 5) : []
    const galleryArr = Array.isArray(galleryImageUrls) ? galleryImageUrls.slice(0, 5) : []
    const brand = (brandName !== undefined ? String(brandName).trim() : null) || 'Salon'
    const menu = (menuLabel !== undefined ? String(menuLabel).trim() : null) || 'Services'
    const invWeb = invoiceWebsite !== undefined ? String(invoiceWebsite).trim() || null : undefined
    const invUpi = invoiceUpiId !== undefined ? String(invoiceUpiId).trim() || null : undefined
    const invTerms = invoiceTerms !== undefined ? String(invoiceTerms).trim() || null : undefined

    const s = await prisma.siteCustomization.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        brandName: brand,
        menuLabel: menu,
        heroVideoUrls: JSON.stringify(heroArr),
        galleryImageUrls: JSON.stringify(galleryArr),
        invoiceWebsite: invWeb ?? null,
        invoiceUpiId: invUpi ?? null,
        invoiceTerms: invTerms ?? null,
      },
      update: {
        brandName: brand,
        menuLabel: menu,
        heroVideoUrls: JSON.stringify(heroArr),
        galleryImageUrls: JSON.stringify(galleryArr),
        ...(invWeb !== undefined && { invoiceWebsite: invWeb }),
        ...(invUpi !== undefined && { invoiceUpiId: invUpi }),
        ...(invTerms !== undefined && { invoiceTerms: invTerms }),
      },
    })

    const rows: SettingsRow[] = [{
      brandName: s.brandName,
      menuLabel: s.menuLabel,
      heroVideoUrls: s.heroVideoUrls,
      galleryImageUrls: s.galleryImageUrls,
      invoiceWebsite: s.invoiceWebsite,
      invoiceUpiId: s.invoiceUpiId,
      invoiceTerms: s.invoiceTerms,
    }]
    const r = rows[0]
    return NextResponse.json({
      brandName: r?.brandName ?? 'Salon',
      menuLabel: r?.menuLabel ?? 'Services',
      heroBannerImageUrl: null,
      heroVideoUrls: parseJsonArray(r?.heroVideoUrls ?? null),
      galleryImageUrls: parseJsonArray(r?.galleryImageUrls ?? null),
      invoiceWebsite: r?.invoiceWebsite ?? null,
      invoiceUpiId: r?.invoiceUpiId ?? null,
      invoiceTerms: r?.invoiceTerms ?? null,
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
