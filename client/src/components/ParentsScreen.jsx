import { useState, useEffect } from 'react';
import { fetchStats, fetchHistory, fetchChildren } from '../api';
import EmailSettings from './EmailSettings';
import './ParentsScreen.css';

const TYPE_LABELS = {
  addition_10: 'חיבור עד 10',
  addition_20: 'חיבור עד 20',
  subtraction_10: 'חיסור עד 10',
  subtraction_20: 'חיסור עד 20',
  addition_30: 'חיבור עד 30',
  subtraction_30: 'חיסור עד 30',
  complete_10: 'השלמה ל-10',
  complete_20: 'השלמה ל-20',
  compare: 'השוואת מספרים',
  sequence: 'רצף מספרים',
  tens_in_number: 'כמה עשרות',
  ones_in_number: 'כמה אחדות',
  build_tens_ones: 'בניית מספר – עשרות ואחדות',
  expanded_form: 'פירוק לעשרות ואחדות',
  hundreds_in_number: 'כמה מאות',
  build_hundreds: 'בניית מספר תלת-ספרתי',
  expanded_form_3: 'פירוק מאות, עשרות ואחדות',
  skip_count: 'דילוגים – עולה',
  skip_count_back: 'דילוגים – יורד',
  skip_count_100: 'דילוגים ב-100',
  word_add: 'בעיה מילולית – חיבור',
  word_sub: 'בעיה מילולית – חיסור',
  geo_sides: 'גאומטריה – צלעות',
  geo_corners: 'גאומטריה – פינות',
  geo_identify: 'גאומטריה – זיהוי צורה',
  geo_count_sides_compare: 'גאומטריה – השוואה',
  name_letter: 'שם האות',
  word_starts_with: 'מילה שמתחילה ב-',
  fill_letter: 'השלמת אות במילה',
  fill_letter_choice: 'אות חסרה (בחירה)',
  find_letter: 'מציאת אות',
  match_letter: 'התאמת אות למילה',
  type_letter: 'כתיבת אות',
  count_letter: 'ספירת אותיות',
  first_letter_of_word: 'אות ראשונה',
  odd_one_out: 'מה שונה',
};

