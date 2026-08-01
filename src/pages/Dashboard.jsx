import { Target, Zap, TrendingUp, Link2, ArrowRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import IdeaCard from '../components/IdeaCard';
import { computeMatch } from '../data';
import { C, F } from '../theme';

export default function Dashboard({ user, allIdeas, view, onNav, onOpenIdea, onSignOut }) {
  const ranked = [...allIdeas].map(idea => ({ idea, match: computeMatch(user?.skills, idea.skills) })).sort((a, b) => b.match - a.match).slice(0, 3);
  const goodMatches = allIdeas.filter(idea => computeMatch(user?.skills, idea.skills) >= 50).length;
  const submittedByMe = allIdeas.filter(idea => idea.author_id === user?.id).length;

  const STATS = [
    [String(goodMatches), 'Skill Matches', Target],
    [String(submittedByMe), 'Ideas Submitted', Zap],
    [`${(user?.skills || []).length}`, 'Skills Listed', TrendingUp],
    [String(allIdeas.length), 'Total Challenges', Link2],
  ];

  const checks = [
    { done: Boolean(user?.name && user.name !== user?.email?.split('@')[0]), label: 'Add your real name' },
    { done: Boolean(user?.org), label: 'Add your organization' },
    { done: (user?.skills || []).length > 0, label: 'List at least one skill' },
    { done: Boolean(user?.portfolio_link || user?.cv_link || user?.linkedin_link), label: 'Add a CV, portfolio, or LinkedIn link' },
  ];
  const completion = Math.round((checks.filter(c => c.done).length / checks.length) * 100);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar view={view} user={user} onNav={onNav} onSignOut={onSignOut} />
      <main style={{ flex: 1, padding: '40px 44px', background: C.canvas, overflowY: 'auto', fontFamily: F.body }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: F.display, fontSize: 27, fontWeight: 600, color: C.text }}>
            Good morning, {user?.name?.split(' ')[0] || 'there'} <span style={{ opacity: 0.5 }}>👋</span>
          </h1>
          <p style={{ fontSize: 14.5, color: C.muted, marginTop: 5 }}>Here are challenges matching your profile</p>
        </div>

        {completion < 100 && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: '22px 26px', marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontFamily: F.display, fontSize: 15, fontWeight: 600, color: C.text }}>Finish setting up your profile</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.signal }}>{completion}%</div>
            </div>
            <div style={{ height: 6, background: C.canvas, borderRadius: 999, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ width: `${completion}%`, height: '100%', background: C.signal, borderRadius: 999, transition: 'width .4s' }} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
              {checks.map(c => (
                <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: c.done ? C.faint : C.text, textDecoration: c.done ? 'line-through' : 'none' }}>
                  <span style={{ width: 15, height: 15, borderRadius: '50%', border: `1.5px solid ${c.done ? C.signal : C.border}`, background: c.done ? C.signal : 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: C.ink, flexShrink: 0 }}>{c.done ? '✓' : ''}</span>
                  {c.label}
                </div>
              ))}
            </div>
            <button onClick={() => onNav('profile')} style={{ marginTop: 16, padding: '9px 20px', background: C.ink, border: 'none', borderRadius: 999, color: C.onDark, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: F.body }}>Complete Profile →</button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
          {STATS.map(([v, l, Icon]) => (
            <div key={l} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 20px' }}>
              <Icon size={19} color={C.signal} strokeWidth={2} style={{ marginBottom: 10 }} />
              <div style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.text }}>{v}</div>
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: F.display, fontSize: 18, fontWeight: 600, color: C.text }}>Recommended for you</div>
          <button onClick={() => onNav('browse')} style={{ fontSize: 13, color: C.signal, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: 4, fontFamily: F.body }}>View All <ArrowRight size={14} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {ranked.map(({ idea, match }) => <IdeaCard key={idea.id} idea={idea} match={match} onOpen={onOpenIdea} />)}
        </div>
      </main>
    </div>
  );
}
