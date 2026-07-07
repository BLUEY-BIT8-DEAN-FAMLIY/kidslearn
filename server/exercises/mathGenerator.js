function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build an arithmetic-progression sequence of 5 terms with one interior term
// blanked out. `step` may be negative for descending sequences. Numbers are
// shown LTR (a comma-separated number list reverses visually under RTL).
function buildSequence(type, start, step, opts = {}) {
  const len = 5;
  const seq = Array.from({ length: len }, (_, i) => start + i * step);
  const missingIdx = randInt(1, len - 2); // never blank the first/last term
  const display = seq.map((n, i) => (i === missingIdx ? '?' : n));
  return {
    type,
    difficulty: opts.difficulty || 2,
    dir: 'ltr',
    question: display.join(', '),
    answer: seq[missingIdx],
    hint: opts.hint,
  };
}

const WORD_PROBLEMS_ADD = [
  (a, b) => `לדני ${a} בלונים, קיבל עוד ${b}. כמה בלונים יש לו עכשיו?`,
  (a, b) => `בכיתה יש ${a} ילדים, הגיעו עוד ${b}. כמה ילדים יש עכשיו?`,
  (a, b) => `לשרה ${a} ספרים, קנתה עוד ${b}. כמה ספרים יש לה?`,
  (a, b) => `בסל יש ${a} תפוחים, הוסיפו עוד ${b}. כמה תפוחים יש בסל?`,
  (a, b) => `טום אסף ${a} קונכיות, חברו הוסיף ${b}. כמה קונכיות יש ביחד?`,
  (a, b) => `היו ${a} מכוניות צעצוע, וקנו עוד ${b}. כמה מכוניות יש עכשיו?`,
];

const WORD_PROBLEMS_SUB = [
  (a, b) => `לרותי ${a} סוכריות, נתנה ${b} לאחיה. כמה סוכריות נשארו?`,
  (a, b) => `היו ${a} ציפורים על הגג, ${b} עפו. כמה נשארו?`,
  (a, b) => `לאמא ${a} ביצים, השתמשה ב-${b}. כמה נשארו?`,
  (a, b) => `בחנות היו ${a} עוגיות, נמכרו ${b}. כמה נשארו?`,
  (a, b) => `יוסי קנה ${a} מדבקות, נתן ${b} לחברים. כמה נשאר לו?`,
  (a, b) => `היו ${a} פרחים באגרטל, ולקחו ${b}. כמה פרחים נשארו?`,
];

