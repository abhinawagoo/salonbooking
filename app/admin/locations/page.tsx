'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin, Plus, Edit2 } from 'lucide-react'
import { setUserRole } from '@/lib/auth'

const MAX_LOCATIONS = 2

interface Location {
  id: string
  name: string
  slug: string
  address: string | null
  mobile: string | null
  imageUrl: string | null
  isActive: boolean
}

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Location | null>(null)
  const [form, setForm] = useState({ name: '', address: '', mobile: '', imageUrl: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setUserRole('ADMIN')
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/admin/locations')
      const data = await res.json()
      setLocations(Array.isArray(data) ? data : [])
    } catch {
      setLocations([])
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', address: '', mobile: '', imageUrl: '' })
    setModal('add')
  }

  const openEdit = (loc: Location) => {
    setEditing(loc)
    setForm({
      name: loc.name,
      address: loc.address || '',
      mobile: loc.mobile || '',
      imageUrl: loc.imageUrl || '',
    })
    setModal('edit')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = form.name.trim()
    if (!name) {
      alert('Location name is required')
      return
    }
    setSaving(true)
    try {
      if (modal === 'add') {
        const res = await fetch('/api/admin/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            address: form.address.trim() || undefined,
            mobile: form.mobile.trim() || undefined,
            imageUrl: form.imageUrl.trim() || undefined,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to add location')
      } else if (editing) {
        const res = await fetch(`/api/admin/locations/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            address: form.address.trim() || null,
            mobile: form.mobile.trim() || null,
            imageUrl: form.imageUrl.trim() || null,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to update location')
      }
      setModal(null)
      fetchLocations()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const canAddMore = locations.length < MAX_LOCATIONS

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/customize" className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Back to Customize">
                <ArrowLeft size={20} />
              </Link>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Locations</h1>
                <p className="text-sm text-gray-500">Max {MAX_LOCATIONS}. Names appear in booking and invoices.</p>
              </div>
            </div>
            {canAddMore && (
              <button
                type="button"
                onClick={openAdd}
                className="bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-700 flex items-center gap-2 min-h-[44px]"
              >
                <Plus size={18} />
                Add location
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : locations.length === 0 ? (
            <div className="p-8 text-center">
              <MapPin className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 mb-4">No locations yet. Add up to {MAX_LOCATIONS} salon locations.</p>
              {canAddMore && (
                <button
                  onClick={openAdd}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700"
                >
                  Add first location
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {locations.map((loc) => (
                <li key={loc.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    {loc.imageUrl ? (
                      <img src={loc.imageUrl} alt={loc.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                        <MapPin className="text-primary-600" size={20} />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{loc.name}</p>
                      {loc.address && (
                        <p className="text-sm text-gray-500">{loc.address}</p>
                      )}
                      {loc.mobile && (
                        <p className="text-sm text-gray-500">📞 {loc.mobile}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => openEdit(loc)}
                    className="p-2 rounded-lg hover:bg-gray-200 text-gray-600"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {modal === 'add' ? 'Add location' : 'Edit location'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g. Salon Downtown"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address (optional)</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g. 123 Main St"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile no. (optional)</label>
                <input
                  type="tel"
                  value={form.mobile}
                  onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com/location-image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">This image appears on the bill for this location.</p>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : modal === 'add' ? 'Add' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
