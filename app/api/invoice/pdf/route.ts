import { NextResponse } from 'next/server'
import { generateInvoicePDF } from '@/lib/generateInvoice'
import type { InvoiceData } from '@/lib/generateInvoice'
import { getOrAssignBillNo } from '@/lib/billNo'

export const dynamic = 'force-dynamic'

/** Fetch image from URL and return base64 data URL (server-side, no CORS). */
async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'SalonBooking/1.0' } })
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const base64 = buf.toString('base64')
    return `data:${contentType};base64,${base64}`
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Support bookingToken: fetch full data from DB
    if (body.bookingToken && !body.services) {
      const { prisma } = await import('@/lib/prisma')
      const booking = await prisma.booking.findFirst({
        where: { token: body.bookingToken },
        include: { location: true, user: true, services: { include: { service: true } }, payment: true },
      })
      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      }
      const billNo = await getOrAssignBillNo(booking.id)
      const totalAmount = booking.payment?.totalAmount ?? booking.services.reduce((s, bs) => s + bs.price, 0)
      const amountPaid = booking.payment?.amountPaid ?? 0
      const dueAmount = Math.max(0, totalAmount - amountPaid)

      const site = await prisma.siteCustomization.findFirst({ where: { id: 1 } })
      const payload: InvoiceData = {
        bookingToken: booking.token,
        date: new Date(booking.date),
        timeSlot: booking.timeSlot,
        locationName: booking.location?.name ?? undefined,
        locationAddress: booking.location?.address ?? undefined,
        locationMobile: booking.location?.mobile ?? undefined,
        locationImageUrl: booking.location?.imageUrl ?? undefined,
        services: booking.services.map((bs) => ({
          id: bs.service.id,
          name: bs.service.name,
          price: bs.price,
          quantity: bs.quantity ?? 1,
        })),
        paymentStatus: booking.payment?.paymentStatus ?? 'PENDING',
        totalAmount,
        amountPaid,
        dueAmount,
        onlineAmount: booking.payment?.onlineAmount ?? 0,
        cashAmount: booking.payment?.cashAmount ?? 0,
        customerName: booking.user?.name ?? undefined,
        customerMobile: booking.user?.mobile ?? undefined,
        brandName: site?.brandName ?? undefined,
        website: site?.invoiceWebsite ?? 'shahnazsalonsasaram.com',
        gstNumber: site?.invoiceGst ?? undefined,
        terms: site?.invoiceTerms ?? undefined,
        invoiceNumber: billNo,
      }
      if (payload.locationImageUrl) {
        const dataUrl = await fetchImageAsDataUrl(payload.locationImageUrl)
        if (dataUrl) payload.locationImageDataUrl = dataUrl
      }
      const { buffer, filename } = generateInvoicePDF(payload)
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    // Full payload from client (invoice page, confirmation, staff)
    const data = body as InvoiceData
    if (!data.bookingToken || !data.services?.length) {
      return NextResponse.json({ error: 'Invalid invoice data' }, { status: 400 })
    }

    // Fetch booking to get or assign bill number (one bill no per token)
    const { prisma } = await import('@/lib/prisma')
    const booking = await prisma.booking.findFirst({
      where: { token: data.bookingToken },
      select: { id: true, billNo: true },
    })
    const billNo = booking ? await getOrAssignBillNo(booking.id) : (data.invoiceNumber || data.bookingToken)

    // Ensure date is Date object
    if (typeof data.date === 'string') data.date = new Date(data.date)

    // Fetch image server-side if URL provided (avoids CORS)
    if (data.locationImageUrl && !data.locationImageDataUrl) {
      const dataUrl = await fetchImageAsDataUrl(data.locationImageUrl)
      if (dataUrl) data.locationImageDataUrl = dataUrl
    }

    const payload: InvoiceData = { ...data, invoiceNumber: billNo }
    const { buffer, filename } = generateInvoicePDF(payload)
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Invoice PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