// difficulty: 1=easy, 2=medium, 3=hard
const GENERATORS = {
  // Easy (kept for review/back-compat; not part of the default daily mix)
  addition_10: () => {
    const a = randInt(1, 9);
    const b = randInt(0, 10 - a);
    return { type: 'addition_10', difficulty: 1, dir: 'ltr', question: `${a} + ${b} = ?`, answer: a + b, hint: `נסה לספור על האצבעות` };
  },
  subtraction_10: () => {
    const a = randInt(2, 10);
    const b = randInt(0, a);
    return { type: 'subtraction_10', difficulty: 1, dir: 'ltr', question: `${a} - ${b} = ?`, answer: a - b, hint: `נסה לספור אחורה` };
  },
  sequence: () => {
    const start = randInt(1, 16);
    const seq = [start, start + 1, start + 2, start + 3, start + 4];
    const missingIdx = randInt(1, 3);
    const display = seq.map((n, i) => i === missingIdx ? '?' : n);
    return { type: 'sequence', difficulty: 1, dir: 'ltr', question: display.join(', '), answer: seq[missingIdx], hint: `המספרים עולים ב-1` };
  },
  compare: () => {
    const a = randInt(1, 20);
    const b = randInt(1, 20);
    const symbol = a > b ? '>' : a < b ? '<' : '=';
    return { type: 'compare', difficulty: 1, dir: 'ltr', question: `${a} ___ ${b}`, answer: symbol, options: ['>', '<', '='], hint: `האם ${a} גדול, קטן או שווה ל-${b}?` };
  },

  // Medium
  addition_20: () => {
    const result = randInt(11, 20);
    const a = randInt(2, result - 2);
    const b = result - a;
    return { type: 'addition_20', difficulty: 2, dir: 'ltr', question: `${a} + ${b} = ?`, answer: result, hint: `${a} + ${b}` };
  },
  subtraction_20: () => {
    const a = randInt(11, 20);
    const b = randInt(1, a - 1);
    return { type: 'subtraction_20', difficulty: 2, dir: 'ltr', question: `${a} - ${b} = ?`, answer: a - b, hint: `${a} - ${b}` };
  },
  complete_10: () => {
    const a = randInt(1, 9);
    return { type: 'complete_10', difficulty: 2, dir: 'ltr', question: `${a} + ? = 10`, answer: 10 - a, hint: `כמה צריך להוסיף ל-${a} כדי להגיע ל-10?` };
  },
  complete_20: () => {
    const a = randInt(11, 19);
    return { type: 'complete_20', difficulty: 2, dir: 'ltr', question: `${a} + ? = 20`, answer: 20 - a, hint: `כמה צריך להוסיף ל-${a} כדי להגיע ל-20?` };
  },

  // Medium-Hard – up to 30
  addition_30: () => {
    const result = randInt(21, 30);
    const a = randInt(2, result - 2);
    const b = result - a;
    return { type: 'addition_30', difficulty: 3, dir: 'ltr', question: `${a} + ${b} = ?`, answer: result, hint: `${a} + ${b}` };
  },
  subtraction_30: () => {
    const a = randInt(21, 30);
    const b = randInt(1, a - 1);
    return { type: 'subtraction_30', difficulty: 3, dir: 'ltr', question: `${a} - ${b} = ?`, answer: a - b, hint: `${a} - ${b}` };
  },

  // Hard
  word_add: () => {
    const a = randInt(2, 10);
    const b = randInt(1, 20 - a);
    const tpl = pick(WORD_PROBLEMS_ADD);
    return { type: 'word_add', difficulty: 3, dir: 'rtl', question: tpl(a, b), answer: a + b, hint: `${a} + ${b}` };
  },
  word_sub: () => {
    const a = randInt(5, 20);
    const b = randInt(1, a - 1);
    const tpl = pick(WORD_PROBLEMS_SUB);
    return { type: 'word_sub', difficulty: 3, dir: 'rtl', question: tpl(a, b), answer: a - b, hint: `${a} - ${b}` };
  },

  // ── Place value – tens & ones (תחום ה-100, סוף כיתה א') ──────────────────
  tens_in_number: () => {
    const n = randInt(11, 99);
    return {
      type: 'tens_in_number', difficulty: 2, dir: 'rtl',
      question: `כמה עשרות יש במספר ${n}?`,
      answer: Math.floor(n / 10),
      hint: `הספרה השמאלית במספר ${n} היא ספרת העשרות`,
    };
  },
  ones_in_number: () => {
    const n = randInt(11, 99);
    return {
      type: 'ones_in_number', difficulty: 2, dir: 'rtl',
      question: `כמה אחדות יש במספר ${n}?`,
      answer: n % 10,
      hint: `הספרה הימנית במספר ${n} היא ספרת האחדות`,
    };
  },
  build_tens_ones: () => {
    const t = randInt(1, 9);
    const o = randInt(0, 9);
    return {
      type: 'build_tens_ones', difficulty: 2, dir: 'rtl',
      question: `${t} עשרות ו-${o} אחדות. איזה מספר זה?`,
      answer: t * 10 + o,
      hint: `${t} עשרות = ${t * 10}, ואז מוסיפים ${o} אחדות`,
    };
  },
  expanded_form: () => {
    const t = randInt(1, 9);
    const o = randInt(1, 9);
    const n = t * 10 + o;
    if (pick([true, false])) {
      return {
        type: 'expanded_form', difficulty: 2, dir: 'ltr',
        question: `${n} = ${t * 10} + ?`,
        answer: o,
        hint: `${n} זה ${t} עשרות (${t * 10}) ו-${o} אחדות`,
      };
    }
    return {
      type: 'expanded_form', difficulty: 2, dir: 'ltr',
      question: `${n} = ? + ${o}`,
      answer: t * 10,
      hint: `${n} זה ${t} עשרות (${t * 10}) ו-${o} אחדות`,
    };
  },

  // ── Place value – hundreds (תחום ה-1000, התחלת כיתה ב') ──────────────────
  hundreds_in_number: () => {
    const n = randInt(100, 999);
    return {
      type: 'hundreds_in_number', difficulty: 3, dir: 'rtl',
      question: `כמה מאות יש במספר ${n}?`,
      answer: Math.floor(n / 100),
      hint: `הספרה השמאלית במספר ${n} היא ספרת המאות`,
    };
  },
  build_hundreds: () => {
    const h = randInt(1, 9);
    const t = randInt(0, 9);
    const o = randInt(0, 9);
    return {
      type: 'build_hundreds', difficulty: 3, dir: 'rtl',
      question: `${h} מאות, ${t} עשרות ו-${o} אחדות. איזה מספר זה?`,
      answer: h * 100 + t * 10 + o,
      hint: `${h * 100} ועוד ${t * 10} ועוד ${o}`,
    };
  },
  expanded_form_3: () => {
    const h = randInt(1, 9);
    const t = randInt(1, 9);
    const o = randInt(1, 9);
    const n = h * 100 + t * 10 + o;
    const which = pick(['h', 't', 'o']);
    if (which === 'h') {
      return {
        type: 'expanded_form_3', difficulty: 3, dir: 'ltr',
        question: `${n} = ? + ${t * 10} + ${o}`,
        answer: h * 100,
        hint: `ספרת המאות היא ${h}, כלומר ${h * 100}`,
      };
    }
    if (which === 't') {
      return {
        type: 'expanded_form_3', difficulty: 3, dir: 'ltr',
        question: `${n} = ${h * 100} + ? + ${o}`,
        answer: t * 10,
        hint: `ספרת העשרות היא ${t}, כלומר ${t * 10}`,
      };
    }
    return {
      type: 'expanded_form_3', difficulty: 3, dir: 'ltr',
      question: `${n} = ${h * 100} + ${t * 10} + ?`,
      answer: o,
      hint: `ספרת האחדות היא ${o}`,
    };
  },

  // ── Sequences / skip counting (סדרות ודילוגים) ───────────────────────────
  skip_count: () => {
    const step = pick([2, 5, 10]);
    const maxStartMult = Math.floor((100 - 4 * step) / step);
    const start = step * randInt(1, maxStartMult);
    return buildSequence('skip_count', start, step, {
      difficulty: 2, hint: `כל פעם מוסיפים ${step}`,
    });
  },
  skip_count_back: () => {
    const step = pick([2, 5, 10]);
    const start = step * randInt(4, Math.floor(100 / step));
    return buildSequence('skip_count_back', start, -step, {
      difficulty: 2, hint: `כל פעם מורידים ${step}`,
    });
  },
  skip_count_100: () => {
    if (pick([true, false])) {
      const start = 100 * randInt(1, 6); // up to 600 → last term ≤ 1000
      return buildSequence('skip_count_100', start, 100, {
        difficulty: 3, hint: `קופצים ב-100 כל פעם`,
      });
    }
    const start = 100 * randInt(5, 10); // down from up to 1000 → last term ≥ 100
    return buildSequence('skip_count_100', start, -100, {
      difficulty: 3, hint: `יורדים ב-100 כל פעם`,
    });
  },

  // Geometry – Grade 2 level
  geo_sides: () => {
    const shapes = [
      { name: 'משולש', emoji: '🔺', sides: 3 },
      { name: 'מרובע', emoji: '⬛', sides: 4 },
      { name: 'מחומש', emoji: '⬟', sides: 5 },
      { name: 'משושה', emoji: '⬢', sides: 6 },
    ];
    const s = pick(shapes);
    return {
      type: 'geo_sides', difficulty: 2, dir: 'rtl',
      question: `כמה צלעות יש ל${s.name}?`,
      displayShape: s.emoji,
      answer: s.sides,
      hint: `ספור את הקווים הישרים ב${s.name}`,
    };
  },
  geo_corners: () => {
    const shapes = [
      { name: 'משולש', emoji: '🔺', corners: 3 },
      { name: 'מרובע', emoji: '⬛', corners: 4 },
      { name: 'מחומש', emoji: '⬟', corners: 5 },
      { name: 'משושה', emoji: '⬢', corners: 6 },
    ];
    const s = pick(shapes);
    return {
      type: 'geo_corners', difficulty: 2, dir: 'rtl',
      question: `כמה פינות יש ל${s.name}?`,
      displayShape: s.emoji,
      answer: s.corners,
      hint: `כל פינה היא נקודה שבה שני קווים נפגשים`,
    };
  },
  geo_identify: () => {
    const shapes = [
      { name: 'משולש', emoji: '🔺' },
      { name: 'ריבוע', emoji: '⬛' },
      { name: 'עיגול', emoji: '⚫' },
      { name: 'מלבן', emoji: '▬' },
      { name: 'מחומש', emoji: '⬟' },
      { name: 'משושה', emoji: '⬢' },
    ];
    const correct = pick(shapes);
    const wrong = shuffle(shapes.filter(s => s.name !== correct.name)).slice(0, 3);
    return {
      type: 'geo_identify', difficulty: 1, dir: 'rtl',
      question: `איזו צורה זו?`,
      displayShape: correct.emoji,
      answer: correct.name,
      options: shuffle([correct, ...wrong]).map(s => s.name),
      hint: `הסתכל על הצורה והתבונן בצלעות שלה`,
    };
  },
  geo_count_sides_compare: () => {
    const shapes = [
      { name: 'משולש', sides: 3 },
      { name: 'ריבוע', sides: 4 },
      { name: 'מחומש', sides: 5 },
      { name: 'משושה', sides: 6 },
    ];
    const a = pick(shapes);
    const b = pick(shapes.filter(s => s.sides !== a.sides));
    const more = a.sides > b.sides ? a : b;
    return {
      type: 'geo_count_sides_compare', difficulty: 3, dir: 'rtl',
      question: `לאיזו צורה יש יותר צלעות?`,
      answer: more.name,
      options: shuffle([a.name, b.name]),
      hint: `${a.name} = ${a.sides} צלעות, ${b.name} = ${b.sides} צלעות`,
    };
  },
};

