import { useState, useEffect } from 'react';
import HebrewKeyboard from './HebrewKeyboard';
import { speakHebrew, speakEnglish } from '../lib/tts';
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
  tens_in_number: '🔟 כמה עשרות',
  ones_in_number: '☝️ כמה אחדות',
  build_tens_ones: '🧱 בניית מספר',
  expanded_form: '🧩 פירוק מספר',
  hundreds_in_number: '💯 כמה מאות',
  build_hundreds: '🏗️ בניית מספר תלת-ספרתי',
  expanded_form_3: '🧩 פירוק מאות',
  skip_count: '🐰 דילוגים קדימה',
  skip_count_back: '🐢 דילוגים אחורה',
  skip_count_100: '💯 דילוגים ב-100',
  word_add: '📖 בעיה – חיבור',
  word_sub: '📖 בעיה – חיסור',
  geo_sides: '🔺 גאומטריה – צלעות',
  geo_corners: '🔺 גאומטריה – פינות',
  geo_identify: '🔺 גאומטריה – זיהוי',
  geo_count_sides_compare: '🔺 גאומטריה – השוואה',
  geo_count: '🔺 ספירת צורות',
  count_objects: '🍎 ספירה',
  compare_quantities: '⚖️ איפה יש יותר?',
  number_after: '➡️ המספר שאחרי',
  number_before: '⬅️ המספר שלפני',
  visual_add: '🎈 חיבור עם ציורים',
  visual_sub: '🎈 חיסור עם ציורים',
  pattern: '🔴 מה ממשיך?',
  biggest_number: '🐘 הכי גדול',
  smallest_number: '🐭 הכי קטן',
  round_tens_add: '🔟 חיבור עשרות',
  round_tens_sub: '🔟 חיסור עשרות',
  two_digit_add: '💪 חיבור דו-ספרתי',
  two_digit_sub: '💪 חיסור דו-ספרתי',
  missing_number: '❓ מספר חסר',
  even_odd: '👯 זוגי או אי-זוגי',
  repeated_add: '✖️ לקראת כפל',
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
  read_word: '📖 קריאת מילה',
  last_letter: '🔚 אות אחרונה',
  en_letter_name: '🇬🇧 שם האות',
  en_letter_find: '🇬🇧 מצא את האות',
  en_first_letter: '🇬🇧 אות פותחת',
  en_word_to_pic: '🇬🇧 מילה ← תמונה',
  en_pic_to_word: '🇬🇧 תמונה ← מילה',
  en_listen_pick: '🎧 הקשבה באנגלית',
  en_translate_to_he: '🇬🇧 מה זה בעברית?',
  en_translate_to_en: '🇬🇧 איך אומרים באנגלית?',
  en_missing_letter: '🇬🇧 אות חסרה',
  en_spell: '🇬🇧 כתיבה באנגלית',
  en_next_letter: '🇬🇧 האות הבאה',
  en_upper_lower: '🇬🇧 אות קטנה/גדולה',
  en_last_letter: '🇬🇧 אות אחרונה',
  en_number_word: '🔢 מספר באנגלית',
  en_count: '🔢 סופרים באנגלית',
  en_color: '🎨 צבע באנגלית',
  en_verb: '🏃 פעולה באנגלית',
  en_opposite: '↔️ הפכים',
  en_odd_one_out: '🎯 מה לא שייך',
  en_plural: '🇬🇧 יחיד ורבים',
  en_scramble: '🔤 סידור אותיות',
  en_sentence_fill: '📝 השלמת משפט',
  en_phrase: '💬 ביטויים',
};

// English exercises where the audio (the English word) IS the answer – don't
// auto-play or offer replay before the child answers.
const EN_AUDIO_REVEALS_ANSWER = ['en_pic_to_word', 'en_translate_to_en'];

// Turn a symbolic math question into speakable Hebrew:
// "3 + 4 = ?" → "3 ועוד 4 שווה כמה", "8 - ? = 5" → "8 פחות כמה שווה 5".
function mathSpeech(ex) {
  if (ex.audioText) return ex.audioText;
  if (ex.type === 'compare' && ex.hint) return ex.hint;
  let q = ex.question;
  if (ex.dir === 'ltr') {
    q = q
      .replace(/=\s*\?/g, ' שווה כמה')
      .replace(/\+/g, ' ועוד ')
      .replace(/(\d+)\s*-\s*/g, '$1 פחות ')
      .replace(/___/g, ' לעומת ')
      .replace(/=/g, ' שווה ')
      .replace(/\?/g, ' כמה ');
  }
  return q;
}

