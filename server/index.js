import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateMathExercises } from './exercises/mathGenerator.js';
import { generateHebrewExercises } from './exercises/hebrewGenerator.js';
import {
  saveSession, computeWeakness, getStats, readHistory, readConfig, writeConfig,
  popReviewQueue, addWrongToReviewQueue,
} from './storage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

// Serve the built React app from client/dist when running as a packaged app
const distPath = path.resolve(__dirname, '..', 'client', 'dist');
import('fs').then(({ existsSync }) => {
  if (existsSync(distPath)) {
    app.use(express.static(distPath));
    console.log('[server] serving static files from', distPath);
  }
});

const TYPE_LABELS = {
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
  word_add: 'בעיה מילולית – חיבור',
  word_sub: 'בעיה מילולית – חיסור',
  geo_sides: 'גאומטריה – צלעות',
  geo_corners: 'גאומטריה – פינות',
  geo_identify: 'גאומטריה – זיהוי צורה',
  geo_count_sides_compare: 'גאומטריה – השוואת צורות',
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
};

app.get('/api/exercises/:child', (req, res) => {
  const { child } = req.params;
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const weakness = computeWeakness(child);
  const reviewExercises = popReviewQueue(child, 3);

  if (child === 'son') {
    return res.json({ child, date, exercises: generateMathExercises(weakness, reviewExercises), weakness });
  }
  if (child === 'daughter') {
    return res.json({ child, date, exercises: generateHebrewExercises(weakness, reviewExercises), weakness });
  }
  return res.status(400).json({ error: 'Unknown child' });
});

app.post('/api/save-session', async (req, res) => {
  const { child, childName, date, results } = req.body;
  if (!child || !results) return res.status(400).json({ error: 'Missing data' });

  const session = { child, childName, date, results };
  saveSession(child, session);

  // Resurface wrong exercises into review queue for next session
  addWrongToReviewQueue(child, results);

  // Send email report (non-blocking)
  sendEmailReport(session, child).catch(err => console.error('Email failed:', err.message));

  res.json({ ok: true });
});

app.get('/api/history/:child', (req, res) => {
  const { child } = req.params;
  res.json({ sessions: readHistory()[child] || [] });
});

app.get('/api/stats/:child', (req, res) => {
  res.json(getStats(req.params.child));
});

// ── Hebrew TTS proxy (Google Translate, free, no API key) ─────────────────
// Caches MP3 buffers in-memory keyed by text to avoid re-fetching.
const ttsCache = new Map();
const TTS_CACHE_LIMIT = 200;

app.get('/api/tts', (req, res) => {
  const text = String(req.query.text || '').slice(0, 200);
  if (!text) return res.status(400).send('Missing text');

  const cached = ttsCache.get(text);
  if (cached) {
    res.set('Content-Type', 'audio/mpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    return res.end(cached);
  }

  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=iw&client=tw-ob`;
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
      ttsCache.set(text, buf);
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
        <p>מעכשיו תקבלו דוח אוטומטי בכל פעם שדין או ליה יסיימו את התרגילים היומיים שלהם.</p>
      </div>`,
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

async function sendEmailReport({ childName, date, results }, child) {
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
    subject: `דוח למידה – ${childName} – ${date}`,
    html,
  });
  console.log(`[email sent to ${cfg.recipients || cfg.smtpUser}]`);
}

// ── Daily reminder: send email if child hasn't done exercises by 20:00 ──────
const reminderSentDates = { son: '', daughter: '' };

async function sendReminderEmail(child, childName) {
  const cfg = readConfig().email;
  if (!cfg.enabled || !cfg.smtpUser || !cfg.smtpPass) return;

  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#e65100">⏰ תזכורת יומית – KidsLearn</h2>
      <p style="font-size:1.1em">${childName} עדיין לא השלים/ה את התרגילים היומיים!</p>
      <p>כדאי לשבת יחד עכשיו ולעשות את ${childName === 'דין' ? '10 התרגילים' : '10 תרגילי העברית'} לפני השינה.</p>
      <p style="margin-top:20px;color:#777;font-size:12px">נשלח מ-KidsLearn 🌟</p>
    </div>`;

  const transporter = nodemailer.createTransport({
    host: cfg.smtpHost,
    port: cfg.smtpPort,
    secure: cfg.smtpPort === 465,
    auth: { user: cfg.smtpUser, pass: cfg.smtpPass },
  });

  await transporter.sendMail({
    from: `"KidsLearn 🌟" <${cfg.smtpUser}>`,
    to: cfg.recipients || cfg.smtpUser,
    subject: `⏰ תזכורת: ${childName} לא השלים/ה את התרגילים היום`,
    html,
  });
  console.log(`[reminder sent for ${child}]`);
}

function checkDailyCompletion() {
  const now = new Date();
  const hour = now.getHours();
  if (hour < 20) return; // only check after 20:00 local time

  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const history = readHistory();

  for (const [child, childName] of [['son', 'דין'], ['daughter', 'ליה']]) {
    if (reminderSentDates[child] === today) continue; // already sent today

    const sessions = history[child] || [];
    const doneToday = sessions.some(s => s.date === today || (s.savedAt && s.savedAt.startsWith(today)));

    if (!doneToday) {
      reminderSentDates[child] = today;
      sendReminderEmail(child, childName).catch(err =>
        console.error(`[reminder failed for ${child}]:`, err.message)
      );
    }
  }
}

// Check every 30 minutes; also check 10 seconds after startup in case server starts after 20:00
setInterval(checkDailyCompletion, 30 * 60 * 1000);
setTimeout(checkDailyCompletion, 10_000);

// SPA fallback – serve index.html for any non-API route
import('fs').then(({ existsSync }) => {
  const indexPath = path.join(distPath, 'index.html');
  if (existsSync(indexPath)) {
    app.get(/^\/(?!api\/).*/, (req, res) => res.sendFile(indexPath));
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`KidsLearn server running on http://localhost:${PORT}`));
