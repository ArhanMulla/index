import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Avatar from '../components/Avatar';
import AvatarUpload from '../components/AvatarUpload';
import LinkOrUpload from '../components/LinkOrUpload';
import { supabase } from '../supabaseClient';
import { ROLES, DOMAINS } from '../data';
import { moderationIssue } from '../utils/moderation';
import { C, F } from '../theme';

const inp = { width: '100%', padding: '11px 14px', border: `1.5px solid ${C.border}`, borderRadius: 11, fontSize: 14, display: 'block', color: C.text, background: C.surface, fontFamily: F.body };
const lbl = { display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 };
const errBox = { background: C.dangerBg, border: '1.5px solid #F0C9C0', borderRadius: 10, padding: '10px 14px', color: C.danger, fontSize: 13, marginBottom: 16 };
const okBox = { background: 'rgba(0,191,166,.1)', border: `1.5px solid ${C.signal}`, borderRadius: 10, padding: '10px 14px', color: C.text, fontSize: 13, marginBottom: 16, fontWeight: 600 };
const chip = (active) => ({ padding: '7px 14px', borderRadius: 999, border: `1.5px solid ${active ? C.signal : C.border}`, background: active ? 'rgba(0,191,166,.1)' : C.surface, color: active ? C.signal : C.muted, fontSize: 13, cursor: 'pointer', fontWeight: active ? 600 : 400, fontFamily: F.body });

