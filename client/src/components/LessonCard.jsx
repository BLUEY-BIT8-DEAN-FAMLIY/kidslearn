import { useEffect } from 'react';
import { speakParts, stopSpeech } from '../lib/tts';
import AnalogClock from './AnalogClock';
import './LessonCard.css';

// A mini-lesson screen: teaching, not just practice. Shown when the child
// meets a NEW topic, when a struggling topic is re-taught (lesson.reteach),
// before a mistakes-practice run (lesson.practice), or on demand from the
// "teach me" button mid-exercise (lesson.help). Everything is read aloud so
// non-readers get the full lesson.
export default function LessonCard({ lesson, childName, onStart }) {
  const isNew = !lesson.reteach && !lesson.practice && !lesson.help;

  useEffect(() => {
    const opening = isNew
      ? `${childName}, היום לומדים משהו חדש: ${lesson.title}!`
      : `${childName}, בואו ניזכר יחד איך פותרים: ${lesson.title}!`;
    const parts = [
      { text: opening, lang: 'he' },
      ...lesson.lines.map(text => ({ text, lang: 'he' })),
      ...(lesson.example?.speak ? [{ text: lesson.example.speak, lang: 'he' }] : []),
    ];
    const t = setTimeout(() => speakParts(parts), 400);
    return () => { clearTimeout(t); stopSpeech(); };
  }, [lesson.key]);

  const badge = isNew ? '🌟 נושא חדש!'
    : lesson.practice ? '💪 נזכרים איך פותרים!'
    : lesson.help ? '🎓 לומדים שוב יחד'
    : '💪 מתחזקים בנושא!';

  return (
    <div className="lesson-screen">
      <div className="lesson-card">
        <div className="lesson-badge">{badge}</div>
        <div className="lesson-icon">{lesson.icon}</div>
        <h1 className="lesson-title">{lesson.title}</h1>

        {lesson.lines.map((line, i) => (
          <p key={i} className="lesson-line">{line}</p>
        ))}

        {lesson.example && (
          <div className="lesson-example" dir="ltr">
            {lesson.example.clock ? (
              <div className="lesson-example-display">
                <AnalogClock h={lesson.example.clock.h} m={lesson.example.clock.m} size={150} />
              </div>
            ) : (
              <div className="lesson-example-display">{lesson.example.display}</div>
            )}
            <div className="lesson-example-q" dir="rtl">{lesson.example.question}</div>
          </div>
        )}

        <button className="lesson-start" onClick={() => { stopSpeech(); onStart(); }}>
          {isNew ? '🚀 הבנתי, בואו נתחיל!' : '💪 הבנתי, ממשיכים!'}
        </button>
      </div>
    </div>
  );
}
