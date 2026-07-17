// ── Curriculum mapping (מיפוי) + adaptive progression ──────────────────────
// Two special preparation tracks, aligned with the Israeli Ministry of
// Education curriculum (תכנית הלימודים של משרד החינוך):
//
//   gan_to_a – ילד/ה שעולה מגן חובה לכיתה א׳
//     Based on the kindergarten core curriculum (מנייה עד 10-20, השוואת
//     כמויות, זיהוי ספרות, חיבור/חיסור מוחשי, צורות הנדסיות, חוקיות)
//     plus first-grade readiness (חיבור וחיסור עד 10, מודעות פונולוגית
//     והכרת אותיות בעברית).
//
//   a_to_b – ילד/ה שעולה מכיתה א׳ לכיתה ב׳
//     Consolidates the grade-1 curriculum (חיבור וחיסור עד 20, המבנה
//     העשרוני עד 100, סדרות ודילוגים, מצולעים) and introduces grade-2
//     openers (חיבור/חיסור דו-ספרתי ללא המרה, זוגי/אי-זוגי, חיבור חוזר
//     כהכנה לכפל, היכרות עם מאות).
//
// Each track is split into numbered stages. The child climbs a stage after
// STREAK_TO_ADVANCE consecutive successful practice days (see below).
// The full human-readable mapping lives in docs/curriculum-map.md.

export const PREP_TRACKS = {
  gan_to_a: {
    label: 'עולה לכיתה א׳',
    shortLabel: 'הכנה לכיתה א׳',
    mathStages: 4,
    hebrewStages: 4,
    questionsPerSession: 12,   // shorter sessions for a 5-6 year old
    stageNames: [
      'מנייה, כמויות וצורות',
      'מספרים עד 10',
      'חיבור וחיסור עם ציורים',
      'מוכנות לכיתה א׳',
    ],
    hebrewStageNames: [
      'הכרת האותיות',
      'צליל פותח',
      'אותיות בתוך מילים',
      'קריאה ראשונה',
    ],
  },
  a_to_b: {
    label: 'עולה לכיתה ב׳',
    shortLabel: 'הכנה לכיתה ב׳',
    mathStages: 4,
    // A first-grader already knows the letters, so the Hebrew ladder starts
    // straight at the reading stages (mapped to global stages 3-4).
    hebrewStages: 2,
    questionsPerSession: 20,
    stageNames: [
      'ביסוס כיתה א׳',
      'עשרות שלמות ושכנים',
      'דו-ספרתי ללא המרה',
      'לקראת כיתה ב׳',
    ],
    hebrewStageNames: [
      'קריאת מילים',
      'אוצר מילים וכתיבה',
    ],
  },
};

export const VALID_GRADES = Object.keys(PREP_TRACKS);

export function sanitizeGrade(grade) {
  return VALID_GRADES.includes(grade) ? grade : null;
}

// English (Foundation Level – תכנית האנגלית של משרד החינוך) is a global
// 4-stage ladder, independent of the prep track. The parent picks a starting
// stage per child (englishLevel); the adaptive mechanism climbs from there.
export const ENGLISH_STAGES = 6;
export const ENGLISH_STAGE_NAMES = [
  'אותיות ראשונות',
  'מילים ראשונות',
  'קוראים וכותבים',
  'מרחיבים אוצר מילים',
  'משפטים וכתיבה',
  'שליטה באנגלית',
];

export function sanitizeEnglishLevel(level) {
  const n = Number(level);
  return n >= 1 && n <= ENGLISH_STAGES ? Math.floor(n) : 1;
}

// Hebrew is a global 4-stage ladder too (the MoE literacy foundations),
// for every child — the parent picks the starting stage per child.
export const HEBREW_STAGES = 4;
export const HEBREW_STAGE_NAMES = [
  'הכרת האותיות',
  'צליל פותח',
  'אותיות בתוך מילים',
  'קריאה ראשונה',
];

export function sanitizeHebrewLevel(level) {
  const n = Number(level);
  return n >= 1 && n <= HEBREW_STAGES ? Math.floor(n) : 1;
}

