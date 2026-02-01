'use client'

import { ShoppingBag } from 'lucide-react'

interface CartBarProps {
  itemCount: number
  totalPrice: number
  onContinue: () => void
}

export default function CartBar({ itemCount, totalPrice, onContinue }: CartBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-gray-100 shadow-2xl z-40 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="flex-shrink-0 bg-black rounded-full p-2.5 sm:p-3">
              <ShoppingBag className="text-white" size={20} />
            </div>
            <div className="min-w-0">
              <p className="font-light text-base sm:text-lg text-gray-900 truncate">
                {itemCount} {itemCount === 1 ? 'service' : 'services'} selected
              </p>
              <p className="text-sm text-gray-500 font-light">Total: ₹{totalPrice}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onContinue}
            className="w-full sm:w-auto bg-black text-white px-6 sm:px-10 py-3.5 sm:py-4 rounded-full font-light hover:bg-gray-800 transition-all duration-200 min-h-[48px] sm:min-h-[52px] shadow-lg hover:shadow-xl touch-manipulation flex items-center justify-center"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  )
}
