const BASE = '/api';

export async function fetchExercises(child, date) {
  const url = date ? `${BASE}/exercises/${child}?date=${date}` : `${BASE}/exercises/${child}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch exercises');
  return res.json();
}

export async function saveSession(payload) {
  const res = await fetch(`${BASE}/save-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchStats(child) {
  const res = await fetch(`${BASE}/stats/${child}`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchHistory(child) {
  const res = await fetch(`${BASE}/history/${child}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function fetchEmailConfig() {
  const res = await fetch(`${BASE}/config/email`);
  if (!res.ok) throw new Error('Failed to fetch email config');
  return res.json();
}

export async function saveEmailConfig(cfg) {
  const res = await fetch(`${BASE}/config/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cfg),
  });
  return res.json();
}

export async function testEmail() {
  const res = await fetch(`${BASE}/config/email/test`, { method: 'POST' });
  return res.json();
}
