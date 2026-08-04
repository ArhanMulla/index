import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Users } from 'lucide-react';
import { supabase } from '../supabaseClient';
import Avatar from './Avatar';
import { C, F } from '../theme';

function initialsOf(name) { return (name || '?').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'; }

// Real group chat: everyone on the team (idea owner + every accepted
// applicant) shares one thread, each message labeled with sender
// avatar + name — like a WhatsApp/Instagram group chat.
export default function Chat({ ideaId, myId, onViewProfile }) {
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState({});
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const loadMembers = useCallback(async () => {
    const { data: ideaRow } = await supabase.from('ideas').select('author_id').eq('id', ideaId).maybeSingle();
    const { data: accepted } = await supabase.from('applications').select('applicant_id').eq('idea_id', ideaId).eq('status', 'accepted');
    const memberIds = [...new Set([ideaRow?.author_id, ...(accepted || []).map(a => a.applicant_id)].filter(Boolean))];
    if (memberIds.length === 0) return;
    const { data: profs } = await supabase.from('profiles').select('id, name, avatar_url').in('id', memberIds);
    setMembers(Object.fromEntries((profs || []).map(p => [p.id, p])));
  }, [ideaId]);

  const loadMessages = useCallback(async () => {
    const { data } = await supabase.from('messages').select('*').eq('idea_id', ideaId).order('created_at', { ascending: true });
    setMessages(data || []);
  }, [ideaId]);

  useEffect(() => { loadMembers(); loadMessages(); }, [loadMembers, loadMessages]);

  useEffect(() => {
    const channel = supabase.channel(`messages-${ideaId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `idea_id=eq.${ideaId}` }, () => loadMessages())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [ideaId, loadMessages]);

  // Background poll as a safety net regardless of realtime configuration.
  useEffect(() => {
    const interval = setInterval(loadMessages, 4000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send() {
    const value = text.trim();
    if (!value) return;
    setText(''); setSending(true);
    const { error } = await supabase.from('messages').insert({ idea_id: ideaId, sender_id: myId, content: value });
    setSending(false);
    if (error) { setText(value); return; }
    loadMessages();
  }

  const memberCount = Object.keys(members).length;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 420 }}>
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Users size={15} color={C.signal} />
        <span style={{ fontFamily: F.display, fontSize: 14, fontWeight: 600, color: C.text }}>Team Chat</span>
        {memberCount > 0 && <span style={{ fontSize: 11.5, color: C.faint }}>· {memberCount} member{memberCount === 1 ? '' : 's'}</span>}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 && <div style={{ fontSize: 12.5, color: C.faint, textAlign: 'center', marginTop: 20 }}>Say hello — the team's all here now.</div>}
        {messages.map((m, idx) => {
          const isMe = m.sender_id === myId;
          const sender = members[m.sender_id];
          const showHeader = !isMe && (idx === 0 || messages[idx - 1].sender_id !== m.sender_id);
          return (
            <div key={m.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8 }}>
              {!isMe && (
                <div style={{ width: 26, visibility: showHeader ? 'visible' : 'hidden', flexShrink: 0 }}>
                  <div onClick={() => sender && onViewProfile?.(m.sender_id)} style={{ cursor: sender ? 'pointer' : 'default' }}>
                    <Avatar url={sender?.avatar_url} initials={initialsOf(sender?.name)} size={26} fontSize={10} />
                  </div>
                </div>
              )}
              <div style={{ maxWidth: '72%' }}>
                {showHeader && (
                  <div onClick={() => sender && onViewProfile?.(m.sender_id)} style={{ fontSize: 10.5, fontWeight: 700, color: C.muted, marginBottom: 3, marginLeft: 3, cursor: sender ? 'pointer' : 'default' }}>
                    {sender?.name || 'Member'}
                  </div>
                )}
                <div style={{ padding: '9px 13px', borderRadius: 14, fontSize: 13, lineHeight: 1.5, background: isMe ? C.signal : C.canvas, color: isMe ? C.ink : C.text, wordBreak: 'break-word' }}>{m.content}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '12px 14px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 8 }}>
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message..." style={{ flex: 1, padding: '9px 13px', border: `1.5px solid ${C.border}`, borderRadius: 999, fontSize: 13, fontFamily: F.body }} />
        <button onClick={send} disabled={sending || !text.trim()} style={{ width: 36, height: 36, borderRadius: '50%', background: C.signal, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <Send size={15} color={C.ink} />
        </button>
      </div>
    </div>
  );
}
