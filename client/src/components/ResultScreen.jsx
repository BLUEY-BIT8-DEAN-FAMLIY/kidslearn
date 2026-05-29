import './ResultScreen.css';

export default function ResultScreen({ childName, results, onBack }) {
  const total = results.length;
  const noMistake = results.filter(r => r.firstAttemptCorrect !== false && r.correct).length;
  const correctedAfterMistake = results.filter(r => r.firstAttemptCorrect === false && r.correct).length;
  const failed = results.filter(r => !r.correct).length;

  const pct = Math.round((noMistake / total) * 100);
  const emoji = pct === 100 ? '🏆' : pct >= 80 ? '🌟' : pct >= 60 ? '😊' : '💪';
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

  return (
    <div className="result-screen">
      <div className="result-card">
        <div className="result-emoji">{emoji}</div>
        <h1 className="result-title">{childName}, {msg}</h1>

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
                <span className="r-a">תשובה: {r.answer}</span>
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