// Daily session is composed from these categories with fixed quotas, so the
// new "strengthening" topics (place value + sequences) are guaranteed to show
// up every day rather than competing in a flat random lottery.
const CATEGORIES = {
  arithmetic: ['addition_20', 'subtraction_20', 'addition_30', 'subtraction_30', 'complete_10', 'complete_20'],
  word: ['word_add', 'word_sub'],
  compare: ['compare'],
  tens_ones: ['tens_in_number', 'ones_in_number', 'build_tens_ones', 'expanded_form'],
  sequences: ['sequence', 'skip_count', 'skip_count_back'],
  geometry: ['geo_sides', 'geo_corners', 'geo_identify', 'geo_count_sides_compare'],
  // NOTE: focus is tens & ones up to 100 for now. The hundreds generators
  // (hundreds_in_number, build_hundreds, expanded_form_3) and skip_count_100
  // still exist but are intentionally left out of the daily mix until the kid
  // is ready — add a `hundreds` category back here to re-enable them.
};

// How many questions of each category in a 20-question session (sums to 20).
const CATEGORY_QUOTA = {
  arithmetic: 7,
  word: 2,
  compare: 1,
  tens_ones: 5,
  sequences: 3,
  geometry: 2,
};

// Categories whose slots are given up first to make room for review questions.
const REVIEW_DONOR_ORDER = ['arithmetic', 'geometry', 'word'];

const ALL_TYPES = Object.values(CATEGORIES).flat();
const MAX_PER_TYPE = 2;

// When the child chose to focus on a single operation, restrict the arithmetic
// & word-problem pools accordingly. The number-sense categories (compare /
// tens_ones / sequences / geometry) are operation-neutral and stay as they are.
function operationCategories(operation) {
  if (operation === 'add') {
    return { ...CATEGORIES, arithmetic: ['addition_20', 'addition_30', 'complete_10', 'complete_20'], word: ['word_add'] };
  }
  if (operation === 'sub') {
    return { ...CATEGORIES, arithmetic: ['subtraction_20', 'subtraction_30'], word: ['word_sub'] };
  }
  return CATEGORIES;
}

// The original "mixed" curriculum (end-1st / start-2nd grade): arithmetic up
// to 30 + place value to 100 + sequences + geometry. Used when a child has no
// explicit mathLevel (e.g. the built-in son profile). `operation` ('add' |
// 'sub' | 'mix') focuses the arithmetic portion when requested.
function generateMixedMath(weakness = {}, reviewExercises = [], operation = 'mix') {
  const cats = operationCategories(operation);
  const reviewCount = Math.min(reviewExercises.length, 3);

  // Identify weakest types so we can prefer them within their own category.
  const weakTypes = Object.entries(weakness)
    .filter(([t, rate]) => rate > 0.3 && ALL_TYPES.includes(t))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([t]) => t);

  // Reduce category quotas to free up `reviewCount` slots (review replaces
  // filler categories, never the place-value/sequence strengthening ones).
  const quota = { ...CATEGORY_QUOTA };
  let toFree = reviewCount;
  for (const cat of REVIEW_DONOR_ORDER) {
    while (toFree > 0 && quota[cat] > 0) { quota[cat]--; toFree--; }
    if (!toFree) break;
  }

  // Expand the quota map into a flat list of category slots.
  const catSlots = [];
  for (const [cat, n] of Object.entries(quota)) {
    for (let i = 0; i < n; i++) catSlots.push(cat);
  }

  const exercises = [];
  const seen = new Set();
  const typeCount = {};

  // Review questions first (resurfaced exactly as they were answered wrong).
  for (const r of reviewExercises.slice(0, reviewCount)) {
    exercises.push({ ...r, isReview: true });
    seen.add(`${r.type}|${r.question}`);
    typeCount[r.type] = (typeCount[r.type] || 0) + 1;
  }

  function pickTypeForCategory(cat) {
    const types = cats[cat];
    let pool = types.filter(t => (typeCount[t] || 0) < MAX_PER_TYPE);
    if (!pool.length) pool = types;
    const weakInPool = pool.filter(t => weakTypes.includes(t));
    return pick(weakInPool.length ? weakInPool : pool);
  }

  for (const cat of catSlots) {
    let type = pickTypeForCategory(cat);
    let ex = GENERATORS[type]();
    let key = `${ex.type}|${ex.question}`;
    let attempts = 0;
    // Retry on duplicate question; re-pick the type after a few misses.
    while (seen.has(key) && attempts < 25) {
      if (attempts > 6) type = pickTypeForCategory(cat);
      ex = GENERATORS[type]();
      key = `${ex.type}|${ex.question}`;
      attempts++;
    }
    seen.add(key);
    typeCount[ex.type] = (typeCount[ex.type] || 0) + 1;
    exercises.push(ex);
  }

  // Shuffle so categories are interleaved, then assign display ids.
  return shuffle(exercises).map((ex, i) => ({ ...ex, id: i + 1 }));
}

