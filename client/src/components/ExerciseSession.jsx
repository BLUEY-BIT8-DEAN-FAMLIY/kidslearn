import { useState, useEffect } from 'react';
import { fetchExercises, saveSession } from '../api';
import { speakCelebration, speakEncouragement } from '../lib/tts';
import ExerciseCard from './ExerciseCard';
import ResultScreen from './ResultScreen';
import './ExerciseSession.css';

const MAX_ATTEMPTS = 10;

// What to speak as the "answer" on correct response.
// For fill_letter exercises the answer alone is just one letter, so we speak
// the full word instead — much more rewarding for the child.
function answerSpeech(ex) {
  if (ex.type === 'fill_letter' || ex.type === 'fill_letter_choice') {
    return ex.word || ex.answer;
  }
  return String(ex.answer || '');
}

export default function ExerciseSession({ child, childName, subject, onBack }) {
  // Behaviour keys off the subject (Hebrew = voice + letter keyboard).
  // Fall back to the original son/daughter mapping for safety.
  const isHebrew = subject ? subject === 'hebrew' : child === 'daughter';
  const [exercises, setExercises] = useState([]);
  const [current, setCurrent] = useState(0);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const date = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    fetchExercises(child, date, subject)
      .then(data => { setExercises(data.exercises); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [child, date, subject]);

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
    const correct = String(answer).trim() === String(ex.answer).trim();
    const newAttempts = attempts + 1;

    if (correct) {
      setFeedback('correct');
      // Speak the answer + a random cheer for Hebrew exercises
      if (isHebrew) {
        speakCelebration(answerSpeech(ex));
      }
      // Give a bit more time for Hebrew so the audio celebration can play
      const delay = isHebrew ? 1700 : 900;
      setTimeout(() => {
        setFeedback(null);
        const result = buildResult(ex, true, newAttempts);
        advanceTo([...results, result]);
      }, delay);
    } else {
      setAttempts(newAttempts);
      setWrongCount(wrongCount + 1);
      setFeedback('wrong');

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
    await saveSession({ child, childName, date, subject, results: finalResults });
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

  if (done) return (
    <ResultScreen
      childName={childName}
      results={results}
      exercises={exercises}
      onBack={onBack}
    />
  );

  const ex = exercises[current];

  return (
    <div className="session">
      <div className="session-header">
        <div className="session-progress">
          <span>
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
