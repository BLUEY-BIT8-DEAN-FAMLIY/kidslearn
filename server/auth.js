// Local account auth for the desktop app. Accounts live in users.json (in the
// same writable userData dir as the rest of the app data). Passwords are hashed
// with Node's built-in scrypt (per-user random salt) — never stored in plain
// text — so there are no external dependencies and no cloud service required.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { resolveDataDir } from './dataDir.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Share the exact same data dir as storage.js (see server/dataDir.js) so the
// dev server and the installed app read one users.json, not two.
const DATA_DIR = resolveDataDir(path.join(__dirname, 'data'));
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const KEYLEN = 64;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readUsers() {
  try {
    const list = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeUsers(list) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
  fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2));
}

const normEmail = (e) => String(e || '').trim().toLowerCase();

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(String(password), salt, KEYLEN).toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  const test = crypto.scryptSync(String(password), salt, KEYLEN);
  const known = Buffer.from(hash, 'hex');
  return known.length === test.length && crypto.timingSafeEqual(test, known);
}

const newToken = () => crypto.randomBytes(32).toString('hex');
const publicUser = (u) => ({ email: u.email, name: u.name || '' });

export function userCount() {
  return readUsers().length;
}

export function registerUser({ email, password, name }) {
  email = normEmail(email);
  if (!EMAIL_RE.test(email)) return { error: 'כתובת אימייל לא תקינה' };
  if (String(password || '').length < 6) return { error: 'הסיסמה צריכה להיות לפחות 6 תווים' };
  const users = readUsers();
  if (users.some(u => u.email === email)) return { error: 'כבר קיים חשבון עם האימייל הזה' };
  const { salt, hash } = hashPassword(password);
  const token = newToken();
  const user = {
    email,
    name: String(name || '').trim(),
    salt,
    hash,
    tokens: [token],
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeUsers(users);
  return { ok: true, token, user: publicUser(user) };
}

export function loginUser({ email, password }) {
  email = normEmail(email);
  const users = readUsers();
  const user = users.find(u => u.email === email);
  // Verify even when the user is missing, to avoid leaking which emails exist.
  if (!user) { hashPassword(password || 'x'); return { error: 'אימייל או סיסמה שגויים' }; }
  // Google-created accounts have no local password.
  if (!user.hash) return { error: 'החשבון הזה נכנס עם "התחבר עם Google"' };
  if (!verifyPassword(password, user.salt, user.hash)) return { error: 'אימייל או סיסמה שגויים' };
  const token = newToken();
  user.tokens = [...(user.tokens || []), token].slice(-10);   // keep last 10 devices
  writeUsers(users);
  return { ok: true, token, user: publicUser(user) };
}

// Sign-in via a verified external identity (Google through Supabase). Such
// accounts are created on first sign-in and carry no local password.
export function externalLogin({ email, name }) {
  email = normEmail(email);
  if (!EMAIL_RE.test(email)) return { error: 'חשבון Google ללא אימייל תקין' };
  const users = readUsers();
  let user = users.find(u => u.email === email);
  if (!user) {
    user = {
      email,
      name: String(name || '').trim(),
      provider: 'google',
      tokens: [],
      createdAt: new Date().toISOString(),
    };
    users.push(user);
  }
  if (!user.name && name) user.name = String(name).trim();
  const token = newToken();
  user.tokens = [...(user.tokens || []), token].slice(-10);
  writeUsers(users);
  return { ok: true, token, user: publicUser(user) };
}

export function userForToken(token) {
  if (!token) return null;
  const user = readUsers().find(u => Array.isArray(u.tokens) && u.tokens.includes(token));
  return user ? publicUser(user) : null;
}

// ── Device trust: the family's own computer never sees the login screen ────
// After one successful register/login on a machine, that machine is marked
// trusted (device.json next to the rest of the data). From then on the app
// signs in silently as that account. Fresh installs (other people) still get
// the one-time registration screen. Logging out clears the trust.
const DEVICE_FILE = path.join(DATA_DIR, 'device.json');

export function rememberDevice(email) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DEVICE_FILE, JSON.stringify({ email: normEmail(email) }, null, 2));
  } catch {}
}

export function forgetDevice() {
  try { fs.unlinkSync(DEVICE_FILE); } catch {}
}

export function deviceLogin() {
  let email;
  try { email = normEmail(JSON.parse(fs.readFileSync(DEVICE_FILE, 'utf8')).email); } catch { return null; }
  const users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user) return null;
  const token = newToken();
  user.tokens = [...(user.tokens || []), token].slice(-10);
  writeUsers(users);
  return { ok: true, token, user: publicUser(user) };
}

export function logoutToken(token) {
  if (!token) return;
  const users = readUsers();
  let changed = false;
  for (const u of users) {
    if (Array.isArray(u.tokens) && u.tokens.includes(token)) {
      u.tokens = u.tokens.filter(t => t !== token);
      changed = true;
    }
  }
  if (changed) writeUsers(users);
}
