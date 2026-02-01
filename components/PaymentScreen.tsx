'use client'

import { CreditCard, Wallet, Smartphone, Shield } from 'lucide-react'
import { useState } from 'react'

interface Service {
  id: string
  name: string
  price: number
  duration: number
}

interface PaymentScreenProps {
  services: Service[]
  totalAmount: number
  onPaymentInitiate: (paymentType: 'FULL' | 'ADVANCE', paymentMethod?: string) => void
}

export default function PaymentScreen({ services, totalAmount, onPaymentInitiate }: PaymentScreenProps) {
  const [selectedPaymentType, setSelectedPaymentType] = useState<'FULL' | 'ADVANCE' | null>(null)
  const advanceAmount = totalAmount * 0.3 // 30% advance

  const paymentMethods = [
    {
      id: 'phonepe',
      name: 'PhonePe',
      icon: '📱',
      description: 'UPI, Cards, Wallets',
      available: true,
    },
    {
      id: 'razorpay',
      name: 'Razorpay',
      icon: '💳',
      description: 'Cards, UPI, Netbanking',
      available: false, // Can be enabled later
    },
  ]

  const handlePayment = (paymentType: 'FULL' | 'ADVANCE') => {
    setSelectedPaymentType(paymentType)
    // Don't trigger payment immediately - wait for user to click "Pay Now"
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <h3 className="text-2xl font-light text-gray-900 mb-6">Booking Summary</h3>
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className="flex justify-between items-center py-3 border-b border-gray-100">
              <div>
                <p className="font-light text-lg text-gray-900">{service.name}</p>
                <p className="text-sm text-gray-500 font-light">{service.duration} minutes</p>
              </div>
              <p className="font-light text-lg">₹{service.price}</p>
            </div>
          ))}
          <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200">
            <p className="text-xl font-light text-gray-900">Total Amount</p>
            <p className="text-2xl font-light text-gray-900">₹{totalAmount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <h3 className="text-2xl font-light text-gray-900 mb-6">Payment Amount</h3>
        <div className="space-y-4">
          <button
            onClick={() => handlePayment('FULL')}
            className={`w-full p-6 border-2 rounded-2xl transition-all duration-200 text-left min-h-[100px] ${
              selectedPaymentType === 'FULL'
                ? 'border-black bg-black text-white'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-full p-4 ${selectedPaymentType === 'FULL' ? 'bg-white/20' : 'bg-gray-100'}`}>
                <CreditCard className={selectedPaymentType === 'FULL' ? 'text-white' : 'text-gray-600'} size={24} />
              </div>
              <div className="flex-1">
                <p className={`text-lg font-light ${selectedPaymentType === 'FULL' ? 'text-white' : 'text-gray-900'}`}>
                  Pay Full Amount
                </p>
                <p className={`text-sm ${selectedPaymentType === 'FULL' ? 'text-white/80' : 'text-gray-600'} font-light`}>
                  ₹{totalAmount}
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handlePayment('ADVANCE')}
            className={`w-full p-6 border-2 rounded-2xl transition-all duration-200 text-left min-h-[100px] ${
              selectedPaymentType === 'ADVANCE'
                ? 'border-black bg-black text-white'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-full p-4 ${selectedPaymentType === 'ADVANCE' ? 'bg-white/20' : 'bg-gray-100'}`}>
                <Wallet className={selectedPaymentType === 'ADVANCE' ? 'text-white' : 'text-gray-600'} size={24} />
              </div>
              <div className="flex-1">
                <p className={`text-lg font-light ${selectedPaymentType === 'ADVANCE' ? 'text-white' : 'text-gray-900'}`}>
                  Pay Advance
                </p>
                <p className={`text-sm ${selectedPaymentType === 'ADVANCE' ? 'text-white/80' : 'text-gray-600'} font-light`}>
                  ₹{advanceAmount.toFixed(0)} (30% of total)
                </p>
                <p className={`text-xs mt-1 ${selectedPaymentType === 'ADVANCE' ? 'text-white/70' : 'text-gray-500'} font-light`}>
                  Pay remaining at salon
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {selectedPaymentType && (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h3 className="text-xl font-light text-gray-900 mb-4 flex items-center gap-2">
              <Shield size={20} />
              Payment Method
            </h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    method.available
                      ? 'border-gray-200 hover:border-black cursor-pointer'
                      : 'border-gray-100 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{method.icon}</div>
                    <div className="flex-1">
                      <p className="font-light text-lg text-gray-900">{method.name}</p>
                      <p className="text-sm text-gray-500 font-light">{method.description}</p>
                    </div>
                    {!method.available && (
                      <span className="text-xs text-gray-400 font-light">Coming Soon</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <button
              onClick={() => onPaymentInitiate(selectedPaymentType)}
              className="w-full bg-black text-white py-4 rounded-full font-light text-lg hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Pay ₹{selectedPaymentType === 'FULL' ? totalAmount : Math.round(totalAmount * 0.3)} Now
            </button>
            <p className="text-xs text-gray-500 text-center mt-4 font-light">
              Click to proceed with payment
            </p>
          </div>
        </>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Shield className="text-blue-600 mt-0.5" size={20} />
          <div>
            <p className="text-sm text-blue-900 font-light">
              <strong className="font-medium">Secure Payment:</strong> Your payment is processed securely through PhonePe. 
              We never store your card or UPI details.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
