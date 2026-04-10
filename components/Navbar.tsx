'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { ShoppingBag, User, Menu, X, LogOut, Settings } from 'lucide-react'

export default function Navbar() {
  const { user, profile, signOut, isAdmin } = useAuth()
  const { count } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenu, setUserMenu] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(245,240,232,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(201,168,76,0.2)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div>
            <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', fontWeight: 300, color: 'var(--dark)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              Itra
            </div>
            <div style={{ fontSize: '9px', letterSpacing: '4px', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 400 }}>
              Luxury Perfumes
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          <Link href="/products" className="nav-link">Collection</Link>
          <Link href="/products?category=men" className="nav-link">Men</Link>
          <Link href="/products?category=women" className="nav-link">Women</Link>
          <Link href="/products?category=oud" className="nav-link">Oud</Link>
          <Link href="/about" className="nav-link">About</Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link href="/cart" style={{ position: 'relative', color: 'var(--dark)', display: 'flex' }}>
            <ShoppingBag size={20} strokeWidth={1.5} />
            {count > 0 && (
              <span style={{
                position: 'absolute', top: '-8px', right: '-8px',
                background: 'var(--gold)', color: 'var(--dark)',
                width: '18px', height: '18px', borderRadius: '50%',
                fontSize: '10px', fontWeight: 500, display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}>
                {count}
              </span>
            )}
          </Link>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenu(!userMenu)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dark)', display: 'flex' }}
            >
              <User size={20} strokeWidth={1.5} />
            </button>

            {userMenu && (
              <div style={{
                position: 'absolute', right: 0, top: '100%', marginTop: '8px',
                background: 'white', border: '1px solid #E8DFD0',
                minWidth: '180px', boxShadow: '0 10px 40px rgba(26,21,16,0.1)',
                zIndex: 100
              }}>
                {user ? (
                  <>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #E8DFD0', fontSize: '12px', color: 'var(--muted)' }}>
                      {profile?.full_name || user.email}
                    </div>
                    <Link href="/orders" onClick={() => setUserMenu(false)} style={{ display: 'block', padding: '10px 16px', fontSize: '13px', color: 'var(--dark)', textDecoration: 'none' }}>
                      My Orders
                    </Link>
                    <Link href="/profile" onClick={() => setUserMenu(false)} style={{ display: 'block', padding: '10px 16px', fontSize: '13px', color: 'var(--dark)', textDecoration: 'none' }}>
                      Profile
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px', color: 'var(--gold)', textDecoration: 'none', borderTop: '1px solid #E8DFD0' }}>
                        <Settings size={14} /> Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => { signOut(); setUserMenu(false) }}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', width: '100%', borderTop: '1px solid #E8DFD0' }}
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setUserMenu(false)} style={{ display: 'block', padding: '10px 16px', fontSize: '13px', color: 'var(--dark)', textDecoration: 'none' }}>
                      Sign In
                    </Link>
                    <Link href="/register" onClick={() => setUserMenu(false)} style={{ display: 'block', padding: '10px 16px', fontSize: '13px', color: 'var(--dark)', textDecoration: 'none' }}>
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dark)' }}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{ background: 'var(--cream)', borderTop: '1px solid #E8DFD0', padding: '20px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {['Collection', 'Men', 'Women', 'Oud', 'About'].map(item => (
              <Link key={item} href={`/products${item !== 'Collection' && item !== 'About' ? `?category=${item.toLowerCase()}` : item === 'About' ? '#' : ''}`}
                className="nav-link" onClick={() => setMenuOpen(false)} style={{ fontSize: '14px' }}>
                {item}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