// ── Level-aware arithmetic ("חיבור וחיסור עד N") ───────────────────────────
// When a child has an explicit mathLevel, the whole session is focused on
// addition & subtraction up to that ceiling, with light, in-range support
// (compare / sequence / complete, plus word problems from level 20 up). A
// beginner at level 10 therefore only ever sees numbers within 0–10.
// Types stay generic ('addition' / 'subtraction' / 'complete') so a child's
// history isn't fragmented when the level changes.
export const MATH_LEVELS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

function levelDifficulty(max) {
  return max <= 10 ? 1 : max <= 30 ? 2 : 3;
}

function makeAddition(max) {
  const result = randInt(2, max);
  // Both addends ≥ 1 so a beginner never gets a wall of trivial "+ 0" problems.
  let a = randInt(1, result - 1);
  let b = result - a;
  if (pick([true, false])) { const t = a; a = b; b = t; }   // vary the display order
  // Canonical key so "3 + 4" and "4 + 3" count as the SAME within a session.
  const dedupKey = `addition|${Math.min(a, b)}+${Math.max(a, b)}`;
  return { type: 'addition', difficulty: levelDifficulty(max), dir: 'ltr', question: `${a} + ${b} = ?`, answer: result, hint: `${a} + ${b}`, dedupKey };
}

function makeSubtraction(max) {
  const a = randInt(2, max);
  const b = randInt(1, a);      // b ≥ 1 so we skip trivial "- 0" problems
  return { type: 'subtraction', difficulty: levelDifficulty(max), dir: 'ltr', question: `${a} - ${b} = ?`, answer: a - b, hint: `${a} - ${b}` };
}

function makeComplete(max) {
  // Complete to a "round" target that fits the level (10, 20, … up to max).
  const targets = [];
  for (let r = 10; r <= max; r += 10) targets.push(r);
  const target = targets.length ? pick(targets) : max;
  const a = randInt(1, target - 1);
  return { type: 'complete', difficulty: 2, dir: 'ltr', question: `${a} + ? = ${target}`, answer: target - a, hint: `כמה צריך להוסיף ל-${a} כדי להגיע ל-${target}?` };
}

function makeCompareLeveled(max) {
  const a = randInt(0, max);
  const b = randInt(0, max);
  const symbol = a > b ? '>' : a < b ? '<' : '=';
  return { type: 'compare', difficulty: 1, dir: 'ltr', question: `${a} ___ ${b}`, answer: symbol, options: ['>', '<', '='], hint: `האם ${a} גדול, קטן או שווה ל-${b}?` };
}

function makeSequenceLeveled(max) {
  const step = max <= 10 ? 1 : pick([1, 1, 2]);
  const ascending = pick([true, false]);
  const span = 4 * step;
  // Keep every one of the 5 terms within [0, max].
  const start = ascending
    ? randInt(0, Math.max(0, max - span))
    : randInt(span, max);
  return buildSequence('sequence', start, ascending ? step : -step, {
    difficulty: 1,
    hint: ascending ? `המספרים עולים ב-${step}` : `המספרים יורדים ב-${step}`,
  });
}

function makeWordAddLeveled(max) {
  const a = randInt(2, Math.max(2, max - 1));
  const b = randInt(1, Math.max(1, max - a));
  const tpl = pick(WORD_PROBLEMS_ADD);
  return { type: 'word_add', difficulty: 3, dir: 'rtl', question: tpl(a, b), answer: a + b, hint: `${a} + ${b}` };
}

function makeWordSubLeveled(max) {
  const a = randInt(Math.min(5, max), max);
  const b = randInt(1, Math.max(1, a - 1));
  const tpl = pick(WORD_PROBLEMS_SUB);
  return { type: 'word_sub', difficulty: 3, dir: 'rtl', question: tpl(a, b), answer: a - b, hint: `${a} - ${b}` };
}

function generateLeveledMath(level, reviewExercises = [], operation = 'mix') {
  const L = MATH_LEVELS.includes(level) ? level : 30;
  const reviewCount = Math.min(reviewExercises.length, 3);

  // Build a 20-slot plan. Addition/subtraction are the bulk; the rest is light,
  // in-range support (2 compare + 2 sequence). Word problems join from level 20
  // up. `operation` focuses the bulk on addition only, subtraction only, or a
  // balanced mix.
  const plan = [];
  const push = (gen, n) => { for (let i = 0; i < n; i++) plan.push(gen); };

  const SUPPORT = 4;                 // 2 compare + 2 sequence (operation-neutral)
  const withWord = L >= 20;
  const wordN = withWord ? 2 : 0;
  const arithTotal = 20 - SUPPORT - wordN; // addition / subtraction / complete

  if (operation === 'add') {
    push(() => makeAddition(L), arithTotal - 2);
    push(() => makeComplete(L), 2);          // "complete to a round number" is addition
    if (withWord) push(() => makeWordAddLeveled(L), 2);
  } else if (operation === 'sub') {
    push(() => makeSubtraction(L), arithTotal); // a subtraction-only session has no "complete"
    if (withWord) push(() => makeWordSubLeveled(L), 2);
  } else {
    const half = (arithTotal - 2) / 2;
    push(() => makeAddition(L), half);
    push(() => makeSubtraction(L), half);
    push(() => makeComplete(L), 2);
    if (withWord) { push(() => makeWordAddLeveled(L), 1); push(() => makeWordSubLeveled(L), 1); }
  }
  push(() => makeCompareLeveled(L), 2);
  push(() => makeSequenceLeveled(L), 2);

  // Free slots for resurfaced review questions by dropping leading arithmetic.
  for (let i = 0; i < reviewCount && plan.length; i++) plan.shift();

  return assembleSession(plan, reviewExercises, reviewCount);
}

