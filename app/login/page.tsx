'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(201,168,76,0.08) 0%, transparent 60%)' }} />
      <div style={{ position: 'absolute', right: '-200px', top: '50%', transform: 'translateY(-50%)', width: '700px', height: '700px', borderRadius: '50%', border: '1px solid rgba(201,168,76,0.06)' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '42px', fontWeight: 300, color: 'var(--cream)', letterSpacing: '-0.02em' }}>Itra</div>
          </Link>
          <div style={{ fontSize: '10px', letterSpacing: '4px', color: 'var(--gold)', textTransform: 'uppercase', marginTop: '4px' }}>Welcome Back</div>
        </div>

        <div style={{ background: 'rgba(245,240,232,0.03)', border: '1px solid rgba(201,168,76,0.1)', padding: '48px 40px' }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', fontWeight: 300, color: 'var(--cream)', marginBottom: '8px' }}>Sign In</h2>
          <p style={{ fontSize: '13px', color: 'rgba(245,240,232,0.4)', marginBottom: '32px' }}>Enter your credentials to continue</p>

          {error && (
            <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#FCA5A5', padding: '12px 16px', fontSize: '13px', marginBottom: '24px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(245,240,232,0.5)', display: 'block', marginBottom: '8px' }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream)', padding: '14px 16px', width: '100%', fontSize: '14px', outline: 'none', fontFamily: 'Jost', transition: 'border-color 0.3s' }}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.2)'}
              />
            </div>
            <div style={{ marginBottom: '32px', position: 'relative' }}>
              <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(245,240,232,0.5)', display: 'block', marginBottom: '8px' }}>Password</label>
              <input
                type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream)', padding: '14px 48px 14px 16px', width: '100%', fontSize: '14px', outline: 'none', fontFamily: 'Jost', transition: 'border-color 0.3s' }}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.2)'}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '14px', top: '42px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,240,232,0.4)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="btn-gold" style={{ width: '100%', textAlign: 'center', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'rgba(245,240,232,0.4)' }}>
            Don't have an account?{' '}
            <Link href="/register" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Create one</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
