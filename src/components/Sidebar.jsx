import { LayoutGrid, Search, PlusCircle, User, Backpack, ShieldCheck, LogOut, GraduationCap } from 'lucide-react';
import { C, F } from '../theme';
import NotificationBell from './NotificationBell';
import Avatar from './Avatar';

const NAV = [
  { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { id: 'browse',    icon: Search,     label: 'Browse Challenges' },
  { id: 'submit',    icon: PlusCircle, label: 'Submit Idea' },
  { id: 'practice',  icon: GraduationCap, label: 'Practice Library' },
  { id: 'profile',   icon: User,       label: 'My Profile' },
  { id: 'junior',    icon: Backpack,   label: 'INDEX Junior' },
];

export default function Sidebar({ view, user, onNav, onSignOut }) {
  return (
    <aside style={{
      width: 232, background: C.ink, flexShrink: 0,
      display: 'flex', flexDirection: 'column', minHeight: '100vh',
      position: 'sticky', top: 0, zIndex: 10, borderRight: `1px solid rgba(255,255,255,.06)`,
    }}>
      <div style={{ padding: '22px 20px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 21, color: C.onDark, letterSpacing: '-0.3px' }}>
          INDEX<span style={{ color: C.signal }}>.</span>
        </div>
        <NotificationBell user={user} onNav={onNav} />
      </div>

      <nav style={{ padding: '4px 12px' }}>
        {NAV.map(item => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 11,
                width: '100%', padding: '10px 14px', marginBottom: 2,
                background: active ? 'rgba(0,191,166,.14)' : 'transparent',
                border: 'none', borderRadius: 10,
                color: active ? C.signal : C.onDarkMuted,
                fontSize: 13.5, fontWeight: active ? 600 : 500, cursor: 'pointer',
                textAlign: 'left', transition: 'all .15s', fontFamily: F.body,
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,.04)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon size={17} strokeWidth={2} />
              {item.label}
            </button>
          );
        })}

        {user?.is_admin && (
          <button
            onClick={() => onNav('admin')}
            style={{
              display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '10px 14px', marginTop: 6,
              background: view === 'admin' ? 'rgba(214,160,40,.14)' : 'transparent',
              border: `1px solid ${view === 'admin' ? C.amber : 'rgba(214,160,40,.3)'}`, borderRadius: 10,
              color: C.amber, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', textAlign: 'left', fontFamily: F.body,
            }}
          >
            <ShieldCheck size={17} strokeWidth={2} />
            Admin
          </button>
        )}
      </nav>

      <div style={{ marginTop: 'auto', padding: '16px 14px', borderTop: '1px solid rgba(255,255,255,.07)' }}>
        <div onClick={() => onNav('profile')} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer', padding: '6px', borderRadius: 10 }}>
          <Avatar url={user?.avatar_url} initials={user?.initials} size={36} fontSize={13} />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.onDark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Loading…'}</span>
              {user?.is_verified && <ShieldCheck size={13} style={{ color: C.signal, flexShrink: 0 }} />}
            </div>
            <div style={{ fontSize: 11, color: C.onDarkMuted }}>{user?.role || ''}</div>
          </div>
        </div>
        <button
          onClick={onSignOut}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            width: '100%', padding: '8px 0', background: 'transparent',
            border: '1px solid rgba(255,255,255,.12)', borderRadius: 9,
            color: C.onDarkMuted, fontSize: 12, cursor: 'pointer', fontFamily: F.body,
          }}
        >
          <LogOut size={13} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