export default function ParentsScreen({ onBack }) {
  const [children, setChildren] = useState([]);
  const [activeChild, setActiveChild] = useState('son');
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState(null);

  useEffect(() => {
    fetchChildren()
      .then(data => {
        const list = data.children || [];
        setChildren(list);
        if (list.length && !list.some(c => c.id === activeChild)) {
          setActiveChild(list[0].id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchStats(activeChild), fetchHistory(activeChild)])
      .then(([s, h]) => {
        setStats(s);
        setHistory(h.sessions);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeChild]);

  const activeProfile = children.find(c => c.id === activeChild);
  const childName = activeProfile ? activeProfile.name : (activeChild === 'son' ? 'דין' : 'ליה');

  // Sort by-type stats by weakness (most wrong first)
  const sortedTypes = stats
    ? Object.entries(stats.byType)
        .map(([type, s]) => ({ type, ...s, rate: s.total > 0 ? s.correct / s.total : 0 }))
        .sort((a, b) => a.rate - b.rate)
    : [];

  const weakTypes = sortedTypes.filter(t => t.rate < 0.7 && t.total >= 2).slice(0, 3);
  const strongTypes = sortedTypes.filter(t => t.rate >= 0.8).slice(-3).reverse();

  return (
    <div className="parents-screen">
      <div className="parents-header">
        <button className="back-btn" onClick={onBack}>← חזרה לאזור הילדים</button>
        <h1>👨‍👩‍👧 אזור הורים</h1>
      </div>

      <div className="child-tabs">
        {children.map(c => (
          <button
            key={c.id}
            className={`tab ${activeChild === c.id ? 'active' : ''}`}
            onClick={() => setActiveChild(c.id)}
          >
            {c.photo
              ? <img src={c.photo} alt="" className={`tab-photo ${c.subject === 'hebrew' ? 'tab-photo-daughter' : ''}`} />
              : <span className="tab-emoji">{c.gender === 'girl' ? '👧' : '👦'}</span>}
            {c.name}
          </button>
        ))}
      </div>

      {loading && <div className="loading">טוען...</div>}

      {!loading && stats && (
        <>
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-num">{stats.totalSessions}</div>
              <div className="stat-label">מפגשים</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{stats.totalExercises}</div>
              <div className="stat-label">תרגילים</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">
                {stats.totalExercises ? Math.round(stats.totalCorrect / stats.totalExercises * 100) : 0}%
              </div>
              <div className="stat-label">הצלחה</div>
            </div>
          </div>

          {stats.totalSessions === 0 && (
            <div className="empty-state">
              {childName} עדיין לא ביצע/ה תרגילים. כשתסיים/י מפגש – הנתונים יופיעו כאן.
            </div>
          )}

          {weakTypes.length > 0 && (
            <div className="section">
              <h2>🎯 נושאים שכדאי לתרגל עם {childName}</h2>
              <div className="topic-list">
                {weakTypes.map(t => (
                  <div key={t.type} className="topic-row weak">
                    <span className="topic-name">{TYPE_LABELS[t.type] || t.type}</span>
                    <span className="topic-bar">
                      <span className="bar-fill" style={{ width: `${t.rate * 100}%`, background: '#e53935' }} />
                    </span>
                    <span className="topic-stats">{t.correct}/{t.total} ({Math.round(t.rate * 100)}%)</span>
                  </div>
                ))}
              </div>
              <div className="hint-text">
                💡 התרגילים האלה יוצגו יותר במפגשים הבאים עד שיצליח/תצליח.
              </div>
            </div>
          )}

          {strongTypes.length > 0 && (
            <div className="section">
              <h2>⭐ נושאים חזקים</h2>
              <div className="topic-list">
                {strongTypes.map(t => (
                  <div key={t.type} className="topic-row strong">
                    <span className="topic-name">{TYPE_LABELS[t.type] || t.type}</span>
                    <span className="topic-bar">
                      <span className="bar-fill" style={{ width: `${t.rate * 100}%`, background: '#43a047' }} />
                    </span>
                    <span className="topic-stats">{t.correct}/{t.total} ({Math.round(t.rate * 100)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="section">
            <EmailSettings />
          </div>

          <div className="section">
            <h2>📚 היסטוריית מפגשים ({history.length})</h2>
            <div className="sessions-list">
              {[...history].reverse().map((s, i) => {
                const correctCount = s.results.filter(r => r.correct).length;
                const sessionId = `${s.savedAt}-${i}`;
                const isOpen = expandedSession === sessionId;
                return (
                  <div key={sessionId} className="session-item">
                    <button
                      className="session-summary"
                      onClick={() => setExpandedSession(isOpen ? null : sessionId)}
                    >
                      <span className="session-date">
                        {new Date(s.savedAt).toLocaleDateString('he-IL', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                      <span className="session-score">
                        {correctCount}/{s.results.length}
                        ({Math.round(correctCount / s.results.length * 100)}%)
                      </span>
                      <span className="expand-icon">{isOpen ? '▼' : '◀'}</span>
                    </button>
                    {isOpen && (
                      <div className="session-details">
                        {s.results.map((r, j) => {
                          const noMistake = r.firstAttemptCorrect !== false && r.correct;
                          const corrected = r.firstAttemptCorrect === false && r.correct;
                          const cls = noMistake ? 'correct' : corrected ? 'corrected' : 'wrong';
                          const icon = noMistake ? '✅' : corrected ? '⚠️' : '❌';
                          return (
                            <div key={j} className={`detail-row ${cls}`}>
                              <span className="d-icon">{icon}</span>
                              <span className="d-q" dir={r.dir || 'rtl'}>{r.question.split('\n')[0]}</span>
                              <span className="d-ans">תשובה: <strong>{r.answer}</strong></span>
                              <span className="d-att">{r.attempts} ניסיונות</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              {history.length === 0 && (
                <div className="empty-state">אין עדיין מפגשים שמורים</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
