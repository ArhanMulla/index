import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key && !url.includes('YOUR_'));

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '[INDEX] Supabase is not configured yet. Copy .env.example to .env and fill in ' +
    'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from your Supabase project settings. ' +
    'See README.md → "Connect the real backend (Supabase)".'
  );
}

// Falls back to a dummy client (never actually called) so the app doesn't crash
// before the real keys are added — the UI shows a setup banner instead.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder-anon-key'
);
