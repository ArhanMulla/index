import { useState } from 'react';
import { Backpack } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../supabaseClient';
import { C, F } from '../theme';

export default function Junior({ user, view, onNav, onSignOut }) {
  const [email, setEmail] = useState(user?.email || '');
  const [status, setStatus] = useState('idle');
  const [err, setErr] = useState('');

  async function joinWaitlist() {
    if (!email.trim()) { setErr('Enter an email first.'); return; }
    setStatus('saving'); setErr('');
    const { error } = await supabase.from('waitlist').insert({ email: email.trim().toLowerCase() });
    if (error) { if (error.code === '23505') setStatus('done'); else { setStatus('error'); setErr(error.message); } return; }
    setStatus('done');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar view={view} user={user} onNav={onNav} onSignOut={onSignOut} />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.canvas, padding: '60px 80px', fontFamily: F.body }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: `rgba(76,111,239,.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
            <Backpack size={28} color={C.research} />
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 999, padding: '6px 16px', fontSize: 12, fontWeight: 600, color: C.research, marginBottom: 20 }}>✦ Coming Soon</div>
          <h1 style={{ fontFamily: F.display, fontSize: 38, fontWeight: 600, color: C.text, letterSpacing: '-0.5px', marginBottom: 16 }}>INDEX Junior</h1>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.75, marginBottom: 10 }}>Empowering school students to engage with real-world challenges, guided by university mentors and industry professionals.</p>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 30 }}>INDEX Junior provides age-appropriate challenges, hands-on project guides, mentorship from researchers, and a pathway for young innovators to build real skills before they begin their degrees.</p>
          {status === 'done' ? (
            <div style={{ padding: '14px 0', background: 'rgba(0,191,166,.1)', border: `1.5px solid ${C.signal}`, borderRadius: 999, color: C.text, fontWeight: 700, fontSize: 14 }}>✓ You're on the list — we'll email you when it launches.</div>
          ) : (
            <>
              {err && <div style={{ fontSize: 12.5, color: C.danger, marginBottom: 10 }}>{err}</div>}
              <div style={{ display: 'flex', gap: 8, maxWidth: 380, margin: '0 auto' }}>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={{ flex: 1, padding: '12px 16px', border: `1.5px solid ${C.border}`, borderRadius: 999, fontSize: 14, fontFamily: F.body }} />
                <button onClick={joinWaitlist} disabled={status === 'saving'} style={{ padding: '12px 24px', background: C.signal, border: 'none', borderRadius: 999, color: C.ink, fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F.body }}>{status === 'saving' ? 'Joining…' : 'Join Waitlist'}</button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
