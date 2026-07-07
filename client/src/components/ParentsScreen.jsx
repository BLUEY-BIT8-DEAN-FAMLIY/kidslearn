import { useState, useEffect } from 'react';
import { fetchStats, fetchHistory, fetchChildren, updateChild, IS_WEB } from '../api';
import { PREP_TRACKS, stageName, STREAK_TO_ADVANCE, HEBREW_STAGES, ENGLISH_STAGES } from '../../../server/exercises/curriculum.js';
import EmailSettings from './EmailSettings';
import BgRemovalSettings from './BgRemovalSettings';
import './ParentsScreen.css';

const TYPE_LABELS = {
  addition: 'חיבור',
  subtraction: 'חיסור',
  complete: 'השלמה למספר עגול',
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
  geo_count: 'גאומטריה – ספירת צורות',
  count_objects: 'ספירת חפצים',
  compare_quantities: 'השוואת כמויות',
  number_after: 'המספר שאחרי',
  number_before: 'המספר שלפני',
  visual_add: 'חיבור עם ציורים',
  visual_sub: 'חיסור עם ציורים',
  pattern: 'חוקיות (דגם חוזר)',
  biggest_number: 'המספר הגדול ביותר',
  smallest_number: 'המספר הקטן ביותר',
  round_tens_add: 'חיבור עשרות שלמות',
  round_tens_sub: 'חיסור עשרות שלמות',
  two_digit_add: 'חיבור דו-ספרתי',
  two_digit_sub: 'חיסור דו-ספרתי',
  missing_number: 'מספר חסר בתרגיל',
  even_odd: 'זוגי או אי-זוגי',
  repeated_add: 'חיבור חוזר (לקראת כפל)',
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
  read_word: 'קריאת מילה',
  last_letter: 'אות אחרונה',
  en_letter_name: 'אנגלית – שם האות',
  en_letter_find: 'אנגלית – מציאת אות',
  en_first_letter: 'אנגלית – אות פותחת',
  en_word_to_pic: 'אנגלית – מילה לתמונה',
  en_pic_to_word: 'אנגלית – תמונה למילה',
  en_listen_pick: 'אנגלית – הבנת הנשמע',
  en_translate_to_he: 'אנגלית – תרגום לעברית',
  en_translate_to_en: 'אנגלית – תרגום לאנגלית',
  en_missing_letter: 'אנגלית – אות חסרה',
  en_spell: 'אנגלית – כתיבת מילה',
};

const PLAN_SUBJECT_NAMES = { math: '➕ חשבון', hebrew: '🔤 עברית', english: '🇬🇧 אנגלית' };

// Quick daily-quota editor: the parent can raise/lower each subject's daily
// exercise count right from the parents area (0 = no daily requirement).
function PlanEditor({ profile, onSaved }) {
  const [plan, setPlan] = useState(null);
  const [until, setUntil] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    setPlan({ ...(profile?.dailyPlan || {}) });
    setUntil(profile?.planUntil || '2026-08-31');
    setSavedMsg(false);
  }, [profile?.id]);

  if (!profile || !plan) return null;
  const subjects = Array.isArray(profile.subjects) && profile.subjects.length
    ? profile.subjects
    : [profile.subject || 'math'];

  async function save() {
    setSaving(true);
    try {
      const cleaned = {};
      for (const s of subjects) if (plan[s] > 0) cleaned[s] = Number(plan[s]);
      const { child } = await updateChild(profile.id, {
        dailyPlan: Object.keys(cleaned).length ? cleaned : null,
        planUntil: until,
      });
      onSaved(child);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="section">
      <h2>🗓️ מכסת תרגילים יומית — {profile.name}</h2>
      <div className="quota-rows">
        {subjects.map(s => (
          <label key={s} className="quota-row">
            <span className="quota-name">{PLAN_SUBJECT_NAMES[s] || s}</span>
            <input
              type="number" min="0" max="50"
              value={plan[s] ?? 0}
              onChange={e => setPlan(p => ({ ...p, [s]: Number(e.target.value) }))}
            />
            <span className="quota-unit">תרגילים ביום</span>
          </label>
        ))}
        <label className="quota-row">
          <span className="quota-name">עד תאריך</span>
          <input type="date" value={until} onChange={e => setUntil(e.target.value)} />
        </label>
      </div>
      <button className="quota-save" onClick={save} disabled={saving}>
        {saving ? 'שומר...' : savedMsg ? '✓ נשמר!' : '💾 שמור מכסה'}
      </button>
      <div className="hint-text">💡 0 = בלי חובה יומית. המפגשים מתאימים את עצמם למכסה אוטומטית.</div>
    </div>
  );
}

