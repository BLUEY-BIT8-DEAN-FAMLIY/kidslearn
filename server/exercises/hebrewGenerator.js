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

// Massive Hebrew word→emoji database. Every word here can be used in
// completion/identification exercises because the child has a visual cue
// for what the word means.
const WORD_EMOJI = {
  // א
  'ארנב':'🐰','אריה':'🦁','אבא':'👨','אמא':'👩','אוזן':'👂','אוטו':'🚗',
  'אופניים':'🚲','אש':'🔥','אננס':'🍍','אורז':'🍚','אווז':'🦢','אגס':'🍐',
  'אצבע':'☝️','אבוקדו':'🥑','אוטובוס':'🚌','אמבולנס':'🚑',
  // ב
  'בית':'🏠','בלון':'🎈','בננה':'🍌','בקבוק':'🍼','בצל':'🧅','ברווז':'🦆',
  'ברק':'⚡','בועה':'🫧','בייגלה':'🥨','ביצה':'🥚','ברבור':'🦢',
  'בריכה':'🏊',
  // ג
  'גמל':'🐪','גינה':'🌷','גשם':'🌧️','גזר':'🥕','גביע':'🏆','גלידה':'🍦',
  'גלגל':'🛞','גבינה':'🧀','גורילה':'🦍','גיטרה':'🎸','גרביים':'🧦',
  'גלוב':'🌍','גלשן':'🏄',
  // ד
  'דב':'🐻','דג':'🐟','דלת':'🚪','דבורה':'🐝','דובי':'🧸','דרקון':'🐉',
  'דובדבן':'🍒','דרך':'🛣️','דלעת':'🎃',
  // ה
  'הר':'⛰️','הלמה':'🦙','המבורגר':'🍔','הגה':'🛞',
  // ו
  'ורד':'🌹','וילון':'🪟','וופל':'🧇',
  // ז
  'זברה':'🦓','זית':'🫒','זמר':'🎤','זאב':'🐺','זיקית':'🦎','זנב':'🦊',
  'זיקוקים':'🎆',
  // ח
  'חתול':'🐱','חלב':'🥛','חמור':'🫏','חזיר':'🐷','חיוך':'😊','חמניה':'🌻',
  'חסה':'🥬','חמסה':'🪬','חוף':'🏖️','חתן':'🤵','חצילים':'🍆',
  // ט
  'טלה':'🐑','טיל':'🚀','טבעת':'💍','טרקטור':'🚜','טווס':'🦚',
  'טלוויזיה':'📺','טלפון':'☎️','טיגריס':'🐅','טוסט':'🍞',
  // י
  'יד':'✋','ים':'🌊','ילד':'🧒','ילדה':'👧','יונה':'🕊️','ירח':'🌙',
  'ירוק':'🟢','יהלום':'💎',
  // כ
  'כלב':'🐕','כובע':'🎩','כדור':'⚽','כביש':'🛣️','כסא':'🪑','כוס':'🥤',
  'כריך':'🥪','כנף':'🪽','כרוב':'🥬','כתום':'🍊',
  // ל
  'לב':'❤️','לחם':'🍞','לימון':'🍋','לוחם':'🥋','לוויתן':'🐋','לבנה':'🌝',
  'לוח':'📋',
  // מ
  'מלך':'👑','מגדל':'🗼','מכונית':'🚗','מטוס':'✈️','מטרייה':'☂️',
  'מטרה':'🎯','מזוודה':'🧳','מצלמה':'📷','מתנה':'🎁','מקלדת':'⌨️',
  'מנגו':'🥭','מגן':'🛡️','מספריים':'✂️','מטבע':'🪙','משולש':'🔺','מסכה':'🎭',
  // נ
  'נחש':'🐍','נר':'🕯️','נעל':'👟','נשר':'🦅','נסיכה':'👸','נמר':'🐆',
  'נסיך':'🤴','נמלה':'🐜',
  // ס
  'סוס':'🐴','ספר':'📖','סבתא':'👵','סבא':'👴','סוכריה':'🍬','סלסילה':'🧺',
  'סקייטבורד':'🛹','סייף':'🤺','סופגניה':'🍩','סלט':'🥗','סוכר':'🍯',
  // ע
  'עץ':'🌳','עוגה':'🎂','עכבר':'🐭','עין':'👁️','ענן':'☁️','עטלף':'🦇',
  'עכביש':'🕷️','עפיפון':'🪁','עפרון':'✏️','עציץ':'🪴','עוף':'🐔',
  'עוגייה':'🍪','עגבנייה':'🍅',
  // פ
  'פרח':'🌸','פיל':'🐘','פרפר':'🦋','פינגווין':'🐧','פיצה':'🍕',
  'פנים':'😀','פנקייק':'🥞','פלפל':'🌶️','פסל':'🗽','פנס':'🔦','פטרייה':'🍄',
  'פאי':'🥧',
  // צ
  'צב':'🐢','צבע':'🎨','צפרדע':'🐸','צמיג':'🛞','צלחת':'🍽️','צמר':'🧶',
  'צדפה':'🐚','צלילה':'🤿',
  // ק
  'קוף':'🐵','קשת':'🌈','קיר':'🧱','קסדה':'⛑️','קסם':'✨','קרח':'🧊',
  'קקטוס':'🌵','קופסה':'📦','קציצה':'🍡','קופים':'🐒','קולה':'🥤',
  'קקאו':'🍫',
  // ר
  'רכב':'🚙','רגל':'🦶','ראש':'😀','רובוט':'🤖','רוח':'🌬️','רחפן':'🛸',
  'רכבת':'🚂','רימון':'🍅','רופא':'👨‍⚕️',
  // ש
  'שמש':'☀️','שולחן':'🪑','שפן':'🐇','שלום':'👋','שעון':'🕐','שיניים':'🦷',
  'שמלה':'👗','שום':'🧄','שלג':'❄️','שירה':'🎵','שפתון':'💄',
  // ת
  'תפוח':'🍎','תרנגול':'🐓','תיק':'🎒','תות':'🍓','תינוק':'👶','תרד':'🥬',
  'תופים':'🥁','תפוז':'🍊','תמר':'🌴','תור':'🐂','תאומים':'👯',
};

