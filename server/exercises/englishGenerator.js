// English exercises (Foundation Level – תכנית הלימודים באנגלית של משרד החינוך).
// Four stages, climbing with the same adaptive mechanism as the other subjects:
//   1. אותיות ראשונות   – the alphabet, letter names and first words
//   2. מילים ראשונות    – core vocabulary with pictures + listening
//   3. קוראים וכותבים    – reading, spelling and simple translation
//   4. מרחיבים אוצר מילים – vocabulary expansion for kids who already read/write
// Every exercise carries English audio (audioText + audioLang:'en') so the
// child hears real pronunciation and repeats it — that's the speaking practice.

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

// [english, hebrew, emoji, level]. Levels follow the MoE Foundation bands:
// 1 = first words, 2 = core vocabulary, 3 = readers, 4 = vocabulary expansion.
const WORDS = [
  // Level 1 – first words (one clear picture per letter where possible)
  ['apple', 'תפוח', '🍎', 1], ['ball', 'כדור', '⚽', 1], ['cat', 'חתול', '🐱', 1],
  ['dog', 'כלב', '🐶', 1], ['egg', 'ביצה', '🥚', 1], ['fish', 'דג', '🐟', 1],
  ['hat', 'כובע', '🎩', 1], ['ice', 'קרח', '🧊', 1], ['king', 'מלך', '🤴', 1],
  ['lion', 'אריה', '🦁', 1], ['moon', 'ירח', '🌙', 1], ['nose', 'אף', '👃', 1],
  ['orange', 'תפוז', '🍊', 1], ['pig', 'חזיר', '🐷', 1], ['queen', 'מלכה', '👸', 1],
  ['rabbit', 'ארנב', '🐰', 1], ['sun', 'שמש', '☀️', 1], ['tree', 'עץ', '🌳', 1],
  ['umbrella', 'מטרייה', '☂️', 1], ['van', 'טנדר', '🚐', 1], ['water', 'מים', '💧', 1],
  ['box', 'קופסה', '📦', 1], ['yellow', 'צהוב', '🟡', 1], ['zebra', 'זברה', '🦓', 1],
  ['bird', 'ציפור', '🐦', 1], ['car', 'מכונית', '🚗', 1], ['duck', 'ברווז', '🦆', 1],

  // Level 2 – core vocabulary (animals, food, family, colors, home)
  ['mother', 'אמא', '👩', 2], ['father', 'אבא', '👨', 2], ['baby', 'תינוק', '👶', 2],
  ['boy', 'ילד', '🧒', 2], ['girl', 'ילדה', '👧', 2], ['house', 'בית', '🏠', 2],
  ['book', 'ספר', '📖', 2], ['milk', 'חלב', '🥛', 2], ['bread', 'לחם', '🍞', 2],
  ['cake', 'עוגה', '🎂', 2], ['banana', 'בננה', '🍌', 2], ['cheese', 'גבינה', '🧀', 2],
  ['cow', 'פרה', '🐮', 2], ['horse', 'סוס', '🐴', 2], ['bear', 'דוב', '🐻', 2],
  ['monkey', 'קוף', '🐵', 2], ['mouse', 'עכבר', '🐭', 2], ['bus', 'אוטובוס', '🚌', 2],
  ['red', 'אדום', '🔴', 2], ['blue', 'כחול', '🔵', 2], ['green', 'ירוק', '🟢', 2],
  ['black', 'שחור', '⚫', 2], ['white', 'לבן', '⚪', 2], ['flower', 'פרח', '🌸', 2],
  ['star', 'כוכב', '⭐', 2], ['heart', 'לב', '❤️', 2], ['door', 'דלת', '🚪', 2],
  ['bed', 'מיטה', '🛏️', 2], ['chair', 'כיסא', '🪑', 2], ['hand', 'יד', '✋', 2],
  ['eye', 'עין', '👁️', 2], ['ear', 'אוזן', '👂', 2], ['mouth', 'פה', '👄', 2],
  ['rain', 'גשם', '🌧️', 2], ['snow', 'שלג', '❄️', 2], ['candy', 'סוכריה', '🍬', 2],

  // Level 3 – readers (school, body, clothes, transport, nature)
  ['pencil', 'עיפרון', '✏️', 3], ['school', 'בית ספר', '🏫', 3], ['teacher', 'מורה', '🧑‍🏫', 3],
  ['table', 'שולחן', '🪵', 3], ['window', 'חלון', '🪟', 3], ['clock', 'שעון', '🕐', 3],
  ['phone', 'טלפון', '📱', 3], ['shoe', 'נעל', '👟', 3], ['shirt', 'חולצה', '👕', 3],
  ['dress', 'שמלה', '👗', 3], ['train', 'רכבת', '🚂', 3], ['plane', 'מטוס', '✈️', 3],
  ['boat', 'סירה', '⛵', 3], ['bicycle', 'אופניים', '🚲', 3], ['cloud', 'ענן', '☁️', 3],
  ['fire', 'אש', '🔥', 3], ['leaf', 'עלה', '🍃', 3], ['grapes', 'ענבים', '🍇', 3],
  ['pizza', 'פיצה', '🍕', 3], ['juice', 'מיץ', '🧃', 3], ['soup', 'מרק', '🍲', 3],
  ['sheep', 'כבשה', '🐑', 3], ['chicken', 'תרנגולת', '🐔', 3], ['snake', 'נחש', '🐍', 3],
  ['frog', 'צפרדע', '🐸', 3], ['turtle', 'צב', '🐢', 3], ['bee', 'דבורה', '🐝', 3],
  ['doctor', 'רופא', '🧑‍⚕️', 3], ['police', 'שוטר', '👮', 3], ['ring', 'טבעת', '💍', 3],
  ['key', 'מפתח', '🔑', 3], ['bag', 'תיק', '🎒', 3], ['gift', 'מתנה', '🎁', 3],

  // Level 4 – vocabulary expansion (richer nouns; for kids who already read)
  ['elephant', 'פיל', '🐘', 4], ['giraffe', "ג'ירפה", '🦒', 4], ['penguin', 'פינגווין', '🐧', 4],
  ['butterfly', 'פרפר', '🦋', 4], ['spider', 'עכביש', '🕷️', 4], ['dolphin', 'דולפין', '🐬', 4],
  ['whale', 'לוויתן', '🐋', 4], ['shark', 'כריש', '🦈', 4], ['octopus', 'תמנון', '🐙', 4],
  ['rainbow', 'קשת בענן', '🌈', 4], ['mountain', 'הר', '⛰️', 4], ['island', 'אי', '🏝️', 4],
  ['bridge', 'גשר', '🌉', 4], ['castle', 'טירה', '🏰', 4], ['rocket', 'טיל', '🚀', 4],
  ['robot', 'רובוט', '🤖', 4], ['guitar', 'גיטרה', '🎸', 4], ['drum', 'תוף', '🥁', 4],
  ['crown', 'כתר', '👑', 4], ['dragon', 'דרקון', '🐉', 4], ['ghost', 'רוח רפאים', '👻', 4],
  ['camera', 'מצלמה', '📷', 4], ['scissors', 'מספריים', '✂️', 4], ['ladder', 'סולם', '🪜', 4],
  ['sandwich', 'כריך', '🥪', 4], ['chocolate', 'שוקולד', '🍫', 4], ['strawberry', 'תות', '🍓', 4],
  ['watermelon', 'אבטיח', '🍉', 4], ['pineapple', 'אננס', '🍍', 4], ['mushroom', 'פטרייה', '🍄', 4],
  ['glasses', 'משקפיים', '👓', 4], ['lighthouse', 'מגדלור', '🗼', 4], ['helicopter', 'מסוק', '🚁', 4],
  ['ambulance', 'אמבולנס', '🚑', 4], ['firefighter', 'כבאי', '🧑‍🚒', 4], ['astronaut', 'אסטרונאוט', '🧑‍🚀', 4],
  ['kangaroo', 'קנגורו', '🦘', 4], ['crocodile', 'תנין', '🐊', 4], ['peacock', 'טווס', '🦚', 4],
  ['squirrel', 'סנאי', '🐿️', 4], ['hedgehog', 'קיפוד', '🦔', 4], ['unicorn', 'חד-קרן', '🦄', 4],
].map(([en, he, emoji, level]) => ({ en, he, emoji, level }));

