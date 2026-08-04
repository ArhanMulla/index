import { useState, useEffect } from 'react';
import { ArrowLeft, Briefcase, Clock, CheckCircle2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../supabaseClient';
import { C, F } from '../theme';

export default function PracticeProjectDetail({ project, user, view, onNav, onSignOut, onBack }) {
  const [org, setOrg] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!project) return;
    supabase.from('organizations').select('*').eq('id', project.organization_id).maybeSingle().then(({ data }) => setOrg(data));
    supabase.from('practice_completions').select('id').eq('project_id', project.id).eq('user_id', user.id).maybeSingle().then(({ data }) => setCompleted(Boolean(data)));
  }, [project, user.id]);

  if (!project) { onNav('practice'); return null; }

  async function markComplete() {
    setSaving(true);
    const { error } = await supabase.from('practice_completions').insert({ project_id: project.id, user_id: user.id });
    setSaving(false);
    if (!error || error.code === '23505') setCompleted(true);
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar view={view} user={user} onNav={onNav} onSignOut={onSignOut} />
      <main style={{ flex: 1, padding: '40px 44px', background: C.canvas, overflowY: 'auto', fontFamily: F.body }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: C.muted, fontSize: 13, cursor: 'pointer', marginBottom: 22, padding: 0, fontFamily: F.body }}>
          <ArrowLeft size={15} /> Back to Practice Library
        </button>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: '32px 36px', marginBottom: 16, maxWidth: 760 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${org?.logo_color || C.research}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={18} color={org?.logo_color || C.research} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{org?.name}</div>
              <div style={{ fontSize: 11.5, color: C.faint }}>{org?.type} · {org?.description}</div>
            </div>
          </div>

          <h1 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 600, color: C.text, marginBottom: 12 }}>{project.title}</h1>
          <p style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.75, marginBottom: 18 }}>{project.description}</p>

          <div style={{ display: 'flex', gap: 20, fontSize: 12.5, color: C.muted, marginBottom: 22 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={13} /> ~{project.estimated_hours} hours</span>
            <span>{project.difficulty}</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {(project.skills || []).map(s => <span key={s} style={{ padding: '6px 14px', borderRadius: 999, background: 'rgba(0,191,166,.1)', border: `1.5px solid ${C.signal}`, color: C.signal, fontSize: 13, fontWeight: 600 }}>{s}</span>)}
          </div>

          {(project.common_problems || []).length > 0 && (
            <div style={{ background: C.canvas, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 24px', marginBottom: 24 }}>
              <div style={{ fontFamily: F.display, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 10 }}>Problems people usually hit on this kind of project</div>
              <p style={{ fontSize: 12, color: C.faint, marginBottom: 14 }}>Seeded from what {org?.name} says actually goes wrong in real work like this — so you're not just guessing at a vague brief.</p>
              {(project.common_problems || []).map((prob, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: C.text, marginBottom: 8, alignItems: 'flex-start' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.amber, marginTop: 7, flexShrink: 0 }} />
                  {prob}
                </div>
              ))}
            </div>
          )}

          {completed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 0', color: C.signal, fontWeight: 700, fontSize: 14 }}>
              <CheckCircle2 size={18} /> Marked as completed
            </div>
          ) : (
            <button onClick={markComplete} disabled={saving} style={{ padding: '13px 30px', background: C.signal, border: 'none', borderRadius: 999, color: C.ink, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: F.body }}>
              {saving ? 'Saving…' : 'Mark as Completed'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
