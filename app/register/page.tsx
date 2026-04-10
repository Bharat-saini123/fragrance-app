'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true); setError('')
    const { data, error: authError } = await supabase.auth.signUp({ email: form.email, password: form.password })
    if (authError) { setError(authError.message); setLoading(false); return }
    if (data.user) {
      console.log(data.user, "user");
      await supabase.from('profiles').insert({ id: data.user.id, email: form.email, full_name: form.name, role: 'user' })
    }
    setSuccess(true); setLoading(false)
  }

  if (success) return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '42px', color: 'var(--cream)', marginBottom: '24px' }}>Itra</div>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(201,168,76,0.2)', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '24px' }}>✓</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', fontWeight: 300, color: 'var(--cream)', marginBottom: '12px' }}>Account Created</h2>
        <p style={{ fontSize: '14px', color: 'rgba(245,240,232,0.5)', marginBottom: '32px', lineHeight: 1.6 }}>Please check your email to verify your account, then sign in.</p>
        <Link href="/login" className="btn-gold">Sign In</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 50%, rgba(201,168,76,0.08) 0%, transparent 60%)' }} />
      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '42px', fontWeight: 300, color: 'var(--cream)' }}>Itra</div>
          </Link>
          <div style={{ fontSize: '10px', letterSpacing: '4px', color: 'var(--gold)', textTransform: 'uppercase', marginTop: '4px' }}>Join Us</div>
        </div>
        <div style={{ background: 'rgba(245,240,232,0.03)', border: '1px solid rgba(201,168,76,0.1)', padding: '48px 40px' }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', fontWeight: 300, color: 'var(--cream)', marginBottom: '8px' }}>Create Account</h2>
          <p style={{ fontSize: '13px', color: 'rgba(245,240,232,0.4)', marginBottom: '32px' }}>Begin your fragrance journey</p>
          {error && <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#FCA5A5', padding: '12px 16px', fontSize: '13px', marginBottom: '24px' }}>{error}</div>}
          <form onSubmit={handleRegister}>
            {[
              { label: 'Full Name', key: 'name', type: 'text' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Password', key: 'password', type: 'password' },
              { label: 'Confirm Password', key: 'confirm', type: 'password' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(245,240,232,0.5)', display: 'block', marginBottom: '8px' }}>{f.label}</label>
                <input type={f.type} value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream)', padding: '14px 16px', width: '100%', fontSize: '14px', outline: 'none', fontFamily: 'Jost', transition: 'border-color 0.3s' }}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.2)'}
                />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-gold" style={{ width: '100%', marginTop: '12px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'rgba(245,240,232,0.4)' }}>
            Already have an account? <Link href="/login" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
