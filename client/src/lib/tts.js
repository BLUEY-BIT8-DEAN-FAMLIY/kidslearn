// Shared Hebrew Text-to-Speech utility.
// Primary: server proxy to Google Translate TTS (real Hebrew voice, no install).
// Fallback: Web Speech API (only works if a Hebrew voice is installed).

let _currentAudio = null;

export function cleanForSpeech(text) {
  return String(text || '')
    .replace(/[_]+/g, ' ')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function speakViaWebAPI(text, lang = 'he') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const cleaned = cleanForSpeech(text);
  if (!cleaned) return;
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
    window.speechSynthesis.speak(utter);
  }, 50);
}

export function stopSpeech() {
  if (_currentAudio) {
    try { _currentAudio.pause(); } catch {}
    _currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

const WEB = import.meta.env.VITE_TARGET === 'web';

function speakText(text, lang) {
  const cleaned = cleanForSpeech(text);
  if (!cleaned) return;

  stopSpeech();

  // The static web version has no server TTS proxy – use the browser voice.
  if (WEB) {
    speakViaWebAPI(text, lang);
    return;
  }

  const url = `/api/tts?text=${encodeURIComponent(cleaned)}${lang === 'en' ? '&lang=en' : ''}`;
  const audio = new Audio(url);
  audio.preload = 'auto';
  _currentAudio = audio;

  audio.play().catch(err => {
    console.warn('[TTS] online failed, trying Web Speech API:', err?.message || err);
    speakViaWebAPI(text, lang);
  });

  audio.onerror = () => {
    console.warn('[TTS] audio playback error – falling back to Web Speech API');
    speakViaWebAPI(text, lang);
  };
}

export function speakHebrew(text) {
  speakText(text, 'he');
}

/** Speak English text with an English voice – used by the English exercises. */
export function speakEnglish(text) {
  speakText(text, 'en');
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
