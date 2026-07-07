import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateMathExercises, generatePrepMath } from './exercises/mathGenerator.js';
import { generateHebrewExercises } from './exercises/hebrewGenerator.js';
import { generateEnglishExercises } from './exercises/englishGenerator.js';
import { fitSessionToCount, planIsActive } from './exercises/curriculum.js';
import {
  saveSession, computeWeakness, getStats, readHistory, readConfig, writeConfig,
  popReviewQueue, addWrongToReviewQueue,
  readChildren, getChild, addChild, updateChild, deleteChild,
  getProgress, applySessionProgress,
  getMistakes, updateMistakes,
  countTodayExercises, getPlanStatus,
  maybeAwardSticker, getRewards,
} from './storage.js';
import {
  registerUser, loginUser, userForToken, logoutToken, userCount,
} from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
// Allow larger bodies so child photos (base64 data URLs) fit comfortably
app.use(express.json({ limit: '8mb' }));

// ── Accounts (local register / login) ─────────────────────────────────────
// Passwords are hashed server-side; the client keeps only an opaque token.
const bearerToken = (req) => {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) return h.slice(7);
  return (req.query && req.query.token) || (req.body && req.body.token) || '';
};

app.get('/api/auth/status', (req, res) => {
  res.json({ hasUsers: userCount() > 0 });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body || {};
  const r = registerUser({ email, password, name });
  if (r.error) return res.status(400).json({ error: r.error });
  res.json({ ok: true, token: r.token, user: r.user });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const r = loginUser({ email, password });
  if (r.error) return res.status(401).json({ error: r.error });
  res.json({ ok: true, token: r.token, user: r.user });
});

app.get('/api/auth/me', (req, res) => {
  const user = userForToken(bearerToken(req));
  if (!user) return res.status(401).json({ error: 'לא מחובר' });
  res.json({ ok: true, user });
});

app.post('/api/auth/logout', (req, res) => {
  logoutToken(bearerToken(req));
  res.json({ ok: true });
});

// Serve the built React app from client/dist when running as a packaged app
const distPath = path.resolve(__dirname, '..', 'client', 'dist');
import('fs').then(({ existsSync }) => {
  if (existsSync(distPath)) {
    app.use(express.static(distPath));
    console.log('[server] serving static files from', distPath);
  }
});

const TYPE_LABELS = {
  addition: 'חיבור',
  subtraction: 'חיסור',
  complete: 'השלמה למספר עגול',
  addition_10: 'חיבור עד 10',
  addition_20: 'חיבור עד 20',
  subtraction_10: 'חיסור עד 10',
  subtraction_20: 'חיסור עד 20',
  addition_30: 'חיבור עד 30',
  subtraction_30: 'חיסור עד 30',
  complete_10: 'השלמה ל-10',
  complete_20: 'השלמה ל-20',
  compare: 'השוואת מספרים',
  sequence: 'רצף מספרים',
  tens_in_number: 'כמה עשרות',
  ones_in_number: 'כמה אחדות',
  build_tens_ones: 'בניית מספר – עשרות ואחדות',
  expanded_form: 'פירוק לעשרות ואחדות',
  hundreds_in_number: 'כמה מאות',
  build_hundreds: 'בניית מספר תלת-ספרתי',
  expanded_form_3: 'פירוק מאות, עשרות ואחדות',
  skip_count: 'דילוגים – עולה',
  skip_count_back: 'דילוגים – יורד',
  skip_count_100: 'דילוגים ב-100',
  word_add: 'בעיה מילולית – חיבור',
  word_sub: 'בעיה מילולית – חיסור',
  geo_sides: 'גאומטריה – צלעות',
  geo_corners: 'גאומטריה – פינות',
  geo_identify: 'גאומטריה – זיהוי צורה',
  geo_count_sides_compare: 'גאומטריה – השוואת צורות',
  geo_count: 'גאומטריה – ספירת צורות',
  count_objects: 'ספירת חפצים',
  compare_quantities: 'השוואת כמויות',
  number_after: 'המספר שאחרי',
  number_before: 'המספר שלפני',
  visual_add: 'חיבור עם ציורים',
  visual_sub: 'חיסור עם ציורים',
  pattern: 'חוקיות (דגם חוזר)',
  biggest_number: 'המספר הגדול ביותר',
  smallest_number: 'המספר הקטן ביותר',
  round_tens_add: 'חיבור עשרות שלמות',
  round_tens_sub: 'חיסור עשרות שלמות',
  two_digit_add: 'חיבור דו-ספרתי',
  two_digit_sub: 'חיסור דו-ספרתי',
  missing_number: 'מספר חסר בתרגיל',
  even_odd: 'זוגי או אי-זוגי',
  repeated_add: 'חיבור חוזר (לקראת כפל)',
  name_letter: 'שם האות',
  word_starts_with: 'מילה שמתחילה ב-',
  fill_letter: 'השלמת אות במילה',
  fill_letter_choice: 'בחירת אות חסרה',
  find_letter: 'מציאת אות',
  match_letter: 'התאמת אות למילה',
  type_letter: 'כתיבת אות',
  count_letter: 'ספירת אותיות',
  first_letter_of_word: 'אות ראשונה',
  odd_one_out: 'מה שונה',
  read_word: 'קריאת מילה',
  last_letter: 'אות אחרונה',
  en_letter_name: 'אנגלית – שם האות',
  en_letter_find: 'אנגלית – מציאת אות',
  en_first_letter: 'אנגלית – אות פותחת',
  en_word_to_pic: 'אנגלית – מילה לתמונה',
  en_pic_to_word: 'אנגלית – תמונה למילה',
  en_listen_pick: 'אנגלית – הבנת הנשמע',
  en_translate_to_he: 'אנגלית – תרגום לעברית',
  en_translate_to_en: 'אנגלית – תרגום לאנגלית',
  en_missing_letter: 'אנגלית – אות חסרה',
  en_spell: 'אנגלית – כתיבת מילה',
};

