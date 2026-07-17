// Mini-lessons (שיעורונים): when a child meets a topic family for the FIRST
// time — usually right after levelling up into it — the session opens with a
// short, friendly teaching screen instead of dropping straight into practice.
// Learning paths, not just drilling.
//
// Each lesson: 2-3 short spoken lines (read aloud with TTS), a big visual, and
// one worked example. Keyed by the same family keys as insights.js, plus new
// topic families. A lesson is shown once per child (and skipped entirely for
// families the child already practised before lessons existed).
import { TOPIC_FAMILIES } from './insights.js';

export const LESSONS = {
  // ── Existing families a child can grow INTO ─────────────────────────────
  place_value: {
    icon: '🧱',
    title: 'עשרות ואחדות',
    lines: [
      'כל מספר גדול בנוי מקבוצות של עשר — אלה העשרות — ועוד קצת — אלה האחדות.',
      'במספר 34 יש 3 עשרות ועוד 4 אחדות. שלושים ועוד ארבע!',
    ],
    example: { display: '3️⃣4️⃣', question: '34 = 3 עשרות + 4 אחדות', speak: 'במספר שלושים וארבע יש שלוש עשרות וארבע אחדות' },
  },
  missing: {
    icon: '❓',
    title: 'המספר החסר',
    lines: [
      'לפעמים בתרגיל מתחבא מספר! סימן השאלה שומר לו את המקום.',
      'כמה ועוד 3 שווה 8? חושבים הפוך: 8 פחות 3 — זה 5!',
    ],
    example: { display: '? + 3 = 8', question: 'המספר שמתחבא הוא 5', speak: 'כמה ועוד שלוש שווה שמונה? חמש!' },
  },
  multiplication: {
    icon: '✖️',
    title: 'כפל וחילוק',
    lines: [
      'כפל זה ספירה של קבוצות שוות בבת אחת: 3 שורות של 4 זה 4 ועוד 4 ועוד 4!',
      'וחילוק זה ההפך — מחלקים שווה בשווה לכולם.',
    ],
    example: { display: '🍓🍓🍓🍓\n🍓🍓🍓🍓\n🍓🍓🍓🍓', question: '3 × 4 = 12', speak: 'שלוש כפול ארבע שווה שתים עשרה' },
  },
  ordinals: {
    icon: '🚩',
    title: 'מספרים סודרים',
    lines: [
      'כשעומדים בתור, לכל אחד יש מקום משלו: ראשון, שני, שלישי...',
      'תמיד מתחילים לספור מהדגל!',
    ],
    example: { display: '🚩 🐶 🐱 🐰', question: 'הכלב ראשון, החתול שני, הארנב שלישי', speak: 'הכלב ראשון, החתול שני, והארנב שלישי בתור' },
  },
  week_days: {
    icon: '📅',
    title: 'ימי השבוע',
    lines: [
      'לשבוע יש שבעה ימים שהולכים במעגל: ראשון, שני, שלישי, רביעי, חמישי, שישי ושבת.',
      'אחרי שבת מתחילים שוב מיום ראשון!',
    ],
    example: { display: '📅', question: 'ראשון ← שני ← שלישי ← ... ← שבת ← ראשון', speak: 'ראשון, שני, שלישי, רביעי, חמישי, שישי, שבת — ושוב ראשון!' },
  },
  clock: {
    icon: '🕒',
    title: 'קוראים שעון',
    lines: [
      'המחוג הקצר מספר לנו את השעה.',
      'כשהמחוג הארוך למעלה — שעה עגולה. כשהוא למטה — "וחצי"!',
    ],
    example: { display: '🕒', question: 'השעון הזה מראה 3:00', speak: 'המחוג הקצר על שלוש — השעה שלוש בדיוק' },
  },
  money: {
    icon: '💰',
    title: 'שקלים — כסף וקניות',
    lines: [
      'לכל מטבע ושטר יש ערך משלו: 1, 2, 5, 10 שקלים במטבעות, ו-20, 50, 100 בשטרות.',
      'הרבה מטבעות זה לא תמיד הרבה כסף — סופרים כמו בחנות אמיתית!',
    ],
    example: { display: '🪙 🪙 💵', question: '5 + 5 + 20 = 30 שקלים', speak: 'חמישה שקלים ועוד חמישה ועוד עשרים — שלושים שקלים בארנק' },
  },
  data_reading: {
    icon: '📊',
    title: 'קוראים גרף תמונות',
    lines: [
      'גרף תמונות מספר סיפור במקום מילים: כל שורה היא תשובה.',
      'סופרים את התמונות בשורה — וכך יודעים כמה ילדים בחרו בה!',
    ],
    example: { display: 'תפוח: 🍎🍎🍎🍎\nבננה: 🍌🍌', question: '4 בחרו תפוח, 2 בחרו בננה', speak: 'ארבעה ילדים בחרו תפוח, ושניים בחרו בננה. תפוח מנצח!' },
  },
  phono: {
    icon: '🎵',
    title: 'משחקים עם צלילים',
    lines: [
      'מילים מתחרזות נשמעות דומה בסוף — דָּג וגַג!',
      'וכל מילה מתחלקת לחתיכות קטנות: בַּ-נָ-נָה — שלוש מחיאות כף!',
    ],
    example: { display: '🐟 🏠', question: 'דג — גג: מתחרזות!', speak: 'דג וגג נשמעות אותו דבר בסוף — הן מתחרזות!' },
  },
  he_listening: {
    icon: '🎧',
    title: 'מקשיבים לסיפור',
    lines: [
      'עכשיו משחק חדש: מקשיבים לסיפור קטן עם אוזניים פקוחות.',
      'ואז עונים על שאלה — מי שמקשיב טוב, יודע הכול!',
    ],
    example: { display: '🎧', question: 'מקשיבים... חושבים... עונים!', speak: 'דני הלך לים ולקח שלושה כדורים. כמה כדורים לקח דני? שלושה!' },
  },
  en_phono: {
    icon: '🎶',
    title: 'צלילים באנגלית',
    lines: [
      'גם באנגלית יש מילים שנשמעות דומה בסוף: cat ו-hat מתחרזות!',
      'ולכל מילה יש צליל פותח: ball מתחילה בצליל בּ.',
    ],
    example: { display: '🐱 🎩', question: 'cat — hat', speak: 'קאט והאט נשמעות אותו דבר בסוף — הן מתחרזות!' },
  },
  en_sentences: {
    icon: '💬',
    title: 'משפטים באנגלית',
    lines: [
      'משפט באנגלית מצייר תמונה בראש: The cat is black — חתול שחור!',
      'קוראים לאט ובודקים שכל מילה מתאימה לתמונה.',
    ],
    example: { display: '🐈‍⬛', question: 'The cat is black.', speak: 'The cat is black — החתול שחור' },
  },
  reading: {
    icon: '📖',
    title: 'קוראים מילה שלמה',
    lines: [
      'עכשיו כשמכירים את האותיות — אפשר לחבר אותן למילה שלמה!',
      'מסתכלים על האותיות אחת-אחת, מחברים את הצלילים, ומגלים את המילה.',
    ],
    example: { display: '🐕', question: 'כ-ל-ב ← כלב!', speak: 'כף, למד, בית — כלב!' },
  },
  en_spelling: {
    icon: '✍️',
    title: 'כותבים באנגלית',
    lines: [
      'עכשיו תור הכתיבה! שומעים מילה באנגלית — וכותבים אותה אות-אות.',
      'לא נורא לטעות — כל ניסיון מלמד אותנו משהו חדש.',
    ],
    example: { display: '🐶', question: 'dog = d-o-g', speak: 'dog. די, או, ג׳י' },
  },
};

