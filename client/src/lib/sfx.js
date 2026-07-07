// Tiny sound-effects engine (WebAudio, no audio files).
// Instant feedback sounds — one of the strongest engagement levers in kids
// learning apps. Volumes are kept low and everything is failure-safe.

let ctx = null;

function audioCtx() {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq, startSec, durSec, type = 'sine', volume = 0.12) {
  const ac = audioCtx();
  if (!ac) return;
  const t0 = ac.currentTime + startSec;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durSec);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + durSec + 0.05);
}

/** Cheerful two-note ding on a correct answer. */
export function playCorrect() {
  try {
    tone(660, 0, 0.12, 'triangle');
    tone(880, 0.1, 0.2, 'triangle');
  } catch {}
}

/** Soft low "boop" on a wrong answer (gentle, not punishing). */
export function playWrong() {
  try {
    tone(220, 0, 0.18, 'sine', 0.08);
    tone(180, 0.14, 0.2, 'sine', 0.06);
  } catch {}
}

/** Little fanfare for finishing a session / earning a sticker. */
export function playFanfare() {
  try {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.22, 'triangle', 0.1));
    tone(1319, 0.55, 0.35, 'triangle', 0.08);
  } catch {}
}
