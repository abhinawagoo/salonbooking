/**
 * Indian Rupee currency formatter.
 * Uses Intl.NumberFormat for proper ₹ symbol and locale formatting.
 */
const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatCurrency(amount: number, decimals?: number): string {
  if (decimals !== undefined) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount)
  }
  return formatter.format(amount)
}

/**
 * PDF-safe currency format. Uses "Rs." prefix for jsPDF compatibility
 * (default Helvetica font may not render ₹ in some viewers).
 * Uses Intl.NumberFormat for proper thousand separators (e.g. 1,234.56).
 */
export function formatCurrencyPdf(amount: number, decimals = 2): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
  return `Rs. ${formatted}`
}