// English letter names transliterated to Hebrew, so a beginner who can't read
// English yet can still answer "what is this letter called?".
const LETTERS = [
  { l: 'A', name: 'אֵיי' }, { l: 'B', name: 'בִּי' }, { l: 'C', name: 'סִי' },
  { l: 'D', name: 'דִי' }, { l: 'E', name: 'אִי' }, { l: 'F', name: 'אֶף' },
  { l: 'G', name: "גִ'י" }, { l: 'H', name: "אֵייץ'" }, { l: 'I', name: 'אַיי' },
  { l: 'J', name: "גֵ'יי" }, { l: 'K', name: 'קֵיי' }, { l: 'L', name: 'אֶל' },
  { l: 'M', name: 'אֶם' }, { l: 'N', name: 'אֶן' }, { l: 'O', name: 'אוֹ' },
  { l: 'P', name: 'פִּי' }, { l: 'Q', name: 'קְיוּ' }, { l: 'R', name: 'אַר' },
  { l: 'S', name: 'אֶס' }, { l: 'T', name: 'טִי' }, { l: 'U', name: 'יוּ' },
  { l: 'V', name: 'וִי' }, { l: 'W', name: 'דַאבֶּל יוּ' }, { l: 'X', name: 'אֶקְס' },
  { l: 'Y', name: 'וַואי' }, { l: 'Z', name: 'זִי' },
];

// Fast lookup from an English word to its {en, he, emoji, level} record.
const WORD_BY_EN = Object.fromEntries(WORDS.map(w => [w.en, w]));

// Semantic groups (all words exist in WORDS above) for "odd one out".
const CATEGORIES_EN = {
  animals: ['cat', 'dog', 'lion', 'pig', 'cow', 'horse', 'bear', 'monkey', 'fish', 'bird', 'duck', 'rabbit', 'sheep', 'snake', 'frog', 'bee', 'elephant', 'penguin'],
  food: ['apple', 'banana', 'bread', 'cake', 'cheese', 'milk', 'pizza', 'egg', 'orange', 'candy', 'soup', 'grapes'],
  transport: ['car', 'bus', 'train', 'plane', 'boat', 'bicycle', 'van', 'rocket'],
  colors: ['red', 'blue', 'green', 'black', 'white', 'yellow'],
  body: ['nose', 'eye', 'ear', 'mouth', 'hand'],
};

