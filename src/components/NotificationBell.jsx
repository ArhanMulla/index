import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { C, F, SHADOW } from '../theme';

export default function NotificationBell({ user, onNav }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const ref = useRef(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setItems(data || []);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const unread = items.filter(i => !i.read).length;

  async function markAllRead() {
    const ids = items.filter(i => !i.read).map(i => i.id);
    if (ids.length === 0) return;
    await supabase.from('notifications').update({ read: true }).in('id', ids);
    load();
  }

  function timeAgo(iso) {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen(o => !o); if (!open) markAllRead(); }}
        style={{ position: 'relative', background: 'transparent', border: 'none', color: C.onDarkMuted, cursor: 'pointer', padding: 6, display: 'flex' }}
      >
        <Bell size={19} strokeWidth={2} />
        {unread > 0 && (
          <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: '50%', background: C.signal, border: `1.5px solid ${C.ink}` }} />
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 34, left: -8, width: 320, maxHeight: 380, overflowY: 'auto',
          background: C.surface, borderRadius: 14, boxShadow: SHADOW.lg, border: `1px solid ${C.border}`,
          zIndex: 200, fontFamily: F.body,
        }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, fontWeight: 700, fontSize: 13.5, color: C.text }}>
            Notifications
          </div>
          {items.length === 0 ? (
            <div style={{ padding: '28px 16px', textAlign: 'center', color: C.faint, fontSize: 13 }}>Nothing yet — you'll see updates on your challenges here.</div>
          ) : items.map(n => (
            <div key={n.id}
              onClick={() => { if (n.related_idea_id) onNav?.('browse'); setOpen(false); }}
              style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, cursor: n.related_idea_id ? 'pointer' : 'default', background: n.read ? 'transparent' : 'rgba(0,191,166,.05)' }}
            >
              <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text, marginBottom: 2 }}>{n.title}</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{n.body}</div>
              <div style={{ fontSize: 10.5, color: C.faint, marginTop: 4 }}>{timeAgo(n.created_at)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
