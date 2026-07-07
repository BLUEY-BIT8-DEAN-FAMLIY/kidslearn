// Local account auth for the desktop app. Accounts live in users.json (in the
// same writable userData dir as the rest of the app data). Passwords are hashed
// with Node's built-in scrypt (per-user random salt) — never stored in plain
// text — so there are no external dependencies and no cloud service required.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.KIDSLEARN_DATA_DIR || path.join(__dirname, 'data');
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
  if (!verifyPassword(password, user.salt, user.hash)) return { error: 'אימייל או סיסמה שגויים' };
  const token = newToken();
  user.tokens = [...(user.tokens || []), token].slice(-10);   // keep last 10 devices
  writeUsers(users);
  return { ok: true, token, user: publicUser(user) };
}

export function userForToken(token) {
  if (!token) return null;
  const user = readUsers().find(u => Array.isArray(u.tokens) && u.tokens.includes(token));
  return user ? publicUser(user) : null;
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