// [english, hebrew] opposite pairs — everyday antonyms for young learners.
const OPPOSITES = [
  ['big', 'small', 'גדול', 'קטן'], ['hot', 'cold', 'חם', 'קר'],
  ['up', 'down', 'למעלה', 'למטה'], ['day', 'night', 'יום', 'לילה'],
  ['happy', 'sad', 'שמח', 'עצוב'], ['fast', 'slow', 'מהר', 'לאט'],
  ['open', 'closed', 'פתוח', 'סגור'], ['old', 'new', 'ישן', 'חדש'],
  ['wet', 'dry', 'רטוב', 'יבש'], ['full', 'empty', 'מלא', 'ריק'],
  ['high', 'low', 'גבוה', 'נמוך'], ['long', 'short', 'ארוך', 'קצר'],
  ['good', 'bad', 'טוב', 'רע'], ['clean', 'dirty', 'נקי', 'מלוכלך'],
  ['yes', 'no', 'כן', 'לא'], ['in', 'out', 'בפנים', 'בחוץ'],
  ['left', 'right', 'שמאל', 'ימין'], ['light', 'dark', 'בהיר', 'כהה'],
];

// [digit, english, hebrew] number names.
const NUMBERS = [
  [1, 'one', 'אחת'], [2, 'two', 'שתיים'], [3, 'three', 'שלוש'], [4, 'four', 'ארבע'],
  [5, 'five', 'חמש'], [6, 'six', 'שש'], [7, 'seven', 'שבע'], [8, 'eight', 'שמונה'],
  [9, 'nine', 'תשע'], [10, 'ten', 'עשר'], [11, 'eleven', 'אחת עשרה'], [12, 'twelve', 'שתים עשרה'],
];

// [english, hebrew, emoji] action verbs.
const VERBS = [
  ['run', 'לרוץ', '🏃'], ['jump', 'לקפוץ', '🤸'], ['eat', 'לאכול', '🍽️'], ['sleep', 'לישון', '😴'],
  ['sit', 'לשבת', '🪑'], ['walk', 'ללכת', '🚶'], ['read', 'לקרוא', '📖'], ['play', 'לשחק', '🧸'],
  ['swim', 'לשחות', '🏊'], ['sing', 'לשיר', '🎤'], ['dance', 'לרקוד', '💃'], ['drink', 'לשתות', '🥤'],
  ['write', 'לכתוב', '✍️'], ['cry', 'לבכות', '😢'], ['laugh', 'לצחוק', '😄'], ['fly', 'לעוף', '🕊️'],
];

// [english, hebrew] everyday phrases & greetings.
const PHRASES = [
  ['hello', 'שלום (בפגישה)'], ['goodbye', 'להתראות'], ['thank you', 'תודה'], ['please', 'בבקשה'],
  ['sorry', 'סליחה'], ['good morning', 'בוקר טוב'], ['good night', 'לילה טוב'], ['yes', 'כן'],
  ['no', 'לא'], ['how are you?', 'מה שלומך?'], ['I love you', 'אני אוהב אותך'], ['very good', 'טוב מאוד'],
];

// [colored square, english, hebrew] for the colour question.
const COLORS_EN = [
  ['🟥', 'red', 'אדום'], ['🟦', 'blue', 'כחול'], ['🟩', 'green', 'ירוק'], ['🟨', 'yellow', 'צהוב'],
  ['⬛', 'black', 'שחור'], ['⬜', 'white', 'לבן'], ['🟧', 'orange', 'כתום'], ['🟪', 'purple', 'סגול'],
  ['🟫', 'brown', 'חום'], ['🩷', 'pink', 'ורוד'],
];

// Sentence riddles — read the clue, choose the matching word (real reading).
const SENTENCES = [
  { s: 'A ___ says "meow".', a: 'cat', he: 'אומר מיאו' },
  { s: 'A ___ says "woof".', a: 'dog', he: 'אומר האו' },
  { s: 'The ___ shines at night.', a: 'moon', he: 'מאיר בלילה' },
  { s: 'We read a ___.', a: 'book', he: 'קוראים' },
  { s: 'A ___ can fly.', a: 'bird', he: 'יכולה לעוף' },
  { s: 'We drink ___.', a: 'water', he: 'שותים' },
  { s: 'The ___ is hot.', a: 'sun', he: 'חם מאוד' },
  { s: 'A ___ lives in the sea.', a: 'fish', he: 'חי בים' },
  { s: 'We sleep in a ___.', a: 'bed', he: 'ישנים בּ' },
  { s: 'A ___ has stripes.', a: 'zebra', he: 'עם פסים' },
  { s: 'A ___ is very big.', a: 'elephant', he: 'גדול מאוד' },
  { s: 'We eat an ___.', a: 'apple', he: 'אוכלים' },
];

// Pick a word for the given band: mostly that band's words, some easier
// review. `hard` (a_to_b track) allows long words; the younger track prefers
// short ones (≤6 letters) so the same stage stays age-appropriate.
function pickWord(band, filter = () => true, hard = false) {
  const fits = hard ? filter : (w) => filter(w) && (w.en.length <= 6 || w.level <= 1);
  let own = WORDS.filter(w => w.level === band && fits(w));
  let lower = WORDS.filter(w => w.level < band && fits(w));
  if (!own.length && !lower.length) {           // filter too strict – relax
    own = WORDS.filter(w => w.level === band && filter(w));
    lower = WORDS.filter(w => w.level < band && filter(w));
  }
  const pool = (Math.random() < 0.7 && own.length) ? own : (lower.length ? lower : own);
  return pick(pool.length ? pool : WORDS);
}

