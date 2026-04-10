'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'

export default function DebugPage() {
  const { user, profile, loading, isAdmin } = useAuth()
  const [directFetch, setDirectFetch] = useState<any>(null)
  const [directError, setDirectError] = useState<any>(null)
  const [fixing, setFixing] = useState(false)
  const [fixMsg, setFixMsg] = useState('')

  useEffect(() => {
    if (user) checkDirectly()
  }, [user])

  async function checkDirectly() {
    // Direct Supabase se profile fetch karo — bypassing context
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)
      .single()
    setDirectFetch(data)
    setDirectError(error)
  }

  async function fixAdminRole() {
    if (!user) return
    setFixing(true)
    setFixMsg('')

    // Step 1: Check if profile exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (existing) {
      // Update role to admin
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id)

      if (error) {
        setFixMsg('❌ Update failed: ' + error.message + '\n\nManually run this in Supabase SQL Editor:\nupdate public.profiles set role = \'admin\' where email = \'' + user.email + '\';')
      } else {
        setFixMsg('✅ Done! Role admin set kar diya. Page refresh karo.')
        checkDirectly()
      }
    } else {
      // Insert profile
      const { error } = await supabase
        .from('profiles')
        .insert({ id: user.id, email: user.email, full_name: user.email?.split('@')[0], role: 'admin' })

      if (error) {
        setFixMsg('❌ Insert failed: ' + error.message)
      } else {
        setFixMsg('✅ Profile create karke admin set kar diya! Page refresh karo.')
        checkDirectly()
      }
    }
    setFixing(false)
  }

  const Row = ({ label, value, ok }: { label: string; value: string; ok?: boolean }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F0EBE1' }}>
      <span style={{ fontSize: '13px', color: 'var(--muted)', letterSpacing: '1px' }}>{label}</span>
      <span style={{
        fontSize: '13px', fontFamily: 'monospace', padding: '3px 10px',
        background: ok === true ? '#D1FAE5' : ok === false ? '#FEE2E2' : '#F9F5EE',
        color: ok === true ? '#065F46' : ok === false ? '#991B1B' : 'var(--dark)',
        borderRadius: '2px'
      }}>
        {value}
      </span>
    </div>
  )

  return (
    <main style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ paddingTop: '100px' }}>
        <div style={{ background: 'var(--dark)', padding: '48px 24px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '36px', fontWeight: 300, color: 'var(--cream)' }}>
            🔍 Auth Debug
          </h1>
          <p style={{ color: 'rgba(245,240,232,0.4)', fontSize: '13px', marginTop: '8px' }}>
            /debug — Is page ko baad mein delete kar dena
          </p>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-12" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Auth Context Values */}
          <div style={{ background: 'white', border: '1px solid #E8DFD0', padding: '28px' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '22px', fontWeight: 300, marginBottom: '20px' }}>
              AuthContext Values
            </h2>
            {loading ? (
              <div style={{ color: 'var(--muted)', fontSize: '13px' }}>Loading...</div>
            ) : (
              <>
                <Row label="loading" value={String(loading)} ok={!loading} />
                <Row label="user.id" value={user?.id?.slice(0, 16) + '...' || 'null'} ok={!!user} />
                <Row label="user.email" value={user?.email || 'null'} ok={!!user} />
                <Row label="profile" value={profile === undefined ? 'undefined (still fetching)' : profile === null ? 'null (not found!)' : 'found ✓'} ok={!!profile} />
                <Row label="profile.role" value={profile?.role || 'N/A'} ok={profile?.role === 'admin'} />
                <Row label="isAdmin" value={String(isAdmin)} ok={isAdmin} />
              </>
            )}
          </div>

          {/* Direct Supabase Fetch */}
          <div style={{ background: 'white', border: '1px solid #E8DFD0', padding: '28px' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '22px', fontWeight: 300, marginBottom: '20px' }}>
              Direct Supabase Fetch
            </h2>
            {!user ? (
              <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Login karo pehle</p>
            ) : directFetch === null && directError === null ? (
              <div style={{ color: 'var(--muted)', fontSize: '13px' }}>Fetching...</div>
            ) : directError ? (
              <>
                <div style={{ background: '#FEE2E2', border: '1px solid #DC2626', padding: '16px', color: '#991B1B', fontSize: '13px', marginBottom: '12px', fontFamily: 'monospace' }}>
                  ❌ Error: {directError.message}<br />
                  Code: {directError.code}
                </div>
                {directError.code === 'PGRST116' && (
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>
                    ⚠️ Profile row exist nahi karta profiles table mein. Neeche "Fix" button dabao.
                  </p>
                )}
                {directError.code === '42501' && (
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>
                    ⚠️ RLS policy block kar rahi hai. Supabase SQL Editor mein RLS policies check karo.
                  </p>
                )}
              </>
            ) : (
              <>
                <Row label="id" value={directFetch?.id?.slice(0, 16) + '...'} />
                <Row label="email" value={directFetch?.email || 'null'} ok={!!directFetch?.email} />
                <Row label="full_name" value={directFetch?.full_name || 'null'} />
                <Row label="role" value={directFetch?.role || 'null'} ok={directFetch?.role === 'admin'} />
              </>
            )}
          </div>

          {/* Fix Button */}
          {user && (
            <div style={{ background: 'white', border: '1px solid #E8DFD0', padding: '28px' }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '22px', fontWeight: 300, marginBottom: '12px' }}>
                Auto Fix
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px', lineHeight: 1.6 }}>
                Ye button tumhare account ko admin set karne ki koshish karega directly Supabase se.
              </p>
              <button onClick={fixAdminRole} disabled={fixing} className="btn-gold"
                style={{ marginBottom: fixMsg ? '16px' : '0', opacity: fixing ? 0.7 : 1 }}>
                {fixing ? 'Setting admin...' : '⚡ Set My Account as Admin'}
              </button>
              {fixMsg && (
                <pre style={{
                  marginTop: '16px', padding: '16px', background: '#F9F5EE', fontSize: '12px',
                  color: 'var(--dark)', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: 'monospace',
                  border: '1px solid #E8DFD0'
                }}>
                  {fixMsg}
                </pre>
              )}
            </div>
          )}

          {/* Manual SQL */}
          <div style={{ background: '#F9F5EE', border: '1px solid #E8DFD0', padding: '28px' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '22px', fontWeight: 300, marginBottom: '12px' }}>
              Manual Fix (Supabase SQL Editor)
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>
              Agar upar kuch kaam nahi kiya toh Supabase Dashboard → SQL Editor mein ye run karo:
            </p>
            <pre style={{ background: 'var(--dark)', color: 'var(--gold)', padding: '16px', fontSize: '12px', fontFamily: 'monospace', lineHeight: 1.8, overflowX: 'auto' }}>
{`-- 1. Pehle dekho profile hai ya nahi:
select * from public.profiles 
where email = '${user?.email || 'tumhari@email.com'}';

-- 2. Agar row hai toh role update karo:
update public.profiles 
set role = 'admin' 
where email = '${user?.email || 'tumhari@email.com'}';

-- 3. Agar row nahi hai toh insert karo:
insert into public.profiles (id, email, full_name, role)
select id, email, email, 'admin'
from auth.users
where email = '${user?.email || 'tumhari@email.com'}';`}
            </pre>
          </div>

        </div>
      </div>
    </main>
  )
}
