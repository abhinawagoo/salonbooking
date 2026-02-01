'use client'

import { X, Check } from 'lucide-react'
import Image from 'next/image'

interface ServiceModalProps {
  service: {
    id: string
    name: string
    description?: string
    price: number
    duration: number
    imageUrl?: string
  }
  isOpen: boolean
  onClose: () => void
  onAdd: () => void
  /** When true, show as already selected and disable add */
  isSelected?: boolean
}

export default function ServiceModal({ service, isOpen, onClose, onAdd, isSelected = false }: ServiceModalProps) {
  if (!isOpen) return null

  const handleAdd = () => {
    if (isSelected) return
    onAdd()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-video w-full bg-gray-100">
          {service.imageUrl ? (
            <Image
              src={service.imageUrl}
              alt={service.name}
              fill
              className="object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
              <span className="text-primary-600 text-4xl font-bold">{service.name.charAt(0)}</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">{service.name}</h2>
          {service.description && (
            <p className="text-gray-600 mb-4">{service.description}</p>
          )}
          <div className="flex items-center gap-4 mb-6">
            <div>
              <span className="text-sm text-gray-500">Duration</span>
              <p className="font-semibold">{service.duration} minutes</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Price</span>
              <p className="font-semibold text-primary-600 text-xl">₹{service.price}</p>
            </div>
          </div>
          {isSelected ? (
            <div className="w-full bg-green-100 text-green-800 py-3 rounded-lg font-semibold min-h-[48px] flex items-center justify-center gap-2">
              <Check size={20} />
              Already selected
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors min-h-[48px]"
            >
              Add to Booking
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