function wrongWords(correct, n, filter = () => true) {
  // Distinct English words, Hebrew translations AND emojis, so no matter
  // which field becomes the option text the choices never collide.
  const out = [];
  const seen = new Set([correct.en, correct.he, correct.emoji]);
  for (const w of shuffle(WORDS.filter(filter))) {
    if (seen.has(w.en) || seen.has(w.he) || seen.has(w.emoji)) continue;
    seen.add(w.en); seen.add(w.he); seen.add(w.emoji);
    out.push(w);
    if (out.length === n) break;
  }
  return out;
}

const GENERATORS = {
  // ── Stage 1: the alphabet ─────────────────────────────────────────────
  en_letter_name: () => {
    const letter = pick(LETTERS);
    const wrong = shuffle(LETTERS.filter(x => x.l !== letter.l)).slice(0, 3);
    return {
      type: 'en_letter_name', difficulty: 1, dir: 'rtl',
      question: `מה שמה של האות הזו באנגלית?`,
      displayLetter: letter.l,
      audioText: letter.l, audioLang: 'en',
      answer: letter.name,
      options: shuffle([letter, ...wrong]).map(x => x.name),
      hint: `הקשיבו לצליל 🔊`,
    };
  },
  en_letter_find: () => {
    const letter = pick(LETTERS);
    const distractors = shuffle(LETTERS.filter(x => x.l !== letter.l)).slice(0, 5);
    return {
      type: 'en_letter_find', difficulty: 1, dir: 'rtl',
      question: `מצא את האות ${letter.l} (${letter.name})`,
      displayLetters: shuffle([letter, ...distractors]).map(x => x.l),
      audioText: letter.l, audioLang: 'en',
      answer: letter.l,
      hint: `חפשו את ${letter.l}`,
    };
  },
  en_first_letter: (band, hard) => {
    const word = pickWord(Math.min(band, 2), undefined, hard);
    const first = word.en[0].toUpperCase();
    const wrong = shuffle(LETTERS.filter(x => x.l !== first)).slice(0, 3).map(x => x.l);
    return {
      type: 'en_first_letter', difficulty: 1, dir: 'rtl',
      question: `באיזו אות מתחילה המילה "${word.en}"? (${word.he})`,
      displayImage: word.emoji,
      audioText: word.en, audioLang: 'en',
      answer: first,
      options: shuffle([first, ...wrong]),
      hint: `${word.en} — הקשיבו לצליל הראשון 🔊`,
    };
  },

  // ── Stage 2: vocabulary with pictures + listening ─────────────────────
  en_word_to_pic: (band, hard) => {
    const word = pickWord(band, undefined, hard);
    const wrong = wrongWords(word, 3);
    return {
      type: 'en_word_to_pic', difficulty: 2, dir: 'rtl',
      question: `מה מתאים למילה?`,
      displayWord: word.en,
      audioText: word.en, audioLang: 'en',
      answer: word.emoji,
      options: shuffle([word, ...wrong]).map(w => w.emoji),
      hint: `${word.en} = ${word.he}`,
    };
  },
  en_pic_to_word: (band, hard) => {
    const word = pickWord(band, undefined, hard);
    const wrong = wrongWords(word, 3);
    return {
      type: 'en_pic_to_word', difficulty: 2, dir: 'rtl',
      question: `איזו מילה באנגלית מתאימה לתמונה?`,
      displayImage: word.emoji,
      audioText: word.en, audioLang: 'en',
      answer: word.en,
      options: shuffle([word, ...wrong]).map(w => w.en),
      hint: `בעברית זה ${word.he}`,
    };
  },
  en_listen_pick: (band, hard) => {
    const word = pickWord(band, undefined, hard);
    const wrong = wrongWords(word, 3);
    return {
      type: 'en_listen_pick', difficulty: 2, dir: 'rtl',
      question: `🔊 הקשיבו — מה שמעתם?`,
      audioText: word.en, audioLang: 'en', autoAudio: true,
      answer: word.emoji,
      options: shuffle([word, ...wrong]).map(w => w.emoji),
      hint: `לחצו על 🔊 לשמוע שוב`,
    };
  },

  // ── Stage 3: reading, spelling & translation ──────────────────────────
  en_translate_to_he: (band, hard) => {
    const word = pickWord(band, undefined, hard);
    const wrong = wrongWords(word, 3);
    return {
      type: 'en_translate_to_he', difficulty: 2, dir: 'rtl',
      question: `מה פירוש המילה באנגלית?`,
      displayWord: word.en,
      audioText: word.en, audioLang: 'en',
      answer: word.he,
      options: shuffle([word, ...wrong]).map(w => w.he),
      hint: `רמז: ${word.emoji}`,
    };
  },
  en_translate_to_en: (band, hard) => {
    const word = pickWord(band, undefined, hard);
    const wrong = wrongWords(word, 3);
    return {
      type: 'en_translate_to_en', difficulty: 2, dir: 'rtl',
      question: `איך אומרים "${word.he}" באנגלית?`,
      displayImage: word.emoji,
      audioText: word.en, audioLang: 'en',
      answer: word.en,
      options: shuffle([word, ...wrong]).map(w => w.en),
      hint: `מתחיל באות ${word.en[0].toUpperCase()}`,
    };
  },
  en_missing_letter: (band, hard) => {
    const word = pickWord(band, w => w.en.length >= 3 && !w.en.includes(' ', hard) && !w.en.includes('-'));
    const idx = randInt(0, word.en.length - 1);
    const missing = word.en[idx];
    const display = word.en.split('').map((c, i) => (i === idx ? '_' : c)).join('');
    const wrong = shuffle('abcdefghijklmnoprstuw'.split('').filter(c => c !== missing)).slice(0, 3);
    return {
      type: 'en_missing_letter', difficulty: 3, dir: 'ltr',
      question: `${display}`,
      audioText: word.en, audioLang: 'en',
      displayImage: word.emoji,
      word: word.en,
      answer: missing,
      options: shuffle([missing, ...wrong]),
      hint: `המילה היא "${word.en}" (${word.he})`,
    };
  },

  // ── Stage 4: write the word yourself (vocabulary expansion) ───────────
  en_spell: (band, hard) => {
    const word = pickWord(band, w => w.en.length <= 9 && !w.en.includes(' ', hard) && !w.en.includes('-'));
    return {
      type: 'en_spell', difficulty: 3, dir: 'rtl',
      question: `כתבו באנגלית: ${word.he}`,
      displayImage: word.emoji,
      audioText: word.en, audioLang: 'en', autoAudio: true,
      word: word.en,
      answer: word.en,
      caseInsensitive: true,
      hint: `${word.en.length} אותיות, מתחיל ב-${word.en[0]}`,
      dedupKey: `en_spell|${word.en}`,
    };
  },

  // ── Alphabet & phonics (extra variety) ────────────────────────────────
  en_next_letter: () => {
    const i = randInt(0, LETTERS.length - 2);
    const given = LETTERS[i], answer = LETTERS[i + 1].l;
    const wrong = shuffle(LETTERS.filter(x => x.l !== answer && x.l !== given.l)).slice(0, 3).map(x => x.l);
    return {
      type: 'en_next_letter', difficulty: 1, dir: 'rtl',
      question: `איזו אות באה אחרי ${given.l}?`,
      displayLetter: given.l, audioText: given.l, audioLang: 'en',
      answer, options: shuffle([answer, ...wrong]),
      hint: `A B C D... מה בא אחרי ${given.l}?`,
    };
  },
  en_upper_lower: () => {
    const letter = pick(LETTERS);
    const answer = letter.l.toLowerCase();
    const wrong = shuffle(LETTERS.filter(x => x.l !== letter.l)).slice(0, 3).map(x => x.l.toLowerCase());
    return {
      type: 'en_upper_lower', difficulty: 1, dir: 'rtl',
      question: `איזו אות קטנה מתאימה ל-${letter.l}?`,
      displayLetter: letter.l, audioText: letter.l, audioLang: 'en',
      answer, options: shuffle([answer, ...wrong]),
      hint: `${letter.l} באותיות קטנות`,
    };
  },
  en_last_letter: (band, hard) => {
    const word = pickWord(Math.min(band, 2), w => /[a-z]$/i.test(w.en), hard);
    const answer = word.en[word.en.length - 1].toUpperCase();
    const wrong = shuffle(LETTERS.filter(x => x.l !== answer)).slice(0, 3).map(x => x.l);
    return {
      type: 'en_last_letter', difficulty: 2, dir: 'rtl',
      question: `באיזו אות מסתיימת המילה "${word.en}"? (${word.he})`,
      displayImage: word.emoji, audioText: word.en, audioLang: 'en',
      answer, options: shuffle([answer, ...wrong]),
      hint: `${word.en} — הקשיבו לסוף המילה 🔊`,
    };
  },

  // ── Numbers, colours, verbs, opposites, categories ────────────────────
  en_number_word: () => {
    const n = randInt(1, 10);
    const num = NUMBERS.find(x => x[0] === n);
    const wrong = shuffle(NUMBERS.filter(x => x[0] !== n)).slice(0, 3).map(x => x[1]);
    return {
      type: 'en_number_word', difficulty: 2, dir: 'rtl',
      question: `איך אומרים באנגלית את המספר ${n}?`,
      displayLetter: String(n),
      answer: num[1], options: shuffle([num[1], ...wrong]),
      hint: `${n} = ${num[2]}`,
    };
  },
  en_count: () => {
    const n = randInt(2, 5);
    const emoji = pick(['🍎', '⭐', '🐟', '🎈', '🚗', '🐶', '🌸', '⚽']);
    const num = NUMBERS.find(x => x[0] === n);
    const wrong = shuffle(NUMBERS.filter(x => x[0] !== n && x[0] <= 8)).slice(0, 3).map(x => x[1]);
    return {
      type: 'en_count', difficulty: 2, dir: 'rtl',
      question: `כמה יש כאן? ספרו באנגלית`,
      displayImage: emoji.repeat(n),
      answer: num[1], options: shuffle([num[1], ...wrong]),
      hint: `${n} = ${num[1]}`,
      dedupKey: `en_count|${n}`,
    };
  },
  en_color: () => {
    const c = pick(COLORS_EN);
    const wrong = shuffle(COLORS_EN.filter(x => x[1] !== c[1])).slice(0, 3).map(x => x[1]);
    return {
      type: 'en_color', difficulty: 2, dir: 'rtl',
      question: `מה הצבע הזה באנגלית?`,
      displayImage: c[0],
      answer: c[1], options: shuffle([c[1], ...wrong]),
      hint: `${c[2]} = ${c[1]}`,
      dedupKey: `en_color|${c[1]}`,
    };
  },
  en_verb: () => {
    const v = pick(VERBS);
    const wrong = shuffle(VERBS.filter(x => x[0] !== v[0])).slice(0, 3).map(x => x[0]);
    return {
      type: 'en_verb', difficulty: 2, dir: 'rtl',
      question: `איזו פעולה רואים בתמונה?`,
      displayImage: v[2],
      answer: v[0], options: shuffle([v[0], ...wrong]),
      hint: `${v[1]} = ${v[0]}`,
      dedupKey: `en_verb|${v[0]}`,
    };
  },
  en_opposite: () => {
    const p = pick(OPPOSITES);
    const flip = pick([true, false]);
    const given = flip ? p[1] : p[0], answer = flip ? p[0] : p[1];
    const givenHe = flip ? p[3] : p[2];
    const others = shuffle(OPPOSITES.flatMap(x => [x[0], x[1]]).filter(w => w !== given && w !== answer)).slice(0, 3);
    return {
      type: 'en_opposite', difficulty: 3, dir: 'rtl',
      question: `מה ההפך של "${given}"? (${givenHe})`,
      audioText: given, audioLang: 'en',
      answer, options: shuffle([answer, ...others]),
      hint: `מחפשים את ההפך מ-${givenHe}`,
    };
  },
  en_odd_one_out: () => {
    const cats = Object.keys(CATEGORIES_EN);
    const catA = pick(cats), catB = pick(cats.filter(c => c !== catA));
    const three = shuffle(CATEGORIES_EN[catA]).slice(0, 3);
    const odd = pick(CATEGORIES_EN[catB]);
    const emojiOf = en => (WORD_BY_EN[en] ? WORD_BY_EN[en].emoji : '❓');
    const answer = emojiOf(odd);
    return {
      type: 'en_odd_one_out', difficulty: 3, dir: 'rtl',
      question: `מה לא שייך לקבוצה?`,
      answer, options: shuffle([...three.map(emojiOf), answer]),
      hint: `שלושה מאותה קבוצה, אחד שונה`,
    };
  },
  en_plural: (band, hard) => {
    const irregular = ['fish', 'sheep', 'mouse'];
    const word = pickWord(band, w => /^[a-z]+$/i.test(w.en) && !irregular.includes(w.en), hard);
    const answer = word.en + 's';
    const wrong = [word.en, word.en + 'es', word.en + 'z'].filter(w => w !== answer).slice(0, 3);
    return {
      type: 'en_plural', difficulty: 3, dir: 'rtl',
      question: `יחיד: one ${word.en}. רבים: two ___?`,
      displayImage: word.emoji, audioText: word.en, audioLang: 'en',
      answer, options: shuffle([answer, ...wrong]),
      hint: `ברוב המילים פשוט מוסיפים s בסוף`,
    };
  },

  // ── Reading, sentences & harder spelling (stages 3-6) ─────────────────
  en_scramble: (band, hard) => {
    const word = pickWord(band, w => w.en.length >= 3 && w.en.length <= 6 && /^[a-z]+$/i.test(w.en), hard);
    let letters = shuffle(word.en.split(''));
    let guard = 0;
    while (letters.join('') === word.en && guard++ < 10) letters = shuffle(word.en.split(''));
    return {
      type: 'en_scramble', difficulty: 3, dir: 'rtl',
      question: `סדרו את האותיות למילה נכונה (${word.he}):`,
      displayWord: letters.join(' ').toUpperCase(),
      displayImage: word.emoji, audioText: word.en, audioLang: 'en',
      word: word.en, answer: word.en, caseInsensitive: true,
      hint: `${word.en.length} אותיות, מתחיל ב-${word.en[0]}`,
      dedupKey: `en_scramble|${word.en}`,
    };
  },
  en_sentence_fill: () => {
    const sen = pick(SENTENCES);
    const answerWord = WORD_BY_EN[sen.a];
    const wrong = wrongWords(answerWord, 3);
    return {
      type: 'en_sentence_fill', difficulty: 4, dir: 'ltr',
      question: sen.s.replace('___', '_____'),
      answer: sen.a,
      options: shuffle([sen.a, ...wrong.map(w => w.en)]),
      hint: `(${sen.he}) ${answerWord ? answerWord.emoji : ''}`,
      dedupKey: `en_sentence_fill|${sen.a}`,
    };
  },
  // ── Phonological awareness (GEPF Pre-Foundation, research-verified) ──────
  // Rhyme families (CVC onset-rime) — audio + picture, no reading required.
  en_rhyme: () => {
    const FAMILIES = [
      [['cat', '🐱'], ['hat', '🎩'], ['bat', '🦇']],
      [['dog', '🐶'], ['frog', '🐸'], ['log', '🪵']],
      [['sun', '☀️'], ['run', '🏃'], ['bun', '🥯']],
      [['cake', '🍰'], ['snake', '🐍']],
      [['star', '⭐'], ['car', '🚗']],
      [['moon', '🌙'], ['spoon', '🥄']],
      [['bee', '🐝'], ['tree', '🌳'], ['three', '3️⃣']],
      [['mouse', '🐭'], ['house', '🏠']],
      [['goat', '🐐'], ['boat', '⛵'], ['coat', '🧥']],
      [['fish', '🐟'], ['dish', '🍽️']],
    ];
    const family = pick(FAMILIES);
    const [target, correct] = shuffle(family).slice(0, 2);
    const wrong = shuffle(FAMILIES.filter(f => f !== family)).slice(0, 2).map(f => pick(f));
    const options = shuffle([correct, ...wrong]);
    const optionImages = {};
    for (const [w, e] of options) optionImages[w] = e;
    return {
      type: 'en_rhyme', difficulty: 2, dir: 'rtl',
      question: `איזו מילה מתחרזת עם "${target[0]}"?`,
      displayImage: target[1],
      audioText: `${target[0]}. ${options.map(o => o[0]).join(', ')}`,
      audioLang: 'en',
      answer: correct[0],
      options: options.map(o => o[0]),
      optionImages,
      hint: `מקשיבים לסוף המילה: ${target[0]}`,
      dedupKey: `en_rhyme|${target[0]}|${correct[0]}`,
    };
  },
  // Opening sound: hear a word, pick the picture that starts the same.
  // Unambiguous single consonants only — no digraphs (ch/sh/th).
  en_sound_start: (band, hard) => {
    const clear = 'bdfghjlmnprstw';
    const candidates = WORDS.filter(w => clear.includes(w.en[0]) && /^[a-z]+$/.test(w.en));
    const target = pick(candidates);
    const sameSound = candidates.filter(w => w.en[0] === target.en[0] && w.en !== target.en);
    if (!sameSound.length) return GENERATORS.en_rhyme();   // rare pool gap
    const correct = pick(sameSound);
    const wrong = [];
    const seen = new Set([target.en[0]]);
    for (const w of shuffle(candidates)) {
      if (wrong.length === 2) break;
      if (seen.has(w.en[0])) continue;
      seen.add(w.en[0]);
      wrong.push(w);
    }
    const options = shuffle([correct, ...wrong]);
    return {
      type: 'en_sound_start', difficulty: 2, dir: 'rtl',
      question: `איזו תמונה מתחילה באותו צליל כמו "${target.en}"?`,
      displayImage: target.emoji,
      audioText: `${target.en}. ${options.map(o => o.en).join(', ')}`,
      audioLang: 'en',
      answer: correct.emoji,
      options: options.map(o => o.emoji),
      hint: `${target.en} מתחיל בצליל של האות ${target.en[0].toUpperCase()}`,
      dedupKey: `en_sound_start|${target.en}|${correct.en}`,
    };
  },
  // Sentence ↔ picture matching (A1 written reception, Pre-A1 Starters style).
  en_sentence_pic: () => {
    const SCENES = [
      { s: 'The cat is black.', ok: '🐈‍⬛', near: ['🐈', '🐕'] },
      { s: 'The dog has a ball.', ok: '🐶⚽', near: ['🐱⚽', '🐶🦴'] },
      { s: 'I see two birds.', ok: '🐦🐦', near: ['🐦', '🐦🐦🐦'] },
      { s: 'The ball is red.', ok: '🔴⚽', near: ['🔵⚽', '🔴🎈'] },
      { s: 'The girl eats an apple.', ok: '👧🍎', near: ['👦🍎', '👧🍌'] },
      { s: 'The boy reads a book.', ok: '👦📖', near: ['👧📖', '👦⚽'] },
      { s: 'The fish is in the water.', ok: '🐟💧', near: ['🐟🔥', '🐦💧'] },
      { s: 'I see three stars.', ok: '⭐⭐⭐', near: ['⭐⭐', '⭐'] },
      { s: 'The baby is sleeping.', ok: '👶😴', near: ['👶😀', '👧😴'] },
      { s: 'The car is blue.', ok: '🔵🚗', near: ['🔴🚗', '🔵🚌'] },
      { s: 'The monkey eats a banana.', ok: '🐵🍌', near: ['🐵🍎', '🐶🍌'] },
      { s: 'The bird is on the tree.', ok: '🐦🌳', near: ['🐟🌳', '🐦🏠'] },
    ];
    const scene = pick(SCENES);
    if (pick([true, false])) {
      return {
        type: 'en_sentence_pic', difficulty: 4, dir: 'ltr',
        question: scene.s,
        audioText: scene.s, audioLang: 'en',
        answer: scene.ok,
        options: shuffle([scene.ok, ...scene.near]),
        hint: `קוראים לאט ובודקים שכל מילה מתאימה לתמונה`,
        dedupKey: `en_sentence_pic|${scene.s}`,
      };
    }
    // No English audio here — reading the correct sentence aloud would give
    // the answer away. The Hebrew question is read by the universal TTS.
    const wrongSentences = shuffle(SCENES.filter(x => x !== scene)).slice(0, 2).map(x => x.s);
    return {
      type: 'en_sentence_pic', difficulty: 4, dir: 'rtl',
      question: `איזה משפט מתאר את התמונה?`,
      displayImage: scene.ok,
      answer: scene.s,
      options: shuffle([scene.s, ...wrongSentences]),
      hint: `מסתכלים על התמונה וקוראים כל משפט`,
      dedupKey: `en_sentence_pic|pic|${scene.s}`,
    };
  },
  en_phrase: () => {
    const p = pick(PHRASES);
    if (pick([true, false])) {
      const wrong = shuffle(PHRASES.filter(x => x[0] !== p[0])).slice(0, 3).map(x => x[0]);
      return {
        type: 'en_phrase', difficulty: 3, dir: 'rtl',
        question: `איך אומרים "${p[1]}" באנגלית?`,
        answer: p[0], options: shuffle([p[0], ...wrong]),
        hint: `ביטוי נפוץ באנגלית`,
      };
    }
    const wrong = shuffle(PHRASES.filter(x => x[1] !== p[1])).slice(0, 3).map(x => x[1]);
    return {
      type: 'en_phrase', difficulty: 3, dir: 'rtl',
      question: `מה הפירוש של "${p[0]}"?`,
      audioText: p[0], audioLang: 'en',
      answer: p[1], options: shuffle([p[1], ...wrong]),
      hint: `ביטוי נפוץ באנגלית`,
    };
  },
};

