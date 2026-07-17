import { useEffect } from 'react';
import { speakParts, stopSpeech } from '../lib/tts';
import './LessonCard.css';

// A mini-lesson screen shown before the exercises when the child meets a new
// topic for the first time — teaching, not just practice. Everything is read
// aloud so non-readers get the full lesson.
export default function LessonCard({ lesson, childName, onStart }) {
  useEffect(() => {
    const parts = [
      { text: `${childName}, היום לומדים משהו חדש: ${lesson.title}!`, lang: 'he' },
      ...lesson.lines.map(text => ({ text, lang: 'he' })),
      ...(lesson.example?.speak ? [{ text: lesson.example.speak, lang: 'he' }] : []),
    ];
    const t = setTimeout(() => speakParts(parts), 400);
    return () => { clearTimeout(t); stopSpeech(); };
  }, [lesson.key]);

  return (
    <div className="lesson-screen">
      <div className="lesson-card">
        <div className="lesson-badge">🌟 נושא חדש!</div>
        <div className="lesson-icon">{lesson.icon}</div>
        <h1 className="lesson-title">{lesson.title}</h1>

        {lesson.lines.map((line, i) => (
          <p key={i} className="lesson-line">{line}</p>
        ))}

        {lesson.example && (
          <div className="lesson-example" dir="ltr">
            <div className="lesson-example-display">{lesson.example.display}</div>
            <div className="lesson-example-q" dir="rtl">{lesson.example.question}</div>
          </div>
        )}

        <button className="lesson-start" onClick={() => { stopSpeech(); onStart(); }}>
          🚀 הבנתי, בואו נתחיל!
        </button>
      </div>
    </div>
  );
}
