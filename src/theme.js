// ============================================================
// INDEX design tokens — single source of truth for the whole app.
// Refined navy/teal brand, warmed up with a serif display face.
// ============================================================
export const C = {
  ink:      '#0B1220',   // near-black navy — dark surfaces, primary headings
  ink2:     '#141C2E',   // slightly lighter navy — sidebar, secondary dark surfaces
  signal:   '#00BFA6',   // refined teal — the one accent color, used deliberately
  signalDk: '#009E89',   // pressed/hover state of signal
  canvas:   '#F7F7F5',   // warm-neutral page background
  surface:  '#FFFFFF',   // card backgrounds
  border:   '#E6E4DF',   // warm-neutral border
  borderStrong: '#D8D5CD',
  text:     '#1B2432',   // body text on light surfaces
  muted:    '#6B7280',   // secondary text
  faint:    '#9AA1AC',   // tertiary text / placeholders
  onDark:   '#F2F1EC',   // text on dark surfaces
  onDarkMuted: '#9CA6B8',
  // category accents — refined, less neon than the original build
  industry: '#E2683F',
  research: '#4C6FEF',
  academia: '#9B59D6',
  amber:    '#D6A028',
  danger:   '#C0442E',
  dangerBg: '#FBEDEA',
};

export const F = {
  display: "'Fraunces', Georgia, serif",
  body: "'Plus Jakarta Sans', system-ui, sans-serif",
};

export const R = { sm: 10, md: 14, lg: 18, xl: 24, pill: 999 };

export const SHADOW = {
  sm: '0 1px 2px rgba(11,18,32,0.06)',
  md: '0 4px 16px rgba(11,18,32,0.08)',
  lg: '0 12px 40px rgba(11,18,32,0.12)',
};

export function typeColor(type) {
  return { Industry: C.industry, Research: C.research, Academia: C.academia }[type] || C.muted;
}
