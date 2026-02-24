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
    <div className="space-y-3 sm:space-y-6">
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-6 shadow-sm">
        <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Booking Summary</h3>
        <div className="space-y-2 sm:space-y-3">
          {services.map((service) => (
            <div key={service.id} className="flex justify-between items-center py-2 border-b border-gray-100 gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-gray-900 truncate">{service.name}</p>
                <p className="text-xs text-gray-500">{service.duration} min</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 shrink-0">₹{service.price}</p>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3 border-t-2 border-gray-200">
            <p className="text-sm sm:text-base font-semibold text-gray-900">Total</p>
            <p className="text-base sm:text-xl font-semibold text-gray-900">₹{totalAmount.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-6 shadow-sm">
        <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Payment Amount</h3>
        <div className="space-y-2 sm:space-y-3">
          <button
            onClick={() => handlePayment('FULL')}
            className={`w-full p-3 sm:p-5 border-2 rounded-xl transition-all duration-200 text-left min-h-[64px] sm:min-h-[80px] touch-manipulation ${
              selectedPaymentType === 'FULL'
                ? 'border-black bg-black text-white'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`rounded-full p-2.5 sm:p-4 shrink-0 ${selectedPaymentType === 'FULL' ? 'bg-white/20' : 'bg-gray-100'}`}>
                <CreditCard className={selectedPaymentType === 'FULL' ? 'text-white' : 'text-gray-600'} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm sm:text-base font-light ${selectedPaymentType === 'FULL' ? 'text-white' : 'text-gray-900'}`}>
                  Pay Full Amount
                </p>
                <p className={`text-xs sm:text-sm ${selectedPaymentType === 'FULL' ? 'text-white/80' : 'text-gray-600'} font-light`}>
                  ₹{totalAmount.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handlePayment('ADVANCE')}
            className={`w-full p-3 sm:p-5 border-2 rounded-xl transition-all duration-200 text-left min-h-[64px] sm:min-h-[80px] touch-manipulation ${
              selectedPaymentType === 'ADVANCE'
                ? 'border-black bg-black text-white'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`rounded-full p-2.5 sm:p-4 shrink-0 ${selectedPaymentType === 'ADVANCE' ? 'bg-white/20' : 'bg-gray-100'}`}>
                <Wallet className={selectedPaymentType === 'ADVANCE' ? 'text-white' : 'text-gray-600'} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm sm:text-base font-light ${selectedPaymentType === 'ADVANCE' ? 'text-white' : 'text-gray-900'}`}>
                  Pay Advance
                </p>
                <p className={`text-xs sm:text-sm ${selectedPaymentType === 'ADVANCE' ? 'text-white/80' : 'text-gray-600'} font-light`}>
                  ₹{advanceAmount.toFixed(0)} (30%)
                </p>
                <p className={`text-xs mt-0.5 ${selectedPaymentType === 'ADVANCE' ? 'text-white/70' : 'text-gray-500'} font-light`}>
                  Pay remaining at salon
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {selectedPaymentType && (
        <>
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-6 shadow-sm">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
              <Shield size={18} className="sm:w-5 sm:h-5" />
              Payment Method
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-3 sm:p-4 border-2 rounded-xl transition-all ${
                    method.available
                      ? 'border-gray-200 hover:border-black cursor-pointer'
                      : 'border-gray-100 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-xl sm:text-2xl">{method.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-light text-sm sm:text-base text-gray-900">{method.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500 font-light">{method.description}</p>
                    </div>
                    {!method.available && (
                      <span className="text-xs text-gray-400 font-light shrink-0">Coming Soon</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-6 shadow-sm">
            <button
              onClick={() => onPaymentInitiate(selectedPaymentType)}
              className="w-full bg-black text-white py-3 rounded-full font-semibold text-base hover:bg-gray-800 transition-all duration-200 shadow-lg min-h-[48px] touch-manipulation"
            >
              Pay ₹{selectedPaymentType === 'FULL' ? totalAmount.toLocaleString('en-IN') : Math.round(totalAmount * 0.3).toLocaleString('en-IN')} Now
            </button>
            <p className="text-xs text-gray-500 text-center mt-3 sm:mt-4 font-light">
              Click to proceed with payment
            </p>
          </div>
        </>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
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
