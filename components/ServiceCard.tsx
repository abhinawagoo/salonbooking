'use client'

import { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { PLACEHOLDER_IMAGE } from '@/lib/placeholders'

interface ServiceCardProps {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  duration: number
  onAdd: () => void
  /** When true, show as already selected and disable add button */
  isSelected?: boolean
}

export default function ServiceCard({ name, description, price, imageUrl, duration, onAdd, isSelected = false }: ServiceCardProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200 group ${
      isSelected ? 'border-green-400 bg-green-50/50 cursor-default' : 'border-gray-200 hover:border-primary-300 hover:shadow-xl cursor-pointer'
    }`}>
      <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {imageUrl && !error ? (
          <>
            <img
              src={PLACEHOLDER_IMAGE}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover"
            />
            <img
              src={imageUrl}
              alt={name}
              className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${
                loaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
            <span className="text-primary-500 text-3xl font-light">{name.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="p-4 sm:p-5">
        <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1">{name}</h3>
        {description && (
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">{description}</p>
        )}
        <p className="text-xs text-gray-400 mb-3">{duration} min</p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 sm:pt-4 border-t border-gray-100">
          <span className="text-xl sm:text-2xl font-light text-gray-900">₹{price}</span>
          {isSelected ? (
            <div className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg bg-green-100 text-green-800 font-medium text-sm min-h-[44px]">
              <Check size={18} />
              <span>Already selected</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onAdd}
              className="bg-primary-600 text-white px-4 sm:px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm min-h-[44px] shadow-sm hover:shadow-md touch-manipulation"
            >
              <ShoppingCart size={18} />
              <span>Add to cart</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