// Starting stage for prep-track math (1-4) – lets the parent skip ahead when
// the child is clearly past the early stages.
export function sanitizeMathStage(stage) {
  const n = Number(stage);
  return n >= 1 && n <= 4 ? Math.floor(n) : 1;
}

export function maxStage(track, subject) {
  if (subject === 'english') return ENGLISH_STAGES;
  if (subject === 'hebrew') return HEBREW_STAGES;
  const t = PREP_TRACKS[track];
  if (!t) return 1;
  return t.mathStages;
}

// ── Adaptive difficulty ─────────────────────────────────────────────────────
// A practice day is "successful" when at least SUCCESS_RATE of the session's
// questions were answered correctly on the FIRST attempt. After
// STREAK_TO_ADVANCE successful practice days in a row the child levels up
// (track stage +1, or the next mathLevel for level-based children).
// A day below the bar resets the streak. Days without practice don't reset
// the streak – kids skip weekends; "רצוף" counts practice days.
export const SUCCESS_RATE = 0.8;
export const STREAK_TO_ADVANCE = 3;
// A child who clearly masters the material moves up faster: an "excellent"
// day (95%+ first-attempt) counts as TWO streak days, so two excellent days
// in a row are enough to level up.
export const EXCELLENT_RATE = 0.95;

export function sessionSuccessRate(results) {
  const list = Array.isArray(results) ? results : [];
  if (!list.length) return 0;
  const firstTry = list.filter(r => r.firstAttemptCorrect !== false && r.correct).length;
  return firstTry / list.length;
}

/**
 * Fold one session into a progress record. Pure – returns the new record and
 * whether the child just earned a level-up. Repeat sessions on the same day
 * only count once, but a failed morning can be redeemed by a successful
 * afternoon (the day flips to successful and the streak grows).
 */
export function applySessionToProgress(record, date, rate) {
  const r = {
    stage: record?.stage || 1,
    streak: record?.streak || 0,
    lastDate: record?.lastDate || null,
    lastDateSuccess: record?.lastDateSuccess || false,
  };
  const success = rate >= SUCCESS_RATE;
  const gain = rate >= EXCELLENT_RATE ? 2 : 1;   // excellent day counts double

  if (r.lastDate === date) {
    if (r.lastDateSuccess || !success) return { record: r, advanced: false };
    r.lastDateSuccess = true;           // the day was redeemed
    r.streak += gain;
  } else {
    r.lastDate = date;
    r.lastDateSuccess = success;
    r.streak = success ? r.streak + gain : 0;
  }

  if (r.streak >= STREAK_TO_ADVANCE) {
    r.streak = 0;
    return { record: r, advanced: true };
  }
  return { record: r, advanced: false };
}

// ── Daily summer plan (תכנית יומית לחופש הגדול) ─────────────────────────────
// Each child can have a daily quota of exercises per subject (e.g. ליה: 15
// math + 15 Hebrew + 15 English; דין: 20 math + 20 English). The plan runs
// until `planUntil` (default: the last day of the Israeli summer vacation).

export const PLAN_DEFAULT_UNTIL = '2026-08-31';
export const PLAN_MAX_PER_SUBJECT = 50;
export const PLAN_SESSION_MAX = PLAN_MAX_PER_SUBJECT;   // one session can cover the whole daily quota
export const PLAN_SESSION_MIN = 3;

const VALID_PLAN_SUBJECTS = ['math', 'hebrew', 'english'];

/** {math: 15, hebrew: 15} → sanitized plan object, or null when empty. */
export function sanitizeDailyPlan(plan) {
  if (!plan || typeof plan !== 'object') return null;
  const out = {};
  for (const s of VALID_PLAN_SUBJECTS) {
    const n = Math.floor(Number(plan[s]));
    if (n >= 1) out[s] = Math.min(n, PLAN_MAX_PER_SUBJECT);
  }
  return Object.keys(out).length ? out : null;
}

export function sanitizePlanUntil(until) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(until || '')) ? until : PLAN_DEFAULT_UNTIL;
}

