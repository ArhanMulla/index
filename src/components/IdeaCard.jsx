import { useState } from 'react';
import { ShieldCheck, Users, Clock } from 'lucide-react';
import { C, F, SHADOW, typeColor } from '../theme';

function MatchRing({ pct }) {
  const r = 15, c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div style={{ position: 'relative', width: 38, height: 38, flexShrink: 0 }}>
      <svg width="38" height="38" viewBox="0 0 38 38">
        <circle cx="19" cy="19" r={r} fill="none" stroke={C.border} strokeWidth="3" />
        <circle cx="19" cy="19" r={r} fill="none" stroke={C.signal} strokeWidth="3"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 19 19)" style={{ transition: 'stroke-dashoffset .5s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 700, color: C.text, fontFamily: F.body }}>
        {pct}%
      </div>
    </div>
  );
}

const STATUS_LABEL = { open: 'Open', in_progress: 'In Progress', completed: 'Completed' };
const STATUS_COLOR = { open: C.signal, in_progress: C.amber, completed: C.muted };

export default function IdeaCard({ idea, match, onOpen }) {
  const [hov, setHov] = useState(false);
  const col = typeColor(idea.type);
  const status = idea.status || 'open';

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onOpen(idea)}
      style={{
        background: C.surface,
        border: `1px solid ${hov ? C.signal : C.border}`,
        borderRadius: 16, padding: '18px 18px 15px', cursor: 'pointer',
        transition: 'all 0.2s', transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov ? SHADOW.md : SHADOW.sm, fontFamily: F.body,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 11 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ padding: '3px 10px', borderRadius: 999, background: `${col}16`, color: col, fontSize: 10, fontWeight: 700, letterSpacing: '0.04em' }}>
            {(idea.type || '').toUpperCase()}
          </span>
          {status !== 'open' && (
            <span style={{ padding: '3px 10px', borderRadius: 999, background: `${STATUS_COLOR[status]}16`, color: STATUS_COLOR[status], fontSize: 10, fontWeight: 700 }}>
              {STATUS_LABEL[status]}
            </span>
          )}
        </div>
        <MatchRing pct={match} />
      </div>

      <div style={{ fontFamily: F.display, fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 7, lineHeight: 1.35, minHeight: 40 }}>
        {idea.title}
      </div>

      <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6, marginBottom: 12, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {idea.desc}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
        {(idea.skills || []).slice(0, 3).map(s => (
          <span key={s} style={{ padding: '3px 9px', borderRadius: 999, background: C.canvas, color: C.muted, fontSize: 10.5, border: `1px solid ${C.border}` }}>{s}</span>
        ))}
        {(idea.skills || []).length > 3 && <span style={{ fontSize: 10.5, color: C.faint, padding: '3px 0' }}>+{idea.skills.length - 3}</span>}
      </div>

      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 10, fontSize: 11, color: C.faint, alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Users size={11} />{idea.team ?? 0}/{idea.max ?? '—'}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} />{idea.posted || 'Just now'}</span>
        </div>
        {idea.author_verified && <ShieldCheck size={13} style={{ color: C.signal }} />}
      </div>
    </div>
  );
}
