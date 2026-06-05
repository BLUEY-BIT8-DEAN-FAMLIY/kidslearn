// Browser-only data layer for the static web version (no server).
// Mirrors the server's storage.js logic using localStorage, and generates
// exercises in-browser with the same pure generators the server uses.

import { generateMathExercises } from '../../../server/exercises/mathGenerator.js';
import { generateHebrewExercises } from '../../../server/exercises/hebrewGenerator.js';

const K = {
  history: 'kidslearn:history',
  review: 'kidslearn:review',
  children: 'kidslearn:children',
};

// No children ship with the app – each family creates their own profiles.
const DEFAULT_CHILDREN = [];

function read(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ── Children ────────────────────────────────────────────────────────────
function readChildren() {
  const list = read(K.children, null);
  return Array.isArray(list) && list.length ? list : [...DEFAULT_CHILDREN];
}
function getChildProfile(id) {
  return readChildren().find(c => c.id === id) || null;
}

export async function fetchChildren() {
  return { children: readChildren() };
}

export async function addChild({ name, gender, subject, avatar, photo }) {
  const list = readChildren();
  let n = 1;
  while (list.some(c => c.id === `kid_${n}`)) n++;
  const child = {
    id: `kid_${n}`,
    name: String(name || '').trim() || 'ילד/ה',
    gender: gender === 'girl' ? 'girl' : 'boy',
    subject: subject === 'hebrew' ? 'hebrew' : 'math',
    avatar: avatar || '',
    photo: photo || '',
    builtin: false,
  };
  list.push(child);
  write(K.children, list);
  return { ok: true, child };
}

export async function deleteChild(id) {
  const list = readChildren();
  const child = list.find(c => c.id === id);
  if (!child || child.builtin) throw new Error('לא ניתן למחוק את הילד הזה');
  write(K.children, list.filter(c => c.id !== id));
  return { ok: true };
}

// ── Review queue ────────────────────────────────────────────────────────
function popReviewQueue(child, count) {
  const data = read(K.review, {});
  const queue = data[child] || [];
  const taken = queue.splice(0, count);
  data[child] = queue;
  write(K.review, data);
  return taken;
}
function addWrongToReviewQueue(child, results) {
  const wrong = results
    .filter(r => r.firstAttemptCorrect === false && r.exerciseSnapshot)
    .map(r => r.exerciseSnapshot);
  if (!wrong.length) return;
  const data = read(K.review, {});
  if (!data[child]) data[child] = [];
  data[child].push(...wrong);
  data[child] = data[child].slice(-30);
  write(K.review, data);
}

// ── History / weakness / stats ──────────────────────────────────────────
function readHistory() {
  return read(K.history, {});
}

function computeWeakness(child, lookback = 5) {
  const sessions = (readHistory()[child] || []).slice(-lookback);
  const stats = {};
  for (const session of sessions) {
    for (const r of session.results || []) {
      if (!stats[r.type]) stats[r.type] = { wrong: 0, total: 0 };
      stats[r.type].total++;
      const hadMistake = r.firstAttemptCorrect === false || r.correct === false;
      if (hadMistake) stats[r.type].wrong++;
    }
  }
  const weakness = {};
  for (const [type, s] of Object.entries(stats)) {
    weakness[type] = s.total > 0 ? s.wrong / s.total : 0;
  }
  return weakness;
}

export async function fetchExercises(child, date) {
  const profile = getChildProfile(child);
  if (!profile) throw new Error('Unknown child');
  const weakness = computeWeakness(child);
  const reviewExercises = popReviewQueue(child, 3);
  const exercises = profile.subject === 'hebrew'
    ? generateHebrewExercises(weakness, reviewExercises)
    : generateMathExercises(weakness, reviewExercises);
  return { child, subject: profile.subject, date, exercises, weakness };
}

export async function saveSession(payload) {
  const { child, results } = payload;
  const history = readHistory();
  if (!history[child]) history[child] = [];
  history[child].push({ ...payload, savedAt: new Date().toISOString() });
  write(K.history, history);
  addWrongToReviewQueue(child, results);
  return { ok: true };
}

export async function fetchHistory(child) {
  return { sessions: readHistory()[child] || [] };
}

export async function fetchStats(child) {
  const sessions = readHistory()[child] || [];
  if (!sessions.length) {
    return { totalSessions: 0, totalExercises: 0, totalCorrect: 0, totalNoMistake: 0, byType: {}, recent: [] };
  }
  const byType = {};
  let totalCorrect = 0, totalExercises = 0, totalNoMistake = 0;
  for (const session of sessions) {
    for (const r of session.results || []) {
      totalExercises++;
      if (r.correct) totalCorrect++;
      if (r.firstAttemptCorrect !== false && r.correct) totalNoMistake++;
      if (!byType[r.type]) byType[r.type] = { correct: 0, total: 0, noMistake: 0 };
      byType[r.type].total++;
      if (r.correct) byType[r.type].correct++;
      if (r.firstAttemptCorrect !== false && r.correct) byType[r.type].noMistake++;
    }
  }
  return {
    totalSessions: sessions.length,
    totalExercises, totalCorrect, totalNoMistake, byType,
    recent: sessions.slice(-10).reverse(),
  };
}

// ── Email (not available without a server) ──────────────────────────────
export async function fetchEmailConfig() {
  return { enabled: false, smtpHost: '', smtpPort: 587, smtpUser: '', recipients: '', hasPassword: false, passLength: 0, webVersion: true };
}
export async function saveEmailConfig() {
  return { ok: true, webVersion: true };
}
export async function testEmail() {
  return { ok: false, error: 'שליחת מייל זמינה רק בגרסת המחשב (לא בגרסת הווב)' };
}
