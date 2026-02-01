import { jsPDF } from 'jspdf'
import { format } from 'date-fns'

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
  /** URL of location image (for display). Use locationImageDataUrl for PDF embedding. */
  locationImageUrl?: string
  /** Data URL of location image (for PDF). Caller can pass after loading image. */
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
}

export function generateInvoicePDF(data: InvoiceData) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let yPos = margin

  // Colors
  const primaryColor = [0, 0, 0] // Black
  const grayColor = [128, 128, 128]
  const lightGrayColor = [240, 240, 240]

  // Header: location image (if provided) + title
  const headerHeight = 52
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, pageWidth, headerHeight, 'F')

  const hasLocationImage = data.locationImageDataUrl && data.locationImageDataUrl.startsWith('data:image/')
  if (hasLocationImage && data.locationImageDataUrl) {
    try {
      const formatMatch = data.locationImageDataUrl.match(/^data:image\/(\w+);/)
      const imgFormat = formatMatch ? (formatMatch[1] === 'jpeg' ? 'JPEG' : 'PNG') : 'JPEG'
      doc.addImage(data.locationImageDataUrl, imgFormat, margin, 6, 28, 28)
    } catch {
      // If image fails, skip
    }
  }

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  const titleX = hasLocationImage ? margin + 34 : margin
  doc.text(data.locationName || 'SALON BOOKING', titleX, 22)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Invoice / Booking Receipt', titleX, 32)
  if (data.locationAddress) {
    doc.setFontSize(8)
    doc.text(data.locationAddress, titleX, 42)
  }
  if (data.locationMobile) {
    doc.text(`Contact: ${data.locationMobile}`, titleX, 48)
  }

  yPos = headerHeight + 12

  // Booking Details Section
  doc.setTextColor(...primaryColor)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Booking Details', margin, yPos)
  
  yPos += 10
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  doc.text(`Booking Token: ${data.bookingToken}`, margin, yPos)
  yPos += 7
  
  doc.text(`Date: ${format(data.date, 'EEEE, MMMM d, yyyy')}`, margin, yPos)
  yPos += 7
  
  doc.text(`Time: ${data.timeSlot}`, margin, yPos)
  yPos += 7
  
  if (data.locationName) {
    doc.text(`Location: ${data.locationName}`, margin, yPos)
    yPos += 7
  }
  if (data.locationAddress) {
    doc.text(data.locationAddress, margin, yPos)
    yPos += 7
  }
  
  if (data.customerName) {
    doc.text(`Customer: ${data.customerName}`, margin, yPos)
    yPos += 7
  }
  
  if (data.customerMobile) {
    doc.text(`Mobile: ${data.customerMobile}`, margin, yPos)
    yPos += 10
  }

  // Services Table Header
  doc.setFillColor(...lightGrayColor)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
  
  doc.setTextColor(...primaryColor)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Service', margin + 5, yPos + 6)
  doc.text('Amount', pageWidth - margin - 30, yPos + 6, { align: 'right' })
  
  yPos += 12

  // Services List
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  
  data.services.forEach((service, index) => {
    if (yPos > 250) {
      doc.addPage()
      yPos = margin
    }
    
    doc.text(service.name, margin + 5, yPos)
    doc.text(`₹${service.price}`, pageWidth - margin - 5, yPos, { align: 'right' })
    yPos += 7
  })

  // Total Section
  yPos += 5
  doc.setDrawColor(...grayColor)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...primaryColor)
  doc.text('Total Amount:', margin + 5, yPos)
  doc.text(`₹${data.totalAmount}`, pageWidth - margin - 5, yPos, { align: 'right' })

  const amountPaid = data.amountPaid ?? 0
  const dueAmount = data.dueAmount ?? Math.max(0, data.totalAmount - amountPaid)

  yPos += 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Amount Paid:', margin + 5, yPos)
  doc.setTextColor(0, 128, 0)
  doc.text(`₹${amountPaid}`, pageWidth - margin - 5, yPos, { align: 'right' })
  yPos += 7
  doc.setTextColor(...primaryColor)
  doc.text('Due Amount:', margin + 5, yPos)
  doc.setTextColor(200, 120, 0)
  doc.text(`₹${dueAmount}`, pageWidth - margin - 5, yPos, { align: 'right' })
  doc.setTextColor(...primaryColor)
  yPos += 10
  if ((data.onlineAmount ?? 0) > 0 || (data.cashAmount ?? 0) > 0) {
    doc.setFontSize(9)
    doc.setTextColor(...grayColor)
    const parts = []
    if ((data.onlineAmount ?? 0) > 0) parts.push(`Online: ₹${data.onlineAmount}`)
    if ((data.cashAmount ?? 0) > 0) parts.push(`Cash: ₹${data.cashAmount}`)
    doc.text(parts.join('  ·  '), margin, yPos)
    yPos += 7
  }
  yPos += 5

  // Payment Status
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  doc.text(`Payment Status: ${data.paymentStatus}`, margin, yPos)

  yPos += 20

  // Footer
  if (yPos < 250) {
    doc.setDrawColor(...lightGrayColor)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 10
    
    doc.setFontSize(8)
    doc.setTextColor(...grayColor)
    doc.text('Thank you for your booking!', margin, yPos)
    yPos += 5
    doc.text('Please arrive 10 minutes before your appointment time.', margin, yPos)
    yPos += 5
    doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, margin, yPos)
  }

  // Generate filename
  const filename = `Booking-${data.bookingToken}-${format(data.date, 'yyyyMMdd')}.pdf`
  
  // Save PDF
  doc.save(filename)
}