// An option whose text is only emoji (no letters/digits) gets rendered big.
function isEmojiOption(opt) {
  const s = String(opt);
  return s.length <= 6 && !/[0-9a-zA-Zא-ת<>=]/.test(s);
}

// Hebrew exercise types that need typing input (-> show virtual keyboard)
const HEBREW_TYPING_TYPES = ['type_letter', 'fill_letter', 'first_letter_of_word'];

export default function ExerciseCard({ exercise: ex, child, subject, onAnswer, feedback, showHint, attempts, maxAttempts }) {
  const [input, setInput] = useState('');
  const [selected, setSelected] = useState(null);

  // Behaviour keys off subject (Hebrew = read aloud + letter keyboard,
  // English = English audio). Fall back to the original son/daughter mapping.
  const isHebrew = subject ? subject === 'hebrew' : child === 'daughter';
  const isEnglish = subject === 'english';
  const isMath = subject ? subject === 'math' : child === 'son';
  const enAudioAllowed = isEnglish && ex.audioText && !EN_AUDIO_REVEALS_ANSWER.includes(ex.type);

  // Every question is read aloud: Hebrew questions with the Hebrew voice,
  // English words with the English voice, and symbolic math converted to
  // speakable Hebrew. English types whose audio would reveal the answer get
  // their Hebrew question read instead.
  function speakQuestion() {
    if (isEnglish) {
      if (enAudioAllowed) speakEnglish(ex.audioText);
      else speakHebrew(ex.question);
      return;
    }
    if (isHebrew) {
      speakHebrew(ex.audioText || ex.question);
      return;
    }
    speakHebrew(mathSpeech(ex));
  }

  useEffect(() => {
    setInput('');
    setSelected(null);
    const t = setTimeout(speakQuestion, isEnglish ? 400 : 300);
    return () => clearTimeout(t);
  }, [ex.id, isHebrew, isEnglish]);

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

  const isMultiChoice = ex.options && ex.type !== 'find_letter' && ex.type !== 'count_letter' && ex.type !== 'en_letter_find';
  const isFindLetter = ex.type === 'find_letter' || ex.type === 'odd_one_out' || ex.type === 'en_letter_find';
  const isCountLetter = ex.type === 'count_letter';
  const isUnscramble = ex.type === 'unscramble';
  const isHebrewTyping = isHebrew && HEBREW_TYPING_TYPES.includes(ex.type);

  const cardClass = ['exercise-card', feedback ? `feedback-${feedback}` : ''].filter(Boolean).join(' ');

  return (
    <div className={cardClass}>
      <div className="ex-type-label">{TYPE_LABELS[ex.type] || ex.type}</div>

      {ex.displayShape && (
        <div className={`big-shape ${ex.displayShape.length > 10 ? 'long' : ''}`}>
          {ex.displayShape}
        </div>
      )}
      {ex.displayImage && <div className="big-image">{ex.displayImage}</div>}
      {ex.displayLetter && <div className="big-letter">{ex.displayLetter}</div>}
      {ex.displayWord && !ex.displayLetter && <div className="big-word">{ex.displayWord}</div>}

      <div className="ex-question-row">
        <div className="ex-question" dir={ex.dir || 'rtl'}>{ex.question}</div>
        <button
          type="button"
          className="tts-btn"
          onClick={speakQuestion}
          title="הקרא בקול"
          aria-label="הקרא בקול"
        >
          🔊
        </button>
      </div>

      {/* Multiple choice */}
      {isMultiChoice && (
        <div className="options-grid">
          {ex.options.map(opt => {
            const optImg = ex.optionImages && ex.optionImages[opt];
            const emojiOnly = !optImg && isEmojiOption(opt);
            return (
              <button
                key={opt}
                className={`option-btn ${optImg ? 'with-image' : ''} ${emojiOnly ? 'emoji-only' : ''} ${selected === opt ? (feedback === 'correct' ? 'correct' : 'wrong') : ''}`}
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

      {/* Math / English text input (no virtual keyboard needed) */}
      {!isHebrewTyping && !isMultiChoice && !isFindLetter && !isCountLetter && (
        <div className="input-row">
          <input
            type={isMath && ex.type !== 'compare' ? 'number' : 'text'}
            dir={isEnglish ? 'ltr' : undefined}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submitInput()}
            placeholder={isEnglish ? 'Write in English' : isMath ? 'כתוב את התשובה' : 'כתוב את האות'}
            disabled={!!feedback}
            maxLength={isEnglish ? 14 : 5}
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
