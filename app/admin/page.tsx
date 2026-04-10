'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Package, ShoppingBag, Users, TrendingUp, Clock, ArrowRight } from 'lucide-react'
import type { Order } from '@/lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [products, orders, users, allOrders] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('orders').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
      ])
      const revenue = (allOrders.data || []).reduce((sum: number, o: any) => sum + (o.total || 0), 0)
      setStats({ products: products.count || 0, orders: orders.count || 0, users: users.count || 0, revenue })
      setRecentOrders((allOrders.data as Order[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { label: 'Total Products', value: stats.products, icon: <Package size={20} strokeWidth={1.5} />, href: '/admin/products', color: 'rgba(201,168,76,0.12)' },
    { label: 'Total Orders', value: stats.orders, icon: <ShoppingBag size={20} strokeWidth={1.5} />, href: '/admin/orders', color: 'rgba(37,99,235,0.1)' },
    { label: 'Customers', value: stats.users, icon: <Users size={20} strokeWidth={1.5} />, href: '#', color: 'rgba(5,150,105,0.1)' },
    { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: <TrendingUp size={20} strokeWidth={1.5} />, href: '#', color: 'rgba(124,58,237,0.1)' },
  ]

  return (
    <div style={{ padding: '40px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '36px', fontWeight: 300, color: 'var(--dark)', marginBottom: '8px' }}>Dashboard</h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>Welcome back — here's what's happening with Itra today.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginBottom: '48px' }}>
        {statCards.map((card, i) => (
          <Link key={i} href={card.href} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'white', border: '1px solid #E8DFD0', padding: '24px', transition: 'all 0.3s', cursor: 'pointer' }}
              onMouseOver={e => (e.currentTarget.style.boxShadow = '0 8px 30px rgba(26,21,16,0.08)')}
              onMouseOut={e => (e.currentTarget.style.boxShadow = 'none')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ padding: '10px', background: card.color, color: 'var(--gold)' }}>{card.icon}</div>
              </div>
              <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '32px', fontWeight: 300, color: 'var(--dark)', marginBottom: '4px' }}>
                {loading ? <span className="skeleton" style={{ display: 'inline-block', width: '80px', height: '32px' }} /> : card.value}
              </div>
              <div style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--muted)' }}>{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '48px' }}>
        <Link href="/admin/products" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'var(--dark)', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'opacity 0.2s' }}
            onMouseOver={e => (e.currentTarget.style.opacity = '0.9')}
            onMouseOut={e => (e.currentTarget.style.opacity = '1')}>
            <div>
              <div style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '8px' }}>Quick Action</div>
              <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '22px', color: 'var(--cream)' }}>Add New Product</div>
            </div>
            <ArrowRight size={20} style={{ color: 'var(--gold)' }} />
          </div>
        </Link>
        <Link href="/admin/orders" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'white', border: '1px solid #E8DFD0', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={e => (e.currentTarget.style.boxShadow = '0 8px 30px rgba(26,21,16,0.08)')}
            onMouseOut={e => (e.currentTarget.style.boxShadow = 'none')}>
            <div>
              <div style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>Quick Action</div>
              <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '22px', color: 'var(--dark)' }}>Manage Orders</div>
            </div>
            <ArrowRight size={20} style={{ color: 'var(--muted)' }} />
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div style={{ background: 'white', border: '1px solid #E8DFD0' }}>
        <div style={{ padding: '24px 28px', borderBottom: '1px solid #E8DFD0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={16} strokeWidth={1.5} style={{ color: 'var(--muted)' }} />
            <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '20px', fontWeight: 300 }}>Recent Orders</h3>
          </div>
          <Link href="/admin/orders" style={{ fontSize: '12px', letterSpacing: '1px', color: 'var(--gold)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All <ArrowRight size={12} />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>No orders yet</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F0EBE1' }}>
                {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #F9F5EE' }}>
                  <td style={{ padding: '16px 24px', fontSize: '13px', fontFamily: 'monospace', color: 'var(--muted)' }}>#{order?.id?.slice(0, 8)?.toUpperCase()}</td>
                  <td style={{ padding: '16px 24px', fontSize: '13px' }}>{order.user_email}</td>
                  <td style={{ padding: '16px 24px', fontFamily: 'Cormorant Garamond', fontSize: '18px' }}>₹{order.total.toLocaleString()}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span className={`status-badge status-${order.status}`}>{order.status}</span>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--muted)' }}>
                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
