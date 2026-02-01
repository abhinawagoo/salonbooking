import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Premium salon: standard categories (domain) and subcategories (services)
  const categoriesData = [
    { name: 'Hair', slug: 'hair', order: 1, description: 'Hair cut, straightening, hair colour, spa & more' },
    { name: 'Massage', slug: 'massage', order: 2, description: 'Head massage, body massage, foot massage & more' },
    { name: 'Nails', slug: 'nails', order: 3, description: 'Manicure, pedicure, nail art & more' },
    { name: 'Skin & Beauty', slug: 'skin-beauty', order: 4, description: 'Facial, threading, waxing, bleach & more' },
    { name: 'Bridal & Makeup', slug: 'bridal-makeup', order: 5, description: 'Bridal makeup, party makeup & more' },
  ]

  const categories: { id: string; slug: string }[] = []
  for (const cat of categoriesData) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, order: cat.order, description: cat.description },
      create: { ...cat },
    })
    categories.push({ id: c.id, slug: c.slug })
  }

  const hairId = categories.find((c) => c.slug === 'hair')!.id
  const massageId = categories.find((c) => c.slug === 'massage')!.id
  const nailsId = categories.find((c) => c.slug === 'nails')!.id
  const skinId = categories.find((c) => c.slug === 'skin-beauty')!.id
  const bridalId = categories.find((c) => c.slug === 'bridal-makeup')!.id

  const services = [
    { name: 'Haircut', description: 'Professional haircut and styling', price: 600, duration: 30, categoryId: hairId, imageUrl: 'https://images.unsplash.com/photo-1560869713-7d0a2b17c75a?w=400' },
    { name: 'Hair Colour', description: 'Full hair coloring service', price: 2800, duration: 120, categoryId: hairId, imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400' },
    { name: 'Straightening', description: 'Hair straightening treatment', price: 3500, duration: 90, categoryId: hairId, imageUrl: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a13737?w=400' },
    { name: 'Hair Spa', description: 'Relaxing hair spa treatment', price: 1800, duration: 60, categoryId: hairId, imageUrl: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a13737?w=400' },
    { name: 'Keratin Treatment', description: 'Smoothing keratin treatment', price: 4500, duration: 120, categoryId: hairId, imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400' },
    { name: 'Blow Dry & Styling', description: 'Blow dry and styling', price: 800, duration: 45, categoryId: hairId, imageUrl: 'https://images.unsplash.com/photo-1560869713-7d0a2b17c75a?w=400' },
    { name: 'Head Massage', description: 'Relaxing head and scalp massage', price: 900, duration: 30, categoryId: massageId, imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400' },
    { name: 'Body Massage', description: 'Full body relaxation massage', price: 2200, duration: 60, categoryId: massageId, imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400' },
    { name: 'Foot Massage', description: 'Reflexology foot massage', price: 700, duration: 30, categoryId: massageId, imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400' },
    { name: 'Aromatherapy Massage', description: 'Aromatherapy body massage', price: 2500, duration: 60, categoryId: massageId, imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400' },
    { name: 'Manicure', description: 'Nail care and polish', price: 650, duration: 30, categoryId: nailsId, imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400' },
    { name: 'Pedicure', description: 'Foot care and nail polish', price: 900, duration: 45, categoryId: nailsId, imageUrl: 'https://images.unsplash.com/photo-1604881991720-f91add269b7b?w=400' },
    { name: 'Gel Nails', description: 'Gel manicure or pedicure', price: 1200, duration: 45, categoryId: nailsId, imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400' },
    { name: 'Nail Art', description: 'Custom nail art design', price: 800, duration: 45, categoryId: nailsId, imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400' },
    { name: 'Facial', description: 'Deep cleansing facial treatment', price: 1400, duration: 45, categoryId: skinId, imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400' },
    { name: 'Threading', description: 'Eyebrow and facial threading', price: 350, duration: 15, categoryId: skinId, imageUrl: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a13737?w=400' },
    { name: 'Waxing', description: 'Full body or partial waxing', price: 1100, duration: 60, categoryId: skinId, imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400' },
    { name: 'Bleach', description: 'Face or body bleach', price: 600, duration: 30, categoryId: skinId, imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400' },
    { name: 'Cleanup', description: 'Face cleanup and exfoliation', price: 900, duration: 30, categoryId: skinId, imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400' },
    { name: 'Bridal Makeup', description: 'Full bridal makeup package', price: 8000, duration: 120, categoryId: bridalId, imageUrl: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400' },
    { name: 'Party Makeup', description: 'Party or occasion makeup', price: 2500, duration: 60, categoryId: bridalId, imageUrl: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400' },
    { name: 'HD Makeup', description: 'HD makeup for events', price: 3500, duration: 75, categoryId: bridalId, imageUrl: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400' },
  ]

  for (const service of services) {
    const existing = await prisma.service.findFirst({ where: { name: service.name } })
    if (existing) {
      await prisma.service.update({
        where: { id: existing.id },
        data: { categoryId: service.categoryId, description: service.description, price: service.price, duration: service.duration, imageUrl: service.imageUrl },
      })
    } else {
      await prisma.service.create({
        data: { name: service.name, description: service.description, price: service.price, duration: service.duration, categoryId: service.categoryId, imageUrl: service.imageUrl },
      })
    }
  }

  // Create admin user
  await prisma.user.upsert({
    where: { mobile: '9999999999' },
    update: {},
    create: { name: 'Admin User', mobile: '9999999999', role: 'ADMIN' },
  })

  await prisma.user.upsert({
    where: { mobile: '8888888888' },
    update: {},
    create: { name: 'Staff User', mobile: '8888888888', role: 'STAFF' },
  })

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