// Stage plans – 15 questions each, mixing many question types so a session
// never feels repetitive. Higher stages lean on typing (spell/scramble),
// sentences and opposites, so they are genuinely harder.
const STAGE_PLANS = {
  1: ['en_letter_name', 'en_letter_name', 'en_letter_find', 'en_letter_find',
      'en_next_letter', 'en_next_letter', 'en_upper_lower', 'en_upper_lower',
      'en_first_letter', 'en_first_letter', 'en_word_to_pic', 'en_word_to_pic',
      'en_number_word', 'en_count', 'en_listen_pick'],
  2: ['en_word_to_pic', 'en_word_to_pic', 'en_pic_to_word', 'en_pic_to_word',
      'en_listen_pick', 'en_listen_pick', 'en_color', 'en_verb',
      'en_number_word', 'en_count', 'en_first_letter', 'en_last_letter',
      'en_odd_one_out', 'en_rhyme', 'en_sound_start'],
  3: ['en_pic_to_word', 'en_translate_to_he', 'en_translate_to_he',
      'en_translate_to_en', 'en_translate_to_en', 'en_missing_letter',
      'en_missing_letter', 'en_opposite', 'en_verb', 'en_scramble',
      'en_scramble', 'en_spell', 'en_odd_one_out', 'en_rhyme', 'en_sound_start'],
  4: ['en_translate_to_he', 'en_translate_to_he', 'en_translate_to_en',
      'en_translate_to_en', 'en_missing_letter', 'en_opposite', 'en_opposite',
      'en_plural', 'en_scramble', 'en_spell', 'en_spell', 'en_sentence_fill',
      'en_phrase', 'en_odd_one_out', 'en_sentence_pic'],
  5: ['en_spell', 'en_spell', 'en_scramble', 'en_scramble', 'en_sentence_fill',
      'en_sentence_fill', 'en_translate_to_en', 'en_missing_letter',
      'en_opposite', 'en_opposite', 'en_plural', 'en_plural', 'en_phrase',
      'en_sentence_pic', 'en_translate_to_he'],
  6: ['en_spell', 'en_spell', 'en_spell', 'en_scramble', 'en_scramble',
      'en_sentence_fill', 'en_sentence_fill', 'en_missing_letter',
      'en_missing_letter', 'en_opposite', 'en_plural', 'en_plural',
      'en_phrase', 'en_sentence_pic', 'en_translate_to_en'],
};

