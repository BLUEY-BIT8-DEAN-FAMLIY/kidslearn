import { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import ExerciseSession from './components/ExerciseSession';
import ParentsScreen from './components/ParentsScreen';
import WelcomeScreen from './components/WelcomeScreen';
import { IS_WEB } from './api';
import './App.css';

// Remember the guest choice so returning visitors skip the welcome screen.
function hasEnteredAsGuest() {
  try { return localStorage.getItem('kidslearn:guest') === '1'; } catch { return false; }
}

export default function App() {
  const [view, setView] = useState({ name: 'home' }); // 'home' | 'session' | 'parents'
  // The welcome / guest screen exists ONLY in the web version.
  // The locally-installed desktop app is unaffected (IS_WEB is false there).
  const [entered, setEntered] = useState(() => !IS_WEB || hasEnteredAsGuest());

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
        onBack={() => setView({ name: 'home' })}
      />
    );
  }

  if (view.name === 'parents') {
    return <ParentsScreen onBack={() => setView({ name: 'home' })} />;
  }

  return (
    <HomeScreen
      onSelect={(child, childName, subject) => setView({ name: 'session', child, childName, subject })}
      onParents={() => setView({ name: 'parents' })}
    />
  );
}