function wordsStartingWith(letter) {
  return Object.keys(WORD_EMOJI).filter(w => w.startsWith(letter));
}

const HEBREW_LETTERS = [
  { letter: 'א', name: 'אלף', words: wordsStartingWith('א') },
  { letter: 'ב', name: 'בית', words: wordsStartingWith('ב') },
  { letter: 'ג', name: 'גימל', words: wordsStartingWith('ג') },
  { letter: 'ד', name: 'דלת', words: wordsStartingWith('ד') },
  { letter: 'ה', name: 'הא',  words: wordsStartingWith('ה') },
  { letter: 'ו', name: 'וו',  words: wordsStartingWith('ו') },
  { letter: 'ז', name: 'זין', words: wordsStartingWith('ז') },
  { letter: 'ח', name: 'חית', words: wordsStartingWith('ח') },
  { letter: 'ט', name: 'טית', words: wordsStartingWith('ט') },
  { letter: 'י', name: 'יוד', words: wordsStartingWith('י') },
  { letter: 'כ', name: 'כף',  words: wordsStartingWith('כ') },
  { letter: 'ל', name: 'למד', words: wordsStartingWith('ל') },
  { letter: 'מ', name: 'מם',  words: wordsStartingWith('מ') },
  { letter: 'נ', name: 'נון', words: wordsStartingWith('נ') },
  { letter: 'ס', name: 'סמך', words: wordsStartingWith('ס') },
  { letter: 'ע', name: 'עין', words: wordsStartingWith('ע') },
  { letter: 'פ', name: 'פא',  words: wordsStartingWith('פ') },
  { letter: 'צ', name: 'צדי', words: wordsStartingWith('צ') },
  { letter: 'ק', name: 'קוף', words: wordsStartingWith('ק') },
  { letter: 'ר', name: 'ריש', words: wordsStartingWith('ר') },
  { letter: 'ש', name: 'שין', words: wordsStartingWith('ש') },
  { letter: 'ת', name: 'תו',  words: wordsStartingWith('ת') },
].filter(l => l.words.length > 0);

