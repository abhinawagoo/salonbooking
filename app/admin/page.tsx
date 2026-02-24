'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Image as ImageIcon, Calendar, BarChart3, Settings, Layers } from 'lucide-react'
import { setUserRole } from '@/lib/auth'

interface Service {
  id: string
  name: string
  description?: string
  price: number
  duration: number
  imageUrl?: string
  isActive: boolean
  categoryId?: string | null
  subCategoryId?: string | null
}

export default function AdminDashboard() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  useEffect(() => {
    // Set admin role when accessing admin page
    setUserRole('ADMIN')
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services')
      const data = await response.json()
      // Ensure data is an array
      if (Array.isArray(data)) {
        setServices(data)
      } else {
        console.error('Invalid data format:', data)
        setServices([])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      setServices([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
      })
      fetchServices()
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('Failed to delete service')
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/admin/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      fetchServices()
    } catch (error) {
      console.error('Error updating service:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500 text-sm mt-0.5">Services & bookings</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin/customize"
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium transition-colors min-h-[44px]"
              >
                <Settings size={18} />
                Customize
              </Link>
              <Link
                href="/admin/categories"
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium transition-colors min-h-[44px]"
              >
                <Layers size={18} />
                Categories
              </Link>
              <Link
                href="/admin/bookings"
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium transition-colors min-h-[44px]"
              >
                <Calendar size={18} />
                Bookings
              </Link>
              <Link
                href="/admin/reports"
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium transition-colors min-h-[44px]"
              >
                <BarChart3 size={18} />
                Reports
              </Link>
              <button
                type="button"
                onClick={() => { setEditingService(null); setShowModal(true) }}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 text-sm font-medium transition-colors min-h-[44px]"
              >
                <Plus size={18} />
                Add Service
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold">Services</h2>
          </div>
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : services.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No services found. Click &quot;Add Service&quot; to create one.</div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[520px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(services) && services.map((service) => (
                    <tr key={service.id}>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {service.imageUrl ? (
                            <img src={service.imageUrl} alt={service.name} className="w-12 h-12 rounded object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded bg-primary-100 flex items-center justify-center">
                              <ImageIcon className="text-primary-600" size={20} />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{service.name}</div>
                            {service.description && (
                              <div className="text-sm text-gray-500">{service.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-900">₹{service.price}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-500">{service.duration} min</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(service.id, service.isActive)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            service.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {service.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingService(service)
                              setShowModal(true)
                            }}
                            className="text-primary-600 hover:text-primary-900 p-2"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(service.id)}
                            className="text-red-600 hover:text-red-900 p-2"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Quick Stats</h2>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-600 font-medium">Total Services</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-900">{services.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-green-600 font-medium">Active</p>
              <p className="text-xl sm:text-2xl font-bold text-green-900">
                {services.filter(s => s.isActive).length}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-purple-600 font-medium">Revenue</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-900">₹0</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Link
              href="/admin/bookings"
              className="p-4 sm:p-5 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all flex items-center gap-3 sm:gap-4 min-h-[72px]"
            >
              <div className="bg-primary-100 rounded-full p-2.5 sm:p-3 shrink-0">
                <Calendar className="text-primary-600" size={22} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">View Bookings</h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">Day by day, filter by location</p>
              </div>
            </Link>
            <Link
              href="/admin/reports"
              className="p-4 sm:p-5 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all flex items-center gap-3 sm:gap-4 min-h-[72px]"
            >
              <div className="bg-primary-100 rounded-full p-2.5 sm:p-3 shrink-0">
                <BarChart3 className="text-primary-600" size={22} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Sales Reports</h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">Day, week, month, year by location</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {showModal && (
        <ServiceModal
          service={editingService}
          onClose={() => {
            setShowModal(false)
            setEditingService(null)
          }}
          onSave={() => {
            fetchServices()
            setShowModal(false)
            setEditingService(null)
          }}
        />
      )}
    </div>
  )
}

interface SubCategory {
  id: string
  name: string
  slug: string
  order: number
}

interface Category {
  id: string
  name: string
  slug: string
  order: number
  subcategories?: SubCategory[]
}

function ServiceModal({ service, onClose, onSave }: { service: Service | null; onClose: () => void; onSave: () => void }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    price: service?.price || 0,
    duration: service?.duration || 30,
    imageUrl: service?.imageUrl || '',
    categoryId: service?.categoryId ?? '',
    subCategoryId: service?.subCategoryId ?? '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))
  }, [])
  useEffect(() => {
    if (service) {
      setFormData((f) => ({
        ...f,
        categoryId: service.categoryId ?? '',
        subCategoryId: service.subCategoryId ?? '',
        imageUrl: service.imageUrl ?? '',
      }))
    }
  }, [service?.id, service?.categoryId, service?.subCategoryId, service?.imageUrl])

  const deleteImageFromStorage = async (url: string) => {
    try {
      await fetch('/api/admin/upload/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
    } catch {
      // continue
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please select an image (JPEG, PNG, WebP, GIF).')
      return
    }
    setUploadingImage(true)
    try {
      const form = new FormData()
      form.set('file', file)
      form.set('type', 'service')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setFormData((f) => ({ ...f, imageUrl: data.url || '' }))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cat = categories.find((c) => c.id === formData.categoryId)
    const subs = cat?.subcategories ?? []
    if (formData.categoryId && subs.length > 0 && !formData.subCategoryId) {
      alert('Please select a subcategory. Services belong under subcategories.')
      return
    }
    setIsSubmitting(true)
    try {
      const url = service 
        ? `/api/admin/services/${service.id}`
        : '/api/admin/services'
      
      const response = await fetch(url, {
        method: service ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save service')
      }

      onSave()
    } catch (error: any) {
      console.error('Error saving service:', error)
      alert(error.message || 'Failed to save service. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <h2 className="text-3xl font-light text-gray-900 mb-8">{service ? 'Edit Service' : 'Add New Service'}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-light text-gray-700 mb-3">Service Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all font-light text-lg"
                placeholder="e.g., Haircut & Styling"
              />
            </div>
            <div>
              <label className="block text-sm font-light text-gray-700 mb-3">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all font-light resize-none"
                rows={4}
                placeholder="Describe what this service includes..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-light text-gray-700 mb-3">Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : 0 })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all font-light text-lg"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-light text-gray-700 mb-3">Duration (minutes) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value ? parseInt(e.target.value) : 30 })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all font-light text-lg"
                  placeholder="30"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-light text-gray-700 mb-3">Category (menu)</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, subCategoryId: '' })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all font-light"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {formData.categoryId && (() => {
              const cat = categories.find((c) => c.id === formData.categoryId)
              const subs = cat?.subcategories ?? []
              if (subs.length === 0) return null
              return (
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-3">Subcategory *</label>
                  <select
                    required
                    value={formData.subCategoryId}
                    onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all font-light"
                  >
                    <option value="">Select subcategory</option>
                    {subs.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Services belong under subcategories</p>
                </div>
              )
            })()}
            <div>
              <label className="block text-sm font-light text-gray-700 mb-1">Service image</label>
              <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded mb-3 inline-block">
                Recommended: 600×450 px (4:3) or 400×300 • Min 200×150 • Max 5 MB
              </p>
              {formData.imageUrl ? (
                <div className="flex items-center gap-3">
                  <img src={formData.imageUrl} alt="" className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.imageUrl) deleteImageFromStorage(formData.imageUrl)
                        setFormData((f) => ({ ...f, imageUrl: '' }))
                      }}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove image
                    </button>
                    <label className="text-sm text-gray-600 cursor-pointer">
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                      {uploadingImage ? 'Uploading...' : 'Replace with new'}
                    </label>
                  </div>
                </div>
              ) : (
                <label className="block w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all text-center text-gray-500 text-sm">
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                  {uploadingImage ? 'Uploading...' : 'Upload image (JPEG, PNG, WebP, GIF)'}
                </label>
              )}
            </div>
            <div className="flex gap-4 justify-end pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-all font-light"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-all font-light disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : (service ? 'Update Service' : 'Create Service')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
