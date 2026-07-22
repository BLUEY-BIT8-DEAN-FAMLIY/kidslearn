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
  // ── Core arithmetic strategies (איך מחשבים, לא רק מה התשובה) ────────────
  addition: {
    icon: '➕',
    title: 'איך מחברים חכם',
    lines: [
      'מתחילים תמיד מהמספר הגדול וסופרים קדימה: 7 ועוד 2 — שמונה, תשע!',
      'טריק העשר: 8 ועוד 5? קודם משלימים לעשר (8 ועוד 2), ונשארו עוד 3 — ביחד 13!',
      'במספרים גדולים מחברים עשרות עם עשרות, ואחדות עם אחדות.',
    ],
    example: { display: '8 + 5 = 8 + 2 + 3 = 13', question: 'משלימים ל-10 ואז מוסיפים את מה שנשאר', speak: 'שמונה ועוד חמש: שמונה ועוד שתיים זה עשר, ועוד שלוש — שלוש עשרה!' },
  },
  subtraction: {
    icon: '➖',
    title: 'איך מחסרים חכם',
    lines: [
      'חיסור אפשר לפתור בספירה קדימה: 12 פחות 9 — סופרים מ-9 עד 12.',
      'עשר! אחת-עשרה! שתים-עשרה! שלוש קפיצות — אז התשובה 3.',
      'ובמספרים גדולים: מחסרים עשרות מעשרות, ואחדות מאחדות.',
    ],
    example: { display: '12 - 9 = 3', question: 'מ-9 עד 12 יש 3 קפיצות', speak: 'שתים עשרה פחות תשע: קופצים מתשע לעשר, אחת עשרה, שתים עשרה — שלוש קפיצות!' },
  },
  number_sense: {
    icon: '⚖️',
    title: 'משווים מספרים',
    lines: [
      'איזה מספר גדול יותר? קודם סופרים ספרות: מספר עם יותר ספרות — גדול יותר!',
      'אותו מספר ספרות? משווים קודם את העשרות, ורק אם הן שוות — את האחדות.',
    ],
    example: { display: '47 __ 43', question: 'העשרות שוות (4=4), אז משווים אחדות: 7 > 3, לכן 47 > 43', speak: 'ארבעים ושבע מול ארבעים ושלוש: העשרות שוות, שבע גדולה משלוש — אז ארבעים ושבע גדול יותר!' },
  },
  sequences: {
    icon: '🐰',
    title: 'סדרות ודילוגים',
    lines: [
      'בכל סדרה מסתתרת חוקיות — מגלים אותה כמו בלשים!',
      'בודקים שני שכנים: מ-5 ל-10 יש קפיצה של 5. עכשיו קופצים ככה עד הסוף.',
    ],
    example: { display: '5, 10, 15, ?, 25', question: 'קפיצות של 5 — המספר החסר הוא 20', speak: 'חמש, עשר, חמש עשרה... קפיצות של חמש! אחרי חמש עשרה בא עשרים.' },
  },
  geometry: {
    icon: '🔺',
    title: 'צורות, צלעות ופינות',
    lines: [
      'צלעות הן הקווים הישרים של הצורה, ופינות — המקומות שבהם הם נפגשים.',
      'משולש: 3 צלעות. מרובע: 4. מחומש: 5. משושה: 6 — השם מסגיר את הסוד!',
    ],
    example: { display: '🔺', question: 'למשולש 3 צלעות ו-3 פינות', speak: 'משולש — שלוש צלעות ושלוש פינות. השם כבר אומר את זה: משולש, שלוש!' },
  },

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
      'על השעון יש מספרים מ-1 עד 12. המחוג הקצר מראה את השעה.',
      'כשהמחוג הארוך על 12 — שעה עגולה. כשהוא על 6 — "וחצי"!',
    ],
    example: { clock: { h: 3, m: 0 }, question: 'המחוג הקצר על 3, הארוך על 12 — השעה 3:00', speak: 'המחוג הקצר מצביע על שלוש והארוך על שתים עשרה — השעה שלוש בדיוק!' },
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
  letters: {
    icon: '🔤',
    title: 'מכירים את האותיות',
    lines: [
      'לכל אות יש שם וצורה משלה — כמו חברים חדשים!',
      'מסתכלים טוב על הצורה ואומרים את השם בקול. ככה זוכרים.',
    ],
    example: { display: 'א ב ג', question: 'אָלֶף, בֵּית, גִימֶל', speak: 'אלף, בית, גימל — שלוש האותיות הראשונות!' },
  },
  sounds: {
    icon: '🔉',
    title: 'הצליל הפותח',
    lines: [
      'לכל מילה יש צליל פותח — הצליל הראשון ששומעים.',
      'אומרים את המילה לאט: כּ... לב. שומעים? כלב מתחיל בכף!',
    ],
    example: { display: '🐕', question: 'כלב מתחיל באות כ', speak: 'כּ... כּ... כלב! המילה כלב מתחילה בכף' },
  },
  in_words: {
    icon: '✏️',
    title: 'אותיות בתוך מילה',
    lines: [
      'מילה בנויה מאותיות לפי הסדר. כשאות מתחבאת — קוראים לאט ומגלים מה חסר.',
      'שומעים את המילה, ובודקים איזו אות משלימה אותה בדיוק.',
    ],
    example: { display: 'שֶׁ_ֶשׁ', question: 'שמש — האות החסרה היא מ', speak: 'שֶׁמֶשׁ. שין, מם, שין — האות שבאמצע היא מם!' },
  },
  en_letters: {
    icon: '🔠',
    title: 'האלפבית באנגלית',
    lines: [
      'באנגלית 26 אותיות, ולכל אחת שם משלה: A נשמעת אֵיי, B נשמעת בִּי.',
      'יש אותיות גדולות (A) וקטנות (a) — אותה אות בשני בגדים!',
    ],
    example: { display: 'A a   B b', question: 'A גדולה = a קטנה', speak: 'איי גדולה ואיי קטנה — אותה אות בדיוק!' },
  },
  en_vocab: {
    icon: '🗣️',
    title: 'מילים באנגלית',
    lines: [
      'כל מילה באנגלית היא שם של משהו שאנחנו מכירים: cat זה חתול!',
      'מסתכלים על התמונה, שומעים את המילה, ואומרים אותה בקול — ככה זוכרים.',
    ],
    example: { display: '🐱', question: 'cat = חתול', speak: 'cat! קאט זה חתול' },
  },
  en_listening: {
    icon: '🎧',
    title: 'מקשיבים באנגלית',
    lines: [
      'מקשיבים למילה באנגלית עם אוזניים פקוחות — אפשר ללחוץ 🔊 ולשמוע שוב!',
      'שומעים, חושבים איזו תמונה מתאימה — ורק אז בוחרים.',
    ],
    example: { display: '🔊 → 🐶', question: 'שומעים dog — בוחרים את הכלב', speak: 'dog! דוג זה כלב — בוחרים את התמונה של הכלב' },
  },
  en_translate: {
    icon: '🔁',
    title: 'מתרגמים',
    lines: [
      'לתרגם זה להגיד את אותו הדבר בשפה אחרת: sun זה שמש!',
      'שוכחים? התמונה או האות הראשונה עוזרות להיזכר.',
    ],
    example: { display: '☀️', question: 'sun = שמש', speak: 'sun! סאן זה שמש' },
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
 * Families the child recently struggles with: first-attempt error rate over
 * the last `recent` sessions, with enough evidence to mean something.
 */
export function weakFamilies(sessions, { recent = 6, minAttempts = 4, rate = 0.45 } = {}) {
  const acc = {};
  for (const s of (sessions || []).slice(-recent)) {
    for (const r of s.results || []) {
      const key = familyKeyOf[r.type];
      if (!key) continue;
      if (!acc[key]) acc[key] = { wrong: 0, total: 0 };
      acc[key].total++;
      if (r.firstAttemptCorrect === false || r.correct === false) acc[key].wrong++;
    }
  }
  return Object.entries(acc)
    .filter(([, a]) => a.total >= minAttempts && a.wrong / a.total >= rate)
    .sort((a, b) => b[1].wrong / b[1].total - a[1].wrong / a[1].total)
    .map(([key]) => key);
}

/**
 * Which single lesson (if any) should open this session.
 *
 * Pass 1 — NEW topic: the first family in the session that has a lesson,
 * isn't in `seenKeys`, and isn't an old friend (`experiencedKeys`).
 * Pass 2 — RE-TEACH: the child keeps stumbling on a family (recent error
 * rate ≥ 45%): re-open its lesson even though it was seen, at most once per
 * day (tracked via a `reteach:<key>:<date>` pseudo-key in the seen store).
 *
 * The returned lesson carries `markKey` — persist THAT, not `key`.
 */
export function pickLessonForSession(exercises, { seenKeys = [], experiencedKeys = [], sessions = [], date = '' } = {}) {
  const skip = new Set([...seenKeys, ...experiencedKeys]);
  for (const ex of exercises) {
    const key = familyKeyOf[ex.type];
    if (!key || skip.has(key)) continue;
    const lesson = LESSONS[key];
    if (lesson) return { key, ...lesson, markKey: key };
    skip.add(key);   // family without a lesson — don't re-check
  }

  // Re-teach a struggling topic (לימוד מחדש, לא רק חזרה על שאלות).
  const weak = weakFamilies(sessions);
  if (weak.length) {
    const inSession = new Set(exercises.map(ex => familyKeyOf[ex.type]).filter(Boolean));
    for (const key of weak) {
      if (!inSession.has(key) || !LESSONS[key]) continue;
      const markKey = `reteach:${key}:${date}`;
      if (seenKeys.includes(markKey)) continue;   // already re-taught today
      return { key, ...LESSONS[key], reteach: true, markKey };
    }
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