const GENERATORS = {
  // Easy (difficulty 1)
  name_letter: () => {
    const letter = pick(HEBREW_LETTERS);
    const wrong = shuffle(HEBREW_LETTERS.filter(l => l.letter !== letter.letter)).slice(0, 3);
    return {
      type: 'name_letter', difficulty: 1, dir: 'rtl',
      question: `מה שמה של האות הזו?`,
      displayLetter: letter.letter,
      answer: letter.name,
      options: shuffle([letter, ...wrong]).map(l => l.name),
      hint: `האות ${letter.letter} נקראת...`,
    };
  },
  find_letter: () => {
    const letter = pick(HEBREW_LETTERS);
    const distractors = shuffle(HEBREW_LETTERS.filter(l => l.letter !== letter.letter)).slice(0, 5);
    return {
      type: 'find_letter', difficulty: 1, dir: 'rtl',
      question: `מצא את האות ${letter.letter} בין האותיות:`,
      displayLetters: shuffle([letter, ...distractors]).map(l => l.letter),
      answer: letter.letter,
      hint: `חפש את ${letter.letter}`,
    };
  },
  odd_one_out: () => {
    const letter = pick(HEBREW_LETTERS);
    const count = randInt(4, 5);
    const odd = pick(HEBREW_LETTERS.filter(l => l.letter !== letter.letter)).letter;
    return {
      type: 'odd_one_out', difficulty: 1, dir: 'rtl',
      question: `מה שונה? מצא את האות שלא כמו האחרות:`,
      displayLetters: shuffle([...Array(count).fill(letter.letter), odd]),
      answer: odd,
      hint: `אחת האותיות שונה מהשאר`,
    };
  },

  // Medium (difficulty 2)
  word_starts_with: () => {
    const letter = pick(HEBREW_LETTERS);
    const wordsWithImg = letter.words.filter(w => WORD_EMOJI[w]);
    const correct = pick(wordsWithImg.length ? wordsWithImg : letter.words);
    const wrong = shuffle(
      HEBREW_LETTERS.filter(l => l.letter !== letter.letter)
        .flatMap(l => l.words)
        .filter(w => !w.startsWith(letter.letter) && WORD_EMOJI[w])
    ).slice(0, 3);
    const options = shuffle([correct, ...wrong]);
    const optionImages = {};
    options.forEach(w => { optionImages[w] = WORD_EMOJI[w] || ''; });
    return {
      type: 'word_starts_with', difficulty: 2, dir: 'rtl',
      question: `איזו מילה מתחילה באות ${letter.letter}?`,
      displayLetter: letter.letter,
      answer: correct,
      options,
      optionImages,
      hint: `חפש מילה שמתחילה ב-"${letter.letter}"`,
    };
  },
  match_letter: () => {
    const letter = pick(HEBREW_LETTERS);
    const wordsWithImg = letter.words.filter(w => WORD_EMOJI[w]);
    const word = pick(wordsWithImg.length ? wordsWithImg : letter.words);
    const wrong = shuffle(HEBREW_LETTERS.filter(l => l.letter !== letter.letter)).slice(0, 3);
    return {
      type: 'match_letter', difficulty: 2, dir: 'rtl',
      question: `באיזו אות מתחילה המילה "${word}"?`,
      displayWord: word,
      displayImage: WORD_EMOJI[word],
      answer: letter.letter,
      options: shuffle([letter, ...wrong]).map(l => l.letter),
      hint: `"${word}" מתחילה ב...`,
    };
  },
  first_letter_of_word: () => {
    const letter = pick(HEBREW_LETTERS);
    const wordsWithImg = letter.words.filter(w => WORD_EMOJI[w]);
    const word = pick(wordsWithImg.length ? wordsWithImg : letter.words);
    return {
      type: 'first_letter_of_word', difficulty: 2, dir: 'rtl',
      question: `מה האות הראשונה במילה "${word}"?`,
      displayWord: word,
      displayImage: WORD_EMOJI[word],
      answer: letter.letter,
      hint: `"${word}" – האות הראשונה היא...`,
    };
  },
  count_letter: () => {
    const letter = pick(HEBREW_LETTERS);
    const count = randInt(2, 5);
    const filler = shuffle(HEBREW_LETTERS.filter(l => l.letter !== letter.letter).map(l => l.letter)).slice(0, 8 - count);
    return {
      type: 'count_letter', difficulty: 2, dir: 'rtl',
      question: `כמה פעמים מופיעה האות ${letter.letter}?`,
      displayLetters: shuffle([...Array(count).fill(letter.letter), ...filler]),
      targetLetter: letter.letter,
      answer: count,
      hint: `ספור רק את ה-${letter.letter}`,
    };
  },

  // Hard (difficulty 3) – typing with virtual keyboard
  type_letter: () => {
    const letter = pick(HEBREW_LETTERS);
    return {
      type: 'type_letter', difficulty: 3, dir: 'rtl',
      question: `כתוב את האות:\n${letter.name}`,
      letterName: letter.name,
      answer: letter.letter,
      hint: `האות ${letter.name} נראית כך: ${letter.letter}`,
    };
  },
  fill_letter: () => {
    const candidates = HEBREW_LETTERS.flatMap(l => l.words).filter(w => WORD_EMOJI[w]);
    const word = pick(candidates);
    const blankIdx = Math.random() < 0.7 ? 0 : randInt(1, word.length - 1);
    const missingLetter = word[blankIdx];
    const display = word.split('').map((c, i) => i === blankIdx ? '_' : c).join('');
    return {
      type: 'fill_letter', difficulty: 3, dir: 'rtl',
      question: `השלם את האות החסרה במילה:\n${display}`,
      audioText: `איזו אות צריך להוסיף למילה ${word}?`,
      word,
      blankIdx,
      displayImage: WORD_EMOJI[word],
      answer: missingLetter,
      hint: `המילה היא "${word}". איזו אות חסרה במקום ה-_?`,
    };
  },
  // Reading readiness – match a written word to its picture.
  read_word: () => {
    const candidates = Object.keys(WORD_EMOJI).filter(w => w.length <= 5);
    const word = pick(candidates);
    const wrong = shuffle(candidates.filter(w => w !== word)).slice(0, 3);
    return {
      type: 'read_word', difficulty: 2, dir: 'rtl',
      question: `איזו מילה מתאימה לתמונה?`,
      audioText: `איזו מילה מתאימה לתמונה?`,
      displayImage: WORD_EMOJI[word],
      answer: word,
      options: shuffle([word, ...wrong]),
      hint: `המילה מתחילה באות ${word[0]}`,
    };
  },
  // Phonological awareness – closing sound (includes final-letter forms).
  last_letter: () => {
    const candidates = Object.keys(WORD_EMOJI).filter(w => w.length >= 3);
    const word = pick(candidates);
    const last = word[word.length - 1];
    const wrongPool = 'אבגדהוזחטיכלמנסעפצקרשתךםןףץ'.split('').filter(l => l !== last);
    const wrong = shuffle(wrongPool).slice(0, 3);
    return {
      type: 'last_letter', difficulty: 2, dir: 'rtl',
      question: `מה האות האחרונה במילה "${word}"?`,
      audioText: `מה האות האחרונה במילה ${word}?`,
      displayWord: word,
      displayImage: WORD_EMOJI[word],
      answer: last,
      options: shuffle([last, ...wrong]),
      hint: `אמור את המילה "${word}" לאט והקשב לצליל האחרון`,
    };
  },
  fill_letter_choice: () => {
    const candidates = HEBREW_LETTERS.flatMap(l => l.words).filter(w => WORD_EMOJI[w]);
    const word = pick(candidates);
    const blankIdx = Math.random() < 0.7 ? 0 : randInt(1, word.length - 1);
    const missingLetter = word[blankIdx];
    const display = word.split('').map((c, i) => i === blankIdx ? '_' : c).join('');
    const wrong = shuffle(HEBREW_LETTERS.filter(l => l.letter !== missingLetter)).slice(0, 3).map(l => l.letter);
    return {
      type: 'fill_letter_choice', difficulty: 2, dir: 'rtl',
      question: `איזו אות חסרה במילה?\n${display}`,
      audioText: `איזו אות צריך להוסיף למילה ${word}?`,
      word,
      displayImage: WORD_EMOJI[word],
      answer: missingLetter,
      options: shuffle([missingLetter, ...wrong]),
      hint: `המילה צריכה להיות "${word}"`,
    };
  },
};

