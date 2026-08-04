import { useState } from 'react';
import { Search } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import IdeaCard from '../components/IdeaCard';
import { computeMatch } from '../data';
import { C, F } from '../theme';

const FILTERS = ['All', 'Industry', 'Research', 'Academia'];
const STATUS_FILTERS = ['All statuses', 'Open', 'In Progress', 'Completed'];
const STATUS_MAP = { 'Open': 'open', 'In Progress': 'in_progress', 'Completed': 'completed' };

export default function Browse({ user, allIdeas, loading, loadError, view, onNav, onOpenIdea, onSignOut }) {
  const [filt, setFilt] = useState('All');
  const [statusFilt, setStatusFilt] = useState('All statuses');
  const [srch, setSrch] = useState('');

  const filtered = allIdeas.filter(i =>
    (filt === 'All' || i.type === filt) &&
    (statusFilt === 'All statuses' || (i.status || 'open') === STATUS_MAP[statusFilt]) &&
    (!srch || i.title.toLowerCase().includes(srch.toLowerCase()) || (i.skills || []).some(s => s.toLowerCase().includes(srch.toLowerCase())))
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar view={view} user={user} onNav={onNav} onSignOut={onSignOut} />
      <main style={{ flex: 1, padding: '40px 44px', background: C.canvas, fontFamily: F.body }}>
        <h1 style={{ fontFamily: F.display, fontSize: 27, fontWeight: 600, color: C.text, marginBottom: 5 }}>Browse Challenges</h1>
        <p style={{ fontSize: 14.5, color: C.muted, marginBottom: 22 }}>{loading ? 'Loading challenges…' : `${filtered.length} challenges · Find your next collaboration`}</p>

        {loadError && (
          <div style={{ background: C.dangerBg, border: '1.5px solid #F0C9C0', borderRadius: 12, padding: '12px 16px', color: C.danger, fontSize: 13, marginBottom: 20 }}>
            <strong>Couldn't load submitted challenges:</strong> {loadError}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.faint }} />
            <input value={srch} onChange={e => setSrch(e.target.value)} placeholder="Search by title, skill, or keyword..."
              style={{ width: '100%', padding: '11px 14px 11px 38px', border: `1.5px solid ${C.border}`, borderRadius: 12, fontSize: 14, color: C.text, background: C.surface, fontFamily: F.body }} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilt(f)} style={{ padding: '10px 18px', borderRadius: 999, border: `1.5px solid ${filt === f ? C.signal : C.border}`, background: filt === f ? 'rgba(0,191,166,.1)' : C.surface, color: filt === f ? C.signal : C.muted, fontSize: 13, fontWeight: filt === f ? 600 : 400, cursor: 'pointer', fontFamily: F.body }}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setStatusFilt(s)} style={{ padding: '6px 14px', borderRadius: 999, border: `1px solid ${statusFilt === s ? C.text : C.border}`, background: statusFilt === s ? C.text : 'transparent', color: statusFilt === s ? C.onDark : C.faint, fontSize: 11.5, cursor: 'pointer', fontFamily: F.body }}>{s}</button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {filtered.map(idea => <IdeaCard key={idea.id} idea={idea} match={computeMatch(user?.skills, idea.skills)} onOpen={onOpenIdea} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: C.muted }}>
            <div style={{ fontFamily: F.display, fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 8 }}>{loading ? 'Loading…' : 'No challenges found'}</div>
            {!loading && <div style={{ fontSize: 14 }}>Try a different search or filter</div>}
          </div>
        )}
      </main>
    </div>
  );
}
