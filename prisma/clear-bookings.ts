/**
 * Clear all bookings, booking services, and payments from the database.
 * Use for testing only. Run: npx tsx prisma/clear-bookings.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Delete in order: Payment first (references Booking), then Booking (BookingService cascades)
  const deletedPayments = await prisma.payment.deleteMany({})
  const deletedBookings = await prisma.booking.deleteMany({})
  // BookingService is cascade-deleted with Booking, but deleteMany is safe if any remain
  const deletedServices = await prisma.bookingService.deleteMany({})

  // Reset bill number sequence so next booking gets BILL-000001
  await prisma.billSequence.upsert({
    where: { id: 1 },
    update: { lastNo: 0 },
    create: { id: 1, lastNo: 0 },
  })

  console.log(`Deleted: ${deletedPayments.count} payments, ${deletedBookings.count} bookings, ${deletedServices.count} booking services`)
  console.log('Bill sequence reset. Next booking will get BILL-000001.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
