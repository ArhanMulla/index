import { useState, useRef } from 'react';
import { Upload, ExternalLink, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { C, F } from '../theme';

const MAX_MB = 10;
const ACCEPTED = '.pdf,.doc,.docx';

// A text field for pasting a link, PLUS a button to upload a real
// PDF/Word file instead — either one fills the same value.
export default function LinkOrUpload({ label, value, onChange, userId, placeholder }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) { setErr(`File must be under ${MAX_MB}MB.`); return; }
    setErr(''); setUploading(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${userId}/${Date.now()}_${safeName}`;
    const { error } = await supabase.storage.from('uploads').upload(path, file);
    setUploading(false);
    if (error) { setErr(error.message); return; }
    const { data } = supabase.storage.from('uploads').getPublicUrl(path);
    onChange(data.publicUrl);
  }

  const isUploadedFile = value && value.includes('/storage/v1/object/public/uploads/');
  const fileName = isUploadedFile ? decodeURIComponent(value.split('/').pop().replace(/^\d+_/, '')) : null;

  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>{label}</label>
      {err && <div style={{ fontSize: 11.5, color: C.danger, marginBottom: 6 }}>{err}</div>}

      {isUploadedFile ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 13px', border: `1.5px solid ${C.border}`, borderRadius: 11, background: C.canvas }}>
          <a href={value} target="_blank" rel="noreferrer" style={{ flex: 1, fontSize: 13, color: C.signal, display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <ExternalLink size={14} style={{ flexShrink: 0 }} /> {fileName}
          </a>
          <button onClick={() => onChange('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.faint, display: 'flex' }}><X size={15} /></button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ flex: 1, padding: '11px 14px', border: `1.5px solid ${C.border}`, borderRadius: 11, fontSize: 14, color: C.text, background: C.surface, fontFamily: F.body }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 11, color: C.muted, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F.body }}
          >
            <Upload size={14} /> {uploading ? 'Uploading…' : 'Upload'}
          </button>
          <input ref={fileRef} type="file" accept={ACCEPTED} onChange={handleFile} style={{ display: 'none' }} />
        </div>
      )}
      <div style={{ fontSize: 11, color: C.faint, marginTop: 5 }}>Paste a link, or upload a PDF/Word file directly (max {MAX_MB}MB).</div>
    </div>
  );
}
