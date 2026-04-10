'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/lib/supabase'
import { Filter, ChevronDown } from 'lucide-react'

const STATUSES = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
const STATUS_COLORS: Record<string, string> = {
  pending: '#D97706', confirmed: '#2563EB', shipped: '#7C3AED',
  delivered: '#059669', cancelled: '#DC2626'
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => { fetchOrders() }, [filter])

  async function fetchOrders() {
    setLoading(true)
    let q = supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (filter !== 'all') q = q.eq('status', filter)
    const { data } = await q
    setOrders((data as Order[]) || [])
    setLoading(false)
  }

  async function updateStatus(orderId: string, newStatus: string) {
    setUpdatingId(orderId)
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o))
    setUpdatingId(null)
  }

  return (
    <div style={{ padding: '40px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '36px', fontWeight: 300, marginBottom: '8px' }}>Orders</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>{orders.length} orders {filter !== 'all' ? `· ${filter}` : ''}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{
              padding: '8px 20px', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Jost', border: 'none',
              background: filter === s ? 'var(--dark)' : 'white',
              color: filter === s ? 'var(--gold)' : 'var(--muted)',
              borderBottom: filter === s ? '2px solid var(--gold)' : '2px solid transparent',
              outline: '1px solid',
              outlineColor: filter === s ? 'transparent' : '#E8DFD0',
            }}>
            {s === 'all' ? 'All' : s?.charAt(0)?.toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div style={{ background: 'white', border: '1px solid #E8DFD0' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '60px', marginBottom: '8px' }} />)}
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '80px', textAlign: 'center', color: 'var(--muted)' }}>
            <Filter size={40} strokeWidth={1} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
            <p>No orders found for this filter</p>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E8DFD0', background: '#FAFAF8' }}>
                  {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Action'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <>
                    <tr key={order.id}
                      style={{ borderBottom: '1px solid #F5F0E8', cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseOver={e => (e.currentTarget.style.background = '#FAFAF8')}
                      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                      onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                      <td style={{ padding: '16px 20px', fontSize: '12px', fontFamily: 'monospace', color: 'var(--muted)' }}>
                        #{order?.id?.slice(0, 8)?.toUpperCase()}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13px' }}>{order?.user_email}</td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--muted)' }}>
                        {Array.isArray(order.items) ? order.items.length : 0} item(s)
                      </td>
                      <td style={{ padding: '16px 20px', fontFamily: 'Cormorant Garamond', fontSize: '20px' }}>
                        ₹{order.total.toLocaleString()}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span className={`status-badge status-${order.status}`}>{order.status}</span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '12px', color: 'var(--muted)' }}>
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '16px 20px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <select
                            value={order.status}
                            onChange={e => updateStatus(order.id, e.target.value)}
                            disabled={updatingId === order.id}
                            style={{
                              padding: '6px 28px 6px 10px', fontSize: '11px', letterSpacing: '1px',
                              border: '1px solid #E8DFD0', background: 'white', cursor: 'pointer',
                              fontFamily: 'Jost', color: 'var(--dark)', appearance: 'none', outline: 'none',
                              opacity: updatingId === order.id ? 0.5 : 1
                            }}>
                            {STATUSES.filter(s => s !== 'all').map(s => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                          <ChevronDown size={12} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--muted)' }} />
                        </div>
                      </td>
                    </tr>
                    {expandedId === order.id && (
                      <tr key={`${order.id}-expand`} style={{ background: '#FAFAF8' }}>
                        <td colSpan={7} style={{ padding: '16px 20px 24px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div>
                              <div style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>Order Items</div>
                              {(Array.isArray(order.items) ? order.items : []).map((item: any, i: number) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', color: 'var(--dark)' }}>
                                  <span>{item.product_name} × {item.quantity}</span>
                                  <span style={{ color: 'var(--muted)' }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                            <div>
                              <div style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>Delivery Address</div>
                              <p style={{ fontSize: '13px', color: 'var(--dark)', lineHeight: 1.6 }}>{order.shipping_address || 'Not provided'}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}
