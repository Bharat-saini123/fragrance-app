'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/lib/supabase'
import { useCart } from '@/context/CartContext'
import { ArrowRight, Star, Sparkles, Wind } from 'lucide-react'
import Navbar from '@/components/Navbar'

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const handleAdd = () => { addItem(product); setAdded(true); setTimeout(() => setAdded(false), 1500) }
  return (
    <div className="product-card">
      <div style={{ position: 'relative', overflow: 'hidden', height: '300px', background: '#F9F5EE' }}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }}
            onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')} />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
            <Sparkles size={40} strokeWidth={1} style={{ color: 'var(--gold-light)' }} />
          </div>
        )}
        {product.featured && (
          <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'var(--gold)', color: 'var(--dark)', padding: '4px 10px', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase' }}>Featured</div>
        )}
      </div>
      <div style={{ padding: '20px' }}>
        <div style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '6px' }}>{product.category}</div>
        <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '20px', fontWeight: 300, marginBottom: '8px' }}>{product.name}</h3>
        <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{product.description}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '22px' }}>₹{product.price.toLocaleString()}</span>
          <button className="btn-gold" style={{ padding: '8px 20px', fontSize: '11px' }} onClick={handleAdd}>{added ? '✓ Added' : 'Add to Bag'}</button>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    supabase.from('products').select('*').eq('featured', true).limit(6).then(({ data }) => { setFeatured(data || []); setLoading(false) })
  }, [])

  return (
    <main>
      <Navbar />
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'var(--dark)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(201,168,76,0.12) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', right: '-100px', top: '50%', transform: 'translateY(-50%)', width: '600px', height: '600px', borderRadius: '50%', border: '1px solid rgba(201,168,76,0.1)' }} />
        <div style={{ position: 'absolute', right: '-50px', top: '50%', transform: 'translateY(-50%)', width: '400px', height: '400px', borderRadius: '50%', border: '1px solid rgba(201,168,76,0.15)' }} />
        <div className="max-w-7xl mx-auto px-6 py-32" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '680px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '4px', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '24px' }}>Est. 2024 · Crafted in India</div>
            <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: 'clamp(3.5rem,8vw,7rem)', fontWeight: 300, color: 'var(--cream)', lineHeight: 1.05, marginBottom: '24px' }}>
              The Art of<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Rare Scent</em>
            </h1>
            <p style={{ fontSize: '16px', color: 'rgba(245,240,232,0.6)', lineHeight: 1.8, maxWidth: '480px', marginBottom: '48px' }}>
              Discover extraordinary fragrances from the world's most precious ingredients. Each bottle is a journey, each scent a memory.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link href="/products" className="btn-gold">Explore Collection</Link>
              <Link href="/products?category=oud" className="btn-outline" style={{ borderColor: 'rgba(201,168,76,0.5)', color: 'var(--gold)' }}>Discover Oud</Link>
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontSize: '9px', letterSpacing: '3px', color: 'rgba(201,168,76,0.6)', textTransform: 'uppercase' }}>Scroll</div>
          <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, rgba(201,168,76,0.6), transparent)' }} />
        </div>
      </section>

      <section style={{ background: 'white', padding: '80px 24px' }}>
        <div className="max-w-7xl mx-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px' }}>
          {[{ icon: <Star size={20} strokeWidth={1.5} />, t: 'Premium Quality', d: 'Sourced from the finest perfumers worldwide' },
            { icon: <Wind size={20} strokeWidth={1.5} />, t: 'Long Lasting', d: 'Fragrances that linger from dusk till dawn' },
            { icon: <Sparkles size={20} strokeWidth={1.5} />, t: 'Unique Blends', d: 'Exclusive compositions found nowhere else' },
            { icon: <ArrowRight size={20} strokeWidth={1.5} />, t: 'Fast Delivery', d: 'Delivered with care across India' }
          ].map((f, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--gold)', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '18px', fontWeight: 400, marginBottom: '8px' }}>{f.t}</h3>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '100px 24px', background: 'var(--cream)' }}>
        <div className="max-w-7xl mx-auto">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="section-subtitle">Curated Selection</div>
            <div className="divider" />
            <h2 className="section-title">Featured Fragrances</h2>
          </div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '480px' }} />)}
            </div>
          ) : featured.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--muted)' }}>
              <Sparkles size={48} strokeWidth={1} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
              <p>Products will appear here once added from admin panel</p>
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: '64px' }}>
            <Link href="/products" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>View All <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--dark)', padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-subtitle">The Itra Promise</div>
          <div className="divider" />
          <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: 'clamp(2.5rem,5vw,5rem)', fontWeight: 300, color: 'var(--cream)', marginBottom: '24px' }}>
            Scent is the Closest<br />Thing to <em style={{ color: 'var(--gold)' }}>Memory</em>
          </h2>
          <Link href="/products" className="btn-gold">Shop Now</Link>
        </div>
      </section>

      <footer style={{ background: '#0F0C09', padding: '60px 24px 30px' }}>
        <div className="max-w-7xl mx-auto">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '40px', marginBottom: '48px' }}>
            <div>
              <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', fontWeight: 300, color: 'var(--cream)', marginBottom: '8px' }}>Itra</div>
              <p style={{ fontSize: '12px', color: 'rgba(245,240,232,0.4)', lineHeight: 1.8 }}>Luxury fragrances curated for the discerning soul.</p>
            </div>
            {[{ t: 'Shop', links: ['All Fragrances', 'Men', 'Women', 'Oud'] }, { t: 'Account', links: ['Sign In', 'Register', 'My Orders'] }].map(col => (
              <div key={col.t}>
                <div style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '16px' }}>{col.t}</div>
                {col.links.map(l => <div key={l} style={{ marginBottom: '8px' }}><Link href="/products" style={{ fontSize: '13px', color: 'rgba(245,240,232,0.4)', textDecoration: 'none' }}>{l}</Link></div>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(245,240,232,0.05)', paddingTop: '24px', textAlign: 'center', fontSize: '12px', color: 'rgba(245,240,232,0.2)' }}>
            © 2024 Itra. All rights reserved. Made with love in India.
          </div>
        </div>
      </footer>
    </main>
  )
}
