'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Order } from '@/lib/supabase'
import { Package, CheckCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', confirmed: 'Confirmed', shipped: 'Shipped',
  delivered: 'Delivered', cancelled: 'Cancelled'
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && user) fetchOrders()
    else if (!authLoading) setLoading(false)
  }, [user, authLoading])

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders').select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
    setOrders((data as Order[]) || [])
    setLoading(false)
  }

  if (!authLoading && !user) return (
    <main style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ paddingTop: '180px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '32px', fontWeight: 300, marginBottom: '16px' }}>Please sign in</h2>
        <Link href="/login" className="btn-gold">Sign In</Link>
      </div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ paddingTop: '100px' }}>
        <div style={{ background: 'var(--dark)', padding: '48px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, transparent 70%)' }} />
          <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: 'clamp(2rem,4vw,3.5rem)', fontWeight: 300, color: 'var(--cream)', position: 'relative', zIndex: 1 }}>My Orders</h1>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12">
          {success && (
            <div style={{ background: '#D1FAE5', border: '1px solid #059669', padding: '16px 24px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px', color: '#065F46' }}>
              <CheckCircle size={20} />
              <div>
                <div style={{ fontWeight: 500, marginBottom: '4px' }}>Order Placed Successfully!</div>
                <div style={{ fontSize: '13px' }}>We'll send you updates as your order progresses.</div>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '120px' }} />)}
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Package size={48} strokeWidth={1} style={{ margin: '0 auto 16px', display: 'block', color: 'var(--gold-light)' }} />
              <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', fontWeight: 300, marginBottom: '12px' }}>No orders yet</h3>
              <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>Start your fragrance journey today</p>
              <Link href="/products" className="btn-gold">Shop Now</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map(order => (
                <div key={order.id} style={{ background: 'white', border: '1px solid #E8DFD0', padding: '24px 28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span className={`status-badge status-${order.status}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                      <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '22px' }}>₹{order.total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ borderTop: '1px solid #F0EBE1', paddingTop: '16px' }}>
                    {(order.items as any[]).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--muted)', marginBottom: '4px' }}>
                        <span>{item.product_name} × {item.quantity}</span>
                        <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      {['pending', 'confirmed', 'shipped', 'delivered'].map((s, i) => {
                        const statuses = ['pending', 'confirmed', 'shipped', 'delivered']
                        const currentIdx = statuses.indexOf(order.status)
                        const isActive = i <= currentIdx && order.status !== 'cancelled'
                        return (
                          <div key={s} style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isActive ? 'var(--gold)' : '#E8DFD0', margin: '0 auto 4px', border: `2px solid ${isActive ? 'var(--gold)' : '#E8DFD0'}` }} />
                            <div style={{ fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: isActive ? 'var(--gold)' : 'var(--muted)' }}>{s}</div>
                          </div>
                        )
                      })}
                    </div>
                    {order.status !== 'cancelled' && (
                      <div style={{ height: '2px', background: '#E8DFD0', borderRadius: '1px', position: 'relative', marginTop: '4px' }}>
                        <div style={{
                          position: 'absolute', left: 0, top: 0, height: '100%', background: 'var(--gold)', borderRadius: '1px',
                          width: `${(['pending','confirmed','shipped','delivered'].indexOf(order.status) / 3) * 100}%`,
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--muted)' }}>
                    <span style={{ fontWeight: 500 }}>Delivery to: </span>{order.shipping_address}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
