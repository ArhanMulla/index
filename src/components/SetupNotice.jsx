import { Settings } from 'lucide-react';
import { C, F } from '../theme';

export default function SetupNotice() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: F.body }}>
      <div style={{ maxWidth: 560, background: C.surface, borderRadius: 20, padding: '36px 40px' }}>
        <Settings size={28} color={C.signal} style={{ marginBottom: 12 }} />
        <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 10 }}>One setup step left</div>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 14 }}>
          The site is built, but it isn't connected to a database yet — so accounts and submitted ideas have nowhere to be saved.
        </p>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 14 }}>
          Open <code style={{ background: C.canvas, padding: '2px 6px', borderRadius: 4 }}>README.md</code> in
          this project and follow <strong>"Connect the real backend (Supabase)"</strong> — it takes about 10 minutes and is completely free.
        </p>
        <p style={{ fontSize: 12.5, color: C.faint, lineHeight: 1.6 }}>
          Already did this and still seeing this message? Double-check your{' '}
          <code style={{ background: C.canvas, padding: '2px 6px', borderRadius: 4 }}>.env</code> file is saved, then restart{' '}
          <code style={{ background: C.canvas, padding: '2px 6px', borderRadius: 4 }}>npm run dev</code>.
        </p>
      </div>
    </div>
  );
}
