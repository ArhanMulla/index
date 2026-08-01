import { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import { supabase } from '../supabaseClient';
import Avatar from './Avatar';
import { C } from '../theme';

const MAX_MB = 5;

export default function AvatarUpload({ url, initials, userId, onUploaded, size = 96 }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { setErr('Please choose an image file.'); return; }
    if (file.size > MAX_MB * 1024 * 1024) { setErr(`Image must be under ${MAX_MB}MB.`); return; }
    setErr(''); setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${userId}/avatar_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('uploads').upload(path, file);
    setUploading(false);
    if (error) { setErr(error.message); return; }
    const { data } = supabase.storage.from('uploads').getPublicUrl(path);
    onUploaded(data.publicUrl);
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Avatar url={url} initials={initials} size={size} fontSize={size * 0.33} border={`5px solid ${C.surface}`} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        title="Change photo"
        style={{
          position: 'absolute', bottom: 2, right: 2, width: 30, height: 30, borderRadius: '50%',
          background: C.ink, border: `2.5px solid ${C.surface}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff',
        }}
      >
        <Camera size={13} />
      </button>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      {err && <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, fontSize: 11, color: C.danger, whiteSpace: 'nowrap' }}>{err}</div>}
      {uploading && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff' }}>...</div>}
    </div>
  );
}