export function planIsActive(profile, date) {
  if (!profile?.dailyPlan) return false;
  return date <= (profile.planUntil || PLAN_DEFAULT_UNTIL);
}

/**
 * Resize a generated session to exactly `target` questions. Generators
 * produce fixed-size sessions (12/15/20); when a daily plan needs more, extra
 * batches are appended (deduped, review items only from the first batch), and
 * when it needs fewer, the list is trimmed keeping review questions first.
 */
export function fitSessionToCount(makeSession, target) {
  const n = Math.min(Math.max(PLAN_SESSION_MIN, Math.floor(target)), PLAN_SESSION_MAX);
  let list = makeSession();
  // Include the answer in the key: several English types share a constant
  // question text ("מה מתאים למילה?") and differ only by the answer word.
  const keyOf = (ex) => ex.dedupKey || `${ex.type}|${ex.question}|${ex.answer}`;
  const seen = new Set(list.map(keyOf));

  let guard = 0;
  while (list.length < n && guard < 4) {
    for (const ex of makeSession()) {
      if (list.length >= n) break;
      const k = keyOf(ex);
      if (seen.has(k) || ex.isReview) continue;   // review already came in batch 1
      seen.add(k);
      list.push(ex);
    }
    guard++;
  }

  if (list.length > n) {
    // Keep resurfaced review questions – they matter most.
    const reviews = list.filter(e => e.isReview).slice(0, n);
    const rest = list.filter(e => !e.isReview).slice(0, n - reviews.length);
    list = [...reviews, ...rest];
  }
  return list.map((ex, i) => ({ ...ex, id: i + 1 }));
}

export function stageName(track, subject, stage) {
  if (subject === 'english') {
    return ENGLISH_STAGE_NAMES[Math.min(Math.max(1, stage), ENGLISH_STAGES) - 1] || '';
  }
  if (subject === 'hebrew') {
    return HEBREW_STAGE_NAMES[Math.min(Math.max(1, stage), HEBREW_STAGES) - 1] || '';
  }
  const t = PREP_TRACKS[track];
  if (!t) return '';
  const names = t.stageNames;
  return names[Math.min(Math.max(1, stage), names.length) - 1] || '';
}

// The auto-advance ladder for level-based children (חיבור וחיסור עד N).
// Mirrors MATH_LEVELS in mathGenerator.js (kept literal to avoid the client
// bundling the whole generator just for this list).
const LEVEL_LADDER = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

/**
 * Fold a finished session into a child's progress. Pure — the caller
 * persists the returned record (and the mathLevel bump, when there is one).
 *
 * Returns { record, levelUp } where levelUp is null (no level-up) or:
 *   { mode: 'stage', stage, name }   – prep-track child climbed a stage
 *   { mode: 'level', level }         – leveled-math child got a higher ceiling
 */
export function foldSession(profile, subject, record, date, results) {
  const rate = sessionSuccessRate(results);
  const { record: r, advanced } = applySessionToProgress(record, date, rate);

  if (!advanced) return { record: r, levelUp: null };

  // English and Hebrew climb their own global ladders, for every child,
  // prep track or not.
  if (subject === 'english' || subject === 'hebrew') {
    const cap = subject === 'english' ? ENGLISH_STAGES : HEBREW_STAGES;
    if (r.stage < cap) {
      r.stage += 1;
      return {
        record: r,
        levelUp: { mode: 'stage', stage: r.stage, name: stageName(null, subject, r.stage) },
      };
    }
    return { record: r, levelUp: null };
  }

  if (profile.grade) {
    const cap = maxStage(profile.grade, subject);
    if (r.stage < cap) {
      r.stage += 1;
      return {
        record: r,
        levelUp: { mode: 'stage', stage: r.stage, name: stageName(profile.grade, subject, r.stage) },
      };
    }
    return { record: r, levelUp: null };   // already mastered the top stage
  }

  if (subject === 'math' && profile.mathLevel) {
    const next = LEVEL_LADDER[LEVEL_LADDER.indexOf(profile.mathLevel) + 1];
    if (next) return { record: r, levelUp: { mode: 'level', level: next } };
  }

  return { record: r, levelUp: null };
}
