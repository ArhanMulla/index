import HeroCanvas from '../components/HeroCanvas';
import { C, F } from '../theme';

const FEATURES = [
  ['Skill Matching',     'Matched to projects based on your real, saved skills — not a generic keyword search.'],
  ['Industry Challenges','Real company problems posted and ready for collaborative solutions.'],
  ['Research Hub',       'Connect research to industry partners, students, and funding.'],
  ['Learning Paths',     'Personalized course recommendations to close skill gaps instantly.'],
  ['Verified Network',   'University and company badges so you know exactly who you\'re working with.'],
  ['Team Workspace',     'Message collaborators the moment an application is accepted.'],
];

const STATS = [['247','Active Challenges'],['1,842','Collaborators'],['34','Universities'],['89','Industry Partners']];

export default function Home({ onAuth, onShowPublic }) {
  return (
    <div style={{ background: C.ink, fontFamily: F.body }}>
      <nav style={{
        background: 'rgba(11,18,32,.92)', padding: '18px 48px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,.06)',
        position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(14px)',
      }}>
        <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 23, color: C.onDark }}>INDEX<span style={{ color: C.signal }}>.</span></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => onAuth('login')} style={{ padding: '9px 22px', background: 'transparent', border: '1px solid rgba(255,255,255,.22)', borderRadius: 999, color: C.onDark, fontSize: 14, cursor: 'pointer', fontFamily: F.body }}>Sign In</button>
          <button onClick={() => onAuth('signup')} style={{ padding: '9px 22px', background: C.signal, border: 'none', borderRadius: 999, color: C.ink, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: F.body }}>Get Started</button>
        </div>
      </nav>

      <div style={{ height: '90vh', minHeight: 580, display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <HeroCanvas />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 60px', maxWidth: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: C.signal, marginBottom: 26 }}>
            <div style={{ width: 26, height: 1.5, background: C.signal }} />Industry · Academia · Research · Innovation
          </div>
          <h1 style={{ fontFamily: F.display, fontSize: 'clamp(44px,6.2vw,78px)', fontWeight: 600, lineHeight: 1.06, letterSpacing: '-1.5px', color: C.onDark, marginBottom: 26 }}>
            Where problems<br /><em style={{ fontStyle: 'italic', color: C.signal, fontWeight: 500 }}>meet solutions.</em>
          </h1>
          <p style={{ fontSize: 18, fontWeight: 400, color: 'rgba(242,241,236,.62)', maxWidth: 500, lineHeight: 1.75, marginBottom: 44 }}>
            INDEX connects companies, universities, researchers, and students — turning real-world challenges into collaborative breakthroughs.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <button onClick={() => onAuth('signup')} style={{ padding: '15px 34px', background: C.signal, border: 'none', borderRadius: 999, color: C.ink, fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: F.body }}>Join the Ecosystem</button>
            <button onClick={() => onAuth('login')} style={{ padding: '14px 34px', background: 'transparent', border: '1.5px solid rgba(255,255,255,.28)', borderRadius: 999, color: C.onDark, fontSize: 16, cursor: 'pointer', fontFamily: F.body }}>Sign In</button>
          </div>
        </div>
      </div>

      <div style={{ background: C.surface, padding: '30px 60px', display: 'flex', justifyContent: 'center', gap: 84, flexWrap: 'wrap', borderBottom: `1px solid ${C.border}` }}>
        {STATS.map(([v, l]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: F.display, fontSize: 34, fontWeight: 700, color: C.text }}>{v}</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ background: C.canvas, padding: '100px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: C.signal, marginBottom: 16 }}>Platform Features</div>
          <h2 style={{ fontFamily: F.display, fontSize: 'clamp(28px,4vw,42px)', fontWeight: 600, letterSpacing: '-0.5px', color: C.text }}>Everything to collaborate,<br />all in one place</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, maxWidth: 1080, margin: '0 auto' }}>
          {FEATURES.map(([title, desc]) => (
            <div key={title} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: '30px 26px' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: C.signal, marginBottom: 18 }} />
              <div style={{ fontFamily: F.display, fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 9 }}>{title}</div>
              <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.65 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: C.ink, padding: '110px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,191,166,.13) 0%,transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: F.display, fontSize: 'clamp(30px,5vw,58px)', fontWeight: 600, color: C.onDark, letterSpacing: '-1px', lineHeight: 1.08, marginBottom: 20 }}>Ready to join<br /><em style={{ color: C.signal, fontStyle: 'italic' }}>the ecosystem?</em></h2>
          <p style={{ fontSize: 17, color: 'rgba(242,241,236,.55)', marginBottom: 42, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>Student, researcher, company, or university — INDEX has a place for you.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => onAuth('signup')} style={{ padding: '15px 34px', background: C.signal, border: 'none', borderRadius: 999, color: C.ink, fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: F.body }}>Create Your Profile</button>
            <button onClick={() => onAuth('signup')} style={{ padding: '14px 34px', background: 'transparent', border: '1.5px solid rgba(255,255,255,.28)', borderRadius: 999, color: C.onDark, fontSize: 16, cursor: 'pointer', fontFamily: F.body }}>Post a Challenge</button>
          </div>
        </div>
      </div>

      <div style={{ background: '#070C16', padding: '30px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 18, color: C.onDark }}>INDEX<span style={{ color: C.signal }}>.</span></div>
        <div style={{ display: 'flex', gap: 20, fontSize: 12.5, color: 'rgba(242,241,236,.35)' }}>
          <span>© 2026 INDEX</span>
          <a href="#" onClick={e => { e.preventDefault(); onShowPublic('terms'); }} style={{ color: 'rgba(242,241,236,.5)' }}>Terms</a>
          <a href="#" onClick={e => { e.preventDefault(); onShowPublic('privacy'); }} style={{ color: 'rgba(242,241,236,.5)' }}>Privacy</a>
        </div>
      </div>
    </div>
  );
}