function initialsOf(name) { return (name || '?').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'; }

export default function EditProfile({ user, view, onNav, onSignOut, onProfileUpdated }) {
  const [editing, setEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [role, setRole] = useState(user?.role || 'Student');
  const [org, setOrg] = useState(user?.org || '');
  const [domains, setDomains] = useState(user?.domains || []);
  const [domainIn, setDomainIn] = useState('');
  const [skills, setSkills] = useState(user?.skills || []);
  const [skillIn, setSkillIn] = useState('');
  const [cvLink, setCvLink] = useState(user?.cv_link || '');
  const [portfolioLink, setPortfolioLink] = useState(user?.portfolio_link || '');
  const [linkedinLink, setLinkedinLink] = useState(user?.linkedin_link || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState('');

  const toggleDomain = d => { setSaved(false); setDomains(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]); };
  const addDomain = () => { const v = domainIn.trim(); if (v && !domains.includes(v)) setDomains(p => [...p, v]); setDomainIn(''); setSaved(false); };
  const toggleSkill = s => { setSaved(false); setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]); };
  const addSkill = () => { const v = skillIn.trim(); if (v && !skills.includes(v)) setSkills(p => [...p, v]); setSkillIn(''); setSaved(false); };

  async function handleAvatarUploaded(url) {
    setAvatarUrl(url);
    const { error } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
    if (!error) onProfileUpdated({ ...user, avatar_url: url });
  }

  const presetDomainIds = DOMAINS.filter(d => domains.includes(d.label)).map(d => d.id);
  const visibleSkills = [...new Set([...DOMAINS.filter(d => presetDomainIds.includes(d.id)).flatMap(d => d.skills), ...skills])];

  async function save() {
    if (!name.trim()) { setErr('Name is required.'); return; }
    const modIssue = moderationIssue(bio);
    if (modIssue) { setErr(modIssue); return; }
    setSaving(true); setErr(''); setSaved(false);
    const { error } = await supabase.from('profiles').update({
      name: name.trim(), bio: bio.trim() || null, role, org: org.trim(), domains, skills,
      cv_link: cvLink.trim() || null, portfolio_link: portfolioLink.trim() || null, linkedin_link: linkedinLink.trim() || null,
    }).eq('id', user.id);
    setSaving(false);
    if (error) { setErr(error.message); return; }
    setSaved(true); setEditing(false);
    onProfileUpdated({ ...user, name: name.trim(), bio: bio.trim(), role, org: org.trim(), domains, skills, cv_link: cvLink.trim(), portfolio_link: portfolioLink.trim(), linkedin_link: linkedinLink.trim(), initials: initialsOf(name.trim()) });
  }

  const links = [
    user?.cv_link && { icon: '📄', label: 'CV / Resume', href: user.cv_link },
    user?.portfolio_link && { icon: '💼', label: 'Portfolio', href: user.portfolio_link },
    user?.linkedin_link && { icon: '🔗', label: 'LinkedIn', href: user.linkedin_link },
  ].filter(Boolean);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar view={view} user={{ ...user, avatar_url: avatarUrl }} onNav={onNav} onSignOut={onSignOut} />
      <main style={{ flex: 1, padding: '40px 44px', background: C.canvas, fontFamily: F.body }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          {saved && <div style={okBox}>✓ Profile updated.</div>}

          {!editing ? (
            <div style={{ background: C.surface, borderRadius: 22, overflow: 'hidden', border: `1px solid ${C.border}` }}>
              <div style={{ height: 128, background: `linear-gradient(120deg, ${C.ink} 0%, #182238 55%, ${C.signal} 160%)`, position: 'relative' }} />
              <div style={{ padding: '0 34px 34px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: -48, position: 'relative', zIndex: 2 }}>
                  <AvatarUpload url={avatarUrl} initials={user?.initials} userId={user.id} onUploaded={handleAvatarUploaded} size={96} />
                  <button onClick={() => setEditing(true)} style={{ marginBottom: 8, padding: '9px 22px', background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 999, color: C.text, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F.body }}>Edit Profile</button>
                </div>
                <div style={{ marginTop: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontFamily: F.display, fontSize: 23, fontWeight: 600, color: C.text }}>{user?.name}</div>
                    {user?.is_verified && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999, background: 'rgba(0,191,166,.1)', color: C.signal, fontSize: 11, fontWeight: 700 }}>
                        <ShieldCheck size={12} /> Verified {user.verification_type === 'university' ? 'University' : 'Company'}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13.5, color: C.signal, fontWeight: 600, marginTop: 4 }}>{user?.role}{user?.org ? ` · ${user.org}` : ''}</div>
                  {user?.bio && <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.65, marginTop: 12, maxWidth: 480 }}>{user.bio}</p>}
                </div>
                <div style={{ display: 'flex', gap: 30, marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
                  {[['Skills', (user?.skills || []).length], ['Domains', (user?.domains || []).length]].map(([l, v]) => (
                    <div key={l}><div style={{ fontFamily: F.display, fontSize: 21, fontWeight: 700, color: C.text }}>{v}</div><div style={{ fontSize: 11.5, color: C.faint }}>{l}</div></div>
                  ))}
                </div>
                {links.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
                    {links.map(l => <a key={l.label} href={l.href.startsWith('http') ? l.href : `https://${l.href}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, background: C.canvas, border: `1px solid ${C.border}`, color: C.text, fontSize: 12.5, fontWeight: 600 }}><span>{l.icon}</span>{l.label}</a>)}
                  </div>
                )}
                {(user?.domains || []).length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Domains</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{user.domains.map(d => <span key={d} style={{ padding: '5px 12px', borderRadius: 999, background: 'rgba(76,111,239,.1)', color: C.research, fontSize: 12, fontWeight: 600 }}>{d}</span>)}</div>
                  </div>
                )}
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Skills</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(user?.skills || []).length === 0 && <span style={{ fontSize: 13, color: C.faint, fontStyle: 'italic' }}>No skills added yet.</span>}
                    {(user?.skills || []).map(s => <span key={s} style={{ padding: '5px 12px', borderRadius: 999, background: 'rgba(0,191,166,.1)', border: `1px solid ${C.signal}`, color: C.signal, fontSize: 12, fontWeight: 600 }}>{s}</span>)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: '32px 36px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                <h1 style={{ fontFamily: F.display, fontSize: 20, fontWeight: 600, color: C.text }}>Edit Profile</h1>
                <button onClick={() => setEditing(false)} style={{ background: 'none', border: 'none', color: C.muted, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              </div>
              {err && <div style={errBox}>{err}</div>}

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
                <AvatarUpload url={avatarUrl} initials={user?.initials} userId={user.id} onUploaded={handleAvatarUploaded} size={84} />
              </div>

              <label style={lbl}>Full Name</label>
              <input style={{ ...inp, marginBottom: 16 }} value={name} onChange={e => { setSaved(false); setName(e.target.value); }} />
              <label style={lbl}>Bio</label>
              <textarea style={{ ...inp, marginBottom: 16 }} rows={2} value={bio} onChange={e => { setSaved(false); setBio(e.target.value); }} placeholder="A short line about you" />
              <label style={lbl}>Email</label>
              <input style={{ ...inp, marginBottom: 16, background: C.canvas, color: C.faint }} value={user?.email || ''} disabled />
              <label style={lbl}>I am a...</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                {ROLES.map(r => <div key={r.id} onClick={() => { setSaved(false); setRole(r.label); }} style={{ border: `2px solid ${role === r.label ? C.signal : C.border}`, borderRadius: 12, padding: '10px 12px', cursor: 'pointer', background: role === r.label ? 'rgba(0,191,166,.08)' : C.surface, fontSize: 13, fontWeight: 600, color: C.text, display: 'flex', alignItems: 'center', gap: 8 }}><span>{r.icon}</span>{r.label}</div>)}
              </div>
              <label style={lbl}>{role === 'Industry' ? 'Company Name' : 'University / Institution'}</label>
              <input style={{ ...inp, marginBottom: 20 }} value={org} onChange={e => { setSaved(false); setOrg(e.target.value); }} />
              <label style={lbl}>Domains</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>
                {DOMAINS.map(d => <button key={d.id} onClick={() => toggleDomain(d.label)} style={chip(domains.includes(d.label))}><span style={{ marginRight: 5 }}>{d.icon}</span>{d.label}</button>)}
                {domains.filter(d => !DOMAINS.some(pd => pd.label === d)).map(d => <span key={d} style={{ ...chip(true), display: 'inline-flex', alignItems: 'center', gap: 5 }}>{d}<span onClick={() => toggleDomain(d)} style={{ cursor: 'pointer', fontWeight: 700 }}>×</span></span>)}
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                <input value={domainIn} onChange={e => setDomainIn(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDomain())} placeholder="Add a custom domain" style={{ ...inp, fontSize: 13 }} />
                <button onClick={addDomain} style={{ padding: '9px 16px', background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 12, color: C.muted, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F.body }}>+ Add</button>
              </div>
              <label style={lbl}>Skills ({skills.length} selected)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>{visibleSkills.map(s => <button key={s} onClick={() => toggleSkill(s)} style={chip(skills.includes(s))}>{s}</button>)}</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                <input value={skillIn} onChange={e => setSkillIn(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Add a custom skill" style={{ ...inp, fontSize: 13 }} />
                <button onClick={addSkill} style={{ padding: '9px 16px', background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 12, color: C.muted, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F.body }}>+ Add</button>
              </div>

              <div style={{ marginBottom: 14 }}><LinkOrUpload label="📄 CV / Resume" value={cvLink} onChange={v => { setSaved(false); setCvLink(v); }} userId={user.id} placeholder="Link to your CV" /></div>
              <div style={{ marginBottom: 14 }}><LinkOrUpload label="💼 Portfolio" value={portfolioLink} onChange={v => { setSaved(false); setPortfolioLink(v); }} userId={user.id} placeholder="Portfolio, GitHub, or personal site" /></div>
              <label style={lbl}>🔗 LinkedIn</label>
              <input style={{ ...inp, marginBottom: 26 }} value={linkedinLink} onChange={e => { setSaved(false); setLinkedinLink(e.target.value); }} placeholder="linkedin.com/in/yourname" />

              <button onClick={save} disabled={saving} style={{ width: '100%', padding: '12px 0', background: C.signal, border: 'none', borderRadius: 12, color: C.ink, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: F.body }}>{saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
