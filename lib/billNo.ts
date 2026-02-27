/**
 * Serial bill number assignment. One bill number per booking token.
 * Format: BILL-000001, BILL-000002, ...
 */

import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

/** Get or assign bill number for a booking. Idempotent - same token always returns same billNo. */
export async function getOrAssignBillNo(bookingId: string): Promise<string> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { billNo: true },
  })
  if (booking?.billNo) return booking.billNo

  const billNo = await prisma.$transaction(async (tx) => {
    const result = await tx.$queryRaw<{ lastNo: number }[]>(
      Prisma.sql`UPDATE "BillSequence" SET "lastNo" = "lastNo" + 1 WHERE "id" = 1 RETURNING "lastNo"`
    )
    const lastNo = result?.[0]?.lastNo ?? 1
    const num = `BILL-${String(lastNo).padStart(6, '0')}`

    await tx.booking.update({
      where: { id: bookingId },
      data: { billNo: num },
    })
    return num
  })

  return billNo
}