export const ENGLISH_STAGES = 6;

// WORDS only carry levels 1-4, so vocabulary difficulty tops out there even
// though the stage ladder (and the typing/sentence question mix) goes to 6.
const MAX_WORD_BAND = 4;

/**
 * `track` makes the same stage age-appropriate: an a_to_b child (rising 2nd
 * grader) draws vocabulary one band higher and gets long words, while the
 * younger track prefers short words at the same stage.
 */
export function generateEnglishExercises(stage = 1, reviewExercises = [], track = null) {
  const s = Math.min(Math.max(1, Number(stage) || 1), ENGLISH_STAGES);
  const hard = track === 'a_to_b';
  const band = Math.min(s + (hard ? 1 : 0), MAX_WORD_BAND);
  const plan = [...STAGE_PLANS[s]];
  const reviewCount = Math.min(reviewExercises.length, 3);
  for (let i = 0; i < reviewCount && plan.length; i++) plan.shift();

  const exercises = [];
  const seen = new Set();
  const keyOf = (ex) => ex.dedupKey || `${ex.type}|${ex.question}|${ex.answer}`;
  for (const r of reviewExercises.slice(0, reviewCount)) {
    exercises.push({ ...r, isReview: true });
    seen.add(keyOf(r));
  }
  for (const type of plan) {
    let ex = GENERATORS[type](band, hard);
    let key = keyOf(ex);
    let attempts = 0;
    while (seen.has(key) && attempts < 25) { ex = GENERATORS[type](band, hard); key = keyOf(ex); attempts++; }
    seen.add(key);
    exercises.push(ex);
  }
  return shuffle(exercises).map((ex, i) => ({ ...ex, id: i + 1 }));
}