// Turn a plan (array of generator thunks) + resurfaced review questions into
// a shuffled, de-duplicated session with display ids.
function assembleSession(plan, reviewExercises, reviewCount) {
  const exercises = [];
  const seen = new Set();
  const keyOf = (ex) => ex.dedupKey || `${ex.type}|${ex.question}`;
  for (const r of reviewExercises.slice(0, reviewCount)) {
    exercises.push({ ...r, isReview: true });
    seen.add(keyOf(r));
  }
  for (const gen of plan) {
    let ex = gen();
    let key = keyOf(ex);
    let attempts = 0;
    while (seen.has(key) && attempts < 25) { ex = gen(); key = keyOf(ex); attempts++; }
    seen.add(key);
    exercises.push(ex);
  }
  return shuffle(exercises).map((ex, i) => ({ ...ex, id: i + 1 }));
}

// ═══ Preparation tracks (מסלולי הכנה) ═══════════════════════════════════════
// Question types for the two Ministry-of-Education-aligned prep tracks:
// gan_to_a (עולה מגן חובה לכיתה א׳) and a_to_b (עולה מכיתה א׳ לכיתה ב׳).
// See server/exercises/curriculum.js and docs/curriculum-map.md for the map.

const COUNT_ITEMS = [
  { e: '🍎', name: 'תפוחים' },
  { e: '⭐', name: 'כוכבים' },
  { e: '🎈', name: 'בלונים' },
  { e: '🌸', name: 'פרחים' },
  { e: '🐟', name: 'דגים' },
  { e: '🚗', name: 'מכוניות' },
  { e: '🍓', name: 'תותים' },
  { e: '🦋', name: 'פרפרים' },
  { e: '🐤', name: 'אפרוחים' },
];

const emojiRow = (e, n) => Array(n).fill(e).join(' ');

// ── Kindergarten → 1st grade (counting, quantities, visual arithmetic) ──────
function makeCountObjects(max) {
  const item = pick(COUNT_ITEMS);
  const n = randInt(2, max);
  return {
    type: 'count_objects', difficulty: 1, dir: 'rtl',
    question: `כמה ${item.name} יש כאן?`,
    displayShape: emojiRow(item.e, n),
    answer: n,
    hint: `הצבע על כל ${item.e} וספור בקול`,
  };
}

function makeCompareQuantities() {
  const [a, b] = shuffle(COUNT_ITEMS).slice(0, 2);
  const na = randInt(1, 6);
  let nb = randInt(1, 6);
  while (nb === na) nb = randInt(1, 6);
  const more = na > nb ? a : b;
  return {
    type: 'compare_quantities', difficulty: 1, dir: 'rtl',
    question: `ממה יש יותר?`,
    displayShape: `${emojiRow(a.e, na)}\n${emojiRow(b.e, nb)}`,
    answer: more.name,
    options: shuffle([a.name, b.name]),
    hint: `ספור כל שורה בנפרד והשווה`,
  };
}

function makeNumberAfter(max) {
  const n = randInt(0, max - 1);
  return {
    type: 'number_after', difficulty: 1, dir: 'rtl',
    question: `איזה מספר בא אחרי ${n}?`,
    answer: n + 1,
    hint: `ספור: ${n}, ואז...`,
  };
}

function makeNumberBefore(max) {
  const n = randInt(1, max);
  return {
    type: 'number_before', difficulty: 1, dir: 'rtl',
    question: `איזה מספר בא לפני ${n}?`,
    answer: n - 1,
    hint: `המספר שקטן מ-${n} באחד`,
  };
}

function makeVisualAdd(max) {
  const item = pick(COUNT_ITEMS);
  const result = randInt(2, max);
  const a = randInt(1, result - 1);
  const b = result - a;
  return {
    type: 'visual_add', difficulty: 1, dir: 'ltr',
    question: `${a} + ${b} = ?`,
    displayShape: `${emojiRow(item.e, a)}  +  ${emojiRow(item.e, b)}`,
    answer: result,
    hint: `ספור את כל ה${item.name} ביחד`,
  };
}

function makeVisualSub(max) {
  const item = pick(COUNT_ITEMS);
  const a = randInt(2, max);
  const b = randInt(1, a - 1);
  return {
    type: 'visual_sub', difficulty: 1, dir: 'ltr',
    question: `${a} - ${b} = ?`,
    displayShape: emojiRow(item.e, a),
    answer: a - b,
    hint: `יש ${a} ${item.name}. כסה ${b} וספור כמה נשארו`,
  };
}

function makePattern() {
  const emojis = shuffle(['🔴', '🔵', '🟡', '🟢', '⭐', '❤️', '🔺', '🟪']).slice(0, 3);
  const kind = pick(['AB', 'AABB', 'ABC']);
  let unit;
  if (kind === 'AB') unit = [emojis[0], emojis[1]];
  else if (kind === 'AABB') unit = [emojis[0], emojis[0], emojis[1], emojis[1]];
  else unit = [emojis[0], emojis[1], emojis[2]];
  const seq = Array(unit.length > 3 ? 2 : 3).fill(unit).flat();
  const answer = seq[seq.length - 1];
  const display = [...seq.slice(0, -1), '❓'];
  const usedSet = [...new Set(unit)];
  const distractor = emojis.find(e => !usedSet.includes(e));
  const options = shuffle(distractor ? [...usedSet, distractor] : usedSet);
  return {
    type: 'pattern', difficulty: 1, dir: 'ltr',
    question: `מה בא במקום סימן השאלה?`,
    displayShape: display.join(' '),
    answer,
    options,
    hint: `יש כאן חוקיות שחוזרת על עצמה — אמור אותה בקול`,
  };
}

