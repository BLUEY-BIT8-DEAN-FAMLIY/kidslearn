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

export function generateMathExercises(weakness = {}, reviewExercises = []) {
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
    const types = CATEGORIES[cat];
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
