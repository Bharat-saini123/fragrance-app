'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { LayoutDashboard, Package, ShoppingBag, LogOut, Plus, ChevronRight } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut, isAdmin } = useAuth()
  console.log(user, "user");
  console.log(isAdmin, "isAdmin");
  console.log(profile, "profile");
  console.log(loading, "loading");
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Sirf redirect karo jab:
    // 1. Auth loading khatam ho gayi
    // 2. User logged in hai toh profile bhi aa gayi ho (null = fetched but not found, undefined = still fetching)
    const profileLoaded = profile !== undefined
    if (!loading && profileLoaded) {
      if (!user || !isAdmin) router.push('/')
    }
  }, [user, profile, isAdmin, loading])

  // Auth load ho raha hai ya user hai lekin profile abhi fetch ho rahi hai
  const stillLoading = loading || (user != null && profile === undefined)

  if (stillLoading) return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '32px', fontWeight: 300, color: 'var(--cream)', letterSpacing: '-0.02em' }}>Itra</div>
      <div style={{ fontSize: '10px', letterSpacing: '4px', color: 'var(--gold)', textTransform: 'uppercase' }}>Loading...</div>
    </div>
  )

  if (!user || !isAdmin) return null

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={16} strokeWidth={1.5} /> },
    { href: '/admin/products', label: 'Products', icon: <Package size={16} strokeWidth={1.5} /> },
    { href: '/admin/orders', label: 'Orders', icon: <ShoppingBag size={16} strokeWidth={1.5} /> },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', background: 'var(--dark)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50 }}>
        <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', fontWeight: 300, color: 'var(--cream)', letterSpacing: '-0.02em' }}>Itra</div>
          </Link>
          <div style={{ fontSize: '9px', letterSpacing: '3px', color: 'var(--gold)', textTransform: 'uppercase', marginTop: '4px' }}>Admin Panel</div>
        </div>

        <nav style={{ padding: '24px 16px', flex: 1 }}>
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                  marginBottom: '4px', textDecoration: 'none', transition: 'all 0.2s',
                  background: active ? 'rgba(201,168,76,0.12)' : 'transparent',
                  borderLeft: active ? '2px solid var(--gold)' : '2px solid transparent',
                  color: active ? 'var(--gold)' : 'rgba(245,240,232,0.5)',
                  fontSize: '13px', letterSpacing: '1px',
                }}>
                {item.icon}
                {item.label}
                {active && <ChevronRight size={12} style={{ marginLeft: 'auto' }} />}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '24px', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
          <div style={{ fontSize: '12px', color: 'rgba(245,240,232,0.3)', marginBottom: '12px' }}>{profile?.email}</div>
          <button onClick={() => { signOut(); router.push('/') }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,240,232,0.4)', fontSize: '13px', padding: 0 }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: '260px', flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