function makeBiggestNumber(max) {
  const nums = shuffle(Array.from({ length: max + 1 }, (_, i) => i)).slice(0, 3);
  return {
    type: 'biggest_number', difficulty: 1, dir: 'rtl',
    question: `איזה מספר הכי גדול?`,
    answer: Math.max(...nums),
    options: nums,
    hint: `איזה מספר בא אחרון כשסופרים?`,
  };
}

function makeSmallestNumber(max) {
  const nums = shuffle(Array.from({ length: max + 1 }, (_, i) => i)).slice(0, 3);
  return {
    type: 'smallest_number', difficulty: 1, dir: 'rtl',
    question: `איזה מספר הכי קטן?`,
    answer: Math.min(...nums),
    options: nums,
    hint: `איזה מספר בא ראשון כשסופרים?`,
  };
}

function makeGeoCount() {
  const shapes = [
    { e: '🔺', name: 'משולשים' },
    { e: '⬛', name: 'ריבועים' },
    { e: '⚫', name: 'עיגולים' },
  ];
  const s = pick(shapes);
  const n = randInt(3, 7);
  return {
    type: 'geo_count', difficulty: 1, dir: 'rtl',
    question: `כמה ${s.name} יש?`,
    displayShape: emojiRow(s.e, n),
    answer: n,
    hint: `הצבע על כל צורה וספור`,
  };
}

// ── 1st grade → 2nd grade (two-digit arithmetic, pre-multiplication) ────────
function makeRoundTensAdd() {
  const a = 10 * randInt(1, 8);
  const b = 10 * randInt(1, (100 - a) / 10);
  return {
    type: 'round_tens_add', difficulty: 2, dir: 'ltr',
    question: `${a} + ${b} = ?`,
    answer: a + b,
    hint: `${a / 10} עשרות ועוד ${b / 10} עשרות`,
  };
}

function makeRoundTensSub() {
  const a = 10 * randInt(2, 10);
  const b = 10 * randInt(1, a / 10 - 1);
  return {
    type: 'round_tens_sub', difficulty: 2, dir: 'ltr',
    question: `${a} - ${b} = ?`,
    answer: a - b,
    hint: `${a / 10} עשרות פחות ${b / 10} עשרות`,
  };
}

// Two-digit ± ones/tens WITHOUT regrouping (בלי המרה) – the grade-2 opener.
function makeTwoDigitAdd() {
  if (pick([true, false])) {
    const t = randInt(1, 9);
    const o = randInt(1, 8);
    const b = randInt(1, 9 - o);
    const a = t * 10 + o;
    return {
      type: 'two_digit_add', difficulty: 3, dir: 'ltr',
      question: `${a} + ${b} = ?`, answer: a + b,
      hint: `רק ספרת האחדות משתנה: ${o} + ${b}`,
    };
  }
  const a = randInt(11, 89);
  const b = 10 * randInt(1, Math.floor((99 - a) / 10));
  return {
    type: 'two_digit_add', difficulty: 3, dir: 'ltr',
    question: `${a} + ${b} = ?`, answer: a + b,
    hint: `רק ספרת העשרות משתנה: מוסיפים ${b / 10} עשרות`,
  };
}

function makeTwoDigitSub() {
  if (pick([true, false])) {
    const t = randInt(1, 9);
    const o = randInt(2, 9);
    const b = randInt(1, o);
    const a = t * 10 + o;
    return {
      type: 'two_digit_sub', difficulty: 3, dir: 'ltr',
      question: `${a} - ${b} = ?`, answer: a - b,
      hint: `רק ספרת האחדות משתנה: ${o} - ${b}`,
    };
  }
  const a = randInt(31, 99);
  const b = 10 * randInt(1, Math.floor(a / 10) - 1);
  return {
    type: 'two_digit_sub', difficulty: 3, dir: 'ltr',
    question: `${a} - ${b} = ?`, answer: a - b,
    hint: `רק ספרת העשרות משתנה: מורידים ${b / 10} עשרות`,
  };
}

function makeMissingAdd(max) {
  const c = randInt(3, max);
  const known = randInt(1, c - 1);
  const missing = c - known;
  if (pick([true, false])) {
    return {
      type: 'missing_number', difficulty: 2, dir: 'ltr',
      question: `? + ${known} = ${c}`, answer: missing,
      hint: `כמה צריך להוסיף ל-${known} כדי להגיע ל-${c}?`,
    };
  }
  return {
    type: 'missing_number', difficulty: 2, dir: 'ltr',
    question: `${known} + ? = ${c}`, answer: missing,
    hint: `כמה צריך להוסיף ל-${known} כדי להגיע ל-${c}?`,
  };
}

function makeMissingSub(max) {
  const a = randInt(3, max);
  const b = randInt(1, a - 1);
  const c = a - b;
  if (pick([true, false])) {
    return {
      type: 'missing_number', difficulty: 2, dir: 'ltr',
      question: `${a} - ? = ${c}`, answer: b,
      hint: `כמה צריך להוריד מ-${a} כדי להגיע ל-${c}?`,
    };
  }
  return {
    type: 'missing_number', difficulty: 2, dir: 'ltr',
    question: `? - ${b} = ${c}`, answer: a,
    hint: `איזה מספר, פחות ${b}, נותן ${c}?`,
  };
}

function makeEvenOdd(max) {
  const n = randInt(1, max);
  return {
    type: 'even_odd', difficulty: 2, dir: 'rtl',
    question: `המספר ${n} — זוגי או אי-זוגי?`,
    answer: n % 2 === 0 ? 'זוגי' : 'אי-זוגי',
    options: ['זוגי', 'אי-זוגי'],
    hint: `מספר זוגי אפשר לחלק לזוגות בלי שנשאר אחד לבד`,
  };
}

