import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * One-time fix: ensure all services with subCategoryId have correct categoryId
 * from their subcategory's parent. Run once to fix existing data.
 * POST /api/admin/fix-service-subcategories
 */
export async function POST() {
  try {
    const servicesWithSub = await prisma.service.findMany({
      where: { subCategoryId: { not: null } },
      select: { id: true, subCategoryId: true, categoryId: true },
    })

    let fixed = 0
    for (const s of servicesWithSub) {
      if (!s.subCategoryId) continue
      const sub = await prisma.subCategory.findUnique({
        where: { id: s.subCategoryId },
        select: { categoryId: true },
      })
      if (sub && s.categoryId !== sub.categoryId) {
        await prisma.service.update({
          where: { id: s.id },
          data: { categoryId: sub.categoryId },
        })
        fixed++
      }
    }

    return NextResponse.json({ fixed, total: servicesWithSub.length })
  } catch (e) {
    console.error('Fix service subcategories error:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
