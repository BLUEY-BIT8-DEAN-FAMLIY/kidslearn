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

function speakViaWebAPI(text) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const cleaned = cleanForSpeech(text);
  if (!cleaned) return;
  window.speechSynthesis.cancel();
  setTimeout(() => {
    const utter = new SpeechSynthesisUtterance(cleaned);
    utter.lang = 'he-IL';
    utter.rate = 0.85;
    utter.pitch = 1.05;
    utter.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const heVoice =
      voices.find(v => v.lang === 'he-IL') ||
      voices.find(v => v.lang?.toLowerCase().startsWith('he'));
    if (heVoice) {
      utter.voice = heVoice;
      utter.lang = heVoice.lang;
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

export function speakHebrew(text) {
  const cleaned = cleanForSpeech(text);
  if (!cleaned) return;

  stopSpeech();

  const url = `/api/tts?text=${encodeURIComponent(cleaned)}`;
  const audio = new Audio(url);
  audio.preload = 'auto';
  _currentAudio = audio;

  audio.play().catch(err => {
    console.warn('[TTS] online failed, trying Web Speech API:', err?.message || err);
    speakViaWebAPI(text);
  });

  audio.onerror = () => {
    console.warn('[TTS] audio playback error – falling back to Web Speech API');
    speakViaWebAPI(text);
  };
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
