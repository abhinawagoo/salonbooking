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
  const sectionSpacing = 20
  let yPos = margin

  /** Add new page if content would overflow; draw border on current page before leaving. */
  const checkPageBreak = (spaceNeeded: number, onNewPage?: () => void): void => {
    if (yPos + spaceNeeded > pageHeight - margin) {
      doc.setDrawColor(...BORDER_COLOR)
      doc.setLineWidth(0.5)
      doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin, 'S')
      doc.addPage()
      yPos = margin
      onNewPage?.()
    }
  }

  const tableWidth = pageWidth - 2 * margin
  const cellPad = 8
  const rowH = 12
  const lineHeight = 5
  // Column widths: No 5%, Services 35%, SAC 10%, Qty 10%, Rate 14%, Tax 14%, Total 12%
  const colNo = tableWidth * 0.05
  const colServices = tableWidth * 0.35
  const colSAC = tableWidth * 0.10
  const colQty = tableWidth * 0.10
  const colRate = tableWidth * 0.14
  const colTax = tableWidth * 0.14
  const colTotal = tableWidth * 0.12
  const colX = {
    no: margin,
    services: margin + colNo,
    sac: margin + colNo + colServices,
    qty: margin + colNo + colServices + colSAC,
    rate: margin + colNo + colServices + colSAC + colQty,
    tax: margin + colNo + colServices + colSAC + colQty + colRate,
    total: margin + colNo + colServices + colSAC + colQty + colRate + colTax,
  }

  /** Repeat table header on new page (for continuation). */
  const drawTableHeader = (): void => {
    doc.setFillColor(...HEADER_BG)
    doc.setDrawColor(...BORDER_COLOR)
    doc.rect(margin, yPos, tableWidth, rowH, 'FD')
    doc.rect(margin, yPos, tableWidth, rowH, 'S')
    doc.setTextColor(...BLACK)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('No', colX.no + cellPad / 2, yPos + 8)
    doc.text('Services', colX.services + cellPad / 2, yPos + 8)
    doc.text('SAC', colX.sac + cellPad / 2, yPos + 8)
    doc.text('Qty', colX.qty + cellPad / 2, yPos + 8)
    doc.text('Rate', colX.rate + colRate - cellPad / 2, yPos + 8, { align: 'right' })
    doc.text('Tax', colX.tax + colTax - cellPad / 2, yPos + 8, { align: 'right' })
    doc.text('Total', pageWidth - margin - cellPad / 2, yPos + 8, { align: 'right' })
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
      doc.addImage(data.locationImageDataUrl, fmt, margin, yPos, 32, 32)
    } catch {
      // skip
    }
  }

  const leftX = hasLogo ? margin + 36 : margin
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

  doc.setTextColor(...BLACK)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('TAX INVOICE', pageWidth - margin, yPos + 10, { align: 'right' })

  const infoRowSpacing = Math.round(sectionSpacing * 0.4) // 60% reduction
  yPos = Math.max(lineY, yPos + 36) + infoRowSpacing

  // ----- INFO ROW -----
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...BLACK)
  doc.text(`Invoice No: ${invoiceNo}`, margin, yPos)
  doc.text(`Invoice Date: ${invoiceDate}`, pageWidth - margin, yPos, { align: 'right' })
  if (data.timeSlot) {
    yPos += 6
    doc.text(`Appointment: ${formatTime12h(data.timeSlot)}`, margin, yPos)
  }
  yPos += infoRowSpacing

  // ----- BILL TO BOX -----
  checkPageBreak(40)
  doc.setDrawColor(...BORDER_COLOR)
  doc.setFillColor(250, 250, 249)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 32, 'FD')
  doc.setTextColor(...BLACK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Bill To', margin + 10, yPos + 10)
  doc.setFont('helvetica', 'normal')
  if (data.customerName) doc.text(data.customerName, margin + 10, yPos + 18)
  if (data.customerMobile) doc.text(`Mobile: ${data.customerMobile}`, margin + 10, yPos + 25)
  yPos += 40

  // ----- TABLE -----
  checkPageBreak(rowH) // only break if we can't fit the header
  doc.setFillColor(...HEADER_BG)
  doc.setDrawColor(...BORDER_COLOR)
  doc.rect(margin, yPos, tableWidth, rowH, 'FD')
  doc.rect(margin, yPos, tableWidth, rowH, 'S')
  doc.setTextColor(...BLACK)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('No', colX.no + cellPad / 2, yPos + 8)
  doc.text('Services', colX.services + cellPad / 2, yPos + 8)
  doc.text('SAC', colX.sac + cellPad / 2, yPos + 8)
  doc.text('Qty', colX.qty + cellPad / 2, yPos + 8)
  doc.text('Rate', colX.rate + colRate - cellPad / 2, yPos + 8, { align: 'right' })
  doc.text('Tax', colX.tax + colTax - cellPad / 2, yPos + 8, { align: 'right' })
  doc.text('Total', pageWidth - margin - cellPad / 2, yPos + 8, { align: 'right' })
  yPos += rowH

  let totalTaxable = 0
  let totalTax = 0

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  data.services.forEach((svc, i) => {
    const svcLines = doc.splitTextToSize(svc.name, colServices - cellPad)
    const actualRowH = Math.max(rowH, 6 + svcLines.length * lineHeight)
    checkPageBreak(actualRowH, drawTableHeader)
    const price = svc.price
    const taxable = Math.round((price / (1 + GST_RATE)) * 100) / 100
    const tax = Math.round((price - taxable) * 100) / 100
    totalTaxable += taxable
    totalTax += tax

    doc.setDrawColor(...BORDER_COLOR)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    const cellCenterY = yPos + actualRowH / 2 - 2
    doc.text(String(i + 1), colX.no + cellPad / 2, cellCenterY)
    doc.text(svcLines, colX.services + cellPad / 2, yPos + 5)
    doc.text(SAC_CODE, colX.sac + cellPad / 2, cellCenterY)
    doc.text('1 PCS', colX.qty + cellPad / 2, cellCenterY)
    doc.text(formatCurrencyPdf(taxable), colX.rate + colRate - cellPad / 2, cellCenterY, { align: 'right' })
    doc.text(formatCurrencyPdf(tax), colX.tax + colTax - cellPad / 2, cellCenterY, { align: 'right' })
    doc.text(formatCurrencyPdf(price, 0), pageWidth - margin - cellPad / 2, cellCenterY, { align: 'right' })
    yPos += actualRowH
  })

  doc.setDrawColor(...BORDER_COLOR)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 4

  // ----- SUBTOTAL ROW -----
  checkPageBreak(rowH + 20)
  doc.setFillColor(...HEADER_BG)
  doc.rect(margin, yPos, tableWidth, rowH - 2, 'FD')
  doc.rect(margin, yPos, tableWidth, rowH - 2, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BLACK)
  doc.text('SUBTOTAL', margin + cellPad / 2, yPos + 6)
  doc.text(formatCurrencyPdf(totalTax), colX.tax + colTax - cellPad / 2, yPos + 6, { align: 'right' })
  doc.text(formatCurrencyPdf(data.totalAmount, 0), pageWidth - margin - cellPad / 2, yPos + 6, { align: 'right' })
  yPos += rowH + sectionSpacing

  // ----- BOTTOM GRID: Terms (left) | Totals (right) -----
  checkPageBreak(85) // only break when truly needed (exact content height)
  const amountPaid = data.amountPaid ?? 0
  const dueAmount = data.dueAmount ?? Math.max(0, data.totalAmount - amountPaid)
  const totalsBoxWidth = 90
  const totalsBoxX = pageWidth - margin - totalsBoxWidth

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...GRAY)
  doc.text('Terms & Conditions', margin, yPos)
  if (terms) {
    doc.setFontSize(8)
    const termsLines = doc.splitTextToSize(terms, 95)
    doc.text(termsLines, margin, yPos + 6)
  }

  doc.setDrawColor(...BORDER_COLOR)
  doc.setFillColor(250, 250, 249)
  doc.rect(totalsBoxX, yPos - 4, totalsBoxWidth, 72, 'FD')
  doc.rect(totalsBoxX, yPos - 4, totalsBoxWidth, 72, 'S')
  doc.setTextColor(...BLACK)
  doc.setFontSize(9)
  doc.text('Taxable Amount', totalsBoxX + 4, yPos + 4)
  doc.text(formatCurrencyPdf(totalTaxable), totalsBoxX + totalsBoxWidth - 4, yPos + 4, { align: 'right' })
  doc.text('CGST @9%', totalsBoxX + 4, yPos + 11)
  doc.text(formatCurrencyPdf(totalTaxable * 0.09), totalsBoxX + totalsBoxWidth - 4, yPos + 11, { align: 'right' })
  doc.text('SGST @9%', totalsBoxX + 4, yPos + 18)
  doc.text(formatCurrencyPdf(totalTaxable * 0.09), totalsBoxX + totalsBoxWidth - 4, yPos + 18, { align: 'right' })
  doc.setFont('helvetica', 'bold')
  doc.text('Total Amount', totalsBoxX + 4, yPos + 27)
  doc.text(formatCurrencyPdf(data.totalAmount, 0), totalsBoxX + totalsBoxWidth - 4, yPos + 27, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.text('Received Amount', totalsBoxX + 4, yPos + 34)
  doc.text(formatCurrencyPdf(amountPaid, 0), totalsBoxX + totalsBoxWidth - 4, yPos + 34, { align: 'right' })
  doc.text('Balance', totalsBoxX + 4, yPos + 41)
  doc.text(formatCurrencyPdf(dueAmount, 0), totalsBoxX + totalsBoxWidth - 4, yPos + 41, { align: 'right' })
  doc.text('Amount (in words):', totalsBoxX + 4, yPos + 50)
  doc.setFontSize(7)
  const words = numberToWords(data.totalAmount)
  const wordsLines = doc.splitTextToSize(words, totalsBoxWidth - 8)
  doc.text(wordsLines, totalsBoxX + 4, yPos + 56)

  yPos += 85

  // ----- SIGNATURE BOX -----
  checkPageBreak(60)
  const sigW = 50
  const sigH = 28
  doc.setDrawColor(...BORDER_COLOR)
  doc.rect(pageWidth - margin - sigW, yPos, sigW, sigH, 'S')
  doc.setFontSize(8)
  doc.text('Signature', pageWidth - margin - sigW + 4, yPos + 10)
  doc.text(salonName, pageWidth - margin - sigW + 4, yPos + 20)

  // Outer border
  doc.setDrawColor(...BORDER_COLOR)
  doc.setLineWidth(0.5)
  doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin, 'S')

  const filename = `Tax-Invoice-${invoiceNo}-${format(data.date, 'yyyyMMdd')}.pdf`
  const buffer = doc.output('arraybuffer') as ArrayBuffer
  return { buffer, filename }
}