// Repeated addition – the doorway to multiplication in grade 2.
function makeRepeatedAdd() {
  const times = randInt(2, 4);
  const v = randInt(2, 5);
  return {
    type: 'repeated_add', difficulty: 3, dir: 'ltr',
    question: `${Array(times).fill(v).join(' + ')} = ?`,
    answer: times * v,
    hint: `${times} פעמים ${v} — לקראת לוח הכפל!`,
    dedupKey: `repeated_add|${times}x${v}`,
  };
}

const geoGan = () => GENERATORS[pick(['geo_identify', 'geo_sides', 'geo_corners'])]();
const geoGrade2 = () => GENERATORS[pick(['geo_identify', 'geo_sides', 'geo_corners', 'geo_count_sides_compare'])]();
const tensOnes = () => GENERATORS[pick(['tens_in_number', 'ones_in_number', 'build_tens_ones', 'expanded_form'])]();
const skipCount = () => GENERATORS[pick(['skip_count', 'skip_count_back'])]();

// Stage plans. Each entry receives the operation focus ('add'|'sub'|'mix')
// and returns an array of generator thunks (one per question in the session).
// gan_to_a sessions have 12 questions; a_to_b sessions have 20.
const PREP_PLANS = {
  gan_to_a: [
    // Stage 1 – מנייה, כמויות וצורות
    () => [
      () => makeCountObjects(6), () => makeCountObjects(6), () => makeCountObjects(6),
      makeCompareQuantities, makeCompareQuantities,
      makePattern, makePattern,
      () => GENERATORS.geo_identify(), () => GENERATORS.geo_identify(),
      () => makeBiggestNumber(6), () => makeSmallestNumber(6),
      makeGeoCount,
    ],
    // Stage 2 – מספרים עד 10
    (op) => [
      () => makeCountObjects(10), () => makeCountObjects(10),
      () => makeNumberAfter(10), () => makeNumberBefore(10),
      () => makeCompareLeveled(10), () => makeCompareLeveled(10),
      ...(op === 'sub'
        ? [() => makeVisualSub(5), () => makeVisualSub(5)]
        : op === 'add'
          ? [() => makeVisualAdd(5), () => makeVisualAdd(5)]
          : [() => makeVisualAdd(5), () => makeVisualSub(5)]),
      makePattern,
      () => GENERATORS.geo_sides(),
      () => GENERATORS.geo_identify(),
      () => makeBiggestNumber(10),
    ],
    // Stage 3 – חיבור וחיסור עם ציורים עד 10
    (op) => [
      ...(op === 'add'
        ? Array(6).fill(() => makeVisualAdd(10))
        : op === 'sub'
          ? Array(6).fill(() => makeVisualSub(10))
          : [() => makeVisualAdd(10), () => makeVisualAdd(10), () => makeVisualAdd(10),
             () => makeVisualSub(10), () => makeVisualSub(10), () => makeVisualSub(10)]),
      // "complete to 10" is addition – swap it out of subtraction-only sessions
      () => (op === 'sub' ? makeVisualSub(10) : makeComplete(10)),
      () => (pick([true, false]) ? makeNumberAfter(10) : makeNumberBefore(10)),
      () => makeCompareLeveled(10),
      () => makeSequenceLeveled(10),
      () => makeCountObjects(10),
      () => GENERATORS.geo_corners(),
    ],
    // Stage 4 – מוכנות לכיתה א׳ (ספרות בלבד עד 10)
    (op) => [
      ...(op === 'add'
        ? Array(6).fill(() => makeAddition(10))
        : op === 'sub'
          ? Array(6).fill(() => makeSubtraction(10))
          : [() => makeAddition(10), () => makeAddition(10), () => makeAddition(10),
             () => makeSubtraction(10), () => makeSubtraction(10), () => makeSubtraction(10)]),
      () => (op === 'sub' ? makeSubtraction(10) : makeComplete(10)),
      () => makeSequenceLeveled(20),
      () => makeCompareLeveled(20),
      () => (op === 'sub' ? makeWordSubLeveled(10) : makeWordAddLeveled(10)),
      () => makeNumberAfter(20),
      geoGan,
    ],
  ],
  a_to_b: [
    // Stage 1 – ביסוס כיתה א׳ (חיבור/חיסור עד 20, מבנה עשרוני)
    (op) => [
      ...(op === 'add'
        ? [GENERATORS.addition_20, GENERATORS.addition_20, GENERATORS.addition_20,
           GENERATORS.addition_20, GENERATORS.addition_20, GENERATORS.addition_20]
        : op === 'sub'
          ? [GENERATORS.subtraction_20, GENERATORS.subtraction_20, GENERATORS.subtraction_20,
             GENERATORS.subtraction_20, GENERATORS.subtraction_20, GENERATORS.subtraction_20]
          : [GENERATORS.addition_20, GENERATORS.addition_20, GENERATORS.addition_20,
             GENERATORS.subtraction_20, GENERATORS.subtraction_20, GENERATORS.subtraction_20]),
      ...(op === 'sub'
        ? [GENERATORS.subtraction_20, GENERATORS.subtraction_30]
        : [GENERATORS.complete_10, GENERATORS.complete_20]),
      tensOnes, tensOnes, tensOnes,
      () => makeCompareLeveled(100), () => makeCompareLeveled(100),
      skipCount, skipCount, () => makeSequenceLeveled(50),
      () => (op === 'sub' ? makeWordSubLeveled(20) : makeWordAddLeveled(20)),
      () => (op === 'add' ? makeWordAddLeveled(20) : makeWordSubLeveled(20)),
      geoGrade2, geoGrade2,
    ],
    // Stage 2 – עשרות שלמות ושכנים בתחום ה-100
    (op) => [
      ...(op === 'add'
        ? [makeRoundTensAdd, makeRoundTensAdd, makeRoundTensAdd, makeRoundTensAdd]
        : op === 'sub'
          ? [makeRoundTensSub, makeRoundTensSub, makeRoundTensSub, makeRoundTensSub]
          : [makeRoundTensAdd, makeRoundTensAdd, makeRoundTensSub, makeRoundTensSub]),
      ...(op === 'add'
        ? [GENERATORS.addition_20, GENERATORS.addition_20]
        : op === 'sub'
          ? [GENERATORS.subtraction_20, GENERATORS.subtraction_20]
          : [GENERATORS.addition_20, GENERATORS.subtraction_20]),
      () => (op === 'sub' ? makeMissingSub(20) : op === 'add' ? makeMissingAdd(20) : pick([makeMissingAdd, makeMissingSub])(20)),
      () => (op === 'add' ? makeMissingAdd(20) : op === 'sub' ? makeMissingSub(20) : pick([makeMissingAdd, makeMissingSub])(20)),
      () => makeNumberAfter(100), () => makeNumberBefore(100),
      tensOnes, tensOnes,
      skipCount, skipCount,
      () => makeCompareLeveled(100), () => makeCompareLeveled(100),
      () => (op === 'sub' ? makeWordSubLeveled(30) : makeWordAddLeveled(30)),
      () => (op === 'add' ? makeWordAddLeveled(30) : makeWordSubLeveled(30)),
      geoGrade2, geoGrade2,
    ],
    // Stage 3 – חיבור וחיסור דו-ספרתי ללא המרה
    (op) => [
      ...(op === 'add'
        ? [makeTwoDigitAdd, makeTwoDigitAdd, makeTwoDigitAdd, makeTwoDigitAdd, makeTwoDigitAdd, makeTwoDigitAdd]
        : op === 'sub'
          ? [makeTwoDigitSub, makeTwoDigitSub, makeTwoDigitSub, makeTwoDigitSub, makeTwoDigitSub, makeTwoDigitSub]
          : [makeTwoDigitAdd, makeTwoDigitAdd, makeTwoDigitAdd, makeTwoDigitSub, makeTwoDigitSub, makeTwoDigitSub]),
      () => (op === 'sub' ? makeMissingSub(30) : op === 'add' ? makeMissingAdd(30) : pick([makeMissingAdd, makeMissingSub])(30)),
      () => (op === 'add' ? makeMissingAdd(30) : op === 'sub' ? makeMissingSub(30) : pick([makeMissingAdd, makeMissingSub])(30)),
      () => makeEvenOdd(20), () => makeEvenOdd(20),
      tensOnes, tensOnes,
      skipCount, skipCount,
      () => makeCompareLeveled(100),
      () => (op === 'sub' ? makeWordSubLeveled(30) : makeWordAddLeveled(30)),
      () => (op === 'add' ? makeWordAddLeveled(30) : makeWordSubLeveled(30)),
      () => (op === 'sub' ? makeRoundTensSub() : op === 'add' ? makeRoundTensAdd() : pick([makeRoundTensAdd, makeRoundTensSub])()),
      geoGrade2, geoGrade2,
    ],
    // Stage 4 – לקראת כיתה ב׳ (חיבור חוזר, היכרות עם מאות)
    (op) => [
      ...(op === 'add'
        ? [makeTwoDigitAdd, makeTwoDigitAdd, makeTwoDigitAdd, makeTwoDigitAdd]
        : op === 'sub'
          ? [makeTwoDigitSub, makeTwoDigitSub, makeTwoDigitSub, makeTwoDigitSub]
          : [makeTwoDigitAdd, makeTwoDigitAdd, makeTwoDigitSub, makeTwoDigitSub]),
      makeRepeatedAdd, makeRepeatedAdd, makeRepeatedAdd,
      GENERATORS.hundreds_in_number, GENERATORS.build_hundreds, GENERATORS.skip_count_100,
      () => (op === 'sub' ? makeMissingSub(50) : op === 'add' ? makeMissingAdd(50) : pick([makeMissingAdd, makeMissingSub])(50)),
      () => (op === 'add' ? makeMissingAdd(50) : op === 'sub' ? makeMissingSub(50) : pick([makeMissingAdd, makeMissingSub])(50)),
      () => makeEvenOdd(50),
      () => (op === 'sub' ? makeWordSubLeveled(50) : makeWordAddLeveled(50)),
      () => (op === 'add' ? makeWordAddLeveled(50) : makeWordSubLeveled(50)),
      GENERATORS.expanded_form,
      () => makeCompareLeveled(100),
      () => makeSequenceLeveled(100),
      geoGrade2, geoGrade2,
    ],
  ],
};

