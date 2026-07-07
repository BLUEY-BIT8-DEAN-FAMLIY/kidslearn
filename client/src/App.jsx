import { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import ExerciseSession from './components/ExerciseSession';
import ParentsScreen from './components/ParentsScreen';
import WelcomeScreen from './components/WelcomeScreen';
import MistakesScreen from './components/MistakesScreen';
import AuthScreen from './components/AuthScreen';
import { IS_WEB, meAccount, logoutAccount } from './api';
import './App.css';

// Remember the guest choice so returning visitors skip the welcome screen.
function hasEnteredAsGuest() {
  try { return localStorage.getItem('kidslearn:guest') === '1'; } catch { return false; }
}

// Persisted account session (desktop) — keeps the user logged in across launches.
const AUTH_KEY = 'kidslearn:auth';
function loadAuth() { try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); } catch { return null; } }
function saveAuth(a) { try { localStorage.setItem(AUTH_KEY, JSON.stringify(a)); } catch {} }
function clearAuth() { try { localStorage.removeItem(AUTH_KEY); } catch {} }

export default function App() {
  const [view, setView] = useState({ name: 'home' }); // 'home' | 'session' | 'parents'
  // The welcome / guest screen exists ONLY in the web version.
  // The locally-installed desktop app is unaffected (IS_WEB is false there).
  const [entered, setEntered] = useState(() => !IS_WEB || hasEnteredAsGuest());

  // Desktop accounts: require login. The web build keeps the guest flow.
  const [auth, setAuth] = useState(() => (IS_WEB ? null : loadAuth()));
  const [authReady, setAuthReady] = useState(IS_WEB);

  useEffect(() => {
    if (IS_WEB) return;
    const stored = loadAuth();
    if (!stored?.token) { setAuthReady(true); return; }
    let alive = true;
    meAccount(stored.token)
      .then(r => {
        if (!alive) return;
        if (r?.ok) setAuth({ token: stored.token, email: r.user.email, name: r.user.name });
        else { clearAuth(); setAuth(null); }
        setAuthReady(true);
      })
      .catch(() => { if (alive) setAuthReady(true); });   // transient error: keep the stored session
    return () => { alive = false; };
  }, []);

  function handleLogout() {
    if (auth?.token) logoutAccount(auth.token);
    clearAuth();
    setAuth(null);
    setView({ name: 'home' });
  }

  // Gate the desktop app behind login / registration.
  if (!IS_WEB) {
    if (!authReady) return <div className="auth"><div className="auth-footer">טוען…</div></div>;
    if (!auth) return <AuthScreen onAuthed={(a) => { saveAuth(a); setAuth(a); }} />;
  }

  if (IS_WEB && !entered) {
    return (
      <WelcomeScreen
        onGuest={() => {
          try { localStorage.setItem('kidslearn:guest', '1'); } catch {}
          setEntered(true);
        }}
      />
    );
  }

  if (view.name === 'session') {
    return (
      <ExerciseSession
        child={view.child}
        childName={view.childName}
        subject={view.subject}
        practice={view.practice}
        practiceType={view.practiceType}
        onBack={() => setView({ name: 'home' })}
      />
    );
  }

  if (view.name === 'mistakes') {
    return (
      <MistakesScreen
        child={view.child}
        childName={view.childName}
        onPractice={(subject, practiceType) =>
          setView({ name: 'session', child: view.child, childName: view.childName, subject, practice: true, practiceType })}
        onBack={() => setView({ name: 'home' })}
      />
    );
  }

  if (view.name === 'parents') {
    return <ParentsScreen onBack={() => setView({ name: 'home' })} />;
  }

  return (
    <>
      {!IS_WEB && auth && (
        <button
          onClick={handleLogout}
          title={auth.email}
          style={{
            position: 'fixed', top: 12, left: 12, zIndex: 50,
            background: 'rgba(255,255,255,0.85)', color: '#5c6bc0',
            border: '1px solid rgba(92,107,192,0.3)', borderRadius: 10,
            padding: '6px 12px', fontSize: '0.85rem', fontWeight: 700,
            fontFamily: 'inherit', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
        >🚪 יציאה</button>
      )}
      <HomeScreen
        onSelect={(child, childName, subject) => setView({ name: 'session', child, childName, subject })}
        onMistakes={(child, childName) => setView({ name: 'mistakes', child, childName })}
        onParents={() => setView({ name: 'parents' })}
      />
    </>
  );
}
