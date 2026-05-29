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

const WORD_PROBLEMS_ADD = [
  (a, b) => `לדני ${a} בלונים, קיבל עוד ${b}. כמה בלונים יש לו עכשיו?`,
  (a, b) => `בכיתה יש ${a} ילדים, הגיעו עוד ${b}. כמה ילדים יש עכשיו?`,
  (a, b) => `לשרה ${a} ספרים, קנתה עוד ${b}. כמה ספרים יש לה?`,
  (a, b) => `בסל יש ${a} תפוחים, הוסיפו עוד ${b}. כמה תפוחים יש בסל?`,
  (a, b) => `טום אסף ${a} קונכיות, חברו הוסיף ${b}. כמה קונכיות יש ביחד?`,
  (a, b) => `לדין ${a} מכוניות צעצוע, אבא קנה לו עוד ${b}. כמה מכוניות יש לו?`,
];

const WORD_PROBLEMS_SUB = [
  (a, b) => `לרותי ${a} סוכריות, נתנה ${b} לאחיה. כמה סוכריות נשארו?`,
  (a, b) => `היו ${a} ציפורים על הגג, ${b} עפו. כמה נשארו?`,
  (a, b) => `לאמא ${a} ביצים, השתמשה ב-${b}. כמה נשארו?`,
  (a, b) => `בחנות היו ${a} עוגיות, נמכרו ${b}. כמה נשארו?`,
  (a, b) => `יוסי קנה ${a} מדבקות, נתן ${b} לחברים. כמה נשאר לו?`,
  (a, b) => `לליה ${a} פרחים, נתנה ${b} לאמא. כמה נשארו לה?`,
];

// difficulty: 1=easy, 2=medium, 3=hard
const GENERATORS = {
  // Easy
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

const TYPES_BY_DIFFICULTY = {
  1: ['addition_10', 'subtraction_10', 'sequence', 'compare', 'geo_identify'],
  3: [
    'addition_20', 'subtraction_20',
    'addition_30', 'subtraction_30',
    'complete_10', 'complete_20',
    'geo_sides', 'geo_corners', 'geo_count_sides_compare',
    'word_add', 'word_sub',
  ],
};

const ALL_TYPES = Object.values(TYPES_BY_DIFFICULTY).flat();

function getExerciseSlots() {
  // 20 exercises – all hard (difficulty 3)
  return Array(20).fill(3);
}

export function generateMathExercises(weakness = {}, reviewExercises = []) {
  const slots = getExerciseSlots();

  // Reserve up to 3 slots for review (replace medium difficulty ones)
  const reviewCount = Math.min(reviewExercises.length, 3);
  const reviewSlot = reviewExercises.slice(0, reviewCount);

  // Identify weakest types (boost frequency)
  const weakTypes = Object.entries(weakness)
    .filter(([t, rate]) => rate > 0.3 && ALL_TYPES.includes(t))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([t]) => t);

  const exercises = [];

  // Add review exercises first (mark them as review)
  for (const r of reviewSlot) {
    exercises.push({ ...r, isReview: true });
  }

  // Track question signatures + per-type counts so we don't get too many
  // of the same type in one session (feels repetitive to the kid).
  const seen = new Set(exercises.map(e => `${e.type}|${e.question}`));
  const typeCount = {};
  for (const e of exercises) typeCount[e.type] = (typeCount[e.type] || 0) + 1;
  const MAX_PER_TYPE = 2;

  function pickAllowedType(difficulty) {
    const pool = TYPES_BY_DIFFICULTY[difficulty].filter(t => (typeCount[t] || 0) < MAX_PER_TYPE);
    // If all types reached the limit (unlikely), allow any
    return pool.length ? pick(pool) : pick(TYPES_BY_DIFFICULTY[difficulty]);
  }

  // Fill remaining slots
  const remainingSlots = slots.slice(reviewCount);
  let weakIdx = 0;
  for (const difficulty of remainingSlots) {
    let type;
    // Every 4th slot, prefer a weak type (if available and not maxed out)
    if (
      weakTypes.length &&
      exercises.length % 4 === 0 &&
      weakIdx < weakTypes.length &&
      (typeCount[weakTypes[weakIdx]] || 0) < MAX_PER_TYPE
    ) {
      type = weakTypes[weakIdx++ % weakTypes.length];
    } else {
      type = pickAllowedType(difficulty);
    }

    // Generate, retry on duplicate question (up to 20 tries)
    let ex = GENERATORS[type]();
    let key = `${ex.type}|${ex.question}`;
    let attempts = 0;
    while (seen.has(key) && attempts < 20) {
      if (attempts > 5) type = pickAllowedType(difficulty);
      ex = GENERATORS[type]();
      key = `${ex.type}|${ex.question}`;
      attempts++;
    }
    seen.add(key);
    typeCount[ex.type] = (typeCount[ex.type] || 0) + 1;
    exercises.push(ex);
  }

  // Shuffle (keep difficulty progression mostly intact, just light shuffle)
  // Actually shuffle entirely for variety
  const shuffled = shuffle(exercises);
  return shuffled.map((ex, i) => ({ ...ex, id: i + 1 }));
}