// Exercises per day, last 14 days — the parent sees the practice rhythm at a
// glance (research: consistency beats intensity for young learners).
function ActivityChart({ history }) {
  const days = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    days.push(d.toISOString().slice(0, 10));
  }
  const counts = days.map(date =>
    (history || [])
      .filter(s => s.date === date)
      .reduce((n, s) => n + (s.results || []).length, 0));
  const max = Math.max(...counts, 1);
  if (!counts.some(c => c > 0)) return null;

  return (
    <div className="section">
      <h2>📊 פעילות ב-14 הימים האחרונים</h2>
      <div className="activity-chart" dir="ltr">
        {days.map((date, i) => (
          <div key={date} className="activity-col" title={`${date}: ${counts[i]} תרגילים`}>
            <span className="activity-count">{counts[i] || ''}</span>
            <div
              className={`activity-bar ${counts[i] > 0 ? 'active' : ''}`}
              style={{ height: `${Math.max(4, (counts[i] / max) * 90)}px` }}
            />
            <span className="activity-day">{Number(date.slice(8, 10))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Current stage + streak per adaptive subject: prep-track math/hebrew and the
// global English ladder (English adapts for every child who learns it).
function ProgressSection({ profile, progress }) {
  if (!profile || !progress) return null;
  const track = PREP_TRACKS[profile.grade];
  const subjects = Array.isArray(profile.subjects) && profile.subjects.length
    ? profile.subjects
    : [profile.subject || 'math'];

  const rows = subjects
    .filter(s => (s === 'math' ? !!track : true))
    .map(s => {
      const p = progress[s] || { stage: 1, streak: 0 };
      const stage = s === 'english'
        ? Math.max(p.stage, profile.englishLevel || 1)
        : s === 'hebrew'
          ? Math.max(p.stage, profile.hebrewLevel || 1)
          : Math.max(p.stage, profile.mathStage || 1);
      const total = s === 'english' ? ENGLISH_STAGES : s === 'hebrew' ? HEBREW_STAGES : track.mathStages;
      const icon = s === 'english' ? '🇬🇧 אנגלית' : s === 'hebrew' ? '🔤 עברית' : '➕ חשבון';
      return { s, icon, stage, total, name: stageName(profile.grade, s, stage), streak: p.streak };
    });

  if (!rows.length) return null;

  return (
    <div className="section">
      <h2>🎓 התקדמות{track ? ` — ${track.label}` : ''}</h2>
      <div className="topic-list">
        {rows.map(r => (
          <div key={r.s} className="topic-row">
            <span className="topic-name">
              {r.icon}: שלב {r.stage} מתוך {r.total} — {r.name}
            </span>
            <span className="topic-stats">
              🔥 רצף ימי הצלחה: {r.streak}/{STREAK_TO_ADVANCE}
            </span>
          </div>
        ))}
      </div>
      <div className="hint-text">
        💡 אחרי {STREAK_TO_ADVANCE} ימי תרגול מוצלחים ברצף (80% ומעלה בניסיון ראשון) עולים שלב אוטומטית.
      </div>
    </div>
  );
}

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
  const childName = activeProfile ? activeProfile.name : '';

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
            {c.photo && !c.avatar
              ? <img src={c.photo} alt="" className={`tab-photo ${c.subject === 'hebrew' ? 'tab-photo-daughter' : ''}`} />
              : <span className="tab-emoji">{c.avatar || (c.gender === 'girl' ? '👧' : '👦')}</span>}
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

          <ProgressSection profile={activeProfile} progress={stats.progress} />

          <PlanEditor
            profile={activeProfile}
            onSaved={(child) => setChildren(cs => cs.map(c => (c.id === child.id ? child : c)))}
          />

          <ActivityChart history={history} />

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

          {!IS_WEB && (
            <div className="section">
              <EmailSettings />
            </div>
          )}

          {!IS_WEB && (
            <div className="section">
              <BgRemovalSettings />
            </div>
          )}

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
