'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format, startOfDay, endOfDay, addDays } from 'date-fns'
import ServiceCard from '@/components/ServiceCard'
import ServiceModal from '@/components/ServiceModal'
import { ChevronRight } from 'lucide-react'
import { parseBusinessHours, getDayConfig, isWithinClosingTime } from '@/lib/slots'

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

export default function BookingServicesPage() {
  const router = useRouter()
  const [hasData, setHasData] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [allServices, setAllServices] = useState<Service[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null)
  const [subcategoryPopupCategory, setSubcategoryPopupCategory] = useState<Category | null>(null)
  const [selectedServices, setSelectedServices] = useState<ServiceWithQty[]>([])
  const [totalBump, setTotalBump] = useState(false)
  const [modalService, setModalService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [showClosingTimePopup, setShowClosingTimePopup] = useState(false)
  const [businessHoursJson, setBusinessHoursJson] = useState<string | null>(null)

  const checkWouldExceedClosing = (servicesToCheck: ServiceWithQty[]): boolean => {
    if (servicesToCheck.length === 0) return false
    const dateTime = sessionStorage.getItem('bookingDateTime')
    if (!dateTime || !businessHoursJson) return false
    const dt = JSON.parse(dateTime) as { date: string; timeSlot: string }
    const duration = servicesToCheck.reduce((sum, s) => sum + s.duration * (s.quantity ?? 1), 0)
    const businessHours = parseBusinessHours(businessHoursJson)
    const bookingDate = new Date(dt.date)
    const dayConfig = getDayConfig(businessHours, bookingDate.getDay())
    const closeTime = dayConfig.closeTime || '18:00'
    return !isWithinClosingTime(dt.timeSlot, duration, closeTime)
  }

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

    const loc = sessionStorage.getItem('bookingLocation')
    if (loc) {
      const { id } = JSON.parse(loc) as { id: string }
      const startDate = format(startOfDay(new Date()), 'yyyy-MM-dd')
      const endDate = format(endOfDay(addDays(new Date(), 30)), 'yyyy-MM-dd')
      fetch(`/api/slots/availability?startDate=${startDate}&endDate=${endDate}&locationId=${encodeURIComponent(id)}`)
        .then((r) => r.json())
        .then((data) => setBusinessHoursJson(data.businessHours ?? null))
        .catch(() => {})
    }
  }, [router])

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)
  const selectedSubcategory = selectedCategory?.subcategories?.find((s) => s.id === selectedSubcategoryId)

  const displayServices = (() => {
    if (selectedSubcategoryId && selectedSubcategory) {
      const fromSubcategory = selectedSubcategory.services ?? []
      // Use nested services from API, or fallback to filter allServices by subCategoryId
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
    const nextServices: ServiceWithQty[] = (() => {
      const prev = selectedServices
      const existing = prev.find((s) => s.id === modalService.id)
      if (existing) {
        return prev.map((s) => (s.id === modalService.id ? { ...s, quantity: s.quantity + 1 } : s))
      }
      return [...prev, { ...modalService, quantity: 1 }]
    })()
    if (checkWouldExceedClosing(nextServices)) {
      setShowClosingTimePopup(true)
      setModalService(null)
      return
    }
    setSelectedServices(nextServices)
    setTotalBump(true)
    setTimeout(() => setTotalBump(false), 400)
    setModalService(null)
  }

  const handleIncreaseQuantity = (serviceId: string) => {
    const nextServices = selectedServices.map((s) =>
      s.id === serviceId ? { ...s, quantity: (s.quantity ?? 1) + 1 } : s
    )
    if (checkWouldExceedClosing(nextServices)) {
      setShowClosingTimePopup(true)
      return
    }
    setSelectedServices(nextServices)
    setTotalBump(true)
    setTimeout(() => setTotalBump(false), 400)
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
    if (checkWouldExceedClosing(selectedServices)) {
      setShowClosingTimePopup(true)
      return
    }
    sessionStorage.setItem('selectedServices', JSON.stringify(selectedServices))
    router.push('/booking/payment')
  }

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price * s.quantity, 0)
  const totalItems = selectedServices.reduce((sum, s) => sum + s.quantity, 0)

  if (!hasData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 sm:pb-24">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Add services</h1>
          <p className="text-gray-600 mt-0.5 text-sm sm:text-base">Choose services for your appointment</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        {/* Category pills: wrap to next line, smaller on mobile (no horizontal scroll) */}
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

      {/* Bottom bar: selected count + continue - always visible on mobile */}
      <div className="fixed left-0 right-0 bottom-0 bg-white border-t border-gray-200 shadow-lg z-50 p-3 sm:p-4 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-3 min-h-[52px]">
          <p className={`text-sm sm:text-base font-medium truncate min-w-0 transition-all duration-200 ${totalBump ? 'scale-105 text-green-600' : 'scale-100 text-gray-700'}`}>
            {totalItems} {totalItems === 1 ? 'item' : 'items'} · ₹{totalPrice.toLocaleString('en-IN')}
          </p>
          <button
            type="button"
            onClick={handleContinue}
            disabled={totalItems === 0}
            className="flex-shrink-0 flex items-center justify-center gap-1.5 sm:gap-2 bg-gray-900 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium text-sm sm:text-base hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[44px] touch-manipulation"
          >
            <span className="whitespace-nowrap">Continue to payment</span>
            <ChevronRight size={18} className="sm:w-5 sm:h-5 shrink-0" />
          </button>
        </div>
      </div>

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

      {/* Closing time popup */}
      {showClosingTimePopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Please book another time</h3>
            <p className="text-gray-600 text-sm mb-4">
              Your selected appointment time and services would end <strong>after our salon closing time</strong>. We need to close on time to serve all our customers properly.
            </p>
            <p className="text-gray-500 text-xs mb-6">
              Please go back and choose an earlier time slot so your appointment can be completed before we close.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => { setShowClosingTimePopup(false); router.push('/booking/date-time') }}
                className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
              >
                Change date & time
              </button>
              <button
                type="button"
                onClick={() => setShowClosingTimePopup(false)}
                className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Reduce services
              </button>
              <button
                type="button"
                onClick={() => setShowClosingTimePopup(false)}
                className="w-full py-2 text-gray-500 text-sm hover:text-gray-700"
              >
                Close
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
