import { useState, useEffect } from 'react';
import { fetchExercises, fetchMistakes, saveSession } from '../api';
import { speakCelebration, speakEncouragement, speakEnglish } from '../lib/tts';
import { playCorrect, playWrong } from '../lib/sfx';
import ExerciseCard from './ExerciseCard';
import ResultScreen from './ResultScreen';
import './ExerciseSession.css';

const MAX_ATTEMPTS = 10;
const PRACTICE_SESSION_SIZE = 12;

function shuffleList(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// What to speak as the "answer" on correct response.
// For fill_letter exercises the answer alone is just one letter, so we speak
// the full word instead — much more rewarding for the child.
function answerSpeech(ex) {
  if (ex.type === 'fill_letter' || ex.type === 'fill_letter_choice') {
    return ex.word || ex.answer;
  }
  return String(ex.answer || '');
}

// Math sessions open with this choice: practise addition, subtraction or both.
const OPERATIONS = [
  { id: 'add', icon: '➕', label: 'חיבור', cls: 'op-add' },
  { id: 'sub', icon: '➖', label: 'חיסור', cls: 'op-sub' },
  { id: 'mix', icon: '🔀', label: 'מעורב', cls: 'op-mix' },
];

function OperationPicker({ childName, onPick, onBack }) {
  return (
    <div className="op-picker">
      <h2 className="op-picker-title">{childName}, במה נתחיל היום?</h2>
      <div className="op-row">
        {OPERATIONS.map(o => (
          <button key={o.id} className={`op-btn ${o.cls}`} onClick={() => onPick(o.id)}>
            <span className="op-icon">{o.icon}</span>
            <span className="op-text">{o.label}</span>
          </button>
        ))}
      </div>
      <button className="op-back" onClick={onBack}>חזרה</button>
    </div>
  );
}

export default function ExerciseSession({ child, childName, subject, practice, practiceType, onBack }) {
  // Behaviour keys off the subject (Hebrew = voice + letter keyboard,
  // English = English audio). Fall back to the original son/daughter mapping.
  const isHebrew = subject ? subject === 'hebrew' : child === 'daughter';
  const isEnglish = subject === 'english';
  const isMath = subject ? subject === 'math' : child === 'son';
  // Math sessions first ask which operation to focus on; Hebrew/English and
  // mistake-practice sessions skip this.
  const [operation, setOperation] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [current, setCurrent] = useState(0);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(null);   // adaptive-difficulty outcome
  const [planStatus, setPlanStatus] = useState(null); // daily summer-plan status
  const [sticker, setSticker] = useState(null);       // today's earned sticker
  const [attempts, setAttempts] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const date = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    // Mistake practice: replay the child's own failed exercises, on demand.
    if (practice) {
      setLoading(true);
      fetchMistakes(child)
        .then(data => {
          let list = (data.mistakes?.[subject] || []).map(m => m.exercise);
          if (practiceType) list = list.filter(e => e.type === practiceType);
          const session = shuffleList(list)
            .slice(0, PRACTICE_SESSION_SIZE)
            .map((ex, i) => ({ ...ex, id: i + 1, isReview: false }));
          setExercises(session);
          setLoading(false);
        })
        .catch(err => { setError(err.message); setLoading(false); });
      return;
    }
    // Wait for the operation choice before loading a math session.
    if (isMath && !operation) return;
    setLoading(true);
    fetchExercises(child, date, subject, operation || undefined)
      .then(data => { setExercises(data.exercises); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [child, date, subject, operation, isMath, practice, practiceType]);

  function buildResult(ex, finalCorrect, totalAttempts) {
    return {
      id: ex.id,
      type: ex.type,
      dir: ex.dir,
      question: ex.question,
      answer: ex.answer,
      correct: finalCorrect,
      firstAttemptCorrect: totalAttempts === 1 && finalCorrect,
      attempts: totalAttempts,
      isReview: !!ex.isReview,
      // Snapshot the original exercise so wrong ones can be resurfaced exactly
      exerciseSnapshot: ex,
    };
  }

  function advanceTo(newResults) {
    setResults(newResults);
    setAttempts(0);
    setWrongCount(0);
    setShowHint(false);
    if (current + 1 >= exercises.length) {
      finishSession(newResults);
    } else {
      setCurrent(c => c + 1);
    }
  }

  function handleAnswer(answer) {
    const ex = exercises[current];
    // English typing is case-insensitive ("Dog" === "dog").
    const norm = v => {
      const s = String(v).trim();
      return ex.caseInsensitive ? s.toLowerCase() : s;
    };
    const correct = norm(answer) === norm(ex.answer);
    const newAttempts = attempts + 1;

    if (correct) {
      setFeedback('correct');
      playCorrect();
      // Speak the answer + a random cheer for Hebrew exercises
      if (isHebrew) {
        speakCelebration(answerSpeech(ex));
      }
      // English: repeat the word with an English voice so the child hears the
      // correct pronunciation one more time.
      if (isEnglish) {
        speakEnglish(ex.word || ex.audioText || String(ex.answer));
      }
      // Give a bit more time for Hebrew/English so the audio can play
      const delay = (isHebrew || isEnglish) ? 1700 : 900;
      setTimeout(() => {
        setFeedback(null);
        const result = buildResult(ex, true, newAttempts);
        advanceTo([...results, result]);
      }, delay);
    } else {
      setAttempts(newAttempts);
      setWrongCount(wrongCount + 1);
      setFeedback('wrong');
      playWrong();

      // Voice encouragement on wrong answer (only on first mistake to avoid noise)
      if (isHebrew && newAttempts === 1) {
        speakEncouragement();
      }

      if (wrongCount + 1 >= 3) setShowHint(true);

      setTimeout(() => {
        setFeedback(null);
        if (newAttempts >= MAX_ATTEMPTS) {
          const result = buildResult(ex, false, newAttempts);
          advanceTo([...results, result]);
        }
      }, 700);
    }
  }

  async function finishSession(finalResults) {
    setDone(true);
    const res = await saveSession({ child, childName, date, subject, results: finalResults, practice: !!practice });
    if (res?.progress) setProgress(res.progress);
    if (res?.planStatus) setPlanStatus(res.planStatus);
    if (res?.sticker) setSticker(res.sticker);
  }

  // Math: ask which operation to practise before anything loads.
  if (isMath && !practice && !operation) {
    return <OperationPicker childName={childName} onPick={setOperation} onBack={onBack} />;
  }

  if (loading) return (
    <div className="session-loading">
      <div className="spinner" />
      <p>טוען תרגילים...</p>
    </div>
  );

  if (error) return (
    <div className="session-error">
      <p>שגיאה: {error}</p>
      <button onClick={onBack}>חזור</button>
    </div>
  );

  // Nothing left to practise – every mistake was already conquered.
  if (practice && exercises.length === 0) return (
    <div className="session-error">
      <p>🏆 אין תרגילים לתרגל — כל הטעויות תוקנו, כל הכבוד!</p>
      <button onClick={onBack}>חזרה</button>
    </div>
  );

  if (done) return (
    <ResultScreen
      childName={childName}
      results={results}
      exercises={exercises}
      progress={progress}
      planStatus={planStatus}
      newSticker={sticker}
      onBack={onBack}
    />
  );

  const ex = exercises[current];

  return (
    <div className="session">
      <div className="session-header">
        <div className="session-progress">
          <span>
            {practice && <span className="review-badge">🔁 תרגול טעויות</span>}
            {childName} – שאלה {current + 1} מתוך {exercises.length}
            {ex?.isReview && <span className="review-badge">🔁 חזרה</span>}
          </span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(current / exercises.length) * 100}%` }} />
          </div>
        </div>
        <div className="attempt-badges">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
            <div key={i} className={`attempt-dot ${i < attempts ? 'used' : ''}`} />
          ))}
        </div>
      </div>

      <ExerciseCard
        exercise={ex}
        child={child}
        subject={subject}
        onAnswer={handleAnswer}
        feedback={feedback}
        showHint={showHint}
        attempts={attempts}
        maxAttempts={MAX_ATTEMPTS}
      />
    </div>
  );
}
