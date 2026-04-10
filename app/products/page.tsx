'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/lib/supabase'
import { useCart } from '@/context/CartContext'
import { Sparkles, Search } from 'lucide-react'
import Navbar from '@/components/Navbar'

const CATEGORIES = ['all', 'men', 'women', 'oud', 'unisex', 'gift']

function ProductsContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [search, setSearch] = useState('')
  const { addItem } = useCart()
  const [addedId, setAddedId] = useState<string | null>(null)

  useEffect(() => { fetchProducts() }, [category])

  async function fetchProducts() {
    setLoading(true)
    let query = supabase.from('products').select('*').order('created_at', { ascending: false })
    if (category !== 'all') query = query.eq('category', category)
    const { data } = await query
    setProducts(data || [])
    setLoading(false)
  }

  const filtered = products.filter(p =>
    search ? p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()) : true
  )

  const handleAdd = (product: Product) => {
    addItem(product)
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1500)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '48px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              style={{
                padding: '8px 20px', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
                cursor: 'pointer', transition: 'all 0.3s', fontFamily: 'Jost',
                background: category === cat ? 'var(--gold)' : 'transparent',
                color: category === cat ? 'var(--dark)' : 'var(--muted)',
                border: `1px solid ${category === cat ? 'var(--gold)' : '#E8DFD0'}`,
              }}>
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search fragrances..."
            style={{ paddingLeft: '36px', border: '1px solid #E8DFD0', background: 'white' }} />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: '460px' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--muted)' }}>
          <Sparkles size={48} strokeWidth={1} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
          <p style={{ fontFamily: 'Cormorant Garamond', fontSize: '24px', fontWeight: 300 }}>No fragrances found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {filtered.map(product => (
            <div key={product.id} className="product-card">
              <div style={{ height: '280px', background: '#F9F5EE', overflow: 'hidden', position: 'relative' }}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }}
                    onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')} />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={32} strokeWidth={1} style={{ color: 'var(--gold-light)' }} />
                  </div>
                )}
                {product.stock === 0 && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,21,16,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--cream)' }}>Out of Stock</span>
                  </div>
                )}
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '6px' }}>{product.category}</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '20px', fontWeight: 300, marginBottom: '8px' }}>{product.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{product.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '22px' }}>₹{product.price.toLocaleString()}</span>
                  <button className="btn-gold" style={{ padding: '8px 20px', fontSize: '11px' }}
                    disabled={product.stock === 0} onClick={() => handleAdd(product)}>
                    {addedId === product.id ? '✓ Added' : product.stock === 0 ? 'Sold Out' : 'Add to Bag'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ paddingTop: '100px' }}>
        <div style={{ background: 'var(--dark)', padding: '60px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 70%)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '10px', letterSpacing: '4px', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '16px' }}>Our</div>
            <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: 'clamp(2.5rem,5vw,5rem)', fontWeight: 300, color: 'var(--cream)' }}>Fragrance Collection</h1>
          </div>
        </div>

        <Suspense fallback={
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: '460px' }} />)}
            </div>
          </div>
        }>
          <ProductsContent />
        </Suspense>
      </div>
    </main>
  )
}
