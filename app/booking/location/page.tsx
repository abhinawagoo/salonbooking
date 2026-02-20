'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, ChevronRight } from 'lucide-react'

interface Location {
  id: string
  name: string
  slug: string
  address: string | null
}

export default function LocationPage() {
  const router = useRouter()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        setLocations(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSelect = (location: Location) => {
    sessionStorage.setItem('bookingLocation', JSON.stringify({ id: location.id, name: location.name, address: location.address }))
    router.push('/booking/date-time')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-4 text-gray-600">Loading locations...</p>
        </div>
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md text-center">
          <p className="text-gray-600">No locations available. Please try again later.</p>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="mt-6 text-gray-900 font-medium underline"
          >
            Back to home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Choose location</h1>
          <p className="text-gray-600 mt-0.5 text-sm sm:text-base">Select the salon you want to visit</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 sm:py-8">
        <div className="space-y-2 sm:space-y-3">
          {locations.map((loc) => (
            <button
              key={loc.id}
              type="button"
              onClick={() => handleSelect(loc)}
              className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 text-left hover:border-gray-300 hover:shadow-md transition-all flex items-center gap-3 sm:gap-4"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <MapPin size={24} className="text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{loc.name}</p>
                {loc.address && (
                  <p className="text-sm text-gray-500 mt-0.5">{loc.address}</p>
                )}
              </div>
              <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
