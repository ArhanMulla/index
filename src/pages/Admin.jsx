import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Trash2, Users, FileText } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../supabaseClient';
import { C, F } from '../theme';

export default function Admin({ user, view, onNav, onSignOut, onIdeasChanged }) {
  const [tab, setTab] = useState('ideas');
  const [ideas, setIdeas] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: i }, { data: p }] = await Promise.all([
      supabase.from('ideas').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    ]);
    setIdeas(i || []); setProfiles(p || []); setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function deleteIdea(id) {
    if (!window.confirm('Delete this idea permanently?')) return;
    await supabase.from('ideas').delete().eq('id', id);
    load(); onIdeasChanged?.();
  }

  async function toggleVerify(p) {
    await supabase.from('profiles').update({ is_verified: !p.is_verified, verification_type: p.is_verified ? null : (p.verification_type || 'company') }).eq('id', p.id);
    load();
  }

  if (!user?.is_admin) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar view={view} user={user} onNav={onNav} onSignOut={onSignOut} />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.canvas, fontFamily: F.body }}>
          <div style={{ textAlign: 'center', color: C.muted }}>Admin access only.</div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar view={view} user={user} onNav={onNav} onSignOut={onSignOut} />
      <main style={{ flex: 1, padding: '40px 44px', background: C.canvas, fontFamily: F.body }}>
        <h1 style={{ fontFamily: F.display, fontSize: 27, fontWeight: 600, color: C.text, marginBottom: 5 }}>Admin</h1>
        <p style={{ fontSize: 14.5, color: C.muted, marginBottom: 26 }}>Moderate content and manage verification badges.</p>

        <div style={{ display: 'flex', gap: 14, marginBottom: 26 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 10 }}><FileText size={17} color={C.signal} /><div><div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 18, color: C.text }}>{ideas.length}</div><div style={{ fontSize: 11, color: C.muted }}>Total Ideas</div></div></div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 10 }}><Users size={17} color={C.signal} /><div><div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 18, color: C.text }}>{profiles.length}</div><div style={{ fontSize: 11, color: C.muted }}>Total Users</div></div></div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['ideas', 'users'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '9px 20px', borderRadius: 999, border: `1.5px solid ${tab === t ? C.signal : C.border}`, background: tab === t ? 'rgba(0,191,166,.1)' : C.surface, color: tab === t ? C.signal : C.muted, fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize', fontFamily: F.body }}>{t}</button>
          ))}
        </div>

        {loading ? <div style={{ color: C.muted }}>Loading…</div> : tab === 'ideas' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ideas.map(i => (
              <div key={i.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontWeight: 600, fontSize: 13.5, color: C.text }}>{i.title}</div><div style={{ fontSize: 11.5, color: C.faint }}>{i.type} · {i.status || 'open'} · {new Date(i.created_at).toLocaleDateString()}</div></div>
                <button onClick={() => deleteIdea(i.id)} style={{ padding: '7px 12px', background: C.dangerBg, border: 'none', borderRadius: 8, color: C.danger, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontFamily: F.body }}><Trash2 size={13} /> Remove</button>
              </div>
            ))}
            {ideas.length === 0 && <div style={{ color: C.faint, fontSize: 13 }}>No submitted ideas yet.</div>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {profiles.map(p => (
              <div key={p.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontWeight: 600, fontSize: 13.5, color: C.text, display: 'flex', alignItems: 'center', gap: 6 }}>{p.name} {p.is_admin && <span style={{ fontSize: 10, color: C.amber, fontWeight: 700 }}>ADMIN</span>}</div><div style={{ fontSize: 11.5, color: C.faint }}>{p.role} {p.org ? `· ${p.org}` : ''}</div></div>
                <button onClick={() => toggleVerify(p)} style={{ padding: '7px 14px', background: p.is_verified ? 'rgba(0,191,166,.1)' : C.canvas, border: `1px solid ${p.is_verified ? C.signal : C.border}`, borderRadius: 8, color: p.is_verified ? C.signal : C.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontFamily: F.body }}><ShieldCheck size={13} /> {p.is_verified ? 'Verified' : 'Verify'}</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
