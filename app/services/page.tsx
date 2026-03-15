'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ServiceCard from '@/components/ServiceCard'
import ServiceModal from '@/components/ServiceModal'
import CartBar from '@/components/CartBar'

interface Service {
  id: string
  name: string
  description?: string
  price: number
  duration: number
  imageUrl?: string
  categoryId?: string
  subCategoryId?: string
}

type ServiceWithQty = Service & { quantity: number }

interface SubCategory {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  order: number
  services: Service[]
}

interface Category {
  id: string
  name: string
  slug: string
  order: number
  services?: Service[]
  subcategories?: SubCategory[]
}

export default function ServicesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [allServices, setAllServices] = useState<Service[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null)
  const [subcategoryPopupCategory, setSubcategoryPopupCategory] = useState<Category | null>(null)
  const [selectedServices, setSelectedServices] = useState<ServiceWithQty[]>([])
  const [modalService, setModalService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedServices = sessionStorage.getItem('selectedServices')
    if (savedServices) {
      try {
        const parsed = JSON.parse(savedServices) as (Service & { quantity?: number })[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedServices(parsed.map((s) => ({ ...s, quantity: s.quantity ?? 1 })))
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
  }, [])

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)
  const selectedSubcategory = selectedCategory?.subcategories?.find((s) => s.id === selectedSubcategoryId)

  const displayServices = (() => {
    if (selectedSubcategoryId && selectedSubcategory) {
      const fromSubcategory = selectedSubcategory.services ?? []
      return fromSubcategory.length > 0
        ? fromSubcategory
        : allServices.filter((s) => s.subCategoryId === selectedSubcategoryId)
    }
    if (selectedCategoryId && selectedCategory) {
      const subs = selectedCategory.subcategories ?? []
      if (subs.length > 0) {
        return subs.flatMap((s) => s.services ?? [])
      }
      if ((selectedCategory.services ?? []).length > 0) return selectedCategory.services!
      return allServices.filter((s) => s.categoryId === selectedCategoryId)
    }
    return allServices
  })()

  const handleCategoryClick = (cat: Category) => {
    const subs = cat.subcategories ?? []
    if (subs.length > 0) {
      setSubcategoryPopupCategory(cat)
      setSelectedCategoryId(null)
      setSelectedSubcategoryId(null)
    } else {
      setSubcategoryPopupCategory(null)
      setSelectedCategoryId(cat.id)
      setSelectedSubcategoryId(null)
    }
  }

  const handleSubcategorySelect = (sub: SubCategory | null) => {
    if (subcategoryPopupCategory) {
      setSelectedCategoryId(subcategoryPopupCategory.id)
      setSelectedSubcategoryId(sub?.id ?? null)
      setSubcategoryPopupCategory(null)
    }
  }

  const handleServiceClick = (service: Service) => {
    setModalService(service)
  }

  const handleAddService = () => {
    if (!modalService) return
    setSelectedServices((prev) => {
      const existing = prev.find((s) => s.id === modalService.id)
      if (existing) {
        return prev.map((s) => (s.id === modalService.id ? { ...s, quantity: s.quantity + 1 } : s))
      }
      return [...prev, { ...modalService, quantity: 1 }]
    })
    setModalService(null)
  }

  const handleIncreaseQuantity = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, quantity: s.quantity + 1 } : s))
    )
  }

  const handleDecreaseQuantity = (serviceId: string) => {
    setSelectedServices((prev) => {
      const item = prev.find((s) => s.id === serviceId)
      if (!item) return prev
      if (item.quantity <= 1) return prev.filter((s) => s.id !== serviceId)
      return prev.map((s) => (s.id === serviceId ? { ...s, quantity: s.quantity - 1 } : s))
    })
  }

  const handleDeleteService = (serviceId: string) => {
    setSelectedServices((prev) => prev.filter((s) => s.id !== serviceId))
  }

  const handleContinue = () => {
    const totalItems = selectedServices.reduce((sum, s) => sum + s.quantity, 0)
    if (totalItems === 0) {
      alert('Please add at least one service.')
      return
    }
    sessionStorage.setItem('selectedServices', JSON.stringify(selectedServices))
    router.push('/booking/location')
  }

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price * s.quantity, 0)
  const totalItems = selectedServices.reduce((sum, s) => sum + s.quantity, 0)

  return (
    <div className={`min-h-screen bg-gray-50 ${totalItems > 0 ? 'pb-28 sm:pb-24' : ''}`}>
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Browse Services</h1>
          <p className="text-gray-600 mt-0.5 text-sm sm:text-base">Choose services for your appointment</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 pb-4">
          <button
            type="button"
            onClick={() => { setSelectedCategoryId(null); setSelectedSubcategoryId(null); setSubcategoryPopupCategory(null) }}
            className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors min-h-[32px] sm:min-h-[36px] touch-manipulation ${
              !selectedCategoryId ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors min-h-[32px] sm:min-h-[36px] touch-manipulation ${
                selectedCategoryId === cat.id ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4">
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
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4">
            {displayServices.map((service) => {
              const item = selectedServices.find((s) => s.id === service.id)
              return (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  description={service.description}
                  price={service.price}
                  duration={service.duration}
                  imageUrl={service.imageUrl}
                  onAdd={() => handleServiceClick(service)}
                  onCardClick={() => handleServiceClick(service)}
                  quantity={item?.quantity ?? 0}
                  onIncrease={() => handleIncreaseQuantity(service.id)}
                  onDecrease={() => handleDecreaseQuantity(service.id)}
                  onDelete={() => handleDeleteService(service.id)}
                />
              )
            })}
          </div>
        )}
      </div>

      {totalItems > 0 && (
        <CartBar
          itemCount={totalItems}
          totalPrice={totalPrice}
          onContinue={handleContinue}
        />
      )}

      {/* Subcategory selection popup */}
      {subcategoryPopupCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Select subcategory</h3>
              <p className="text-sm text-gray-500 mt-0.5">{subcategoryPopupCategory.name}</p>
            </div>
            <div className="overflow-y-auto flex-1 p-4 sm:p-6">
              <button
                type="button"
                onClick={() => handleSubcategorySelect(null)}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-left mb-2"
              >
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-medium">All</div>
                <div>
                  <p className="font-medium text-gray-900">All {subcategoryPopupCategory.name}</p>
                  <p className="text-xs text-gray-500">View all services in this category</p>
                </div>
              </button>
              {(subcategoryPopupCategory.subcategories ?? []).map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => handleSubcategorySelect(sub)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-left mb-2"
                >
                  {sub.imageUrl ? (
                    <img src={sub.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-medium">{sub.name.charAt(0)}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{sub.name}</p>
                    <p className="text-xs text-gray-500">{(sub.services?.length ?? 0)} services</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSubcategoryPopupCategory(null)}
                className="w-full py-2.5 text-gray-600 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {modalService && (
        <ServiceModal
          service={modalService}
          isOpen
          onClose={() => setModalService(null)}
          onAdd={handleAddService}
          quantity={selectedServices.find((s) => s.id === modalService.id)?.quantity ?? 0}
          onIncrease={() => modalService && handleIncreaseQuantity(modalService.id)}
          onDecrease={() => modalService && handleDecreaseQuantity(modalService.id)}
          onDelete={() => { modalService && handleDeleteService(modalService.id); setModalService(null) }}
        />
      )}
    </div>
  )
}