// Review questions resurface per child AND per subject, so a kid who learns
// both math and Hebrew never gets a letter question inside a math session.
const reviewKey = (child, subject) => `${child}:${subject || 'math'}`;

app.get('/api/exercises/:child', (req, res) => {
  const { child } = req.params;
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const profile = getChild(child);
  if (!profile) return res.status(404).json({ error: 'Unknown child' });

  // A child can have more than one subject; honour the requested one if enabled.
  const requested = String(req.query.subject || '');
  const subject = profile.subjects.includes(requested) ? requested : profile.subjects[0];

  // Optional operation focus for math sessions ('add' | 'sub' | 'mix').
  const op = String(req.query.op || 'mix');

  const weakness = computeWeakness(child);
  const reviewExercises = popReviewQueue(reviewKey(child, subject), 3);
  // Prep-track children (עולה לכיתה א׳/ב׳) get curriculum-stage sessions that
  // climb automatically; everyone else keeps the level/mixed behaviour.
  const progress = getProgress(child, subject);
  // Every ladder starts at the parent-chosen level and climbs from there.
  const effectiveStage = subject === 'english'
    ? Math.max(progress.stage, profile.englishLevel || 1)
    : subject === 'hebrew'
      ? Math.max(progress.stage, profile.hebrewLevel || 1)
      : Math.max(progress.stage, profile.mathStage || 1);
  const makeSession = () => subject === 'english'
    ? generateEnglishExercises(effectiveStage, reviewExercises, profile.grade)
    : subject === 'hebrew'
      ? generateHebrewExercises(weakness, reviewExercises, effectiveStage, profile.grade)
      : profile.grade
        ? generatePrepMath(profile.grade, effectiveStage, reviewExercises, op)
        : generateMathExercises(weakness, reviewExercises, profile.mathLevel, op);

  // Daily summer plan: size the session to exactly what's left of today's
  // quota, so one session (or a short top-up) completes the subject.
  const planTarget = planIsActive(profile, date) ? profile.dailyPlan[subject] : null;
  let exercises;
  if (planTarget) {
    const remaining = planTarget - countTodayExercises(child, subject, date);
    exercises = remaining > 0 ? fitSessionToCount(makeSession, remaining) : makeSession();
  } else {
    exercises = makeSession();
  }

  return res.json({ child, subject, date, exercises, weakness, track: profile.grade || null, stage: effectiveStage });
});

