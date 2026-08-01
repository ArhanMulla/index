import { C, F } from '../theme';

// Shows the user's uploaded photo if they have one, otherwise their
// initials — used everywhere a profile picture appears in the app.
export default function Avatar({ url, initials, size = 40, fontSize = 14, border }) {
  const common = {
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', border: border || 'none',
  };
  if (url) {
    return (
      <div style={common}>
        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    );
  }
  return (
    <div style={{ ...common, background: C.signal }}>
      <span style={{ fontFamily: F.display, fontWeight: 700, fontSize, color: C.ink, lineHeight: 1, transform: 'translateY(1px)' }}>
        {initials || '?'}
      </span>
    </div>
  );
}
