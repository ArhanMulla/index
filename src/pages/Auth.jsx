import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { ROLES, DOMAINS } from '../data';
import { C, F } from '../theme';

const inp = { width: '100%', padding: '11px 14px', border: `1.5px solid ${C.border}`, borderRadius: 11, fontSize: 14, display: 'block', color: C.text, background: C.surface, fontFamily: F.body };
const lbl = { display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 };
const PBtn = { width: '100%', padding: '13px 0', background: C.signal, border: 'none', borderRadius: 12, color: C.ink, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: F.body };
const GBtn = { padding: '11px 20px', background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 12, color: C.muted, fontSize: 14, cursor: 'pointer', fontFamily: F.body };
const errBox = { background: C.dangerBg, border: `1.5px solid #F0C9C0`, borderRadius: 10, padding: '10px 14px', color: C.danger, fontSize: 13, marginBottom: 16 };
const chip = (active) => ({ padding: '7px 14px', borderRadius: 999, border: `1.5px solid ${active ? C.signal : C.border}`, background: active ? 'rgba(0,191,166,.1)' : C.surface, color: active ? C.signal : C.muted, fontSize: 13, cursor: 'pointer', fontWeight: active ? 600 : 400, transition: 'all .12s', fontFamily: F.body });

const TOTAL_STEPS = 4;

