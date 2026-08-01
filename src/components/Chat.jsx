import { useState, useEffect, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { C, F } from '../theme';

export default function Chat({ ideaId, myId, otherId, otherName }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from('messages').select('*').eq('idea_id', ideaId)
      .or(`and(sender_id.eq.${myId},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${myId})`)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  }, [ideaId, myId, otherId]);

  useEffect(() => { load(); }, [load]);

  // Realtime subscription (instant updates when it's configured)...
  useEffect(() => {
    const channel = supabase.channel(`messages-${ideaId}-${myId}-${otherId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `idea_id=eq.${ideaId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [ideaId, myId, otherId, load]);

  // ...PLUS a quiet 4-second poll as a safety net, so chat still feels
  // live even if realtime replication isn't enabled on this project yet.
  useEffect(() => {
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send() {
    const value = text.trim();
    if (!value) return;
    setText('');
    setSending(true);
    const { error } = await supabase.from('messages').insert({ idea_id: ideaId, sender_id: myId, recipient_id: otherId, content: value });
    setSending(false);
    if (error) { setText(value); return; }
    load();
  }

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 380 }}>
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, fontFamily: F.display, fontSize: 14, fontWeight: 600, color: C.text }}>
        Chat with {otherName}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.length === 0 && <div style={{ fontSize: 12.5, color: C.faint, textAlign: 'center', marginTop: 20 }}>Say hello — you're now working together on this challenge.</div>}
        {messages.map(m => (
          <div key={m.id} style={{ alignSelf: m.sender_id === myId ? 'flex-end' : 'flex-start', maxWidth: '78%' }}>
            <div style={{ padding: '9px 13px', borderRadius: 14, fontSize: 13, lineHeight: 1.5, background: m.sender_id === myId ? C.signal : C.canvas, color: m.sender_id === myId ? C.ink : C.text, wordBreak: 'break-word' }}>{m.content}</div>
          </div>
        ))}
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
