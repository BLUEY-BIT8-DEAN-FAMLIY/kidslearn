// API layer. In the desktop/server build this talks to the Express server.
// In the static web build (VITE_TARGET=web) it delegates to a localStorage-
// backed implementation so the app runs entirely in the browser.
import * as local from './lib/localApi.js';

const WEB = import.meta.env.VITE_TARGET === 'web';
const BASE = '/api';

// ── Server implementations ──────────────────────────────────────────────
async function serverFetchExercises(child, date, subject) {
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  if (subject) params.set('subject', subject);
  const qs = params.toString();
  const url = qs ? `${BASE}/exercises/${child}?${qs}` : `${BASE}/exercises/${child}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch exercises');
  return res.json();
}

async function serverSaveSession(payload) {
  const res = await fetch(`${BASE}/save-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

async function serverFetchStats(child) {
  const res = await fetch(`${BASE}/stats/${child}`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

async function serverFetchHistory(child) {
  const res = await fetch(`${BASE}/history/${child}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

async function serverFetchChildren() {
  const res = await fetch(`${BASE}/children`);
  if (!res.ok) throw new Error('Failed to fetch children');
  return res.json();
}

async function serverAddChild(payload) {
  const res = await fetch(`${BASE}/children`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add child');
  return data;
}

async function serverUpdateChild(id, payload) {
  const res = await fetch(`${BASE}/children/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update child');
  return data;
}

async function serverDeleteChild(id) {
  const res = await fetch(`${BASE}/children/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete child');
  return data;
}

async function serverFetchEmailConfig() {
  const res = await fetch(`${BASE}/config/email`);
  if (!res.ok) throw new Error('Failed to fetch email config');
  return res.json();
}

async function serverSaveEmailConfig(cfg) {
  const res = await fetch(`${BASE}/config/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cfg),
  });
  return res.json();
}

async function serverTestEmail() {
  const res = await fetch(`${BASE}/config/email/test`, { method: 'POST' });
  return res.json();
}

// ── Background removal (desktop only — proxies to the configured API) ──────
async function serverRemoveBackground(image) {
  const res = await fetch(`${BASE}/remove-bg`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'הסרת הרקע נכשלה');
  return data; // { ok, image }
}

async function serverFetchBgConfig() {
  const res = await fetch(`${BASE}/config/removebg`);
  if (!res.ok) throw new Error('Failed to fetch background-removal config');
  return res.json();
}

async function serverSaveBgConfig(cfg) {
  const res = await fetch(`${BASE}/config/removebg`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cfg),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'שמירה נכשלה');
  return data;
}

// ── Public API (picks local or server) ──────────────────────────────────
export const fetchExercises   = WEB ? local.fetchExercises   : serverFetchExercises;
export const saveSession      = WEB ? local.saveSession      : serverSaveSession;
export const fetchStats       = WEB ? local.fetchStats       : serverFetchStats;
export const fetchHistory     = WEB ? local.fetchHistory     : serverFetchHistory;
export const fetchChildren    = WEB ? local.fetchChildren    : serverFetchChildren;
export const addChild         = WEB ? local.addChild         : serverAddChild;
export const updateChild      = WEB ? local.updateChild      : serverUpdateChild;
export const deleteChild      = WEB ? local.deleteChild      : serverDeleteChild;
export const fetchEmailConfig = WEB ? local.fetchEmailConfig : serverFetchEmailConfig;
export const saveEmailConfig  = WEB ? local.saveEmailConfig  : serverSaveEmailConfig;
export const testEmail        = WEB ? local.testEmail        : serverTestEmail;
export const removeBackground = WEB ? local.removeBackground : serverRemoveBackground;
export const fetchBgConfig    = WEB ? local.fetchBgConfig    : serverFetchBgConfig;
export const saveBgConfig     = WEB ? local.saveBgConfig     : serverSaveBgConfig;

export const IS_WEB = WEB;
