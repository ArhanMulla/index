import { useState, useEffect } from 'react';
import { Briefcase, Clock, ArrowRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../supabaseClient';
import { C, F, typeColor } from '../theme';

const FILTERS = ['All', 'Industry', 'Academia'];

export default function PracticeLibrary({ user, view, onNav, onSignOut, onOpenProject }) {
  const [orgs, setOrgs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filt, setFilt] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: o }, { data: p }] = await Promise.all([
        supabase.from('organizations').select('*').order('name'),
        supabase.from('practice_projects').select('*').order('created_at', { ascending: false }),
      ]);
      setOrgs(o || []); setProjects(p || []); setLoading(false);
    })();
  }, []);

  const orgMap = Object.fromEntries(orgs.map(o => [o.id, o]));
  const filtered = projects.filter(p => filt === 'All' || orgMap[p.organization_id]?.type === filt);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar view={view} user={user} onNav={onNav} onSignOut={onSignOut} />
      <main style={{ flex: 1, padding: '40px 44px', background: C.canvas, fontFamily: F.body }}>
        <h1 style={{ fontFamily: F.display, fontSize: 27, fontWeight: 600, color: C.text, marginBottom: 5 }}>Practice Library</h1>
        <p style={{ fontSize: 14.5, color: C.muted, marginBottom: 24 }}>Self-paced projects modeled on real company and research work — build skill and experience before applying to live challenges.</p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 26 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilt(f)} style={{ padding: '9px 20px', borderRadius: 999, border: `1.5px solid ${filt === f ? C.signal : C.border}`, background: filt === f ? 'rgba(0,191,166,.1)' : C.surface, color: filt === f ? C.signal : C.muted, fontSize: 13, fontWeight: filt === f ? 600 : 400, cursor: 'pointer', fontFamily: F.body }}>{f}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ color: C.muted }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: C.muted }}>
            <div style={{ fontFamily: F.display, fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 8 }}>No practice projects yet</div>
            <div style={{ fontSize: 14 }}>Check back soon — organizations add new self-paced projects here regularly.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {filtered.map(p => {
              const org = orgMap[p.organization_id];
              return (
                <div key={p.id} onClick={() => onOpenProject(p)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px', cursor: 'pointer', transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.signal; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${org?.logo_color || C.research}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Briefcase size={15} color={org?.logo_color || C.research} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{org?.name}</div>
                      <div style={{ fontSize: 10.5, color: C.faint }}>{org?.type}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: F.display, fontSize: 15.5, fontWeight: 600, color: C.text, marginBottom: 8, lineHeight: 1.35 }}>{p.title}</div>
                  <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6, marginBottom: 14, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.description}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                    {(p.skills || []).slice(0, 3).map(s => <span key={s} style={{ padding: '3px 9px', borderRadius: 999, background: C.canvas, color: C.muted, fontSize: 10.5, border: `1px solid ${C.border}` }}>{s}</span>)}
                  </div>
                  <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: C.faint, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> {p.estimated_hours}h · {p.difficulty}</span>
                    <span style={{ fontSize: 12, color: C.signal, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>View <ArrowRight size={12} /></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
