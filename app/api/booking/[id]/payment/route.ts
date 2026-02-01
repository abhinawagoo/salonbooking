import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH: Record cash payment or update payment breakdown (staff/admin)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: bookingId } = params
    const body = await request.json()
    const { addCash, onlineAmount, cashAmount } = body

    const payment = await prisma.payment.findFirst({
      where: { bookingId },
    })
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Record cash received at salon (staff or admin)
    if (typeof addCash === 'number' && addCash > 0) {
      const newCashAmount = payment.cashAmount + addCash
      const newAmountPaid = payment.amountPaid + addCash
      if (newAmountPaid > payment.totalAmount) {
        return NextResponse.json(
          { error: 'Total paid cannot exceed total amount' },
          { status: 400 }
        )
      }
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          cashAmount: newCashAmount,
          amountPaid: newAmountPaid,
          paymentStatus: newAmountPaid >= payment.totalAmount ? 'COMPLETED' : payment.paymentStatus,
        },
      })
      const updated = await prisma.payment.findUnique({
        where: { id: payment.id },
      })
      return NextResponse.json(updated)
    }

    // Admin: set payment breakdown (online + cash)
    if (
      typeof onlineAmount === 'number' &&
      typeof cashAmount === 'number' &&
      onlineAmount >= 0 &&
      cashAmount >= 0
    ) {
      const newAmountPaid = onlineAmount + cashAmount
      if (newAmountPaid > payment.totalAmount) {
        return NextResponse.json(
          { error: 'Total paid cannot exceed total amount' },
          { status: 400 }
        )
      }
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          onlineAmount,
          cashAmount,
          amountPaid: newAmountPaid,
          paymentStatus: newAmountPaid >= payment.totalAmount ? 'COMPLETED' : 'PENDING',
        },
      })
      const updated = await prisma.payment.findUnique({
        where: { id: payment.id },
      })
      return NextResponse.json(updated)
    }

    return NextResponse.json(
      { error: 'Provide addCash (number) or both onlineAmount and cashAmount' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    )
  }
}
