// Shared Hebrew Text-to-Speech utility.
// Primary: server proxy to Google Translate TTS (real Hebrew voice, no install).
// Fallback: Web Speech API (only works if a Hebrew voice is installed).

let _currentAudio = null;
let _seqId = 0;   // monotonically increasing claim id for speech sequences

export function cleanForSpeech(text) {
  return String(text || '')
    .replace(/[_]+/g, ' ')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function speakViaWebAPI(text, lang = 'he', onEnd = null) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) { onEnd?.(); return; }
  const cleaned = cleanForSpeech(text);
  if (!cleaned) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  setTimeout(() => {
    const utter = new SpeechSynthesisUtterance(cleaned);
    const wanted = lang === 'en' ? 'en' : 'he';
    utter.lang = wanted === 'en' ? 'en-US' : 'he-IL';
    utter.rate = 0.85;
    utter.pitch = 1.05;
    utter.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const voice =
      voices.find(v => v.lang === utter.lang) ||
      voices.find(v => v.lang?.toLowerCase().startsWith(wanted));
    if (voice) {
      utter.voice = voice;
      utter.lang = voice.lang;
    }
    if (onEnd) {
      utter.onend = () => onEnd();
      utter.onerror = () => onEnd();
    }
    window.speechSynthesis.speak(utter);
  }, 50);
}

export function stopSpeech() {
  _seqId++;   // invalidate any running speakParts sequence
  if (_currentAudio) {
    try { _currentAudio.pause(); } catch {}
    _currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

const WEB = import.meta.env.VITE_TARGET === 'web';

// `interrupt: false` lets the sequence player chain parts without each part
// cancelling the previous one; `onEnd` fires when this part finishes.
function speakText(text, lang, { interrupt = true, onEnd = null } = {}) {
  const cleaned = cleanForSpeech(text);
  if (!cleaned) { onEnd?.(); return; }

  if (interrupt) stopSpeech();

  // The static web version has no server TTS proxy – use the browser voice.
  if (WEB) {
    speakViaWebAPI(text, lang, onEnd);
    return;
  }

  const url = `/api/tts?text=${encodeURIComponent(cleaned)}${lang === 'en' ? '&lang=en' : ''}`;
  const audio = new Audio(url);
  audio.preload = 'auto';
  _currentAudio = audio;

  audio.onended = () => { if (onEnd) onEnd(); };

  audio.play().catch(err => {
    console.warn('[TTS] online failed, trying Web Speech API:', err?.message || err);
    speakViaWebAPI(text, lang, onEnd);
  });

  audio.onerror = () => {
    console.warn('[TTS] audio playback error – falling back to Web Speech API');
    speakViaWebAPI(text, lang, onEnd);
  };
}

export function speakHebrew(text) {
  speakText(text, 'he');
}

/** Speak English text with an English voice – used by the English exercises. */
export function speakEnglish(text) {
  speakText(text, 'en');
}

/**
 * Speak several parts back-to-back, each in its own language, e.g. the Hebrew
 * question followed by the English word — so a child who can't read yet hears
 * the WHOLE exercise. A new call (or any speak*) cancels the running sequence.
 */
export function speakParts(parts) {
  const list = (parts || []).filter(p => p && cleanForSpeech(p.text));
  if (!list.length) return;
  stopSpeech();                 // also invalidates any previous sequence
  const seq = _seqId;           // our claim on the speech channel
  const playNext = (i) => {
    if (seq !== _seqId || i >= list.length) return;   // superseded or done
    speakText(list[i].text, list[i].lang, {
      interrupt: false,
      onEnd: () => setTimeout(() => playNext(i + 1), 250),   // small natural pause
    });
  };
  playNext(0);
}

const CHEERS = [
  'כל הכבוד!',
  'מצוין!',
  'יופי!',
  'נכון מאוד!',
  'אלופה!',
  'יפה מאוד!',
  'ענית נכון!',
  'וואו, איזה כיף!',
  'מדהים!',
  'את גאונה!',
];

/**
 * Speak the answer (full word for completion exercises) plus a random cheer.
 * Used when the child answers correctly.
 */
export function speakCelebration(answerText) {
  const cheer = CHEERS[Math.floor(Math.random() * CHEERS.length)];
  const t = answerText ? `${answerText}! ${cheer}` : cheer;
  speakHebrew(t);
}

const ENCOURAGE = [
  'נסי שוב, את יכולה!',
  'כמעט! עוד נסיון',
  'אל תוותרי, נסי שוב',
  'את על הדרך הנכונה!',
];

/** Encourage the child after a wrong answer. */
export function speakEncouragement() {
  const phrase = ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)];
  speakHebrew(phrase);
}