// ── Mistakes collection (תרגול טעויות) ─────────────────────────────────────
// Everything each child got wrong on first attempt, per subject, kept until
// the child solves that exact question correctly on the first try.
app.get('/api/mistakes/:child', (req, res) => {
  const { child } = req.params;
  const profile = getChild(child);
  if (!profile) return res.status(404).json({ error: 'Unknown child' });
  const mistakes = {};
  for (const s of profile.subjects) mistakes[s] = getMistakes(child, s);
  res.json({ child, mistakes });
});

// ── Children (profiles) ───────────────────────────────────────────────────
app.get('/api/children', (req, res) => {
  // Attach today's daily-plan progress so the home screen can show it.
  const today = new Date().toISOString().slice(0, 10);
  const children = readChildren().map(c => ({ ...c, todayPlan: getPlanStatus(c, today) }));
  res.json({ children });
});

app.post('/api/children', (req, res) => {
  const { name, gender, subject, subjects, mathLevel, grade, englishLevel, hebrewLevel, mathStage, dailyPlan, planUntil, avatar, photo } = req.body || {};
  if (!name || !String(name).trim()) return res.status(400).json({ error: 'חסר שם' });
  // Reject oversized photos (defensive – client already downscales)
  if (photo && photo.length > 6_000_000) return res.status(413).json({ error: 'התמונה גדולה מדי' });
  const child = addChild({ name, gender, subject, subjects, mathLevel, grade, englishLevel, hebrewLevel, mathStage, dailyPlan, planUntil, avatar, photo });
  res.json({ ok: true, child });
});

app.put('/api/children/:id', (req, res) => {
  const { name, gender, subject, subjects, mathLevel, grade, englishLevel, hebrewLevel, mathStage, dailyPlan, planUntil, avatar, photo } = req.body || {};
  if (name !== undefined && !String(name).trim()) return res.status(400).json({ error: 'חסר שם' });
  if (photo && photo.length > 6_000_000) return res.status(413).json({ error: 'התמונה גדולה מדי' });
  const child = updateChild(req.params.id, { name, gender, subject, subjects, mathLevel, grade, englishLevel, hebrewLevel, mathStage, dailyPlan, planUntil, avatar, photo });
  if (!child) return res.status(404).json({ error: 'הילד לא נמצא' });
  res.json({ ok: true, child });
});

app.delete('/api/children/:id', (req, res) => {
  const ok = deleteChild(req.params.id);
  if (!ok) return res.status(400).json({ error: 'לא ניתן למחוק את הילד הזה' });
  res.json({ ok: true });
});

app.post('/api/save-session', async (req, res) => {
  const { child, childName, date, results, subject, practice } = req.body;
  if (!child || !results) return res.status(400).json({ error: 'Missing data' });

  // The mistakes collection always updates: new mistakes join it, questions
  // solved correctly on the first attempt leave it. Runs BEFORE the session
  // is written to history — the first call lazily backfills from history, and
  // saving first would make it count this session's results twice.
  updateMistakes(child, subject || 'math', results);

  const session = { child, childName, date, results, subject, practice: !!practice };
  saveSession(child, session);

  const profile = getChild(child);
  let progress = null;
  if (!practice) {
    // Resurface wrong exercises into review queue for next session (per subject)
    addWrongToReviewQueue(reviewKey(child, subject), results);
    // Adaptive difficulty: consecutive successful days climb the child's
    // prep-track stage / math level automatically. Practice sessions are
    // remedial by nature and never touch the streak.
    progress = profile
      ? applySessionProgress(profile, subject, date || new Date().toISOString().slice(0, 10), results)
      : null;
  }

  // Send email report (non-blocking)
  sendEmailReport(session, child).catch(err => console.error('Email failed:', err.message));

  // Daily-plan status after this session (for the "day complete" celebration),
  // and today's sticker when the day's learning was earned.
  const day = date || new Date().toISOString().slice(0, 10);
  const planStatus = profile ? getPlanStatus(profile, day) : null;
  const sticker = profile ? maybeAwardSticker(profile, day, planStatus) : null;

  res.json({ ok: true, progress, planStatus, sticker });
});

// ── Rewards: stars, streak, sticker album, achievements ───────────────────
app.get('/api/rewards/:child', (req, res) => {
  const profile = getChild(req.params.child);
  if (!profile) return res.status(404).json({ error: 'Unknown child' });
  res.json({ child: profile.id, ...getRewards(profile.id) });
});

