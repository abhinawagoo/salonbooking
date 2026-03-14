'use client'

import { CreditCard, Wallet, Shield, Plus, Minus, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface Service {
  id: string
  name: string
  price: number
  duration: number
  quantity?: number
}

interface PaymentScreenProps {
  services: Service[]
  totalAmount: number
  onPaymentInitiate: (paymentType: 'FULL' | 'ADVANCE', paymentMethod?: string) => void
  /** When provided, allow editing quantity. Updates services and total. */
  onServicesChange?: (services: Service[]) => void
  /** When true, briefly animate the total (e.g. scale bump) */
  totalBump?: boolean
  /** When true, disable payment buttons (e.g. when booking exceeds closing time) */
  disabled?: boolean
  /** Controlled: selected payment type from parent */
  selectedPaymentType?: 'FULL' | 'ADVANCE' | null
  /** Called when user selects Full or Advance (before Pay Now). Use to show arrival popup. */
  onPaymentTypeSelect?: (paymentType: 'FULL' | 'ADVANCE') => void
}

export default function PaymentScreen({ services, totalAmount, onPaymentInitiate, onServicesChange, totalBump = false, disabled = false, selectedPaymentType: controlledType, onPaymentTypeSelect }: PaymentScreenProps) {
  const [internalType, setInternalType] = useState<'FULL' | 'ADVANCE' | null>(null)
  const selectedPaymentType = controlledType ?? internalType
  const advanceAmount = totalAmount * 0.3 // 30% advance

  const paymentMethods = [
    {
      id: 'phonepe',
      name: 'PhonePe',
      icon: '📱',
      description: 'UPI, Cards, Wallets',
    },
  ]

  const handlePaymentTypeClick = (paymentType: 'FULL' | 'ADVANCE') => {
    if (onPaymentTypeSelect) {
      onPaymentTypeSelect(paymentType)
    } else {
      setInternalType(paymentType)
    }
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-6 shadow-sm">
        <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Booking Summary</h3>
        <div className="space-y-2 sm:space-y-3">
          {services.map((service) => {
            const qty = service.quantity ?? 1
            const lineTotal = service.price * qty
            const canEdit = !!onServicesChange
            return (
              <div key={service.id} className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[minmax(0,1fr)_auto_auto] items-center py-2 border-b border-gray-100 gap-2 sm:gap-3">
                <div className="min-w-0 overflow-hidden">
                  <p className="font-medium text-sm text-gray-900 break-words">{service.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{service.duration} min{qty > 1 ? ` · ×${qty}` : ''}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 justify-self-end">
                  {canEdit && qty > 0 ? (
                    <div className="flex items-center gap-1">
                      <div className="flex items-center rounded-full border border-gray-200 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => {
                            if (qty <= 1) return
                            const updated = services.map((s) =>
                              s.id === service.id ? { ...s, quantity: (s.quantity ?? 1) - 1 } : s
                            ).filter((s) => (s.quantity ?? 1) > 0)
                            onServicesChange(updated)
                          }}
                          className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-50"
                          aria-label="Decrease"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="min-w-[2rem] text-center text-sm font-medium">{qty}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = services.map((s) =>
                              s.id === service.id ? { ...s, quantity: (s.quantity ?? 1) + 1 } : s
                            )
                            onServicesChange(updated)
                          }}
                          className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-50"
                          aria-label="Increase"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = services.filter((s) => s.id !== service.id)
                          onServicesChange(updated)
                        }}
                        className="flex items-center justify-center w-7 h-7 rounded text-red-500 hover:bg-red-50"
                        aria-label="Remove all"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : null}
                </div>
                <p className="text-sm font-semibold text-gray-900 shrink-0 justify-self-end">₹{lineTotal.toLocaleString('en-IN')}</p>
              </div>
            )
          })}
          <div className="flex justify-between items-center pt-3 border-t-2 border-gray-200">
            <p className="text-sm sm:text-base font-semibold text-gray-900">Total</p>
            <p className={`text-base sm:text-xl font-semibold transition-all duration-200 ${totalBump ? 'scale-105 text-green-600' : 'scale-100 text-gray-900'}`}>
              ₹{totalAmount.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-6 shadow-sm">
        <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Payment Amount</h3>
        <div className="space-y-2 sm:space-y-3">
          <button
            onClick={() => !disabled && handlePaymentTypeClick('FULL')}
            disabled={disabled}
            className={`w-full p-3 sm:p-5 border-2 rounded-xl transition-all duration-200 text-left min-h-[64px] sm:min-h-[80px] touch-manipulation ${
              disabled ? 'opacity-60 cursor-not-allowed' : ''
            } ${
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
            onClick={() => !disabled && handlePaymentTypeClick('ADVANCE')}
            disabled={disabled}
            className={`w-full p-3 sm:p-5 border-2 rounded-xl transition-all duration-200 text-left min-h-[64px] sm:min-h-[80px] touch-manipulation ${
              disabled ? 'opacity-60 cursor-not-allowed' : ''
            } ${
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
                  className="p-3 sm:p-4 border-2 border-gray-200 rounded-xl transition-all hover:border-black cursor-pointer"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-xl sm:text-2xl">{method.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-light text-sm sm:text-base text-gray-900">{method.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500 font-light">{method.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-6 shadow-sm">
            <button
              onClick={() => !disabled && onPaymentInitiate(selectedPaymentType)}
              disabled={disabled}
              className={`w-full bg-black text-white py-3 rounded-full font-semibold text-base hover:bg-gray-800 transition-all duration-200 shadow-lg min-h-[48px] touch-manipulation ${
                disabled ? 'opacity-60 cursor-not-allowed' : ''
              }`}
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
