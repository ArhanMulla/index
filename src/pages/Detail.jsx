import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Chat from '../components/Chat';
import Avatar from '../components/Avatar';
import { supabase } from '../supabaseClient';
import { moderationIssue } from '../utils/moderation';
import { typeColor, C, F } from '../theme';
import { COURSE_MAP as CM, computeMatch } from '../data';

const inp = { width: '100%', padding: '9px 12px', border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 13, display: 'block', color: C.text, background: C.surface, fontFamily: F.body };
const lbl = { display: 'block', fontSize: 12.5, fontWeight: 600, color: C.text, marginBottom: 5 };

export default function Detail({ idea, user, view, onNav, onSubmit, onSignOut, onIdeasChanged }) {
  const [myApplication, setMyApplication] = useState(null);
  const [applications, setApplications] = useState([]);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [motivation, setMotivation] = useState('');
  const [contribution, setContribution] = useState('');
  const [certificateLink, setCertificateLink] = useState('');
  const [portfolioLink, setPortfolioLink] = useState(user?.portfolio_link || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [outcomeText, setOutcomeText] = useState(idea?.outcome_report || '');
  const [savingOutcome, setSavingOutcome] = useState(false);

  const isAuthor = idea && !idea.seed && idea.author_id === user?.id;
  const isSeed = idea?.seed;
  const isAdmin = user?.is_admin;
  const matchedSkills = (idea?.skills || []).filter(s => (user?.skills || []).some(us => us.toLowerCase() === s.toLowerCase()));
  const status = idea?.status || 'open';

  // FIX: both the idea's author AND the applicant now load what they
  // each need to know whether an accepted collaboration exists — this
  // was previously only ever loaded for the author, so the applicant's
  // side could never see the chat unlock.
  const refresh = useCallback(async () => {
    if (!idea || isSeed) return;
    if (isAuthor || isAdmin) {
      const { data } = await supabase.from('applications').select('*, applicant:profiles(name, role, org, skills, portfolio_link, linkedin_link, cv_link, is_verified, avatar_url)').eq('idea_id', idea.id).order('created_at', { ascending: true });
      setApplications(data || []);
    }
    if (user && !isAuthor) {
      const { data } = await supabase.from('applications').select('*').eq('idea_id', idea.id).eq('applicant_id', user.id).maybeSingle();
      setMyApplication(data || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idea?.id, isAuthor, isAdmin, user?.id, isSeed]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { setOutcomeText(idea?.outcome_report || ''); }, [idea?.outcome_report]);

  if (!idea) { onNav('browse'); return null; }

  const col = typeColor(idea.type);
  const match = computeMatch(user?.skills, idea.skills);
  const courses = idea.courses?.length ? idea.courses : (idea.skills || []).filter(s => CM[s]).map(s => CM[s]);

  // Unified "who am I chatting with" — works whether I'm the owner (pick
  // from the applications list) or the applicant (use my own application).
  const acceptedCollab = isAuthor
    ? applications.find(a => a.status === 'accepted')
    : (myApplication?.status === 'accepted' ? myApplication : null);
  const chatOtherId = acceptedCollab && (isAuthor ? acceptedCollab.applicant_id : idea.author_id);
  const chatOtherName = acceptedCollab && (isAuthor ? (acceptedCollab.applicant?.name || 'your collaborator') : idea.author);

  async function notify(userId, type, title, body, relatedIdeaId) {
    await supabase.from('notifications').insert({ user_id: userId, type, title, body, related_idea_id: relatedIdeaId });
  }

  async function sendApplication() {
    if (!motivation.trim() || !contribution.trim()) { setErr("Please fill in why you want to join and how you'd contribute."); return; }
    const modIssue = moderationIssue(motivation) || moderationIssue(contribution);
    if (modIssue) { setErr(modIssue); return; }
    setBusy(true); setErr('');
    const { data, error } = await supabase.from('applications').insert({
      idea_id: idea.id, applicant_id: user.id, motivation: motivation.trim(), contribution: contribution.trim(),
      certificate_link: certificateLink.trim() || null, portfolio_link: portfolioLink.trim() || null, contact_email: contactEmail.trim() || user.email,
    }).select().single();
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setMyApplication(data); setShowApplyForm(false);
    await notify(idea.author_id, 'new_application', 'New application', `${user.name} applied to "${idea.title}"`, idea.id);
  }

  async function decide(app, status2) {
    setBusy(true); setErr('');
    const { error } = await supabase.from('applications').update({ status: status2 }).eq('id', app.id);
    if (!error && status2 === 'accepted') {
      await supabase.from('ideas').update({ team: (idea.team || 0) + 1 }).eq('id', idea.id);
      onIdeasChanged?.();
    }
    setBusy(false);
    if (error) { setErr(error.message); return; }
    await notify(app.applicant_id, status2 === 'accepted' ? 'application_accepted' : 'application_declined',
      status2 === 'accepted' ? "You're in!" : 'Application update',
      status2 === 'accepted' ? `Your application to "${idea.title}" was accepted — you can now chat on this page.` : `Your application to "${idea.title}" was declined.`, idea.id);
    refresh();
  }

  async function saveOutcome(newStatus) {
    setSavingOutcome(true);
    const payload = { status: newStatus };
    if (newStatus === 'completed') { payload.outcome_report = outcomeText.trim() || null; payload.completed_at = new Date().toISOString(); }
    const { error } = await supabase.from('ideas').update(payload).eq('id', idea.id);
    setSavingOutcome(false);
    if (!error) onIdeasChanged?.();
  }

  async function adminDelete() {
    if (!window.confirm('Delete this idea permanently? This cannot be undone.')) return;
    await supabase.from('ideas').delete().eq('id', idea.id);
    onIdeasChanged?.(); onNav('browse');
  }

  const statusPill = (s) => {
    const map = { pending: [C.amber, 'Pending'], accepted: [C.signal, 'Accepted'], declined: [C.faint, 'Declined'] };
    const [c, label] = map[s] || map.pending;
    return <span style={{ padding: '3px 10px', borderRadius: 999, background: `${c}18`, color: c, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{label}</span>;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar view={view} user={user} onNav={onNav} onSignOut={onSignOut} />
      <main style={{ flex: 1, padding: '40px 44px', background: C.canvas, overflowY: 'auto', fontFamily: F.body }}>
        <button onClick={() => onNav('browse')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 22, padding: 0, fontFamily: F.body }}>← Back to Browse</button>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: '32px 36px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ padding: '5px 14px', borderRadius: 999, background: `${col}18`, color: col, fontSize: 12, fontWeight: 700 }}>{idea.type}</span>
              {status !== 'open' && <span style={{ padding: '5px 14px', borderRadius: 999, background: status === 'completed' ? `${C.muted}18` : `${C.amber}18`, color: status === 'completed' ? C.muted : C.amber, fontSize: 12, fontWeight: 700 }}>{status === 'in_progress' ? 'In Progress' : 'Completed'}</span>}
            </div>
            <span style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: C.signal }}>{match}% match</span>
          </div>
          <h1 style={{ fontFamily: F.display, fontSize: 25, fontWeight: 600, color: C.text, marginBottom: 12, lineHeight: 1.25 }}>{idea.title}</h1>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, marginBottom: 20 }}>{idea.desc}</p>
          <div style={{ display: 'flex', gap: 28, fontSize: 13, color: C.muted, flexWrap: 'wrap' }}>
            <span>👤 <strong style={{ color: C.text }}>{idea.author}</strong>{idea.org ? ` · ${idea.org}` : ''} {idea.author_verified && <ShieldCheck size={12} style={{ display: 'inline', color: C.signal, verticalAlign: -1 }} />}</span>
            <span>⏰ {idea.posted || 'Just now'}</span>
            <span>👥 {idea.team ?? 0}/{idea.max ?? '—'} members</span>
          </div>
          {isAdmin && !isAuthor && (
            <button onClick={adminDelete} style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: C.dangerBg, border: 'none', borderRadius: 8, color: C.danger, fontSize: 12, cursor: 'pointer', fontFamily: F.body }}><Trash2 size={13} /> Admin: Remove this idea</button>
          )}
        </div>

        {status === 'completed' && idea.outcome_report && (
          <div style={{ background: `${C.signal}0D`, border: `1.5px solid ${C.signal}`, borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
            <div style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>✓ Outcome Report</div>
            <p style={{ fontSize: 13.5, color: C.text, lineHeight: 1.7 }}>{idea.outcome_report}</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '24px 28px' }}>
              <div style={{ fontFamily: F.display, fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 12 }}>Problem Statement</div>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8 }}>{idea.problem}</p>
              {idea.limitations && <><div style={{ fontFamily: F.display, fontSize: 14, fontWeight: 600, color: C.text, marginTop: 16, marginBottom: 8 }}>Current Limitations</div><p style={{ fontSize: 13, color: C.muted, lineHeight: 1.75 }}>{idea.limitations}</p></>}
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '24px 28px' }}>
              <div style={{ fontFamily: F.display, fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 12 }}>Skills Required</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>{(idea.skills || []).map(s => <span key={s} style={{ padding: '6px 14px', borderRadius: 999, background: 'rgba(0,191,166,.1)', border: `1.5px solid ${C.signal}`, color: C.signal, fontSize: 13, fontWeight: 600 }}>{s}</span>)}</div>
              {courses.length > 0 && <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}><div style={{ fontSize: 11, fontWeight: 700, color: C.signal, marginBottom: 10, letterSpacing: '.1em', textTransform: 'uppercase' }}>✦ Suggested Courses</div>{courses.map(c => <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.muted, marginBottom: 8 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: C.signal, flexShrink: 0 }} />{c}</div>)}</div>}
              {(idea.research_link || idea.work_link) && (
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, marginTop: 14 }}>
                  {idea.research_link && <div style={{ fontSize: 13, marginBottom: 6 }}><span style={{ color: C.muted }}>Related paper: </span><a href={idea.research_link} target="_blank" rel="noreferrer" style={{ color: C.signal }}>View document ↗</a></div>}
                  {idea.work_link && <div style={{ fontSize: 13 }}><span style={{ color: C.muted }}>Related work: </span><a href={idea.work_link} target="_blank" rel="noreferrer" style={{ color: C.signal }}>View document ↗</a></div>}
                </div>
              )}
            </div>

            {isAuthor && !isSeed && (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '24px 28px' }}>
                <div style={{ fontFamily: F.display, fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 4 }}>Applicants {applications.length > 0 && `(${applications.length})`}</div>
                <p style={{ fontSize: 12.5, color: C.faint, marginBottom: 16 }}>People who've applied to join this challenge.</p>
                {applications.length === 0 && <p style={{ fontSize: 13.5, color: C.muted }}>No applications yet.</p>}
                {applications.map(app => (
                  <div key={app.id} style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px', marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <Avatar url={app.applicant?.avatar_url} initials={(app.applicant?.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()} size={30} fontSize={11} />
                        <div><span style={{ fontWeight: 700, fontSize: 13.5, color: C.text }}>{app.applicant?.name}</span> {app.applicant?.is_verified && <ShieldCheck size={12} style={{ display: 'inline', color: C.signal }} />}<div style={{ fontSize: 12, color: C.muted }}>{app.applicant?.role}{app.applicant?.org ? ` · ${app.applicant.org}` : ''}</div></div>
                      </div>
                      {statusPill(app.status)}
                    </div>
                    {app.applicant?.skills?.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>{app.applicant.skills.map(s => <span key={s} style={{ padding: '2px 9px', borderRadius: 999, background: (idea.skills || []).includes(s) ? 'rgba(0,191,166,.12)' : C.canvas, color: (idea.skills || []).includes(s) ? C.signal : C.faint, fontSize: 10.5, fontWeight: 600, border: `1px solid ${(idea.skills || []).includes(s) ? C.signal : C.border}` }}>{s}</span>)}</div>}
                    {app.motivation && <div style={{ fontSize: 12.5, color: '#374151', marginBottom: 6 }}><strong>Why:</strong> {app.motivation}</div>}
                    {app.contribution && <div style={{ fontSize: 12.5, color: '#374151', marginBottom: 6 }}><strong>How:</strong> {app.contribution}</div>}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                      {app.certificate_link && <a href={app.certificate_link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.signal }}>📜 Certificate</a>}
                      {app.portfolio_link && <a href={app.portfolio_link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.signal }}>💼 Portfolio</a>}
                    </div>
                    {app.status === 'pending' && <div style={{ display: 'flex', gap: 8 }}><button disabled={busy} onClick={() => decide(app, 'accepted')} style={{ padding: '6px 14px', background: C.signal, border: 'none', borderRadius: 8, color: C.ink, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Accept</button><button disabled={busy} onClick={() => decide(app, 'declined')} style={{ padding: '6px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, cursor: 'pointer', fontSize: 12 }}>Decline</button></div>}
                  </div>
                ))}
              </div>
            )}

            {isAuthor && !isSeed && (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '24px 28px' }}>
                <div style={{ fontFamily: F.display, fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 14 }}>Challenge Status</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  {['open', 'in_progress', 'completed'].map(s => <button key={s} onClick={() => saveOutcome(s)} disabled={savingOutcome} style={{ padding: '8px 16px', borderRadius: 999, border: `1.5px solid ${status === s ? C.signal : C.border}`, background: status === s ? 'rgba(0,191,166,.1)' : C.surface, color: status === s ? C.signal : C.muted, fontSize: 12.5, fontWeight: status === s ? 600 : 400, cursor: 'pointer', fontFamily: F.body }}>{s === 'in_progress' ? 'In Progress' : s[0].toUpperCase() + s.slice(1)}</button>)}
                </div>
                {status === 'completed' && (
                  <>
                    <label style={lbl}>Outcome report (this becomes case-study material)</label>
                    <textarea value={outcomeText} onChange={e => setOutcomeText(e.target.value)} rows={3} style={{ ...inp, marginBottom: 10 }} placeholder="What happened? What was delivered?" />
                    <button onClick={() => saveOutcome('completed')} disabled={savingOutcome} style={{ padding: '8px 18px', background: C.ink, border: 'none', borderRadius: 999, color: C.onDark, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: F.body }}>{savingOutcome ? 'Saving…' : 'Save Outcome'}</button>
                  </>
                )}
              </div>
            )}

            {acceptedCollab && !isSeed && chatOtherId && (
              <Chat ideaId={idea.id} myId={user.id} otherId={chatOtherId} otherName={chatOtherName} />
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isAuthor ? (
              <div style={{ background: 'rgba(0,191,166,.1)', border: `1.5px solid ${C.signal}`, borderRadius: 14, padding: '14px 18px', fontSize: 12.5, color: C.text, textAlign: 'center' }}>This is your challenge — manage applicants on the left.</div>
            ) : isSeed ? (
              <div style={{ background: '#FFF7ED', border: '1.5px solid #FED7AA', borderRadius: 14, padding: '14px 18px', fontSize: 12.5, color: '#9A3412' }}>This is a sample challenge shown for demonstration. Try applying to a real submitted idea from Browse instead.</div>
            ) : myApplication ? (
              <div style={{ padding: '16px 18px', background: C.canvas, border: `1.5px solid ${C.border}`, borderRadius: 14 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>✓ Application Sent</span>{statusPill(myApplication.status)}</div>{myApplication.status === 'accepted' && <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>Chat with the challenge owner below 👇</div>}</div>
            ) : showApplyForm ? (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
                <div style={{ fontFamily: F.display, fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 4 }}>Apply to Join</div>
                {matchedSkills.length > 0 && <div style={{ background: 'rgba(0,191,166,.08)', borderRadius: 8, padding: '8px 10px', fontSize: 11.5, color: C.text, marginBottom: 14, marginTop: 10 }}>✓ Matches {matchedSkills.length} of your skills: {matchedSkills.join(', ')}</div>}
                {err && <div style={{ fontSize: 12, color: C.danger, marginBottom: 10 }}>{err}</div>}
                <label style={lbl}>Why do you want to join? *</label>
                <textarea value={motivation} onChange={e => setMotivation(e.target.value)} rows={2} style={{ ...inp, marginBottom: 12 }} />
                <label style={lbl}>How would you contribute? *</label>
                <textarea value={contribution} onChange={e => setContribution(e.target.value)} rows={2} style={{ ...inp, marginBottom: 12 }} />
                <label style={lbl}>Certificate link (optional)</label>
                <input value={certificateLink} onChange={e => setCertificateLink(e.target.value)} style={{ ...inp, marginBottom: 12 }} />
                <label style={lbl}>Portfolio link (optional)</label>
                <input value={portfolioLink} onChange={e => setPortfolioLink(e.target.value)} style={{ ...inp, marginBottom: 12 }} />
                <label style={lbl}>Contact email</label>
                <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} style={{ ...inp, marginBottom: 16 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowApplyForm(false)} style={{ padding: '9px 14px', background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 10, color: C.muted, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                  <button disabled={busy} onClick={sendApplication} style={{ flex: 1, padding: '9px 0', background: C.signal, border: 'none', borderRadius: 10, color: C.ink, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{busy ? 'Sending…' : 'Send Application'}</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowApplyForm(true)} style={{ width: '100%', padding: '14px 0', background: C.signal, border: 'none', borderRadius: 14, color: C.ink, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: F.body }}>Apply to Join Team</button>
            )}

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>Posted By</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar url={idea.author_avatar_url} initials={(idea.author || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()} size={36} fontSize={13} border={`1.5px solid ${C.signal}`} />
                <div><div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{idea.author}</div><div style={{ fontSize: 12, color: C.muted }}>{idea.role}{idea.org ? ` · ${idea.org}` : ''}</div></div>
              </div>
            </div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 20px' }}>
              {[['👥', 'Team', `${idea.team ?? 0} of ${idea.max ?? '—'} filled`], ['⏰', 'Posted', idea.posted || 'Just now'], ['✅', 'Status', status === 'in_progress' ? 'In Progress' : status[0].toUpperCase() + status.slice(1)]].map(([icon, label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><span style={{ fontSize: 13, color: C.muted }}>{icon} {label}</span><span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{val}</span></div>
              ))}
            </div>
            <button onClick={onSubmit} style={{ padding: '11px 20px', background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 12, color: C.muted, fontSize: 13, cursor: 'pointer', width: '100%', fontFamily: F.body }}>Submit Similar Idea</button>
          </div>
        </div>
      </main>
    </div>
  );
}
