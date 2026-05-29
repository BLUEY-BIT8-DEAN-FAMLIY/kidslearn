import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// When packaged in Electron, KIDSLEARN_DATA_DIR points to a writable location
// (userData) since the app bundle itself is read-only (asar archive).
const DATA_DIR = process.env.KIDSLEARN_DATA_DIR || path.join(__dirname, 'data');
const BUNDLED_DATA_DIR = path.join(__dirname, 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const REVIEW_FILE = path.join(DATA_DIR, 'review.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  // On first run in packaged mode, seed user data from the bundled defaults
  // so the email/SMTP config and history carry over.
  if (DATA_DIR !== BUNDLED_DATA_DIR && fs.existsSync(BUNDLED_DATA_DIR)) {
    for (const f of ['history.json', 'config.json', 'review.json']) {
      const target = path.join(DATA_DIR, f);
      const source = path.join(BUNDLED_DATA_DIR, f);
      if (!fs.existsSync(target) && fs.existsSync(source)) {
        try { fs.copyFileSync(source, target); } catch {}
      }
    }
  }
  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify({ son: [], daughter: [] }, null, 2));
  }
  if (!fs.existsSync(REVIEW_FILE)) {
    fs.writeFileSync(REVIEW_FILE, JSON.stringify({ son: [], daughter: [] }, null, 2));
  }
}

// === HISTORY ===
export function readHistory() {
  ensureDataDir();
  try { return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8')); }
  catch { return { son: [], daughter: [] }; }
}

export function writeHistory(data) {
  ensureDataDir();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2));
}

export function saveSession(child, session) {
  const history = readHistory();
  if (!history[child]) history[child] = [];
  history[child].push({ ...session, savedAt: new Date().toISOString() });
  writeHistory(history);
  return session;
}

// === REVIEW QUEUE ===
// Stores actual exercises (with their generated values) that the kid got wrong on first attempt.
// They will resurface on the next session.

export function readReviewQueue() {
  ensureDataDir();
  try { return JSON.parse(fs.readFileSync(REVIEW_FILE, 'utf8')); }
  catch { return { son: [], daughter: [] }; }
}

export function writeReviewQueue(data) {
  ensureDataDir();
  fs.writeFileSync(REVIEW_FILE, JSON.stringify(data, null, 2));
}

/** Pull up to N items off the review queue (FIFO – oldest first). They are removed from the queue. */
export function popReviewQueue(child, count) {
  const data = readReviewQueue();
  const queue = data[child] || [];
  const taken = queue.splice(0, count);
  data[child] = queue;
  writeReviewQueue(data);
  return taken;
}

/**
 * Add wrong exercises from a session to the review queue.
 * Each entry stores the original exercise data so we can show the SAME question again.
 */
export function addWrongToReviewQueue(child, results) {
  const wrong = results
    .filter(r => r.firstAttemptCorrect === false && r.exerciseSnapshot)
    .map(r => r.exerciseSnapshot);
  if (!wrong.length) return;
  const data = readReviewQueue();
  if (!data[child]) data[child] = [];
  data[child].push(...wrong);
  // Cap queue at 30 to avoid unbounded growth
  data[child] = data[child].slice(-30);
  writeReviewQueue(data);
}

// === WEAKNESS / STATS ===
/**
 * Compute per-type failure rate over the last N sessions.
 * Uses firstAttemptCorrect as the source of truth (mistake counts even if eventually corrected).
 */
export function computeWeakness(child, lookbackSessions = 5) {
  const history = readHistory();
  const sessions = (history[child] || []).slice(-lookbackSessions);

  const stats = {};
  for (const session of sessions) {
    for (const r of session.results || []) {
      if (!stats[r.type]) stats[r.type] = { wrong: 0, total: 0 };
      stats[r.type].total++;
      // Mistake = was wrong on first attempt (even if later corrected)
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

// === CONFIG ===
const DEFAULT_CONFIG = {
  email: {
    enabled: false,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    recipients: '',
  },
};

export function readConfig() {
  ensureDataDir();
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
    return DEFAULT_CONFIG;
  }
  try { return { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) }; }
  catch { return DEFAULT_CONFIG; }
}

export function writeConfig(config) {
  ensureDataDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

/** Aggregate stats per child for the parents view. */
export function getStats(child) {
  const history = readHistory();
  const sessions = history[child] || [];

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
    totalExercises,
    totalCorrect,
    totalNoMistake,
    byType,
    recent: sessions.slice(-10).reverse(),
  };
}