export default function Auth({ mode, onAuthed, onSwitch, onBack }) {
  const [step, setStep]     = useState(1);
  const [role, setRole]     = useState('');
  const [nm, setNm]         = useState('');
  const [em, setEm]         = useState('');
  const [pw, setPw]         = useState('');
  const [og, setOg]         = useState('');

  const [domains, setDomains]   = useState([]);
  const [domainIn, setDomainIn] = useState('');
  const [skills, setSkills]     = useState([]);
  const [skillIn, setSkillIn]   = useState('');

  const [cvLink, setCvLink]             = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [linkedinLink, setLinkedinLink]   = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const toggleDomain = d => setDomains(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  const addDomain = () => { const v = domainIn.trim(); if (v && !domains.includes(v)) setDomains(p => [...p, v]); setDomainIn(''); };
  const toggleSkill = s => setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const addSkill = () => { const v = skillIn.trim(); if (v && !skills.includes(v)) setSkills(p => [...p, v]); setSkillIn(''); };

  const presetDomainIds = DOMAINS.filter(d => domains.includes(d.label)).map(d => d.id);
  const visibleSkills = [...new Set([...DOMAINS.filter(d => presetDomainIds.includes(d.id)).flatMap(d => d.skills), ...skills])];

  function detectVerification(email) {
    const domain = (email.split('@')[1] || '').toLowerCase();
    if (!domain) return { verified: false, type: null };
    if (domain.endsWith('.ac.ae') || domain.endsWith('.edu') || domain.includes('university') || domain.includes('.edu.')) return { verified: true, type: 'university' };
    if (['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'].includes(domain)) return { verified: false, type: null };
    return { verified: true, type: 'company' };
  }

  async function handleLogin() {
    setError('');
    if (!em || !pw) { setError('Enter your email and password.'); return; }
    setLoading(true);
    const { data, error: err } = await supabase.auth.signInWithPassword({ email: em.trim(), password: pw });
    setLoading(false);
    if (err) { setError(err.message === 'Invalid login credentials' ? 'Wrong email or password.' : err.message); return; }
    if (!data.session || !data.user) { setError('Something went wrong signing in. Please try again.'); return; }
    onAuthed(data.user);
  }

  async function handleSignup() {
    setError('');
    setLoading(true);
    const { data, error: err } = await supabase.auth.signUp({ email: em.trim(), password: pw });
    if (err) { setLoading(false); setError(err.message); return; }

    const alreadyRegistered = data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0;
    if (alreadyRegistered) { setLoading(false); setError('An account with this email already exists — please sign in instead.'); onSwitch('login'); return; }
    if (!data.session || !data.user) { setLoading(false); setError('Check your inbox to confirm your email, then sign in.'); onSwitch('login'); return; }

    const authedUser = data.user;
    const verification = detectVerification(em);
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: authedUser.id, name: nm.trim(), role: role || 'Student', org: og.trim(),
      domains, skills,
      cv_link: cvLink.trim() || null, portfolio_link: portfolioLink.trim() || null, linkedin_link: linkedinLink.trim() || null,
      is_verified: verification.verified, verification_type: verification.type,
    });
    setLoading(false);
    if (profileErr) { setError(`Account created, but saving your profile failed: ${profileErr.message}`); return; }
    onAuthed(authedUser);
  }

  return (
    <div style={{ background: 'rgba(11,18,32,.97)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: F.body }}>
      <div style={{ background: C.surface, borderRadius: 24, padding: '40px 44px', width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto' }}>

        {mode === 'login' ? (
          <>
            <div style={{ fontFamily: F.display, fontSize: 26, fontWeight: 600, color: C.text, marginBottom: 6 }}>Welcome back</div>
            <div style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>Sign in to your INDEX account</div>
            {error && <div style={errBox}>{error}</div>}
            <label style={lbl}>Email</label>
            <input style={{ ...inp, marginBottom: 14 }} placeholder="you@email.com" type="email" value={em} onChange={e => setEm(e.target.value)} />
            <label style={lbl}>Password</label>
            <input style={{ ...inp, marginBottom: 24 }} placeholder="••••••••" type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            <button onClick={handleLogin} disabled={loading} style={PBtn}>{loading ? 'Signing in…' : 'Sign In →'}</button>
            <div style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: C.muted }}>
              No account? <span style={{ color: C.signal, cursor: 'pointer', fontWeight: 600 }} onClick={() => { setError(''); onSwitch('signup'); }}>Join INDEX</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12.5, color: C.faint, cursor: 'pointer' }} onClick={onBack}>← Back to home</div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 5, marginBottom: 22 }}>
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: step > i ? C.signal : C.border }} />
              ))}
            </div>

            {step === 1 && (
              <>
                <div style={{ fontFamily: F.display, fontSize: 24, fontWeight: 600, color: C.text, marginBottom: 6 }}>Join INDEX</div>
                <div style={{ fontSize: 14, color: C.muted, marginBottom: 22 }}>I am a...</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
                  {ROLES.map(r => (
                    <div key={r.id} onClick={() => setRole(r.label)} style={{ border: `2px solid ${role === r.label ? C.signal : C.border}`, borderRadius: 14, padding: '16px 14px', cursor: 'pointer', background: role === r.label ? 'rgba(0,191,166,.08)' : C.surface }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{r.icon}</div>
                      <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 14, color: C.text, marginBottom: 4 }}>{r.label}</div>
                      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{r.desc}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => role && setStep(2)} style={{ ...PBtn, opacity: role ? 1 : 0.45 }}>Continue →</button>
                <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: C.muted }}>
                  Have an account? <span style={{ color: C.signal, cursor: 'pointer', fontWeight: 600 }} onClick={() => onSwitch('login')}>Sign In</span>
                </div>
                <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12.5, color: C.faint, cursor: 'pointer' }} onClick={onBack}>← Back to home</div>
              </>
            )}

            {step === 2 && (
              <>
                <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 600, color: C.text, marginBottom: 4 }}>Your Details</div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Setting up your {role} profile</div>
                {error && <div style={errBox}>{error}</div>}
                <label style={lbl}>Full Name</label>
                <input style={{ ...inp, marginBottom: 14 }} value={nm} onChange={e => setNm(e.target.value)} placeholder="Your full name" />
                <label style={lbl}>Email</label>
                <input style={{ ...inp, marginBottom: 14 }} type="email" value={em} onChange={e => setEm(e.target.value)} placeholder="you@email.com" />
                {em.includes('@') && (
                  <div style={{ fontSize: 11.5, color: detectVerification(em).verified ? C.signal : C.faint, marginTop: -8, marginBottom: 14 }}>
                    {detectVerification(em).verified ? `✓ This email will get a verified ${detectVerification(em).type} badge` : 'Personal email — no verification badge (that\'s fine for now)'}
                  </div>
                )}
                <label style={lbl}>Password</label>
                <input style={{ ...inp, marginBottom: 14 }} type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="At least 6 characters" />
                <label style={lbl}>{role === 'Industry' ? 'Company Name' : 'University / Institution'}</label>
                <input style={{ ...inp, marginBottom: 24 }} value={og} onChange={e => setOg(e.target.value)} placeholder={role === 'Industry' ? 'Your company' : 'e.g. UAE University'} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setStep(1)} style={GBtn}>← Back</button>
                  <button onClick={() => { if (!nm || !em || !pw) { setError('Name, email, and password are required.'); return; } if (pw.length < 6) { setError('Password must be at least 6 characters.'); return; } setError(''); setStep(3); }} style={{ ...PBtn, flex: 1 }}>Continue →</button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 600, color: C.text, marginBottom: 4 }}>Your Domains & Skills</div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Pick the areas you work in, then the specific skills within them</div>
                {error && <div style={errBox}>{error}</div>}
                <label style={lbl}>Domains</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>
                  {DOMAINS.map(d => <button key={d.id} onClick={() => toggleDomain(d.label)} style={chip(domains.includes(d.label))}><span style={{ marginRight: 5 }}>{d.icon}</span>{d.label}</button>)}
                  {domains.filter(d => !DOMAINS.some(pd => pd.label === d)).map(d => (
                    <span key={d} style={{ ...chip(true), display: 'inline-flex', alignItems: 'center', gap: 5 }}>{d}<span onClick={() => toggleDomain(d)} style={{ cursor: 'pointer', fontWeight: 700 }}>×</span></span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
                  <input value={domainIn} onChange={e => setDomainIn(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDomain(); } }} placeholder="Don't see your domain? Type it and press Enter" style={{ ...inp, fontSize: 13 }} />
                  <button onClick={addDomain} style={{ ...GBtn, padding: '9px 16px', whiteSpace: 'nowrap' }}>+ Add</button>
                </div>
                <label style={lbl}>Skills</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10, maxHeight: 150, overflowY: 'auto' }}>
                  {visibleSkills.length === 0 && <div style={{ fontSize: 12.5, color: C.faint, fontStyle: 'italic' }}>Pick a domain above to see relevant skills, or add your own below.</div>}
                  {visibleSkills.map(s => <button key={s} onClick={() => toggleSkill(s)} style={chip(skills.includes(s))}>{s}</button>)}
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                  <input value={skillIn} onChange={e => setSkillIn(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} placeholder="Don't see your skill? Type it and press Enter" style={{ ...inp, fontSize: 13 }} />
                  <button onClick={addSkill} style={{ ...GBtn, padding: '9px 16px', whiteSpace: 'nowrap' }}>+ Add</button>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setStep(2)} style={GBtn}>← Back</button>
                  <button onClick={() => setStep(4)} style={{ ...PBtn, flex: 1 }}>Continue →</button>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 600, color: C.text, marginBottom: 4 }}>Links</div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Optional — you can always add these later from My Profile.</div>
                {error && <div style={errBox}>{error}</div>}
                <label style={lbl}>📄 CV / Resume link</label>
                <input value={cvLink} onChange={e => setCvLink(e.target.value)} style={{ ...inp, marginBottom: 14 }} placeholder="Link to your CV" />
                <label style={lbl}>💼 Portfolio link</label>
                <input value={portfolioLink} onChange={e => setPortfolioLink(e.target.value)} style={{ ...inp, marginBottom: 14 }} placeholder="Portfolio, GitHub, or personal site" />
                <label style={lbl}>🔗 LinkedIn</label>
                <input value={linkedinLink} onChange={e => setLinkedinLink(e.target.value)} style={{ ...inp, marginBottom: 26 }} placeholder="linkedin.com/in/yourname" />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setStep(3)} style={GBtn}>← Back</button>
                  <button onClick={handleSignup} disabled={loading} style={{ ...PBtn, flex: 1 }}>{loading ? 'Creating account…' : '🎉 Create Account'}</button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
