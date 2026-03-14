import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { formatTime12h } from './formatTime'
import { numberToWords } from './numberToWords'
import { formatCurrencyPdf } from './currency'

const SAC_CODE = '9984'
const GST_RATE = 0.18
interface Service {
  id: string
  name: string
  price: number
  quantity?: number
}

export interface InvoiceData {
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
  brandName?: string
  website?: string
  gstNumber?: string
  terms?: string
  invoiceNumber?: string
}

const BORDER_COLOR: [number, number, number] = [229, 224, 216] // #E5E0D8
const HEADER_BG: [number, number, number] = [243, 238, 230] // #F3EEE6
const BLACK: [number, number, number] = [30, 30, 30]
const GRAY: [number, number, number] = [100, 100, 100]

export function generateInvoicePDF(data: InvoiceData) {
  const doc = new jsPDF({ putOnlyUsedFonts: true })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 24
  const innerPadding = 24
  const contentLeft = margin + innerPadding
  const contentRight = pageWidth - margin - innerPadding
  const contentTop = margin + innerPadding
  const contentBottom = pageHeight - margin - innerPadding
  const sectionSpacing = 20
  let yPos = contentTop

  /** Add new page if content would overflow; draw border on current page before leaving. */
  const checkPageBreak = (spaceNeeded: number, onNewPage?: () => void): void => {
    if (yPos + spaceNeeded > contentBottom) {
      doc.setDrawColor(...BORDER_COLOR)
      doc.setLineWidth(0.5)
      doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin, 'S')
      doc.addPage()
      yPos = contentTop
      onNewPage?.()
    }
  }

  const tableWidth = contentRight - contentLeft
  const cellPad = 10
  const rowH = 14
  const lineHeight = 5
  // Column widths: match HTML - No 5%, Services 35%, SAC 10%, Qty 10%, Rate 14%, Tax 14%, Total 12%
  const colNo = tableWidth * 0.05
  const colServices = tableWidth * 0.35
  const colSAC = tableWidth * 0.10
  const colQty = tableWidth * 0.10
  const colRate = tableWidth * 0.14
  const colTax = tableWidth * 0.14
  const colTotal = tableWidth * 0.12
  const colX = {
    no: contentLeft,
    services: contentLeft + colNo,
    sac: contentLeft + colNo + colServices,
    qty: contentLeft + colNo + colServices + colSAC,
    rate: contentLeft + colNo + colServices + colSAC + colQty,
    tax: contentLeft + colNo + colServices + colSAC + colQty + colRate,
    total: contentLeft + colNo + colServices + colSAC + colQty + colRate + colTax,
  }

  /** Draw vertical lines for table columns */
  const drawTableColumnBorders = (startY: number, height: number): void => {
    doc.setDrawColor(...BORDER_COLOR)
    const xCoords = [contentLeft, colX.services, colX.sac, colX.qty, colX.rate, colX.tax, colX.total, contentRight]
    for (const x of xCoords) {
      doc.line(x, startY, x, startY + height)
    }
  }

  /** Repeat table header on new page (for continuation). */
  const drawTableHeader = (): void => {
    doc.setFillColor(...HEADER_BG)
    doc.setDrawColor(...BORDER_COLOR)
    doc.rect(contentLeft, yPos, tableWidth, rowH, 'FD')
    doc.rect(contentLeft, yPos, tableWidth, rowH, 'S')
    drawTableColumnBorders(yPos, rowH)
    doc.setTextColor(...BLACK)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('No', colX.no + cellPad / 2, yPos + 9)
    doc.text('Services', colX.services + cellPad / 2, yPos + 9)
    doc.text('SAC', colX.sac + cellPad / 2, yPos + 9)
    doc.text('Qty', colX.qty + cellPad / 2, yPos + 9)
    doc.text('Rate', colX.rate + colRate - cellPad / 2, yPos + 9, { align: 'right' })
    doc.text('Tax', colX.tax + colTax - cellPad / 2, yPos + 9, { align: 'right' })
    doc.text('Total', contentRight - cellPad / 2, yPos + 9, { align: 'right' })
    yPos += rowH
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
  }

  const salonName = (data.brandName || data.locationName || 'SALON').toUpperCase()
  const invoiceNo = data.invoiceNumber || data.bookingToken
  const invoiceDate = format(data.date, 'dd/MM/yyyy')
  const terms = data.terms?.trim() || ''

  // ----- HEADER -----
  const hasLogo = data.locationImageDataUrl && data.locationImageDataUrl.startsWith('data:image/')
  if (hasLogo && data.locationImageDataUrl) {
    try {
      const fmt = data.locationImageDataUrl.match(/^data:image\/(\w+);/)?.[1] === 'jpeg' ? 'JPEG' : 'PNG'
      doc.addImage(data.locationImageDataUrl, fmt, contentLeft, yPos, 32, 32)
    } catch {
      // skip
    }
  }

  const leftX = hasLogo ? contentLeft + 36 : contentLeft
  doc.setTextColor(...BLACK)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text(salonName, leftX, yPos + 14)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  let lineY = yPos + 20
  if (data.locationMobile) {
    doc.text(data.locationMobile, leftX, lineY)
    lineY += 6
  }
  if (data.locationAddress) {
    doc.text(data.locationAddress, leftX, lineY)
    lineY += 6
  }
  if (data.website) {
    doc.text(data.website, leftX, lineY)
    lineY += 6
  }
  if (data.gstNumber) {
    doc.text(`Goods and Services Tax Identification Number: ${data.gstNumber}`, leftX, lineY)
    lineY += 6
  }

  doc.setTextColor(...BLACK)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('TAX INVOICE', contentRight, yPos + 14, { align: 'right' })

  const infoRowSpacing = Math.round(sectionSpacing * 0.4) // 60% reduction
  yPos = Math.max(lineY, yPos + 36) + infoRowSpacing

  // ----- INFO ROW -----
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...BLACK)
  doc.text(`Invoice No: ${invoiceNo}`, contentLeft, yPos)
  doc.text(`Invoice Date: ${invoiceDate}`, contentRight, yPos, { align: 'right' })
  if (data.timeSlot) {
    yPos += 6
    doc.text(`Appointment: ${formatTime12h(data.timeSlot)}`, contentLeft, yPos)
  }
  yPos += infoRowSpacing

  // ----- BILL TO BOX -----
  const billToPadding = 12
  const billToHeight = 38
  checkPageBreak(billToHeight + 4)
  doc.setDrawColor(...BORDER_COLOR)
  doc.setFillColor(250, 250, 249)
  doc.rect(contentLeft, yPos, tableWidth, billToHeight, 'FD')
  doc.rect(contentLeft, yPos, tableWidth, billToHeight, 'S')
  doc.setTextColor(...BLACK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Bill To', contentLeft + billToPadding, yPos + 12)
  doc.setFont('helvetica', 'normal')
  if (data.customerName) doc.text(data.customerName, contentLeft + billToPadding, yPos + 21)
  if (data.customerMobile) doc.text(`Mobile: ${data.customerMobile}`, contentLeft + billToPadding, yPos + 29)
  yPos += billToHeight + 4

  // ----- TABLE -----
  checkPageBreak(rowH)
  doc.setFillColor(...HEADER_BG)
  doc.setDrawColor(...BORDER_COLOR)
  doc.rect(contentLeft, yPos, tableWidth, rowH, 'FD')
  doc.rect(contentLeft, yPos, tableWidth, rowH, 'S')
  drawTableColumnBorders(yPos, rowH)
  doc.setTextColor(...BLACK)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('No', colX.no + cellPad / 2, yPos + 9)
  doc.text('Services', colX.services + cellPad / 2, yPos + 9)
  doc.text('SAC', colX.sac + cellPad / 2, yPos + 9)
  doc.text('Qty', colX.qty + cellPad / 2, yPos + 9)
  doc.text('Rate', colX.rate + colRate - cellPad / 2, yPos + 9, { align: 'right' })
  doc.text('Tax', colX.tax + colTax - cellPad / 2, yPos + 9, { align: 'right' })
  doc.text('Total', contentRight - cellPad / 2, yPos + 9, { align: 'right' })
  yPos += rowH

  let totalTaxable = 0
  let totalTax = 0

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  data.services.forEach((svc, i) => {
    const svcLines = doc.splitTextToSize(svc.name, colServices - cellPad)
    const actualRowH = Math.max(rowH, 6 + svcLines.length * lineHeight)
    checkPageBreak(actualRowH, drawTableHeader)
    const qty = svc.quantity ?? 1
    const price = svc.price
    const taxable = Math.round((price / (1 + GST_RATE)) * 100) / 100
    const tax = Math.round((price - taxable) * 100) / 100
    totalTaxable += taxable
    totalTax += tax
    const unitTaxable = qty > 0 ? Math.round((taxable / qty) * 100) / 100 : taxable

    doc.setDrawColor(...BORDER_COLOR)
    doc.line(contentLeft, yPos, contentRight, yPos)
    drawTableColumnBorders(yPos, actualRowH)
    const cellCenterY = yPos + actualRowH / 2 - 2
    doc.text(String(i + 1), colX.no + cellPad / 2, cellCenterY)
    doc.text(svcLines, colX.services + cellPad / 2, yPos + 5)
    doc.text(SAC_CODE, colX.sac + cellPad / 2, cellCenterY)
    doc.text(`${qty} PCS`, colX.qty + cellPad / 2, cellCenterY)
    doc.text(formatCurrencyPdf(unitTaxable), colX.rate + colRate - cellPad / 2, cellCenterY, { align: 'right' })
    doc.text(formatCurrencyPdf(tax), colX.tax + colTax - cellPad / 2, cellCenterY, { align: 'right' })
    doc.text(formatCurrencyPdf(price, 0), contentRight - cellPad / 2, cellCenterY, { align: 'right' })
    yPos += actualRowH
  })

  doc.setDrawColor(...BORDER_COLOR)
  doc.line(contentLeft, yPos, contentRight, yPos)
  yPos += 4

  // ----- SUBTOTAL ROW -----
  const subtotalRowH = rowH - 2
  checkPageBreak(subtotalRowH + 20)
  doc.setFillColor(...HEADER_BG)
  doc.rect(contentLeft, yPos, tableWidth, subtotalRowH, 'FD')
  doc.rect(contentLeft, yPos, tableWidth, subtotalRowH, 'S')
  drawTableColumnBorders(yPos, subtotalRowH)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BLACK)
  doc.text('SUBTOTAL', contentLeft + cellPad / 2, yPos + 7)
  doc.text(formatCurrencyPdf(totalTax), colX.tax + colTax - cellPad / 2, yPos + 7, { align: 'right' })
  doc.text(formatCurrencyPdf(data.totalAmount, 0), contentRight - cellPad / 2, yPos + 7, { align: 'right' })
  yPos += subtotalRowH + sectionSpacing

  // ----- BOTTOM GRID: Terms (left) | Totals (right) - match HTML layout -----
  const amountPaid = data.amountPaid ?? 0
  const dueAmount = data.dueAmount ?? Math.max(0, data.totalAmount - amountPaid)
  const totalsBoxWidth = 95
  const boxPadding = 12
  const gapBetweenBoxes = 16
  const totalsBoxX = contentRight - totalsBoxWidth
  const termsBoxWidth = Math.max(60, totalsBoxX - contentLeft - gapBetweenBoxes)
  const bottomSectionHeight = 78
  checkPageBreak(bottomSectionHeight + 30)

  const bottomSectionY = yPos

  // Terms & Conditions - bordered box with padding (match HTML)
  doc.setDrawColor(...BORDER_COLOR)
  doc.setFillColor(250, 250, 249)
  doc.rect(contentLeft, bottomSectionY, termsBoxWidth, bottomSectionHeight, 'FD')
  doc.rect(contentLeft, bottomSectionY, termsBoxWidth, bottomSectionHeight, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...BLACK)
  doc.text('Terms & Conditions', contentLeft + boxPadding, bottomSectionY + 10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  if (terms) {
    doc.setFontSize(8)
    const termsLines = doc.splitTextToSize(terms, termsBoxWidth - 2 * boxPadding)
    doc.text(termsLines, contentLeft + boxPadding, bottomSectionY + 18)
  }
  doc.setFontSize(8)
  doc.text('View full Terms & Conditions', contentLeft + boxPadding, bottomSectionY + 28)

  // Payment summary - bordered box with padding (match HTML)
  doc.setDrawColor(...BORDER_COLOR)
  doc.setFillColor(250, 250, 249)
  doc.rect(totalsBoxX, bottomSectionY, totalsBoxWidth, bottomSectionHeight, 'FD')
  doc.rect(totalsBoxX, bottomSectionY, totalsBoxWidth, bottomSectionHeight, 'S')
  doc.setTextColor(...BLACK)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Taxable Amount', totalsBoxX + boxPadding, bottomSectionY + 12)
  doc.text(formatCurrencyPdf(totalTaxable), totalsBoxX + totalsBoxWidth - boxPadding, bottomSectionY + 12, { align: 'right' })
  doc.text('CGST @9%', totalsBoxX + boxPadding, bottomSectionY + 20)
  doc.text(formatCurrencyPdf(totalTaxable * 0.09), totalsBoxX + totalsBoxWidth - boxPadding, bottomSectionY + 20, { align: 'right' })
  doc.text('SGST @9%', totalsBoxX + boxPadding, bottomSectionY + 28)
  doc.text(formatCurrencyPdf(totalTaxable * 0.09), totalsBoxX + totalsBoxWidth - boxPadding, bottomSectionY + 28, { align: 'right' })
  doc.setFont('helvetica', 'bold')
  doc.text('Total Amount', totalsBoxX + boxPadding, bottomSectionY + 38)
  doc.text(formatCurrencyPdf(data.totalAmount, 0), totalsBoxX + totalsBoxWidth - boxPadding, bottomSectionY + 38, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.text('Received Amount', totalsBoxX + boxPadding, bottomSectionY + 46)
  doc.text(formatCurrencyPdf(amountPaid, 0), totalsBoxX + totalsBoxWidth - boxPadding, bottomSectionY + 46, { align: 'right' })
  doc.text('Balance', totalsBoxX + boxPadding, bottomSectionY + 54)
  doc.text(formatCurrencyPdf(dueAmount, 0), totalsBoxX + totalsBoxWidth - boxPadding, bottomSectionY + 54, { align: 'right' })
  doc.text('Total Amount (in words):', totalsBoxX + boxPadding, bottomSectionY + 64)
  doc.setFontSize(7)
  const words = numberToWords(data.totalAmount)
  const wordsLines = doc.splitTextToSize(words, totalsBoxWidth - 2 * boxPadding)
  doc.text(wordsLines, totalsBoxX + boxPadding, bottomSectionY + 70)

  yPos = bottomSectionY + bottomSectionHeight + 16

  // ----- SIGNATURE BOX -----
  checkPageBreak(40)
  const sigW = 58
  const sigH = 32
  const sigPadding = 10
  doc.setDrawColor(...BORDER_COLOR)
  doc.rect(contentRight - sigW, yPos, sigW, sigH, 'S')
  doc.setFontSize(8)
  doc.text('Signature', contentRight - sigW + sigPadding, yPos + 10)
  doc.text(salonName, contentRight - sigW + sigPadding, yPos + 20)

  // Outer border
  doc.setDrawColor(...BORDER_COLOR)
  doc.setLineWidth(0.5)
  doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin, 'S')

  const filename = `Tax-Invoice-${invoiceNo}-${format(data.date, 'yyyyMMdd')}.pdf`
  const buffer = doc.output('arraybuffer') as ArrayBuffer
  return { buffer, filename }
}
