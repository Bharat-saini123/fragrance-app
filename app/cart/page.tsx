'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Minus, Plus, X, ShoppingBag, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'cart' | 'address'>('cart')

  const handleCheckout = async () => {
    if (!user) { router.push('/login'); return }
    if (step === 'cart') { setStep('address'); return }
    if (!address.trim()) return

    setLoading(true)
    const orderItems = items.map(i => ({
      product_id: i.product.id,
      product_name: i.product.name,
      quantity: i.quantity,
      price: i.product.price,
    }))

    const { error } = await supabase.from('orders').insert({
      user_id: user.id,
      user_email: user.email,
      status: 'pending',
      total,
      items: orderItems,
      shipping_address: address,
    })

    if (!error) {
      clearCart()
      router.push('/orders?success=true')
    }
    setLoading(false)
  }

  if (items.length === 0) return (
    <main style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ paddingTop: '120px', textAlign: 'center', padding: '180px 24px' }}>
        <ShoppingBag size={64} strokeWidth={1} style={{ margin: '0 auto 24px', display: 'block', color: 'var(--gold-light)' }} />
        <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '36px', fontWeight: 300, marginBottom: '16px' }}>Your bag is empty</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>Discover our curated collection of rare fragrances</p>
        <Link href="/products" className="btn-gold">Explore Collection</Link>
      </div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ paddingTop: '100px' }}>
        <div style={{ background: 'var(--dark)', padding: '48px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, transparent 70%)' }} />
          <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: 'clamp(2rem,4vw,3.5rem)', fontWeight: 300, color: 'var(--cream)', position: 'relative', zIndex: 1 }}>
            {step === 'cart' ? 'Shopping Bag' : 'Shipping Details'}
          </h1>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '48px' }}>

            {/* Left: Items or Address */}
            <div>
              {step === 'cart' ? (
                <div>
                  {items.map(item => (
                    <div key={item.product.id} style={{ display: 'flex', gap: '20px', padding: '24px 0', borderBottom: '1px solid #E8DFD0', alignItems: 'center' }}>
                      <div style={{ width: '100px', height: '100px', background: '#F9F5EE', flexShrink: 0, overflow: 'hidden' }}>
                        {item.product.image_url ? (
                          <img src={item.product.image_url} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ height: '100%', background: '#F0EBE1' }} />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{item.product.category}</div>
                        <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '20px', fontWeight: 300, marginBottom: '8px' }}>{item.product.name}</h3>
                        <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '18px', color: 'var(--muted)' }}>₹{item.product.price.toLocaleString()}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E8DFD0', background: 'white' }}>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
                            <Minus size={12} />
                          </button>
                          <span style={{ width: '36px', textAlign: 'center', fontSize: '14px' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
                            <Plus size={12} />
                          </button>
                        </div>
                        <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '18px', minWidth: '80px', textAlign: 'right' }}>
                          ₹{(item.product.price * item.quantity).toLocaleString()}
                        </div>
                        <button onClick={() => removeItem(item.product.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px' }}>
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <button onClick={() => setStep('cart')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', padding: 0 }}>
                    ← Back to Cart
                  </button>
                  <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '24px', fontWeight: 300, marginBottom: '24px' }}>Delivery Address</h3>
                  <textarea value={address} onChange={e => setAddress(e.target.value)}
                    placeholder="Enter your complete delivery address including flat/house number, street, city, state, pincode..."
                    rows={5} style={{ resize: 'vertical', fontFamily: 'Jost', border: '1px solid #E8DFD0', padding: '16px', width: '100%', fontSize: '14px', color: 'var(--dark)', background: 'white', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                    onBlur={e => e.target.style.borderColor = '#E8DFD0'}
                  />
                </div>
              )}
            </div>

            {/* Right: Summary */}
            <div>
              <div style={{ background: 'white', padding: '32px', border: '1px solid #E8DFD0', position: 'sticky', top: '120px' }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '22px', fontWeight: 300, marginBottom: '24px' }}>Order Summary</h3>
                {items.map(i => (
                  <div key={i.product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px', color: 'var(--muted)' }}>
                    <span>{i.product.name} × {i.quantity}</span>
                    <span>₹{(i.product.price * i.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #E8DFD0', paddingTop: '16px', marginTop: '16px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: 'var(--muted)' }}>
                    <span>Subtotal</span><span>₹{total.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--muted)' }}>
                    <span>Shipping</span><span style={{ color: '#059669' }}>Free</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E8DFD0' }}>
                    <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '20px' }}>Total</span>
                    <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '20px' }}>₹{total.toLocaleString()}</span>
                  </div>
                </div>
                <button onClick={handleCheckout} disabled={loading || (step === 'address' && !address.trim())}
                  className="btn-gold" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Placing Order...' : step === 'cart' ? <><span>Proceed to Checkout</span><ArrowRight size={14} /></> : 'Place Order'}
                </button>
                {!user && (
                  <p style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center', marginTop: '12px' }}>
                    <Link href="/login" style={{ color: 'var(--gold)' }}>Sign in</Link> to place your order
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
