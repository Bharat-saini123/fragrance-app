'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import { User, Mail, Edit3, Save, X, ShoppingBag, Calendar, Shield, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
    const { user, profile, loading } = useAuth()
    const router = useRouter()

    const [editing, setEditing] = useState(false)
    const [fullName, setFullName] = useState('')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [orderCount, setOrderCount] = useState(0)
    const [totalSpent, setTotalSpent] = useState(0)

    useEffect(() => {
        if (!loading && !user) router.push('/login')
    }, [user, loading])

    useEffect(() => {
        if (profile) setFullName(profile.full_name || '')
    }, [profile])

    useEffect(() => {
        if (user) fetchOrderStats()
    }, [user])

    async function fetchOrderStats() {
        const { data } = await supabase
            .from('orders')
            .select('total')
            .eq('user_id', user!.id)
        if (data) {
            setOrderCount(data.length)
            setTotalSpent(data.reduce((sum, o) => sum + (o.total || 0), 0))
        }
    }

    async function handleSave() {
        setSaving(true)
        await supabase.from('profiles').update({ full_name: fullName }).eq('id', user!.id)
        setSaving(false)
        setEditing(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    const joinedDate = user?.created_at
        ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
        : ''

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', color: 'var(--muted)', opacity: 0.5 }}>Loading...</div>
        </div>
    )

    if (!user) return null

    return (
        <main style={{ minHeight: '100vh', background: 'var(--cream)' }}>
            <Navbar />

            {/* Header */}
            <div style={{ paddingTop: '100px' }}>
                <div style={{ background: 'var(--dark)', padding: '60px 24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.1) 0%, transparent 60%)' }} />
                    <div style={{ position: 'absolute', right: '-100px', top: '50%', transform: 'translateY(-50%)', width: '500px', height: '500px', borderRadius: '50%', border: '1px solid rgba(201,168,76,0.08)' }} />
                    <div style={{ position: 'absolute', right: '-60px', top: '50%', transform: 'translateY(-50%)', width: '320px', height: '320px', borderRadius: '50%', border: '1px solid rgba(201,168,76,0.12)' }} />

                    <div className="max-w-4xl mx-auto" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '28px' }}>
                        {/* Avatar */}
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '32px', fontWeight: 300, color: 'var(--gold)' }}>
                                {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                            </span>
                        </div>

                        <div>
                            <div style={{ fontSize: '10px', letterSpacing: '4px', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '8px' }}>
                                {profile?.role === 'admin' ? 'Administrator' : 'Member'}
                            </div>
                            <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 300, color: 'var(--cream)', lineHeight: 1.1 }}>
                                {profile?.full_name || 'My Profile'}
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                                <Calendar size={12} style={{ color: 'rgba(245,240,232,0.4)' }} />
                                <span style={{ fontSize: '12px', color: 'rgba(245,240,232,0.4)' }}>Member since {joinedDate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div style={{ background: 'white', borderBottom: '1px solid #E8DFD0' }}>
                    <div className="max-w-4xl mx-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center' }}>
                        {[
                            { label: 'Total Orders', value: orderCount },
                            { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}` },
                            { label: 'Account Type', value: profile?.role === 'admin' ? 'Admin' : 'Standard' },
                        ].map((stat, i) => (
                            <div key={i} style={{ padding: '24px', borderRight: i < 2 ? '1px solid #E8DFD0' : 'none' }}>
                                <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', fontWeight: 300, color: 'var(--dark)', marginBottom: '4px' }}>{stat.value}</div>
                                <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-12">

                {/* Success Toast */}
                {saved && (
                    <div style={{ background: '#D1FAE5', border: '1px solid rgba(5,150,105,0.3)', padding: '14px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: '#065F46' }}>
                        <CheckCircle size={16} />
                        <span style={{ fontSize: '14px' }}>Profile updated successfully</span>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>

                    {/* Left: Profile Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Personal Info Card */}
                        <div style={{ background: 'white', border: '1px solid #E8DFD0', padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                                <div>
                                    <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '6px' }}>Account</div>
                                    <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '24px', fontWeight: 300 }}>Personal Information</h2>
                                </div>
                                {!editing ? (
                                    <button onClick={() => setEditing(true)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', border: '1px solid #E8DFD0', background: 'white', cursor: 'pointer', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Jost', color: 'var(--dark)', transition: 'all 0.2s' }}
                                        onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)'; (e.currentTarget as HTMLElement).style.color = 'var(--gold)' }}
                                        onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E8DFD0'; (e.currentTarget as HTMLElement).style.color = 'var(--dark)' }}>
                                        <Edit3 size={12} /> Edit
                                    </button>
                                ) : (
                                    <button onClick={() => { setEditing(false); setFullName(profile?.full_name || '') }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', border: '1px solid #E8DFD0', background: 'white', cursor: 'pointer', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Jost', color: 'var(--muted)' }}>
                                        <X size={12} /> Cancel
                                    </button>
                                )}
                            </div>

                            {/* Name Field */}
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <User size={13} style={{ color: 'var(--muted)' }} />
                                    <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>Full Name</label>
                                </div>
                                {editing ? (
                                    <input
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        placeholder="Enter your full name"
                                        style={{ border: '1px solid #E8DFD0', padding: '12px 16px', width: '100%', fontSize: '15px', fontFamily: 'Cormorant Garamond', fontWeight: 300, color: 'var(--dark)', outline: 'none', background: 'white', transition: 'border-color 0.3s' }}
                                        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                                        onBlur={e => e.target.style.borderColor = '#E8DFD0'}
                                    />
                                ) : (
                                    <div style={{ padding: '12px 0', fontFamily: 'Cormorant Garamond', fontSize: '20px', fontWeight: 300, color: profile?.full_name ? 'var(--dark)' : 'var(--muted)', borderBottom: '1px solid #F0EBE1' }}>
                                        {profile?.full_name || <em style={{ fontStyle: 'italic', fontSize: '16px' }}>Not set</em>}
                                    </div>
                                )}
                            </div>

                            {/* Email Field (read-only) */}
                            <div style={{ marginBottom: editing ? '28px' : '0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <Mail size={13} style={{ color: 'var(--muted)' }} />
                                    <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>Email Address</label>
                                </div>
                                <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F0EBE1' }}>
                                    <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '18px', fontWeight: 300, color: 'var(--dark)' }}>{user.email}</span>
                                    <span style={{ fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--muted)', background: '#F0EBE1', padding: '3px 8px' }}>Verified</span>
                                </div>
                            </div>

                            {editing && (
                                <button onClick={handleSave} disabled={saving} className="btn-gold"
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1 }}>
                                    <Save size={14} />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            )}
                        </div>

                        {/* Change Password Card */}
                        <div style={{ background: 'white', border: '1px solid #E8DFD0', padding: '32px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '6px' }}>Security</div>
                                <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '24px', fontWeight: 300 }}>Password</h2>
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '20px' }}>
                                To change your password, we'll send a reset link to your registered email address.
                            </p>
                            <button
                                onClick={async () => {
                                    await supabase.auth.resetPasswordForEmail(user.email!, { redirectTo: `${window.location.origin}/reset-password` })
                                    alert('Password reset email sent! Please check your inbox.')
                                }}
                                className="btn-outline" style={{ fontSize: '12px' }}>
                                Send Reset Link
                            </button>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Account Badge */}
                        <div style={{ background: 'var(--dark)', padding: '28px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', border: '1px solid rgba(201,168,76,0.15)' }} />
                            <div style={{ position: 'absolute', bottom: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', border: '1px solid rgba(201,168,76,0.08)' }} />
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <Shield size={20} strokeWidth={1.5} style={{ color: 'var(--gold)', marginBottom: '12px' }} />
                                <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '20px', fontWeight: 300, color: 'var(--cream)', marginBottom: '6px' }}>
                                    {profile?.role === 'admin' ? 'Admin Account' : 'Itra Member'}
                                </div>
                                <div style={{ fontSize: '12px', color: 'rgba(245,240,232,0.4)', lineHeight: 1.6 }}>
                                    {profile?.role === 'admin'
                                        ? 'Full access to admin panel and store management'
                                        : 'Enjoy exclusive access to our curated fragrance collection'}
                                </div>
                                {profile?.role === 'admin' && (
                                    <Link href="/admin" className="btn-gold" style={{ display: 'inline-block', marginTop: '16px', fontSize: '11px', padding: '8px 20px' }}>
                                        Go to Admin →
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div style={{ background: 'white', border: '1px solid #E8DFD0', padding: '28px' }}>
                            <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '20px' }}>Quick Links</div>
                            {[
                                { icon: <ShoppingBag size={15} strokeWidth={1.5} />, label: 'My Orders', sub: `${orderCount} order${orderCount !== 1 ? 's' : ''}`, href: '/orders' },
                                { icon: <User size={15} strokeWidth={1.5} />, label: 'Browse Collection', sub: 'Explore fragrances', href: '/products' },
                            ].map((link, i) => (
                                <Link key={i} href={link.href} style={{ textDecoration: 'none' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0', borderBottom: i === 0 ? '1px solid #F0EBE1' : 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
                                        onMouseOver={e => (e.currentTarget.style.opacity = '0.7')}
                                        onMouseOut={e => (e.currentTarget.style.opacity = '1')}>
                                        <div style={{ width: '36px', height: '36px', background: '#F9F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', flexShrink: 0 }}>
                                            {link.icon}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '14px', color: 'var(--dark)', fontWeight: 300 }}>{link.label}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{link.sub}</div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Account Info */}
                        <div style={{ background: '#F9F5EE', border: '1px solid #E8DFD0', padding: '24px' }}>
                            <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px' }}>Account Details</div>
                            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--dark)', fontWeight: 400 }}>User ID:</span><br />
                                <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{user.id.slice(0, 16)}...</span>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                                <span style={{ color: 'var(--dark)', fontWeight: 400 }}>Joined:</span><br />
                                {joinedDate}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
