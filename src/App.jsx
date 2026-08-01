import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { SEED_IDEAS } from './data';
import { C, F } from './theme';

import SetupNotice from './components/SetupNotice';
import Home        from './pages/Home';
import Auth        from './pages/Auth';
import Dashboard    from './pages/Dashboard';
import Browse       from './pages/Browse';
import Detail       from './pages/Detail';
import Submit       from './pages/Submit';
import Junior       from './pages/Junior';
import EditProfile  from './pages/EditProfile';
import Admin        from './pages/Admin';
import Legal        from './pages/Legal';

function timeAgo(iso) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) === 1 ? '' : 's'} ago`;
}
function initialsOf(name) { return (name || '?').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'; }

export default function App() {
  const [booting, setBooting] = useState(true);
  const [view, setView]       = useState('home');
  const [publicPage, setPublicPage] = useState(null);
  const [user, setUser]       = useState(null);
  const [auth, setAuth]       = useState(null);
  const [selIdea, setSelIdea] = useState(null);
  const [realIdeas, setRealIdeas]       = useState([]);
  const [ideasLoading, setIdeasLoading] = useState(true);
  const [ideasError, setIdeasError]     = useState('');

  const loadProfile = useCallback(async (authUser) => {
    const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
    if (error) console.error('[INDEX] Failed to load profile:', error);
    setUser({
      id: authUser.id, email: authUser.email,
      name: profile?.name || authUser.email?.split('@')[0] || 'there',
      role: profile?.role || 'Student', org: profile?.org || '', bio: profile?.bio || '',
      domains: profile?.domains || [], skills: profile?.skills || [],
      cv_link: profile?.cv_link || '', portfolio_link: profile?.portfolio_link || '', linkedin_link: profile?.linkedin_link || '',
      is_admin: profile?.is_admin || false, is_verified: profile?.is_verified || false, verification_type: profile?.verification_type || null,
      avatar_url: profile?.avatar_url || '',
      initials: initialsOf(profile?.name || authUser.email),
    });
  }, []);

  const loadIdeas = useCallback(async () => {
    if (!isSupabaseConfigured) { setIdeasLoading(false); return; }
    setIdeasLoading(true); setIdeasError('');
    const { data: rows, error: ideaErr } = await supabase.from('ideas').select('*').order('created_at', { ascending: false });
    if (ideaErr) { console.error('[INDEX] Failed to load ideas:', ideaErr); setIdeasError(ideaErr.message); setRealIdeas([]); setIdeasLoading(false); return; }

    const authorIds = [...new Set((rows || []).map(r => r.author_id).filter(Boolean))];
    let profileMap = {};
    if (authorIds.length > 0) {
      const { data: profs } = await supabase.from('profiles').select('id, name, role, org, is_verified, avatar_url').in('id', authorIds);
      profileMap = Object.fromEntries((profs || []).map(p => [p.id, p]));
    }
    setRealIdeas((rows || []).map(row => {
      const author = profileMap[row.author_id];
      return {
        id: row.id, author_id: row.author_id, type: row.type, title: row.title, desc: row.description,
        problem: row.problem, limitations: row.limitations, skills: row.skills || [], team: row.team ?? 1, max: row.max,
        timeline: row.timeline, research_link: row.research_link, work_link: row.work_link,
        status: row.status || 'open', outcome_report: row.outcome_report,
        author: author?.name || 'INDEX Member', role: author?.role || '', org: author?.org || '', author_verified: author?.is_verified || false, author_avatar_url: author?.avatar_url || '',
        posted: timeAgo(row.created_at), courses: [],
      };
    }));
    setIdeasLoading(false);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) { setBooting(false); setIdeasLoading(false); return; }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) { await loadProfile(session.user); setView('dashboard'); }
      setBooting(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') { setUser(null); setView('home'); }
    });
    loadIdeas();
    return () => listener.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allIdeas = [...realIdeas, ...SEED_IDEAS];
  const openAuth = mode => setAuth(mode);

  async function handleAuthed(authUser) { await loadProfile(authUser); await loadIdeas(); setAuth(null); setView('dashboard'); }
  async function handleSignOut() { await supabase.auth.signOut(); setUser(null); setView('home'); }
  function handleProfileUpdated(updatedUser) { setUser(updatedUser); }
  const navTo = target => { setView(target); window.scrollTo(0, 0); };
  const openIdea = idea => { setSelIdea(idea); setView('detail'); window.scrollTo(0, 0); };

  if (!isSupabaseConfigured) return <SetupNotice />;

  if (publicPage) return <Legal page={publicPage} onBack={() => setPublicPage(null)} />;

  if (booting) return (
    <div style={{ minHeight: '100vh', background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 24, color: C.onDark }}>INDEX<span style={{ color: C.signal }}>.</span></div>
    </div>
  );

  if (auth) return <Auth mode={auth} onAuthed={handleAuthed} onSwitch={mode => setAuth(mode)} onBack={() => setAuth(null)} />;

  if (view === 'home' || !user) return <Home onAuth={openAuth} onShowPublic={setPublicPage} />;

  const shared = { user, view, onNav: navTo, onSignOut: handleSignOut };

  return (
    <>
      {view === 'dashboard' && <Dashboard   {...shared} allIdeas={allIdeas} onOpenIdea={openIdea} />}
      {view === 'browse'    && <Browse      {...shared} allIdeas={allIdeas} loading={ideasLoading} loadError={ideasError} onOpenIdea={openIdea} />}
      {view === 'detail'    && <Detail      {...shared} idea={selIdea} onSubmit={() => navTo('submit')} onIdeasChanged={loadIdeas} />}
      {view === 'submit'    && <Submit      {...shared} onSubmitted={loadIdeas} />}
      {view === 'junior'    && <Junior      {...shared} />}
      {view === 'profile'   && <EditProfile {...shared} onProfileUpdated={handleProfileUpdated} />}
      {view === 'admin'     && <Admin       {...shared} onIdeasChanged={loadIdeas} />}
    </>
  );
}
