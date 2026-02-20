'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, GripVertical, ChevronDown, ChevronRight } from 'lucide-react'
import { setUserRole } from '@/lib/auth'

interface SubCategory {
  id: string
  name: string
  slug: string
  description?: string | null
  imageUrl?: string | null
  order: number
  services: { id: string }[]
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  order: number
  isActive: boolean
  services: { id: string }[]
  subcategories: SubCategory[]
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [subModal, setSubModal] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Category | null>(null)
  const [editingSub, setEditingSub] = useState<SubCategory | null>(null)
  const [parentCategory, setParentCategory] = useState<Category | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [form, setForm] = useState({ name: '', slug: '', description: '', order: 0 })
  const [subForm, setSubForm] = useState({ name: '', slug: '', description: '', order: 0, imageUrl: '' })
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    setUserRole('ADMIN')
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch {
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', slug: '', description: '', order: categories.length })
    setModal('add')
  }

  const openEdit = (cat: Category) => {
    setEditing(cat)
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      order: cat.order,
    })
    setModal('edit')
  }

  const openAddSub = (cat: Category) => {
    setParentCategory(cat)
    setEditingSub(null)
    setSubForm({
      name: '',
      slug: '',
      description: '',
      order: cat.subcategories?.length ?? 0,
      imageUrl: '',
    })
    setSubModal('add')
    setExpanded((prev) => new Set(prev).add(cat.id))
  }

  const openEditSub = (sub: SubCategory, cat: Category) => {
    setParentCategory(cat)
    setEditingSub(sub)
    setSubForm({
      name: sub.name,
      slug: sub.slug,
      description: sub.description || '',
      order: sub.order,
      imageUrl: sub.imageUrl || '',
    })
    setSubModal('edit')
    setExpanded((prev) => new Set(prev).add(cat.id))
  }

  const handleSlugFromName = (isSub = false) => {
    if (isSub) {
      setSubForm((f) => ({
        ...f,
        slug: f.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      }))
    } else {
      setForm((f) => ({
        ...f,
        slug: f.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      }))
    }
  }

  const handleSubImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.set('file', file)
      formData.set('type', 'subcategory')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setSubForm((f) => ({ ...f, imageUrl: data.url || '' }))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal === 'add') {
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error((await res.json()).error)
      } else if (editing) {
        const res = await fetch(`/api/admin/categories/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error((await res.json()).error)
      }
      setModal(null)
      fetchCategories()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSub = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!parentCategory) return
    setSaving(true)
    try {
      if (subModal === 'add') {
        const res = await fetch('/api/admin/subcategories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categoryId: parentCategory.id,
            ...subForm,
          }),
        })
        if (!res.ok) throw new Error((await res.json()).error)
      } else if (editingSub) {
        const res = await fetch(`/api/admin/subcategories/${editingSub.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subForm),
        })
        if (!res.ok) throw new Error((await res.json()).error)
      }
      setSubModal(null)
      setParentCategory(null)
      fetchCategories()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (cat: Category) => {
    const subCount = cat.subcategories?.length ?? 0
    const directServices = (cat.services?.length ?? 0) - (cat.subcategories?.reduce((s, sub) => s + (sub.services?.length ?? 0), 0) ?? 0)
    if (subCount > 0 || directServices > 0) {
      alert('Cannot delete category with subcategories or services. Move or delete them first.')
      return
    }
    if (!confirm(`Delete "${cat.name}"?`)) return
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      fetchCategories()
    } catch {
      alert('Failed to delete')
    }
  }

  const handleDeleteSub = async (sub: SubCategory) => {
    if ((sub.services?.length ?? 0) > 0) {
      alert('Cannot delete subcategory with services. Move or delete services first.')
      return
    }
    if (!confirm(`Delete "${sub.name}"?`)) return
    try {
      const res = await fetch(`/api/admin/subcategories/${sub.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      fetchCategories()
      setSubModal(null)
    } catch {
      alert('Failed to delete')
    }
  }

  const totalServices = (cat: Category) => {
    const direct = cat.services?.length ?? 0
    const fromSubs = cat.subcategories?.reduce((s, sub) => s + (sub.services?.length ?? 0), 0) ?? 0
    return direct + fromSubs
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Menu / Categories</h1>
                <p className="text-gray-600 text-sm">Manage categories and subcategories (Hair → Hair Colour, Hair Wash, etc.)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={openAdd}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <Plus size={18} />
              Add Category
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">No categories yet.</p>
            <button
              type="button"
              onClick={openAdd}
              className="text-primary-600 font-medium hover:underline"
            >
              Add your first category
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {categories.map((cat) => {
                const subs = cat.subcategories ?? []
                const isExpanded = expanded.has(cat.id)
                return (
                  <li key={cat.id}>
                    <div className="flex items-center gap-2 px-6 py-4 hover:bg-gray-50">
                      <button
                        type="button"
                        onClick={() => toggleExpand(cat.id)}
                        className="p-1 rounded hover:bg-gray-200 text-gray-500"
                      >
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                      <GripVertical size={18} className="text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{cat.name}</p>
                        <p className="text-sm text-gray-500">
                          {cat.slug} · {totalServices(cat)} services
                          {subs.length > 0 && ` · ${subs.length} subcategories`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openAddSub(cat)}
                          className="p-2 rounded-lg hover:bg-primary-50 text-primary-600"
                          title="Add subcategory"
                        >
                          <Plus size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(cat)}
                          className="p-2 rounded-lg hover:bg-gray-200 text-gray-600"
                          title="Edit category"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          className="p-2 rounded-lg hover:bg-red-100 text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    {isExpanded && subs.length > 0 && (
                      <ul className="bg-gray-50 border-t border-gray-100 divide-y divide-gray-100">
                        {subs.map((sub) => (
                          <li key={sub.id} className="flex items-center gap-4 pl-14 pr-6 py-3">
                            {sub.imageUrl && (
                              <img src={sub.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800">{sub.name}</p>
                              <p className="text-xs text-gray-500">{sub.slug} · {sub.services?.length ?? 0} services</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEditSub(sub, cat)}
                                className="p-1.5 rounded hover:bg-gray-200 text-gray-600"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSub(sub)}
                                className="p-1.5 rounded hover:bg-red-100 text-red-600"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    {isExpanded && subs.length === 0 && (
                      <div className="bg-gray-50 border-t border-gray-100 pl-14 pr-6 py-4">
                        <p className="text-sm text-gray-500 mb-2">No subcategories yet.</p>
                        <button
                          type="button"
                          onClick={() => openAddSub(cat)}
                          className="text-primary-600 text-sm font-medium hover:underline"
                        >
                          + Add subcategory
                        </button>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Category modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {modal === 'add' ? 'Add Category' : 'Edit Category'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  onBlur={modal === 'add' ? () => handleSlugFromName(false) : undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g. Hair"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g. hair"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g. Hair cut, straightening, colour..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory modal */}
      {subModal && parentCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {subModal === 'add' ? `Add Subcategory under ${parentCategory.name}` : 'Edit Subcategory'}
            </h2>
            <form onSubmit={handleSaveSub} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={subForm.name}
                  onChange={(e) => setSubForm((f) => ({ ...f, name: e.target.value }))}
                  onBlur={subModal === 'add' ? () => handleSlugFromName(true) : undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g. Hair Colour"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={subForm.slug}
                  onChange={(e) => setSubForm((f) => ({ ...f, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g. hair-colour"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={subForm.description}
                  onChange={(e) => setSubForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g. Colouring services"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                {subForm.imageUrl ? (
                  <div className="flex items-center gap-3">
                    <img src={subForm.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover border" />
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => setSubForm((f) => ({ ...f, imageUrl: '' }))}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                      <label className="text-sm text-gray-600 cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={handleSubImageUpload} disabled={uploadingImage} />
                        {uploadingImage ? 'Uploading...' : 'Replace'}
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="block w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 text-center text-gray-500 text-sm">
                    <input type="file" accept="image/*" className="hidden" onChange={handleSubImageUpload} disabled={uploadingImage} />
                    {uploadingImage ? 'Uploading...' : 'Upload image'}
                  </label>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setSubModal(null); setParentCategory(null) }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
