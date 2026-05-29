import { useState, useEffect } from 'react';
import HebrewKeyboard from './HebrewKeyboard';
import { speakHebrew } from '../lib/tts';
import './ExerciseCard.css';

const TYPE_LABELS = {
  addition_10: '➕ חיבור עד 10',
  addition_20: '➕ חיבור עד 20',
  subtraction_10: '➖ חיסור עד 10',
  subtraction_20: '➖ חיסור עד 20',
  complete_10: '🔵 השלמה ל-10',
  complete_20: '🔵 השלמה ל-20',
  compare: '⚖️ השוואת מספרים',
  sequence: '🔢 רצף מספרים',
  word_add: '📖 בעיה – חיבור',
  word_sub: '📖 בעיה – חיסור',
  geo_sides: '🔺 גאומטריה – צלעות',
  geo_corners: '🔺 גאומטריה – פינות',
  geo_identify: '🔺 גאומטריה – זיהוי',
  geo_count_sides_compare: '🔺 גאומטריה – השוואה',
  name_letter: '🔤 שם האות',
  word_starts_with: '🔡 מילה שמתחילה ב...',
  fill_letter: '✏️ השלמת אות במילה',
  fill_letter_choice: '✏️ אות חסרה',
  find_letter: '🔍 מצא את האות',
  match_letter: '🔗 התאם אות',
  type_letter: '⌨️ כתוב את האות',
  count_letter: '🔢 ספור אותיות',
  first_letter_of_word: '🔠 אות ראשונה',
  odd_one_out: '🎯 מה שונה?',
};

// Hebrew exercise types that need typing input (-> show virtual keyboard)
const HEBREW_TYPING_TYPES = ['type_letter', 'fill_letter', 'first_letter_of_word'];

export default function ExerciseCard({ exercise: ex, child, onAnswer, feedback, showHint, attempts, maxAttempts }) {
  const [input, setInput] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setInput('');
    setSelected(null);
    // Auto-read Hebrew questions aloud for the daughter.
    // Prefer audioText (which includes the full word for completion exercises)
    // so the child knows what word they're trying to spell.
    if (child === 'daughter' && ex && (ex.audioText || ex.question)) {
      const t = setTimeout(() => speakHebrew(ex.audioText || ex.question), 300);
      return () => clearTimeout(t);
    }
  }, [ex.id, child]);

  function submitInput(value) {
    const v = (value !== undefined ? value : input).toString().trim();
    if (!v) return;
    onAnswer(v);
    setInput('');
  }

  function submitOption(opt) {
    setSelected(opt);
    onAnswer(opt);
  }

  function kbdKey(letter) {
    setInput(prev => prev + letter);
  }

  function kbdBackspace() {
    setInput(prev => prev.slice(0, -1));
  }

  const isMultiChoice = ex.options && ex.type !== 'find_letter' && ex.type !== 'count_letter';
  const isFindLetter = ex.type === 'find_letter' || ex.type === 'odd_one_out';
  const isCountLetter = ex.type === 'count_letter';
  const isUnscramble = ex.type === 'unscramble';
  const isHebrewTyping = child === 'daughter' && HEBREW_TYPING_TYPES.includes(ex.type);

  const cardClass = ['exercise-card', feedback ? `feedback-${feedback}` : ''].filter(Boolean).join(' ');

  return (
    <div className={cardClass}>
      <div className="ex-type-label">{TYPE_LABELS[ex.type] || ex.type}</div>

      {ex.displayShape && <div className="big-shape">{ex.displayShape}</div>}
      {ex.displayImage && <div className="big-image">{ex.displayImage}</div>}
      {ex.displayLetter && <div className="big-letter">{ex.displayLetter}</div>}
      {ex.displayWord && !ex.displayLetter && <div className="big-word">{ex.displayWord}</div>}

      <div className="ex-question-row">
        <div className="ex-question" dir={ex.dir || 'rtl'}>{ex.question}</div>
        {child === 'daughter' && (
          <button
            type="button"
            className="tts-btn"
            onClick={() => speakHebrew(ex.audioText || ex.question)}
            title="הקרא בקול"
            aria-label="הקרא בקול"
          >
            🔊
          </button>
        )}
      </div>

      {/* Multiple choice */}
      {isMultiChoice && (
        <div className="options-grid">
          {ex.options.map(opt => {
            const optImg = ex.optionImages && ex.optionImages[opt];
            return (
              <button
                key={opt}
                className={`option-btn ${optImg ? 'with-image' : ''} ${selected === opt ? (feedback === 'correct' ? 'correct' : 'wrong') : ''}`}
                onClick={() => submitOption(opt)}
                disabled={!!feedback}
              >
                {optImg && <span className="opt-img">{optImg}</span>}
                <span className="opt-text">{opt}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Find letter in grid */}
      {isFindLetter && (
        <div className="letter-grid">
          {ex.displayLetters.map((l, i) => (
            <button
              key={i}
              className={`letter-grid-btn ${selected === l && i === ex.displayLetters.indexOf(l) ? (feedback === 'correct' ? 'correct' : 'wrong') : ''}`}
              onClick={() => submitOption(l)}
              disabled={!!feedback}
            >
              {l}
            </button>
          ))}
        </div>
      )}

      {/* Count letters */}
      {isCountLetter && (
        <div className="count-section">
          <div className="letter-grid count-display">
            {ex.displayLetters.map((l, i) => (
              <div key={i} className={`letter-grid-btn ${l === ex.targetLetter ? 'target-letter' : ''}`}>
                {l}
              </div>
            ))}
          </div>
          <div className="input-row">
            <input
              type="number"
              min="0"
              max="10"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitInput()}
              placeholder="הקלד מספר"
              disabled={!!feedback}
            />
            <button className="submit-btn" onClick={() => submitInput()} disabled={!!feedback || !input}>✔</button>
          </div>
        </div>
      )}

      {/* Hebrew typing exercises – with virtual keyboard */}
      {isHebrewTyping && !isMultiChoice && !isFindLetter && !isCountLetter && (
        <>
          <div className="kbd-input-display" dir="rtl">
            {input || <span className="kbd-placeholder">כתוב כאן...</span>}
          </div>
          <HebrewKeyboard
            onKey={kbdKey}
            onBackspace={kbdBackspace}
            onSubmit={() => submitInput()}
            disabled={!!feedback}
          />
        </>
      )}

      {/* Math text input (no keyboard needed) */}
      {!isHebrewTyping && !isMultiChoice && !isFindLetter && !isCountLetter && (
        <div className="input-row">
          <input
            type={child === 'son' && ex.type !== 'compare' ? 'number' : 'text'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submitInput()}
            placeholder={child === 'son' ? 'כתוב את התשובה' : 'כתוב את האות'}
            disabled={!!feedback}
            maxLength={5}
            autoFocus
          />
          <button className="submit-btn" onClick={() => submitInput()} disabled={!!feedback || !input}>✔</button>
        </div>
      )}

      {feedback === 'correct' && <div className="feedback-banner correct">🎉 כל הכבוד! תשובה נכונה!</div>}
      {feedback === 'wrong' && <div className="feedback-banner wrong">❌ נסה שוב! ({maxAttempts - attempts} ניסיונות נשארו)</div>}

      {showHint && !feedback && <div className="hint-box">💡 רמז: {ex.hint}</div>}
    </div>
  );
}
