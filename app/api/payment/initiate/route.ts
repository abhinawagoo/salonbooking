import { NextResponse } from 'next/server'
import crypto from 'crypto'

// PhonePe payment initiation
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bookingId, amount, paymentType } = body

    // PhonePe configuration
    const merchantId = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT'
    const saltKey = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6cc41fdb'
    const saltIndex = process.env.PHONEPE_SALT_INDEX || '1'
    const env = process.env.PHONEPE_ENV || 'sandbox'
    
    const baseUrl = env === 'production' 
      ? 'https://api.phonepe.com/apis/hermes'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox'

    // Create payment payload
    const payload = {
      merchantId,
      merchantTransactionId: `TXN${Date.now()}`,
      amount: amount * 100, // Amount in paise
      merchantUserId: bookingId,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback`,
      redirectMode: 'POST',
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback`,
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    }

    // Create X-VERIFY header
    const payloadString = JSON.stringify(payload)
    const base64Payload = Buffer.from(payloadString).toString('base64')
    const stringToHash = base64Payload + '/pg/v1/pay' + saltKey
    const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex')
    const xVerify = sha256Hash + '###' + saltIndex

    // Make API call to PhonePe
    const response = await fetch(`${baseUrl}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        request: base64Payload,
      }),
    })

    const data = await response.json()
    
    if (data.success && data.data.instrumentResponse.redirectInfo.url) {
      return NextResponse.json({
        paymentUrl: data.data.instrumentResponse.redirectInfo.url,
      })
    }

    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error initiating payment:', error)
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    )
  }
}
