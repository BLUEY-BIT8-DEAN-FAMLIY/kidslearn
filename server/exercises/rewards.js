// Rewards: daily stickers, achievements and practice streaks.
// Research-backed motivation loop for kids apps: visible streaks, instant
// feedback and collectible rewards — kept light so the reward is finishing
// the day's learning, not grinding for points.

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// One sticker per successful day. A big pool so the album stays fresh all
// summer (variable reward: the child never knows which one comes next).
export const STICKER_POOL = [
  '🦖', '🦕', '🐉', '🦄', '🦁', '🐯', '🐼', '🐨', '🦊', '🐸',
  '🐬', '🐳', '🦈', '🐙', '🦀', '🐠', '🦩', '🦚', '🦜', '🦉',
  '🚀', '🛸', '🚁', '⛵', '🏎️', '🚂', '🎢', '🎡', '🏰', '🗿',
  '🌋', '🏝️', '🌈', '⚡', '☄️', '🌟', '🍄', '🌵', '🍉', '🍩',
  '🧁', '🍭', '⚽', '🏀', '🎸', '🥁', '🎨', '🎪',
];

/** A random sticker the child doesn't own yet (duplicates once complete). */
export function pickNewSticker(ownedEmojis) {
  const owned = new Set(ownedEmojis);
  const fresh = STICKER_POOL.filter(s => !owned.has(s));
  return pick(fresh.length ? fresh : STICKER_POOL);
}

/**
 * Current practice streak in consecutive calendar days, counted back from
 * today (or yesterday, so the streak isn't "broken" before today's practice).
 */
export function computePracticeStreak(dates, today) {
  const have = new Set(dates);
  const dayMs = 24 * 60 * 60 * 1000;
  let cursor = new Date(`${today}T00:00:00Z`).getTime();
  if (!have.has(today)) cursor -= dayMs;   // today not practised yet – count from yesterday
  let streak = 0;
  while (have.has(new Date(cursor).toISOString().slice(0, 10))) {
    streak++;
    cursor -= dayMs;
  }
  return streak;
}

/** All achievements with earned/locked state, computed from raw data. */
export function computeAchievements({ sessions, stickers, streak }) {
  const totalExercises = sessions.reduce((n, s) => n + (s.results || []).length, 0);
  const hasPerfect = sessions.some(s =>
    (s.results || []).length >= 10 &&
    s.results.every(r => r.firstAttemptCorrect !== false && r.correct));
  const subjects = new Set(sessions.map(s => s.subject || 'math'));
  const bestStreak = streak; // current streak is what we celebrate

  return [
    { id: 'first_steps', icon: '🐣', title: 'צעדים ראשונים', desc: 'סיימת מפגש ראשון!', earned: sessions.length >= 1 },
    { id: 'ex_100', icon: '💯', title: 'מאה ומעלה', desc: '100 תרגילים בסך הכל', earned: totalExercises >= 100 },
    { id: 'ex_500', icon: '🚀', title: 'טיל של תרגולים', desc: '500 תרגילים בסך הכל', earned: totalExercises >= 500 },
    { id: 'perfect', icon: '🎯', title: 'מפגש מושלם', desc: 'מפגש שלם בלי אף טעות', earned: hasPerfect },
    { id: 'streak_3', icon: '🔥', title: 'על הגל', desc: '3 ימי תרגול ברצף', earned: bestStreak >= 3 },
    { id: 'streak_7', icon: '🌟', title: 'שבוע מושלם', desc: '7 ימי תרגול ברצף', earned: bestStreak >= 7 },
    { id: 'collect_5', icon: '📒', title: 'אספן מתחיל', desc: '5 מדבקות באלבום', earned: stickers.length >= 5 },
    { id: 'collect_15', icon: '🏆', title: 'אספן על', desc: '15 מדבקות באלבום', earned: stickers.length >= 15 },
    { id: 'multi', icon: '🎓', title: 'רב-תחומי', desc: 'תרגלת יותר ממקצוע אחד', earned: subjects.size >= 2 },
  ];
}
