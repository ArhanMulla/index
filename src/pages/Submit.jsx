import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import LinkOrUpload from '../components/LinkOrUpload';
import { supabase } from '../supabaseClient';
import { SKILLS_DB, COURSE_MAP } from '../data';
import { moderationIssue } from '../utils/moderation';
import { C, F } from '../theme';

const inp = { width: '100%', padding: '11px 14px', border: `1.5px solid ${C.border}`, borderRadius: 11, fontSize: 14, display: 'block', color: C.text, background: C.surface, fontFamily: F.body };
const lbl = { display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 };
const errBox = { background: C.dangerBg, border: '1.5px solid #F0C9C0', borderRadius: 10, padding: '10px 14px', color: C.danger, fontSize: 13, marginBottom: 16 };
const STEPS = ['Basic Info', 'The Problem', 'Skills & Team', 'References'];

export default function Submit({ user, view, onNav, onSignOut, onSubmitted }) {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [type, setType] = useState('Industry');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [problem, setProblem] = useState('');
  const [limits, setLimits] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillIn, setSkillIn] = useState('');
  const [team, setTeam] = useState(4);
  const [tl, setTl] = useState('3 months');
  const [researchLink, setResearchLink] = useState('');
  const [workLink, setWorkLink] = useState('');

  const addSkill = s => { if (s && !skills.includes(s)) setSkills(prev => [...prev, s]); setSkillIn(''); };
  const rmSkill = s => setSkills(prev => prev.filter(x => x !== s));
  const recs = skills.filter(s => COURSE_MAP[s]).map(s => COURSE_MAP[s]);

  async function handleFinalSubmit() {
    if (!title.trim() || !desc.trim() || !problem.trim()) { setError('Please fill in at least a title, description, and problem statement.'); setStep(1); return; }
    const modIssue = moderationIssue(title) || moderationIssue(desc) || moderationIssue(problem);
    if (modIssue) { setError(modIssue); setStep(1); return; }

    setError(''); setSaving(true);
    const { error: err } = await supabase.from('ideas').insert({
      author_id: user.id, type, title: title.trim(), description: desc.trim(), problem: problem.trim(),
      limitations: limits.trim(), skills, max: team, timeline: tl,
      research_link: researchLink.trim() || null, work_link: workLink.trim() || null, team: 1, status: 'open',
    });
    setSaving(false);
    if (err) { setError(err.message); return; }
    setDone(true);
    onSubmitted?.();
  }

  if (done) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar view={view} user={user} onNav={onNav} onSignOut={onSignOut} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.canvas, fontFamily: F.body }}>
        <div style={{ textAlign: 'center', maxWidth: 420, padding: 40 }}>
          <div style={{ width: 74, height: 74, borderRadius: '50%', background: 'rgba(0,191,166,.1)', border: `2px solid ${C.signal}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 22px' }}>🎉</div>
          <div style={{ fontFamily: F.display, fontSize: 26, fontWeight: 600, color: C.text, marginBottom: 12 }}>Idea Submitted!</div>
          <div style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, marginBottom: 30 }}>Your challenge is now saved and live on INDEX — anyone who visits Browse Challenges can see it and apply.</div>
          <button onClick={() => onNav('browse')} style={{ width: '100%', padding: '12px 0', background: C.signal, border: 'none', borderRadius: 12, color: C.ink, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10, fontFamily: F.body }}>Browse All Challenges</button>
          <button onClick={() => onNav('dashboard')} style={{ width: '100%', padding: '11px 0', background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 12, color: C.muted, fontSize: 14, cursor: 'pointer', fontFamily: F.body }}>Back to Dashboard</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar view={view} user={user} onNav={onNav} onSignOut={onSignOut} />
      <main style={{ flex: 1, padding: '40px', background: C.canvas, overflowY: 'auto', fontFamily: F.body }}>
        <div style={{ maxWidth: 660, margin: '0 auto' }}>
          <h1 style={{ fontFamily: F.display, fontSize: 27, fontWeight: 600, color: C.text, marginBottom: 5 }}>Submit an Idea</h1>
          <p style={{ fontSize: 14.5, color: C.muted, marginBottom: 32 }}>Share a challenge or research opportunity with the INDEX community</p>

          <div style={{ display: 'flex', marginBottom: 36, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 15, left: '8%', right: '8%', height: 2, background: C.border, zIndex: 0 }} />
            <div style={{ position: 'absolute', top: 15, left: '8%', width: `${((step - 1) / (STEPS.length - 1)) * 84}%`, height: 2, background: C.signal, zIndex: 0, transition: 'width .3s' }} />
            {STEPS.map((s, i) => {
              const done2 = step > i + 1, active = step === i + 1;
              return (
                <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                  <div style={{ width: 29, height: 29, borderRadius: '50%', background: done2 ? C.signal : active ? C.ink : C.surface, border: `2px solid ${done2 || active ? C.signal : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: done2 ? C.ink : active ? C.onDark : C.muted }}>{done2 ? '✓' : i + 1}</div>
                  <div style={{ fontSize: 11, color: active ? C.signal : C.muted, marginTop: 6, fontWeight: active ? 600 : 400, textAlign: 'center', whiteSpace: 'nowrap' }}>{s}</div>
                </div>
              );
            })}
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: '32px 36px' }}>
            {error && <div style={errBox}>{error}</div>}

            {step === 1 && (
              <>
                <h2 style={{ fontFamily: F.display, fontSize: 17, fontWeight: 600, color: C.text, marginBottom: 22 }}>About Your Idea</h2>
                <label style={lbl}>Type</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                  {['Industry', 'Academia', 'Research'].map(t => (
                    <button key={t} onClick={() => setType(t)} style={{ padding: '8px 20px', borderRadius: 999, border: `1.5px solid ${type === t ? C.signal : C.border}`, background: type === t ? 'rgba(0,191,166,.1)' : C.surface, color: type === t ? C.signal : C.muted, fontSize: 13, fontWeight: type === t ? 600 : 400, cursor: 'pointer', fontFamily: F.body }}>{t}</button>
                  ))}
                </div>
                <label style={lbl}>Topic / Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} style={{ ...inp, marginBottom: 18 }} placeholder="e.g. AI-Driven Water Management System for Agriculture" />
                <label style={lbl}>Description</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4} style={inp} placeholder="Briefly describe the challenge and what a solution would look like..." />
              </>
            )}
            {step === 2 && (
              <>
                <h2 style={{ fontFamily: F.display, fontSize: 17, fontWeight: 600, color: C.text, marginBottom: 22 }}>The Problem</h2>
                <label style={lbl}>Problem Statement</label>
                <textarea value={problem} onChange={e => setProblem(e.target.value)} rows={4} style={{ ...inp, marginBottom: 18 }} placeholder="What specific problem are you trying to solve? Be as precise as possible..." />
                <label style={lbl}>Current Solutions & Limitations</label>
                <textarea value={limits} onChange={e => setLimits(e.target.value)} rows={3} style={inp} placeholder="What solutions already exist? Why aren't they sufficient?" />
              </>
            )}
            {step === 3 && (
              <>
                <h2 style={{ fontFamily: F.display, fontSize: 17, fontWeight: 600, color: C.text, marginBottom: 22 }}>Skills & Team</h2>
                <label style={lbl}>Skills Required</label>
                <input value={skillIn} onChange={e => setSkillIn(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillIn.trim()); } }} placeholder="Type a skill and press Enter, or click below" style={{ ...inp, marginBottom: 10 }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {SKILLS_DB.filter(s => !skills.includes(s)).slice(0, 9).map(s => <button key={s} onClick={() => addSkill(s)} style={{ padding: '4px 11px', borderRadius: 999, border: `1px solid ${C.border}`, background: C.canvas, color: C.muted, fontSize: 12, cursor: 'pointer' }}>+ {s}</button>)}
                </div>
                {skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 18 }}>
                    {skills.map(s => <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: 'rgba(0,191,166,.1)', border: `1.5px solid ${C.signal}`, color: C.signal, fontSize: 13, fontWeight: 600 }}>{s}<span onClick={() => rmSkill(s)} style={{ cursor: 'pointer', fontWeight: 700 }}>×</span></span>)}
                  </div>
                )}
                {recs.length > 0 && (
                  <div style={{ background: C.canvas, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: '14px 18px', marginBottom: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.signal, marginBottom: 10, letterSpacing: '.1em', textTransform: 'uppercase' }}>✦ AI Course Recommendations</div>
                    {recs.map(c => <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.text, marginBottom: 6 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: C.signal, flexShrink: 0 }} />{c}</div>)}
                  </div>
                )}
                <label style={lbl}>Team Size (max members)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[2, 3, 4, 5, 6, 8].map(n => <button key={n} onClick={() => setTeam(n)} style={{ width: 42, height: 42, borderRadius: 10, border: `1.5px solid ${team === n ? C.signal : C.border}`, background: team === n ? 'rgba(0,191,166,.1)' : C.surface, color: team === n ? C.signal : C.muted, fontWeight: team === n ? 700 : 400, cursor: 'pointer', fontSize: 14 }}>{n}</button>)}
                </div>
              </>
            )}
            {step === 4 && (
              <>
                <h2 style={{ fontFamily: F.display, fontSize: 17, fontWeight: 600, color: C.text, marginBottom: 22 }}>Research & References</h2>
                <LinkOrUpload label="Related Research Paper (optional)" value={researchLink} onChange={setResearchLink} userId={user.id} placeholder="URL, DOI, or upload a PDF" />
                <div style={{ height: 18 }} />
                <LinkOrUpload label="Related Current Work (optional)" value={workLink} onChange={setWorkLink} userId={user.id} placeholder="Link to existing work, or upload a file" />
                <label style={lbl}>Expected Timeline</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['1 month', '3 months', '6 months', '1 year'].map(t => <button key={t} onClick={() => setTl(t)} style={{ padding: '8px 18px', borderRadius: 999, border: `1.5px solid ${tl === t ? C.signal : C.border}`, background: tl === t ? 'rgba(0,191,166,.1)' : C.surface, color: tl === t ? C.signal : C.muted, fontSize: 13, cursor: 'pointer', fontWeight: tl === t ? 600 : 400 }}>{t}</button>)}
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 30, paddingTop: 22, borderTop: `1px solid ${C.border}` }}>
              {step > 1 && <button onClick={() => setStep(s => s - 1)} style={{ padding: '11px 20px', background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 12, color: C.muted, fontSize: 14, cursor: 'pointer', fontFamily: F.body }}>← Back</button>}
              {step < 4
                ? <button onClick={() => setStep(s => s + 1)} style={{ flex: 1, padding: '12px 0', background: C.signal, border: 'none', borderRadius: 12, color: C.ink, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: F.body }}>Continue →</button>
                : <button onClick={handleFinalSubmit} disabled={saving} style={{ flex: 1, padding: '12px 0', background: C.signal, border: 'none', borderRadius: 12, color: C.ink, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: F.body }}>{saving ? 'Submitting…' : '🚀 Submit to INDEX'}</button>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