const TYPES_BY_DIFFICULTY = {
  1: ['name_letter', 'find_letter', 'odd_one_out'],
  2: ['word_starts_with', 'match_letter', 'first_letter_of_word', 'count_letter', 'fill_letter_choice'],
  3: ['type_letter', 'fill_letter'],
};

const ALL_TYPES = [...Object.values(TYPES_BY_DIFFICULTY).flat(), 'read_word', 'last_letter'];

// ── Prep-track stages (מסלולי הכנה) ─────────────────────────────────────────
// Aligned with the MoE literacy foundations (תשתית לקראת קריאה וכתיבה):
// letter recognition → opening sound → letters inside words → first reading.
// Each stage defines its difficulty slots and which types each difficulty
// may draw from. This is a global 4-stage ladder: the parent picks the
// starting stage per child (hebrewLevel) and the adaptive mechanism climbs.
const PREP_STAGES = {
  // Stage 1 – הכרת האותיות
  1: {
    slots: [...Array(9).fill(1), ...Array(6).fill(2)],
    pools: {
      1: ['name_letter', 'find_letter', 'odd_one_out'],
      2: ['word_starts_with', 'match_letter'],
    },
  },
  // Stage 2 – צליל פותח
  2: {
    slots: [...Array(6).fill(1), ...Array(7).fill(2), ...Array(2).fill(3)],
    pools: {
      1: ['name_letter', 'find_letter', 'odd_one_out'],
      2: ['word_starts_with', 'match_letter', 'first_letter_of_word', 'count_letter'],
      3: ['type_letter'],
    },
  },
  // Stage 3 – אותיות בתוך מילים / קריאת מילים
  3: {
    slots: [...Array(4).fill(1), ...Array(7).fill(2), ...Array(4).fill(3)],
    pools: {
      1: ['name_letter', 'find_letter', 'odd_one_out'],
      2: ['word_starts_with', 'match_letter', 'first_letter_of_word', 'count_letter', 'fill_letter_choice', 'read_word'],
      3: ['type_letter', 'fill_letter'],
    },
  },
  // Stage 4 – קריאה ראשונה / אוצר מילים וכתיבה
  4: {
    slots: [...Array(2).fill(1), ...Array(7).fill(2), ...Array(6).fill(3)],
    pools: {
      1: ['odd_one_out', 'find_letter'],
      2: ['read_word', 'last_letter', 'fill_letter_choice', 'first_letter_of_word', 'count_letter', 'word_starts_with'],
      3: ['type_letter', 'fill_letter'],
    },
  },
};

