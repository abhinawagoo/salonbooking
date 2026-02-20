/**
 * Convert number to words for Indian Rupees (e.g. 40 -> "Forty Rupees")
 */
const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function convertChunk(n: number): string {
  if (n === 0) return ''
  if (n < 10) return ones[n]
  if (n < 20) return teens[n - 10]
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '')
  return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertChunk(n % 100) : '')
}

export function numberToWords(num: number): string {
  const intPart = Math.floor(num)
  const decPart = Math.round((num - intPart) * 100)
  if (intPart === 0 && decPart === 0) return 'Zero Rupees'
  let result = ''
  let n = intPart
  if (n >= 10000000) {
    result += convertChunk(Math.floor(n / 10000000)) + ' Crore '
    n %= 10000000
  }
  if (n >= 100000) {
    result += convertChunk(Math.floor(n / 100000)) + ' Lakh '
    n %= 100000
  }
  if (n >= 1000) {
    result += convertChunk(Math.floor(n / 1000)) + ' Thousand '
    n %= 1000
  }
  if (n > 0) {
    result += convertChunk(n)
  }
  result = result.trim()
  result += intPart === 1 ? ' Rupee' : ' Rupees'
  if (decPart > 0) {
    result += ' and ' + convertChunk(decPart)
    result += decPart === 1 ? ' Paise' : ' Paise'
  }
  result += ' Only'
  return result
}
