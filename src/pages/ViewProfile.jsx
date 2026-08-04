import { useState, useEffect } from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Avatar from '../components/Avatar';
import { supabase } from '../supabaseClient';
import { C, F } from '../theme';

function initialsOf(name) { return (name || '?').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'; }

export default function ViewProfile({ profileId, user, view, onNav, onSignOut, onBack }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase.from('profiles').select('*').eq('id', profileId).maybeSingle().then(({ data }) => {
      if (!cancelled) { setProfile(data); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [profileId]);

  if (profileId === user?.id) {
    // Viewing your own profile from somewhere — just go to the real editable page.
    onNav('profile');
    return null;
  }

  const links = profile ? [
    profile.cv_link && { icon: '📄', label: 'CV / Resume', href: profile.cv_link },
    profile.portfolio_link && { icon: '💼', label: 'Portfolio', href: profile.portfolio_link },
    profile.linkedin_link && { icon: '🔗', label: 'LinkedIn', href: profile.linkedin_link },
  ].filter(Boolean) : [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar view={view} user={user} onNav={onNav} onSignOut={onSignOut} />
      <main style={{ flex: 1, padding: '40px 44px', background: C.canvas, fontFamily: F.body }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: C.muted, fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0, fontFamily: F.body }}>
            <ArrowLeft size={15} /> Back
          </button>

          {loading ? (
            <div style={{ color: C.muted, fontSize: 14 }}>Loading profile…</div>
          ) : !profile ? (
            <div style={{ color: C.muted, fontSize: 14 }}>This profile couldn't be found.</div>
          ) : (
            <div style={{ background: C.surface, borderRadius: 22, overflow: 'hidden', border: `1px solid ${C.border}` }}>
              <div style={{ height: 128, background: `linear-gradient(120deg, ${C.ink} 0%, #182238 55%, ${C.signal} 160%)` }} />
              <div style={{ padding: '0 34px 34px' }}>
                <div style={{ marginTop: -48, position: 'relative', zIndex: 2 }}>
                  <Avatar url={profile.avatar_url} initials={initialsOf(profile.name)} size={96} fontSize={32} border={`5px solid ${C.surface}`} />
                </div>
                <div style={{ marginTop: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontFamily: F.display, fontSize: 23, fontWeight: 600, color: C.text }}>{profile.name}</div>
                    {profile.is_verified && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999, background: 'rgba(0,191,166,.1)', color: C.signal, fontSize: 11, fontWeight: 700 }}>
                        <ShieldCheck size={12} /> Verified {profile.verification_type === 'university' ? 'University' : 'Company'}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13.5, color: C.signal, fontWeight: 600, marginTop: 4 }}>{profile.role}{profile.org ? ` · ${profile.org}` : ''}</div>
                  {profile.bio && <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.65, marginTop: 12, maxWidth: 480 }}>{profile.bio}</p>}
                </div>

                {links.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
                    {links.map(l => <a key={l.label} href={l.href.startsWith('http') ? l.href : `https://${l.href}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, background: C.canvas, border: `1px solid ${C.border}`, color: C.text, fontSize: 12.5, fontWeight: 600 }}><span>{l.icon}</span>{l.label}</a>)}
                  </div>
                )}
                {(profile.domains || []).length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Domains</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{profile.domains.map(d => <span key={d} style={{ padding: '5px 12px', borderRadius: 999, background: 'rgba(76,111,239,.1)', color: C.research, fontSize: 12, fontWeight: 600 }}>{d}</span>)}</div>
                  </div>
                )}
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Skills</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(profile.skills || []).length === 0 && <span style={{ fontSize: 13, color: C.faint, fontStyle: 'italic' }}>No skills listed yet.</span>}
                    {(profile.skills || []).map(s => <span key={s} style={{ padding: '5px 12px', borderRadius: 999, background: 'rgba(0,191,166,.1)', border: `1px solid ${C.signal}`, color: C.signal, fontSize: 12, fontWeight: 600 }}>{s}</span>)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