/**
 * A prep-track session (מסלול הכנה): `track` is 'gan_to_a' or 'a_to_b',
 * `stage` is 1-based and climbs automatically as the child succeeds on
 * consecutive days. Falls back to the closest existing stage when out of
 * range so stale data can never crash a session.
 */
export function generatePrepMath(track, stage, reviewExercises = [], operation = 'mix') {
  const stages = PREP_PLANS[track] || PREP_PLANS.a_to_b;
  const idx = Math.min(Math.max(1, Number(stage) || 1), stages.length) - 1;
  const op = MATH_OPERATIONS.includes(operation) ? operation : 'mix';
  const plan = stages[idx](op);
  const reviewCount = Math.min(reviewExercises.length, 3);
  // Give up leading plan slots to make room for resurfaced review questions.
  for (let i = 0; i < reviewCount && plan.length; i++) plan.shift();
  return assembleSession(plan, reviewExercises, reviewCount);
}

/**
 * Public entry point. `level` (10..100) produces a focused
 * addition/subtraction session up to that ceiling; null/undefined keeps the
 * original mixed grade-1-2 curriculum. `operation` ('add' | 'sub' | 'mix')
 * lets the child pick whether to practise addition, subtraction, or both.
 */
export const MATH_OPERATIONS = ['mix', 'add', 'sub'];

export function generateMathExercises(weakness = {}, reviewExercises = [], level = null, operation = 'mix') {
  const op = MATH_OPERATIONS.includes(operation) ? operation : 'mix';
  if (level && MATH_LEVELS.includes(level)) {
    return generateLeveledMath(level, reviewExercises, op);
  }
  return generateMixedMath(weakness, reviewExercises, op);
}