app.get('/api/history/:child', (req, res) => {
  const { child } = req.params;
  res.json({ sessions: readHistory()[child] || [] });
});

app.get('/api/stats/:child', (req, res) => {
  const child = req.params.child;
  res.json({
    ...getStats(child),
    progress: {
      math: getProgress(child, 'math'),
      hebrew: getProgress(child, 'hebrew'),
      english: getProgress(child, 'english'),
    },
  });
});

// ── Hebrew TTS proxy (Google Translate, free, no API key) ─────────────────
// Caches MP3 buffers in-memory keyed by text to avoid re-fetching.
const ttsCache = new Map();
const TTS_CACHE_LIMIT = 200;

app.get('/api/tts', (req, res) => {
  const text = String(req.query.text || '').slice(0, 200);
  if (!text) return res.status(400).send('Missing text');
  // Hebrew by default; English voice for the English exercises.
  const lang = req.query.lang === 'en' ? 'en' : 'iw';

  const cacheKey = `${lang}|${text}`;
  const cached = ttsCache.get(cacheKey);
  if (cached) {
    res.set('Content-Type', 'audio/mpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    return res.end(cached);
  }

  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
  https.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': '*/*',
      'Referer': 'https://translate.google.com/',
    },
  }, (upstream) => {
    if (upstream.statusCode !== 200) {
      console.error('[TTS] upstream status', upstream.statusCode);
      upstream.resume();
      return res.status(502).send('TTS upstream error');
    }
    const chunks = [];
    upstream.on('data', c => chunks.push(c));
    upstream.on('end', () => {
      const buf = Buffer.concat(chunks);
      // Cache result (evict oldest if over limit)
      if (ttsCache.size >= TTS_CACHE_LIMIT) {
        const firstKey = ttsCache.keys().next().value;
        ttsCache.delete(firstKey);
      }
      ttsCache.set(cacheKey, buf);
      res.set('Content-Type', 'audio/mpeg');
      res.set('Cache-Control', 'public, max-age=86400');
      res.end(buf);
    });
  }).on('error', err => {
    console.error('[TTS] proxy error:', err.message);
    res.status(500).send('TTS error');
  });
});

// Email config
app.get('/api/config/email', (req, res) => {
  const cfg = readConfig().email;
  res.json({
    enabled: cfg.enabled,
    smtpHost: cfg.smtpHost,
    smtpPort: cfg.smtpPort,
    smtpUser: cfg.smtpUser,
    recipients: cfg.recipients,
    hasPassword: !!cfg.smtpPass,
    passLength: (cfg.smtpPass || '').length,
  });
});

app.post('/api/config/email', (req, res) => {
  const { enabled, smtpHost, smtpPort, smtpUser, smtpPass, recipients } = req.body;
  const config = readConfig();
  const passProvided = smtpPass !== undefined && smtpPass !== '';
  const newPass = passProvided
    // Strip ALL whitespace (Google sometimes displays App Passwords with spaces)
    ? String(smtpPass).replace(/\s+/g, '')
    : config.email.smtpPass;
  config.email = {
    enabled: !!enabled,
    smtpHost: smtpHost || 'smtp.gmail.com',
    smtpPort: parseInt(smtpPort) || 587,
    smtpUser: smtpUser || '',
    smtpPass: newPass,
    recipients: recipients || '',
  };
  writeConfig(config);
  console.log('[config saved]', {
    smtpUser: config.email.smtpUser,
    passLength: config.email.smtpPass.length,
    passChanged: passProvided,
    recipients: config.email.recipients,
  });
  res.json({ ok: true, passLength: config.email.smtpPass.length, passChanged: passProvided });
});

app.post('/api/config/email/test', async (req, res) => {
  const cfg = readConfig().email;
  if (!cfg.smtpUser || !cfg.smtpPass) return res.status(400).json({ ok: false, error: 'חסרים פרטי SMTP' });
  try {
    const transporter = nodemailer.createTransport({
      host: cfg.smtpHost,
      port: cfg.smtpPort,
      secure: cfg.smtpPort === 465,
      auth: { user: cfg.smtpUser, pass: cfg.smtpPass },
    });
    await transporter.sendMail({
      from: `"KidsLearn 🌟" <${cfg.smtpUser}>`,
      to: cfg.recipients || cfg.smtpUser,
      subject: 'KidsLearn – מייל בדיקה',
      html: `<div dir="rtl" style="font-family:Arial,sans-serif;padding:20px">
        <h2 style="color:#5c6bc0">✅ הגדרות המייל פועלות!</h2>
        <p>מעכשיו תקבלו דוח אוטומטי בכל פעם שהילדים יסיימו את התרגילים היומיים שלהם.</p>
      </div>`,
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── Background-removal config + proxy (remove.bg) ─────────────────────────
// The API key is stored locally and never echoed back to the client.
app.get('/api/config/removebg', (req, res) => {
  const cfg = readConfig().removeBg || {};
  res.json({ hasKey: !!cfg.apiKey, keyLength: (cfg.apiKey || '').length });
});

app.post('/api/config/removebg', (req, res) => {
  const { apiKey } = req.body || {};
  const config = readConfig();
  const provided = apiKey !== undefined && apiKey !== '';
  config.removeBg = {
    apiKey: provided ? String(apiKey).trim() : (config.removeBg?.apiKey || ''),
  };
  writeConfig(config);
  res.json({ ok: true, hasKey: !!config.removeBg.apiKey, keyLength: config.removeBg.apiKey.length });
});

// Remove the background from an uploaded photo. Returns a transparent PNG.
app.post('/api/remove-bg', async (req, res) => {
  const { image } = req.body || {};
  if (!image) return res.status(400).json({ error: 'חסרה תמונה' });
  const apiKey = (readConfig().removeBg?.apiKey || '').trim();
  if (!apiKey) return res.status(400).json({ error: 'לא הוגדר מפתח API להסרת רקע' });

  const b64 = String(image).replace(/^data:image\/\w+;base64,/, '');
  try {
    const body = new URLSearchParams();
    body.set('image_file_b64', b64);
    body.set('size', 'auto');
    const r = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body,
    });
    if (!r.ok) {
      let msg = `remove.bg החזיר שגיאה (${r.status})`;
      if (r.status === 403) msg = 'מפתח ה-API שגוי או שנגמרו הקרדיטים';
      else {
        try { const e = await r.json(); if (e?.errors?.[0]?.title) msg = e.errors[0].title; } catch {}
      }
      console.error('[remove-bg]', r.status, msg);
      return res.status(502).json({ error: msg });
    }
    const buf = Buffer.from(await r.arrayBuffer());
    return res.json({ ok: true, image: `data:image/png;base64,${buf.toString('base64')}` });
  } catch (e) {
    console.error('[remove-bg] proxy error:', e.message);
    return res.status(502).json({ error: 'הסרת הרקע נכשלה: ' + e.message });
  }
});

async function sendEmailReport({ childName, date, results, practice }, child) {
  const total = results.length;
  // "Mistake" = first attempt was wrong (even if eventually corrected)
  const noMistake = results.filter(r => r.firstAttemptCorrect !== false && r.correct).length;
  const finallyCorrect = results.filter(r => r.correct).length;

  const rows = results.map(r => {
    const hadMistake = r.firstAttemptCorrect === false;
    const finallyOk = r.correct;
    const bg = !hadMistake ? '#e8f5e9' : finallyOk ? '#fff3e0' : '#fce4ec';
    const status = !hadMistake ? '✅ ללא טעות' : finallyOk ? '⚠️ תוקן אחרי טעות' : '❌ לא נפתר';
    return `<tr style="background:${bg}">
      <td style="padding:6px 12px;border:1px solid #ddd">${r.id}</td>
      <td style="padding:6px 12px;border:1px solid #ddd" dir="${r.dir || 'rtl'}">${r.question.replace(/\n/g, '<br>')}</td>
      <td style="padding:6px 12px;border:1px solid #ddd">${r.answer}</td>
      <td style="padding:6px 12px;border:1px solid #ddd;text-align:center">${status}</td>
      <td style="padding:6px 12px;border:1px solid #ddd;text-align:center">${r.attempts}</td>
    </tr>`;
  }).join('');

  // Topics to strengthen – based on cumulative weakness
  const weakness = computeWeakness(child);
  const weakTopics = Object.entries(weakness)
    .filter(([_, rate]) => rate > 0.3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const weakSection = weakTopics.length ? `
    <div style="background:#fff3e0;border-right:4px solid #fb8c00;border-radius:8px;padding:14px;margin-top:20px">
      <h3 style="margin:0 0 10px 0;color:#e65100">🎯 נושאים לחיזוק</h3>
      <ul style="margin:6px 16px;padding:0">
        ${weakTopics.map(([t, rate]) => `<li><strong>${TYPE_LABELS[t] || t}</strong> – שיעור טעויות ${Math.round(rate * 100)}%</li>`).join('')}
      </ul>
      <p style="margin:10px 0 0 0;font-size:0.9em;color:#5d4037">💡 התרגילים האלה יוצגו יותר במפגשים הבאים, וגם תרגילים שנכשלו יחזרו אוטומטית.</p>
    </div>` : '';

  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto">
      <h2 style="color:#5c6bc0">דוח למידה יומי – ${childName} 🎉</h2>
      <p><strong>תאריך:</strong> ${date}</p>
      <div style="display:flex;gap:12px;margin:14px 0">
        <div style="flex:1;background:#e8f5e9;padding:12px;border-radius:8px;text-align:center">
          <div style="font-size:1.4em;font-weight:bold;color:#2e7d32">${noMistake}/${total}</div>
          <div style="font-size:0.85em;color:#555">ללא טעות מהפעם הראשונה</div>
        </div>
        <div style="flex:1;background:#fff3e0;padding:12px;border-radius:8px;text-align:center">
          <div style="font-size:1.4em;font-weight:bold;color:#e65100">${finallyCorrect - noMistake}</div>
          <div style="font-size:0.85em;color:#555">תוקן אחרי טעות</div>
        </div>
        <div style="flex:1;background:#ffebee;padding:12px;border-radius:8px;text-align:center">
          <div style="font-size:1.4em;font-weight:bold;color:#b71c1c">${total - finallyCorrect}</div>
          <div style="font-size:0.85em;color:#555">לא נפתר</div>
        </div>
      </div>
      <table style="border-collapse:collapse;width:100%;font-size:0.9em">
        <thead>
          <tr style="background:#5c6bc0;color:#fff">
            <th style="padding:8px 12px;border:1px solid #ddd">#</th>
            <th style="padding:8px 12px;border:1px solid #ddd">שאלה</th>
            <th style="padding:8px 12px;border:1px solid #ddd">תשובה נכונה</th>
            <th style="padding:8px 12px;border:1px solid #ddd">סטטוס</th>
            <th style="padding:8px 12px;border:1px solid #ddd">ניסיונות</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      ${weakSection}
      <p style="margin-top:20px;color:#777;font-size:12px">נשלח מ-KidsLearn 🌟</p>
    </div>`;

  const cfg = readConfig().email;
  if (!cfg.smtpUser || !cfg.smtpPass) {
    console.log('[email skipped – no SMTP credentials configured]');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: cfg.smtpHost,
    port: cfg.smtpPort,
    secure: cfg.smtpPort === 465,
    auth: { user: cfg.smtpUser, pass: cfg.smtpPass },
  });

  await transporter.sendMail({
    from: `"KidsLearn 🌟" <${cfg.smtpUser}>`,
    to: cfg.recipients || cfg.smtpUser,
    subject: `${practice ? 'תרגול טעויות' : 'דוח למידה'} – ${childName} – ${date}`,
    html,
  });
  console.log(`[email sent to ${cfg.recipients || cfg.smtpUser}]`);
}

// NOTE: The old "you haven't done exercises today" daily reminder was removed.
// In the installed desktop app the server only runs while the app is open, so
// the reminder fired right when you opened KidsLearn in the evening *to do*
// the exercises — sending a false "didn't do exercises" email before you'd
// even started. The learning-report email (sent when a session is completed)
// is unaffected and still works.

// SPA fallback – serve index.html for any non-API route
import('fs').then(({ existsSync }) => {
  const indexPath = path.join(distPath, 'index.html');
  if (existsSync(indexPath)) {
    app.get(/^\/(?!api\/).*/, (req, res) => res.sendFile(indexPath));
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`KidsLearn server running on http://localhost:${PORT}`));
