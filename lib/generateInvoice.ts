import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { numberToWords } from './numberToWords'

const SAC_CODE = '9984' // Personal care / beauty services
const GST_RATE = 0.18 // 18%

interface Service {
  id: string
  name: string
  price: number
}

interface InvoiceData {
  bookingToken: string
  date: Date
  timeSlot: string
  locationName?: string
  locationAddress?: string
  locationMobile?: string
  locationImageUrl?: string
  locationImageDataUrl?: string
  services: Service[]
  paymentStatus: string
  totalAmount: number
  amountPaid?: number
  dueAmount?: number
  onlineAmount?: number
  cashAmount?: number
  customerName?: string
  customerMobile?: string
  /** Invoice settings */
  brandName?: string
  website?: string
  upiId?: string
  terms?: string
  qrDataUrl?: string
  invoiceNumber?: string
}

function drawGoldenBorder(doc: jsPDF, margin: number) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const gold: [number, number, number] = [218, 165, 32]
  doc.setDrawColor(...gold)
  doc.setLineWidth(0.5)
  doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin, 'S')
}

export function generateInvoicePDF(data: InvoiceData) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 14
  let yPos = margin + 4

  const primaryColor: [number, number, number] = [0, 0, 0]
  const grayColor: [number, number, number] = [100, 100, 100]
  const highlightColor: [number, number, number] = [255, 255, 220] // pale yellow
  const goldColor: [number, number, number] = [218, 165, 32]

  const salonName = (data.brandName || data.locationName || 'SALON').toUpperCase()
  const invoiceNo = data.invoiceNumber || data.bookingToken
  const invoiceDate = format(data.date, 'dd/MM/yyyy')

  // ----- Header: Logo (left) + Salon details -----
  const hasLogo = data.locationImageDataUrl && data.locationImageDataUrl.startsWith('data:image/')
  if (hasLogo && data.locationImageDataUrl) {
    try {
      const fmt = data.locationImageDataUrl.match(/^data:image\/(\w+);/)?.[1] === 'jpeg' ? 'JPEG' : 'PNG'
      doc.addImage(data.locationImageDataUrl, fmt, margin, yPos, 24, 24)
    } catch {
      // skip
    }
  }

  const leftX = hasLogo ? margin + 28 : margin
  doc.setTextColor(...primaryColor)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(salonName, leftX, yPos + 10)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  let lineY = yPos + 16
  if (data.locationMobile) {
    doc.text(data.locationMobile, leftX, lineY)
    lineY += 5
  }
  if (data.locationAddress) {
    doc.text(data.locationAddress, leftX, lineY)
    lineY += 5
  }
  if (data.website) {
    doc.text(data.website, leftX, lineY)
    lineY += 5
  }

  // ----- TAX INVOICE (right) -----
  doc.setTextColor(...primaryColor)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('TAX INVOICE', pageWidth - margin, yPos + 6, { align: 'right' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Invoice No.: ${invoiceNo}`, pageWidth - margin, yPos + 12, { align: 'right' })
  doc.text(`Invoice Date: ${invoiceDate}`, pageWidth - margin, yPos + 17, { align: 'right' })

  yPos = Math.max(lineY, yPos + 22) + 8

  // ----- Bill To -----
  doc.setFillColor(...highlightColor)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F')
  doc.setTextColor(...primaryColor)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Bill To', margin + 4, yPos + 7)
  yPos += 14
  doc.setFont('helvetica', 'normal')
  if (data.customerName) doc.text(data.customerName, margin + 4, yPos)
  yPos += 5
  if (data.customerMobile) doc.text(`Mobile: ${data.customerMobile}`, margin + 4, yPos)
  yPos += 12

  // ----- Services Table -----
  doc.setFillColor(...highlightColor)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
  doc.setTextColor(...primaryColor)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  const colNo = margin + 4
  const colSvc = margin + 14
  const colSac = margin + 75
  const colQty = margin + 95
  const colRate = margin + 115
  const colTax = margin + 135
  const colTotal = pageWidth - margin - 4
  doc.text('No', colNo, yPos + 6)
  doc.text('SERVICES', colSvc, yPos + 6)
  doc.text('SAC', colSac, yPos + 6)
  doc.text('Qty.', colQty, yPos + 6)
  doc.text('Rate', colRate, yPos + 6)
  doc.text('Tax', colTax, yPos + 6)
  doc.text('Total', colTotal, yPos + 6, { align: 'right' })
  yPos += 10

  let totalTaxable = 0
  let totalTax = 0
  let totalAmount = 0

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  data.services.forEach((svc, i) => {
    const price = svc.price
    const taxable = Math.round((price / (1 + GST_RATE)) * 100) / 100
    const tax = Math.round((price - taxable) * 100) / 100
    totalTaxable += taxable
    totalTax += tax
    totalAmount += price

    doc.text(String(i + 1), colNo, yPos + 4)
    doc.text(svc.name.length > 22 ? svc.name.slice(0, 22) + '..' : svc.name, colSvc, yPos + 4)
    doc.text(SAC_CODE, colSac, yPos + 4)
    doc.text('1 PCS', colQty, yPos + 4)
    doc.text(taxable.toFixed(2), colRate, yPos + 4)
    doc.text(`${tax.toFixed(2)} (18%)`, colTax, yPos + 4)
    doc.text(price.toFixed(0), colTotal, yPos + 4, { align: 'right' })
    yPos += 6
  })

  yPos += 6

  // ----- Summary -----
  const amountPaid = data.amountPaid ?? 0
  const dueAmount = data.dueAmount ?? Math.max(0, data.totalAmount - amountPaid)

  doc.setFillColor(...highlightColor)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
  doc.setTextColor(...primaryColor)
  doc.setFont('helvetica', 'bold')
  doc.text('SUBTOTAL', margin + 4, yPos + 6)
  doc.text(`₹ ${totalTax.toFixed(2)}`, colTax, yPos + 6)
  doc.text(`₹ ${totalAmount.toFixed(0)}`, colTotal, yPos + 6, { align: 'right' })
  yPos += 12

  doc.setFont('helvetica', 'normal')
  doc.text('Taxable Amount', margin + 4, yPos + 4)
  doc.text(`₹ ${totalTaxable.toFixed(2)}`, colTotal, yPos + 4, { align: 'right' })
  yPos += 6
  doc.text('CGST @9%', margin + 4, yPos + 4)
  doc.text(`₹ ${(totalTaxable * 0.09).toFixed(2)}`, colTotal, yPos + 4, { align: 'right' })
  yPos += 6
  doc.text('SGST @9%', margin + 4, yPos + 4)
  doc.text(`₹ ${(totalTaxable * 0.09).toFixed(2)}`, colTotal, yPos + 4, { align: 'right' })
  yPos += 8

  doc.setFillColor(...highlightColor)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Total Amount', margin + 4, yPos + 7)
  doc.text(`₹ ${data.totalAmount.toFixed(0)}`, colTotal, yPos + 7, { align: 'right' })
  yPos += 14

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Received Amount', margin + 4, yPos + 4)
  doc.text(`₹ ${amountPaid.toFixed(0)}`, colTotal, yPos + 4, { align: 'right' })
  yPos += 6
  doc.text('Balance', margin + 4, yPos + 4)
  doc.text(`₹ ${dueAmount.toFixed(0)}`, colTotal, yPos + 4, { align: 'right' })
  yPos += 6
  doc.text('Previous Balance', margin + 4, yPos + 4)
  doc.text('₹ 0', colTotal, yPos + 4, { align: 'right' })
  yPos += 6
  doc.text('Current Balance', margin + 4, yPos + 4)
  doc.text('₹ 0', colTotal, yPos + 4, { align: 'right' })
  yPos += 14

  // ----- Payment QR + UPI -----
  if (data.qrDataUrl && data.qrDataUrl.startsWith('data:image/')) {
    try {
      doc.addImage(data.qrDataUrl, 'PNG', margin, yPos, 28, 28)
    } catch {
      // skip
    }
    doc.setFontSize(8)
    doc.text('Payment QR Code', margin, yPos + 32)
  }
  if (data.upiId) {
    const qrRight = (data.qrDataUrl ? margin + 32 : margin)
    doc.setFontSize(9)
    doc.text('UPI ID:', qrRight, yPos + 8)
    doc.text(data.upiId, qrRight, yPos + 14)
  }
  yPos += (data.qrDataUrl || data.upiId) ? 38 : 0

  // ----- Terms -----
  if (data.terms) {
    doc.setFontSize(8)
    doc.setTextColor(...grayColor)
    doc.text('Terms & Conditions:', margin, yPos + 4)
    doc.text(data.terms, margin, yPos + 10)
    yPos += 18
  }

  // ----- Amount in words -----
  doc.setTextColor(...primaryColor)
  doc.setFontSize(9)
  doc.text('Total Amount (in words):', margin, yPos + 4)
  doc.setFont('helvetica', 'bold')
  doc.text(numberToWords(data.totalAmount), margin, yPos + 10)
  yPos += 18

  // ----- Signature -----
  doc.setDrawColor(...grayColor)
  doc.rect(pageWidth - margin - 45, yPos, 45, 20, 'S')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(`Signature ${salonName}`, pageWidth - margin - 42, yPos + 16)

  // Golden border
  drawGoldenBorder(doc, margin)

  const filename = `Tax-Invoice-${invoiceNo}-${format(data.date, 'yyyyMMdd')}.pdf`
  doc.save(filename)
}
