import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Trash2, Users, FileText, Briefcase, Plus } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../supabaseClient';
import { C, F } from '../theme';

const inp = { width: '100%', padding: '9px 12px', border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 13, display: 'block', color: C.text, background: C.surface, fontFamily: F.body, marginBottom: 10 };

export default function Admin({ user, view, onNav, onSignOut, onIdeasChanged }) {
  const [tab, setTab] = useState('ideas');
  const [ideas, setIdeas] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewOrg, setShowNewOrg] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: '', type: 'Industry', description: '' });
  const [newProject, setNewProject] = useState({ organization_id: '', title: '', description: '', skills: '', common_problems: '', difficulty: 'Intermediate', estimated_hours: 10 });

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: i }, { data: p }, { data: o }, { data: pr }] = await Promise.all([
      supabase.from('ideas').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('organizations').select('*').order('name'),
      supabase.from('practice_projects').select('*').order('created_at', { ascending: false }),
    ]);
    setIdeas(i || []); setProfiles(p || []); setOrgs(o || []); setProjects(pr || []); setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function deleteIdea(id) { if (!window.confirm('Delete this idea permanently?')) return; await supabase.from('ideas').delete().eq('id', id); load(); onIdeasChanged?.(); }
  async function toggleVerify(p) { await supabase.from('profiles').update({ is_verified: !p.is_verified, verification_type: p.is_verified ? null : (p.verification_type || 'company') }).eq('id', p.id); load(); }
  async function deleteOrg(id) { if (!window.confirm('Delete this organization and all its practice projects?')) return; await supabase.from('organizations').delete().eq('id', id); load(); }
  async function deleteProject(id) { if (!window.confirm('Delete this practice project?')) return; await supabase.from('practice_projects').delete().eq('id', id); load(); }

  async function createOrg() {
    if (!newOrg.name.trim()) return;
    await supabase.from('organizations').insert({ name: newOrg.name.trim(), type: newOrg.type, description: newOrg.description.trim() });
    setNewOrg({ name: '', type: 'Industry', description: '' }); setShowNewOrg(false); load();
  }
  async function createProject() {
    if (!newProject.title.trim() || !newProject.organization_id) return;
    await supabase.from('practice_projects').insert({
      organization_id: newProject.organization_id, title: newProject.title.trim(), description: newProject.description.trim(),
      skills: newProject.skills.split(',').map(s => s.trim()).filter(Boolean),
      common_problems: newProject.common_problems.split('\n').map(s => s.trim()).filter(Boolean),
      difficulty: newProject.difficulty, estimated_hours: Number(newProject.estimated_hours) || 10,
    });
    setNewProject({ organization_id: '', title: '', description: '', skills: '', common_problems: '', difficulty: 'Intermediate', estimated_hours: 10 });
    setShowNewProject(false); load();
  }

  if (!user?.is_admin) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar view={view} user={user} onNav={onNav} onSignOut={onSignOut} />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.canvas, fontFamily: F.body }}><div style={{ color: C.muted }}>Admin access only.</div></main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar view={view} user={user} onNav={onNav} onSignOut={onSignOut} />
      <main style={{ flex: 1, padding: '40px 44px', background: C.canvas, fontFamily: F.body }}>
        <h1 style={{ fontFamily: F.display, fontSize: 27, fontWeight: 600, color: C.text, marginBottom: 5 }}>Admin</h1>
        <p style={{ fontSize: 14.5, color: C.muted, marginBottom: 26 }}>Moderate content, manage verification, and curate the Practice Library.</p>

        <div style={{ display: 'flex', gap: 14, marginBottom: 26 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 10 }}><FileText size={17} color={C.signal} /><div><div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 18, color: C.text }}>{ideas.length}</div><div style={{ fontSize: 11, color: C.muted }}>Ideas</div></div></div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 10 }}><Users size={17} color={C.signal} /><div><div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 18, color: C.text }}>{profiles.length}</div><div style={{ fontSize: 11, color: C.muted }}>Users</div></div></div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 10 }}><Briefcase size={17} color={C.signal} /><div><div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 18, color: C.text }}>{projects.length}</div><div style={{ fontSize: 11, color: C.muted }}>Practice Projects</div></div></div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['ideas', 'users', 'practice library'].map(t => (
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
        ) : tab === 'users' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {profiles.map(p => (
              <div key={p.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontWeight: 600, fontSize: 13.5, color: C.text, display: 'flex', alignItems: 'center', gap: 6 }}>{p.name} {p.is_admin && <span style={{ fontSize: 10, color: C.amber, fontWeight: 700 }}>ADMIN</span>}</div><div style={{ fontSize: 11.5, color: C.faint }}>{p.role} {p.org ? `· ${p.org}` : ''}</div></div>
                <button onClick={() => toggleVerify(p)} style={{ padding: '7px 14px', background: p.is_verified ? 'rgba(0,191,166,.1)' : C.canvas, border: `1px solid ${p.is_verified ? C.signal : C.border}`, borderRadius: 8, color: p.is_verified ? C.signal : C.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontFamily: F.body }}><ShieldCheck size={13} /> {p.is_verified ? 'Verified' : 'Verify'}</button>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <button onClick={() => setShowNewOrg(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 12.5, cursor: 'pointer', fontFamily: F.body }}><Plus size={14} /> New Organization</button>
              <button onClick={() => setShowNewProject(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 12.5, cursor: 'pointer', fontFamily: F.body }}><Plus size={14} /> New Practice Project</button>
            </div>

            {showNewOrg && (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, marginBottom: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10, color: C.text }}>New Organization</div>
                <input style={inp} placeholder="Organization name" value={newOrg.name} onChange={e => setNewOrg(o => ({ ...o, name: e.target.value }))} />
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  {['Industry', 'Academia'].map(t => <button key={t} onClick={() => setNewOrg(o => ({ ...o, type: t }))} style={{ padding: '6px 16px', borderRadius: 999, border: `1.5px solid ${newOrg.type === t ? C.signal : C.border}`, background: newOrg.type === t ? 'rgba(0,191,166,.1)' : C.surface, color: newOrg.type === t ? C.signal : C.muted, fontSize: 12, cursor: 'pointer' }}>{t}</button>)}
                </div>
                <textarea style={{ ...inp, marginBottom: 12 }} rows={2} placeholder="Short description" value={newOrg.description} onChange={e => setNewOrg(o => ({ ...o, description: e.target.value }))} />
                <button onClick={createOrg} style={{ padding: '8px 20px', background: C.signal, border: 'none', borderRadius: 999, color: C.ink, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: F.body }}>Create</button>
              </div>
            )}

            {showNewProject && (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, marginBottom: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10, color: C.text }}>New Practice Project</div>
                <select style={inp} value={newProject.organization_id} onChange={e => setNewProject(p => ({ ...p, organization_id: e.target.value }))}>
                  <option value="">Select organization…</option>
                  {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
                <input style={inp} placeholder="Project title" value={newProject.title} onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))} />
                <textarea style={inp} rows={2} placeholder="Description" value={newProject.description} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} />
                <input style={inp} placeholder="Skills (comma separated)" value={newProject.skills} onChange={e => setNewProject(p => ({ ...p, skills: e.target.value }))} />
                <textarea style={inp} rows={3} placeholder="Common problems (one per line)" value={newProject.common_problems} onChange={e => setNewProject(p => ({ ...p, common_problems: e.target.value }))} />
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <select style={{ ...inp, marginBottom: 0 }} value={newProject.difficulty} onChange={e => setNewProject(p => ({ ...p, difficulty: e.target.value }))}>
                    {['Beginner', 'Intermediate', 'Advanced'].map(d => <option key={d}>{d}</option>)}
                  </select>
                  <input style={{ ...inp, marginBottom: 0 }} type="number" placeholder="Est. hours" value={newProject.estimated_hours} onChange={e => setNewProject(p => ({ ...p, estimated_hours: e.target.value }))} />
                </div>
                <button onClick={createProject} style={{ padding: '8px 20px', background: C.signal, border: 'none', borderRadius: 999, color: C.ink, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: F.body }}>Create</button>
              </div>
            )}

            <div style={{ fontSize: 12, fontWeight: 700, color: C.faint, textTransform: 'uppercase', marginBottom: 10 }}>Organizations</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 22 }}>
              {orgs.map(o => (
                <div key={o.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, color: C.text }}><strong>{o.name}</strong> <span style={{ color: C.faint }}>· {o.type}</span></div>
                  <button onClick={() => deleteOrg(o.id)} style={{ background: 'none', border: 'none', color: C.danger, cursor: 'pointer' }}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: C.faint, textTransform: 'uppercase', marginBottom: 10 }}>Practice Projects</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {projects.map(p => (
                <div key={p.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, color: C.text }}>{p.title}</div>
                  <button onClick={() => deleteProject(p.id)} style={{ background: 'none', border: 'none', color: C.danger, cursor: 'pointer' }}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
