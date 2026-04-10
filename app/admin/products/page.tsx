'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/lib/supabase'
import { Plus, Pencil, Trash2, Upload, X, Star, StarOff, Sparkles } from 'lucide-react'

type ProductForm = {
  name: string; description: string; price: string;
  category: string; stock: string; featured: boolean
}
const EMPTY_FORM: ProductForm = { name: '', description: '', price: '', category: 'men', stock: '0', featured: false }
const CATEGORIES = ['men', 'women', 'oud', 'unisex', 'gift']

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  function openAdd() {
    setForm(EMPTY_FORM); setEditingId(null); setImageFile(null); setImagePreview(null); setError(''); setShowModal(true)
  }

  function openEdit(p: Product) {
    setForm({ name: p.name, description: p.description || '', price: String(p.price), category: p.category, stock: String(p.stock), featured: p.featured })
    setEditingId(p.id); setImagePreview(p.image_url || null); setImageFile(null); setError(''); setShowModal(true)
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function uploadImage(file: File): Promise<string | null> {
    const ext = file.name.split('.').pop()
    const path = `products/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
    if (error) { setError('Image upload failed: ' + error.message); return null }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSave() {
    if (!form.name || !form.price) { setError('Name and price are required'); return }
    setSaving(true); setError('')

    let imageUrl = editingId ? products.find(p => p.id === editingId)?.image_url || null : null
    if (imageFile) {
      imageUrl = await uploadImage(imageFile)
      if (!imageUrl) { setSaving(false); return }
    }

    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      stock: parseInt(form.stock) || 0,
      featured: form.featured,
      ...(imageUrl !== null ? { image_url: imageUrl } : {}),
    }

    if (editingId) {
      await supabase.from('products').update(payload).eq('id', editingId)
    } else {
      await supabase.from('products').insert(payload)
    }

    await fetchProducts()
    setShowModal(false)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('products').delete().eq('id', id)
    setProducts(prev => prev.filter(p => p.id !== id))
    setDeleteId(null)
  }

  async function toggleFeatured(p: Product) {
    await supabase.from('products').update({ featured: !p.featured }).eq('id', p.id)
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, featured: !p.featured } : x))
  }

  return (
    <div style={{ padding: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '36px', fontWeight: 300, marginBottom: '8px' }}>Products</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>{products.length} fragrances in collection</p>
        </div>
        <button onClick={openAdd} className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '340px' }} />)}
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px', background: 'white', border: '1px solid #E8DFD0' }}>
          <Sparkles size={48} strokeWidth={1} style={{ margin: '0 auto 16px', display: 'block', color: 'var(--gold-light)' }} />
          <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '24px', fontWeight: 300, marginBottom: '12px' }}>No products yet</h3>
          <button onClick={openAdd} className="btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={14} /> Add First Product
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {products.map(p => (
            <div key={p.id} style={{ background: 'white', border: '1px solid #E8DFD0', overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: '220px', background: '#F9F5EE', position: 'relative', overflow: 'hidden' }}>
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={32} strokeWidth={1} style={{ color: 'var(--gold-light)' }} />
                  </div>
                )}
                {p.featured && (
                  <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'var(--gold)', color: 'var(--dark)', padding: '3px 8px', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase' }}>Featured</div>
                )}
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{p.category}</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '18px', fontWeight: 300, marginBottom: '4px' }}>{p.name}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '18px' }}>₹{p.price.toLocaleString()}</span>
                  <span style={{ fontSize: '12px', color: p.stock > 0 ? '#059669' : '#DC2626', background: p.stock > 0 ? '#D1FAE5' : '#FEE2E2', padding: '2px 8px' }}>
                    {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => openEdit(p)} style={{ flex: 1, padding: '8px', border: '1px solid #E8DFD0', background: 'white', cursor: 'pointer', fontSize: '12px', color: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s', fontFamily: 'Jost' }}
                    onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)'; (e.currentTarget as HTMLElement).style.color = 'var(--gold)' }}
                    onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E8DFD0'; (e.currentTarget as HTMLElement).style.color = 'var(--dark)' }}>
                    <Pencil size={12} /> Edit
                  </button>
                  <button onClick={() => toggleFeatured(p)} title={p.featured ? 'Remove from featured' : 'Add to featured'}
                    style={{ padding: '8px 10px', border: '1px solid #E8DFD0', background: p.featured ? '#FEF3C7' : 'white', cursor: 'pointer', color: p.featured ? '#D97706' : 'var(--muted)', transition: 'all 0.2s' }}>
                    {p.featured ? <Star size={14} fill="currentColor" /> : <StarOff size={14} />}
                  </button>
                  <button onClick={() => setDeleteId(p.id)} style={{ padding: '8px 10px', border: '1px solid #E8DFD0', background: 'white', cursor: 'pointer', color: 'var(--muted)', transition: 'all 0.2s' }}
                    onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = '#DC2626'; (e.currentTarget as HTMLElement).style.color = '#DC2626' }}
                    onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E8DFD0'; (e.currentTarget as HTMLElement).style.color = 'var(--muted)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,21,16,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflow: 'auto', padding: '40px', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
              <X size={20} />
            </button>
            <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', fontWeight: 300, marginBottom: '32px' }}>
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>

            {error && <div style={{ background: '#FEE2E2', border: '1px solid #DC2626', color: '#DC2626', padding: '12px', fontSize: '13px', marginBottom: '20px' }}>{error}</div>}

            {/* Image Upload */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>Product Image</label>
              <div onClick={() => fileRef.current?.click()} style={{
                height: '180px', border: '2px dashed #E8DFD0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'border-color 0.3s', overflow: 'hidden', background: '#FAFAF8', position: 'relative'
              }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = '#E8DFD0')}>
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <Upload size={28} strokeWidth={1} style={{ color: 'var(--gold-light)', margin: '0 auto 8px', display: 'block' }} />
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Click to upload image</div>
                    <div style={{ fontSize: '11px', color: '#C0B09A', marginTop: '4px' }}>JPG, PNG, WEBP</div>
                  </div>
                )}
                {imagePreview && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,21,16,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}
                    onMouseOver={e => (e.currentTarget.style.background = 'rgba(26,21,16,0.4)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'rgba(26,21,16,0)')}>
                    <Upload size={20} style={{ color: 'white', opacity: 0 }} />
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
            </div>

            {/* Form Fields */}
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>Product Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Rose Noir" />
              </div>
              <div>
                <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Describe the fragrance..." style={{ resize: 'vertical', fontFamily: 'Jost', border: '1px solid #E8DFD0', padding: '12px 16px', width: '100%', fontSize: '14px', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = '#E8DFD0'} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="0" />
                </div>
                <div>
                  <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>Stock</label>
                  <input type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} placeholder="0" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))}
                  style={{ width: 'auto', cursor: 'pointer', accentColor: 'var(--gold)' }} />
                <label htmlFor="featured" style={{ fontSize: '13px', color: 'var(--dark)', cursor: 'pointer' }}>Featured on homepage</label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button onClick={() => setShowModal(false)} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-gold" style={{ flex: 1, opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,21,16,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: 'white', padding: '40px', maxWidth: '360px', width: '100%', textAlign: 'center' }}>
            <Trash2 size={40} strokeWidth={1} style={{ color: '#DC2626', margin: '0 auto 16px', display: 'block' }} />
            <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '24px', fontWeight: 300, marginBottom: '12px' }}>Delete Product?</h3>
            <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '28px' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeleteId(null)} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => handleDelete(deleteId!)} style={{ flex: 1, background: '#DC2626', color: 'white', border: 'none', padding: '12px', cursor: 'pointer', fontFamily: 'Jost', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '12px', transition: 'opacity 0.2s' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
