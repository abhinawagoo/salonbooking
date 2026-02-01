'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ServiceCard from '@/components/ServiceCard'
import ServiceModal from '@/components/ServiceModal'
import { ChevronRight } from 'lucide-react'

interface Service {
  id: string
  name: string
  description?: string
  price: number
  duration: number
  imageUrl?: string
  categoryId?: string
}

interface Category {
  id: string
  name: string
  slug: string
  order: number
  services?: Service[]
}

export default function BookingServicesPage() {
  const router = useRouter()
  const [hasData, setHasData] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [allServices, setAllServices] = useState<Service[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [modalService, setModalService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const location = sessionStorage.getItem('bookingLocation')
    const dateTime = sessionStorage.getItem('bookingDateTime')
    const customer = sessionStorage.getItem('customerDetails')
    if (!location || !dateTime || !customer) {
      router.push('/booking/location')
      return
    }
    setHasData(true)
    const savedServices = sessionStorage.getItem('selectedServices')
    if (savedServices) {
      try {
        const parsed = JSON.parse(savedServices) as Service[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedServices(parsed)
        }
      } catch {
        // ignore
      }
    }
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => [])
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        setAllServices(Array.isArray(data) ? data : [])
      })
      .catch(() => [])
      .finally(() => setLoading(false))
  }, [router])

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)
  const displayServices = selectedCategoryId
    ? (selectedCategory?.services ?? []).length > 0
      ? selectedCategory!.services!
      : allServices.filter((s) => s.categoryId === selectedCategoryId)
    : allServices

  const handleServiceClick = (service: Service) => {
    setModalService(service)
  }

  const handleAddService = () => {
    if (modalService && !selectedServices.some((s) => s.id === modalService.id)) {
      setSelectedServices([...selectedServices, modalService])
    }
    setModalService(null)
  }

  const handleContinue = () => {
    if (selectedServices.length === 0) {
      alert('Please add at least one service.')
      return
    }
    sessionStorage.setItem('selectedServices', JSON.stringify(selectedServices))
    router.push('/booking/payment')
  }

  if (!hasData) {
    return null
  }

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add services</h1>
          <p className="text-gray-600 mt-1">Choose services for your appointment</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4">
          <button
            type="button"
            onClick={() => setSelectedCategoryId(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedCategoryId ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategoryId === cat.id ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 animate-pulse overflow-hidden">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayServices.map((service) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                name={service.name}
                description={service.description}
                price={service.price}
                duration={service.duration}
                imageUrl={service.imageUrl}
                onAdd={() => handleServiceClick(service)}
                isSelected={selectedServices.some((s) => s.id === service.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom bar: selected count + continue */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <p className="text-gray-700 font-medium">
            {selectedServices.length} {selectedServices.length === 1 ? 'service' : 'services'} · ₹{totalPrice}
          </p>
          <button
            type="button"
            onClick={handleContinue}
            disabled={selectedServices.length === 0}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Continue to payment
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {modalService && (
        <ServiceModal
          service={modalService}
          isOpen
          onClose={() => setModalService(null)}
          onAdd={handleAddService}
          isSelected={modalService ? selectedServices.some((s) => s.id === modalService.id) : false}
        />
      )}
    </div>
  )
}
