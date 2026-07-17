import { useEffect } from 'react';
import { playFanfare } from '../lib/sfx';
import './ResultScreen.css';

// Falling confetti for big moments (100%, day complete, new sticker).
function Confetti() {
  const pieces = Array.from({ length: 28 }, (_, i) => ({
    left: `${(i * 37) % 100}%`,
    delay: `${(i % 7) * 0.25}s`,
    duration: `${2.2 + (i % 5) * 0.35}s`,
    emoji: ['🎉', '⭐', '✨', '🎈', '💛', '💜'][i % 6],
  }));
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

// Adaptive-difficulty banner: a level-up, or streak progress toward one.
function ProgressBanner({ progress }) {
  if (!progress) return null;
  const { levelUp, streak, lastDateSuccess } = progress;

  if (levelUp?.mode === 'stage') {
    return (
      <div className="levelup-banner">
        🚀 עלית שלב! השלב החדש: <strong>{levelUp.name}</strong>
      </div>
    );
  }
  if (levelUp?.mode === 'level') {
    return (
      <div className="levelup-banner">
        🚀 עלית רמה! מעכשיו: <strong>חיבור וחיסור עד {levelUp.level}</strong>
      </div>
    );
  }
  if (progress.adaptive && lastDateSuccess && streak > 0) {
    return (
      <div className="streak-banner">
        🔥 {streak === 1 ? 'יום מוצלח אחד' : `${streak} ימים מוצלחים`} ברצף — עוד {3 - streak} {3 - streak === 1 ? 'יום' : 'ימים'} ועולים שלב!
      </div>
    );
  }
  return null;
}

const SUBJECT_SHORT = { math: '➕ חשבון', hebrew: '🔤 עברית', english: '🇬🇧 אנגלית' };

// Daily summer-plan status: full-day celebration, or what's still left today.
function PlanBanner({ planStatus }) {
  if (!planStatus) return null;
  if (planStatus.complete) {
    return (
      <div className="levelup-banner">
        🏖️ כל המשימות של היום הושלמו! חופש נעים!
      </div>
    );
  }
  const left = planStatus.subjects.filter(s => s.done < s.target);
  if (!left.length) return null;
  return (
    <div className="streak-banner">
      🗓️ נשאר להיום: {left.map(s => `${SUBJECT_SHORT[s.subject] || s.subject} ${Math.max(0, s.target - s.done)}`).join(' · ')}
    </div>
  );
}

export default function ResultScreen({ childName, results, progress, planStatus, newSticker, onBack }) {
  const total = results.length;
  const noMistake = results.filter(r => r.firstAttemptCorrect !== false && r.correct).length;
  const correctedAfterMistake = results.filter(r => r.firstAttemptCorrect === false && r.correct).length;
  const failed = results.filter(r => !r.correct).length;

  const pct = Math.round((noMistake / total) * 100);
  const emoji = pct === 100 ? '🏆' : pct >= 80 ? '🌟' : pct >= 60 ? '😊' : '💪';
  const celebrate = pct === 100 || planStatus?.complete || !!newSticker;

  useEffect(() => {
    if (pct >= 80 || celebrate) playFanfare();
  }, []);
  const msg =
    pct === 100 ? 'מושלם! ענית נכון על הכל מהפעם הראשונה!' :
    pct >= 80  ? 'כל הכבוד! עשית עבודה מצוינת!' :
    pct >= 60  ? 'יפה מאוד! ממשיכים להתאמן!' :
    'הפגנת אומץ! ממשיכים לנסות!';

  function rowStatus(r) {
    if (r.firstAttemptCorrect !== false && r.correct) return { icon: '✅', cls: 'correct' };
    if (r.correct) return { icon: '⚠️', cls: 'corrected' }; // had mistake but eventually correct
    return { icon: '❌', cls: 'wrong' };
  }

  // < and > are bidi-mirrored in the RTL page — force LTR so they show true.
  const showAnswer = (a) =>
    /^[<>=]$/.test(String(a)) ? <span dir="ltr" style={{ unicodeBidi: 'isolate' }}>{a}</span> : a;

  return (
    <div className="result-screen">
      {celebrate && <Confetti />}
      <div className="result-card">
        <div className="result-emoji">{emoji}</div>
        <h1 className="result-title">{childName}, {msg}</h1>

        {newSticker && (
          <div className="sticker-banner">
            <div className="sticker-big">{newSticker}</div>
            <div>🎁 זכית במדבקה חדשה לאלבום!</div>
          </div>
        )}
        <ProgressBanner progress={progress} />
        <PlanBanner planStatus={planStatus} />

        <div className="score-grid">
          <div className="score-cell good">
            <div className="cell-num">{noMistake}</div>
            <div className="cell-label">ללא טעות</div>
          </div>
          <div className="score-cell warn">
            <div className="cell-num">{correctedAfterMistake}</div>
            <div className="cell-label">תוקן אחרי טעות</div>
          </div>
          <div className="score-cell bad">
            <div className="cell-num">{failed}</div>
            <div className="cell-label">לא נפתר</div>
          </div>
        </div>

        <div className="result-list">
          {results.map((r, i) => {
            const s = rowStatus(r);
            return (
              <div key={i} className={`result-row ${s.cls}`}>
                <span className="r-icon">{s.icon}</span>
                <span className="r-q" dir={r.dir || 'rtl'}>{r.question.split('\n')[0]}</span>
                <span className="r-a">תשובה: {showAnswer(r.answer)}</span>
                <span className="r-att">{r.attempts} {r.attempts === 1 ? 'ניסיון' : 'ניסיונות'}</span>
              </div>
            );
          })}
        </div>

        {(correctedAfterMistake + failed) > 0 && (
          <div className="result-note">
            💡 התרגילים שטעית בהם יחזרו במפגש הבא כדי שתוכל לתרגל אותם שוב
          </div>
        )}

        <div className="result-mail-note">
          📧 דוח מפורט נשלח לאמא ואבא!
        </div>

        <button className="back-home-btn" onClick={onBack}>
          🏠 חזור לדף הבית
        </button>
      </div>
    </div>
  );
}