function getExerciseSlots() {
  const today = new Date().toISOString().slice(0, 10);
  if (today >= '2026-07-01') {
    // 15 exercises starting July 1, 2026
    return [...Array(6).fill(1), ...Array(7).fill(2), ...Array(2).fill(3)];
  }
  // 11 exercises before then
  return [...Array(4).fill(1), ...Array(5).fill(2), ...Array(2).fill(3)];
}

/**
 * `stage` (1-4, optional): the child's Hebrew ladder stage. Accepts either a
 * plain number or the legacy { stage } object; falsy keeps the legacy mix.
 * `track`: the same stage is HARDER for an a_to_b child (rising 2nd grader)
 * than for a gan_to_a child — easy recognition slots are upgraded to harder
 * exercise families, since an older child works at a higher baseline.
 */
export function generateHebrewExercises(weakness = {}, reviewExercises = [], stage = null, track = null) {
  let slots = getExerciseSlots();
  let pools = TYPES_BY_DIFFICULTY;
  const s = typeof stage === 'object' && stage !== null ? stage.stage : stage;
  if (s) {
    const stagePlan = PREP_STAGES[Math.min(Math.max(1, Number(s)), 4)];
    slots = [...stagePlan.slots];
    pools = stagePlan.pools;
    if (track === 'a_to_b') {
      // Same stage, older child: every easy (difficulty-1) slot becomes a
      // medium slot when the stage has medium content to offer.
      slots = slots.map(d => (d === 1 && pools[2]?.length ? 2 : d));
    }
  }

  const reviewCount = Math.min(reviewExercises.length, 3);
  const reviewSlot = reviewExercises.slice(0, reviewCount);

  const weakTypes = Object.entries(weakness)
    .filter(([t, rate]) => rate > 0.3 && ALL_TYPES.includes(t))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([t]) => t);

  const exercises = [];

  for (const r of reviewSlot) {
    exercises.push({ ...r, isReview: true });
  }

  // Avoid duplicate questions + cap per-type so the session feels varied
  const seen = new Set(exercises.map(e => `${e.type}|${e.question}`));
  const typeCount = {};
  for (const e of exercises) typeCount[e.type] = (typeCount[e.type] || 0) + 1;
  const MAX_PER_TYPE = 2;

  function pickAllowedType(difficulty) {
    const pool = pools[difficulty].filter(t => (typeCount[t] || 0) < MAX_PER_TYPE);
    return pool.length ? pick(pool) : pick(pools[difficulty]);
  }

  const remainingSlots = slots.slice(reviewCount);
  let weakIdx = 0;
  for (const difficulty of remainingSlots) {
    let type;
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

  return shuffle(exercises).map((ex, i) => ({ ...ex, id: i + 1 }));
}