// Map every exercise type to its family key (for lesson lookup).
const familyKeyOf = {};
for (const fams of Object.values(TOPIC_FAMILIES)) {
  for (const f of fams) for (const t of f.types) familyKeyOf[t] = f.key;
}
// Types added after the TOPIC_FAMILIES snapshot can register here explicitly.
export function registerFamilies(map) {
  Object.assign(familyKeyOf, map);
}

export function familyKeyForType(type) {
  return familyKeyOf[type] || null;
}

/**
 * Which single lesson (if any) should open this session: the first family in
 * the session that has a lesson, isn't in `seenKeys`, and isn't already an
 * old friend (`experiencedKeys` — families with real practice history).
 */
export function pickLessonForSession(exercises, { seenKeys = [], experiencedKeys = [] } = {}) {
  const skip = new Set([...seenKeys, ...experiencedKeys]);
  for (const ex of exercises) {
    const key = familyKeyOf[ex.type];
    if (!key || skip.has(key)) continue;
    const lesson = LESSONS[key];
    if (lesson) return { key, ...lesson };
    skip.add(key);   // family without a lesson — don't re-check
  }
  return null;
}

/** Families the child has genuinely practised (≥ minAttempts results). */
export function experiencedFamilies(sessions, minAttempts = 5) {
  const counts = {};
  for (const s of sessions || []) {
    for (const r of s.results || []) {
      const key = familyKeyOf[r.type];
      if (key) counts[key] = (counts[key] || 0) + 1;
    }
  }
  return Object.keys(counts).filter(k => counts[k] >= minAttempts);
}
