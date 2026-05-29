import { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import ExerciseSession from './components/ExerciseSession';
import ParentsScreen from './components/ParentsScreen';
import './App.css';

export default function App() {
  const [view, setView] = useState({ name: 'home' }); // 'home' | 'session' | 'parents'

  if (view.name === 'session') {
    return (
      <ExerciseSession
        child={view.child}
        childName={view.childName}
        onBack={() => setView({ name: 'home' })}
      />
    );
  }

  if (view.name === 'parents') {
    return <ParentsScreen onBack={() => setView({ name: 'home' })} />;
  }

  return (
    <HomeScreen
      onSelect={(child, childName) => setView({ name: 'session', child, childName })}
      onParents={() => setView({ name: 'parents' })}
    />
  );
}
