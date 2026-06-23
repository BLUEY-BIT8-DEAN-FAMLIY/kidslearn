import { useState, useRef } from 'react';
import { addChild, updateChild, removeBackground, IS_WEB } from '../api';
import './AddChildModal.css';

// Kid-friendly avatar choices (always available).
const AVATARS = [
  '🦁', '🐯', '🐼', '🦊', '🐰', '🐸', '🐵', '🦄',
  '🐱', '🐶', '🐨', '🐷', '🐧', '🦉', '🦕', '🐠',
  '🌟', '🚀', '⚽', '🦋',
];

// Focused addition/subtraction ceilings the parent can choose from.
const MATH_LEVELS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

// Render any File or data-URL into a centered square PNG of the given size.
// PNG (not JPEG) so a transparent background from the cut-out is preserved.
function toSquarePng(src, max = 256) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = reject;
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      const canvas = document.createElement('canvas');
      canvas.width = max; canvas.height = max;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, max, max);
      ctx.drawImage(img, sx, sy, side, side, 0, 0, max, max);
      resolve(canvas.toDataURL('image/png'));
    };
    if (typeof src === 'string') {
      img.src = src;
    } else {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => { img.src = reader.result; };
      reader.readAsDataURL(src);
    }
  });
}

export default function AddChildModal({ onClose, onSaved, editChild }) {
  const isEdit = !!editChild;
  const initialSubjects = Array.isArray(editChild?.subjects) && editChild.subjects.length
    ? editChild.subjects
    : [editChild?.subject || 'math'];

  const [name, setName] = useState(editChild?.name || '');
  const [gender, setGender] = useState(editChild?.gender || 'boy');
  const [subjects, setSubjects] = useState(initialSubjects);
  const [mathLevel, setMathLevel] = useState(editChild?.mathLevel ?? null);   // null = mixed
  const [avatar, setAvatar] = useState(editChild?.avatar || AVATARS[0]);
  const [photo, setPhoto] = useState(editChild?.photo || '');   // data URL or path when set
  const [saving, setSaving] = useState(false);
  const [bgWorking, setBgWorking] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  function toggleSubject(s) {
    setSubjects(prev => {
      if (prev.includes(s)) {
        const next = prev.filter(x => x !== s);
        return next.length ? next : prev;   // never leave the child with no subject
      }
      return [...prev, s];
    });
  }

  function pickAvatar(a) {
    setAvatar(a);
    setPhoto('');           // choosing an avatar clears any uploaded photo
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      // Show the cropped photo immediately, then remove its background.
      const square = await toSquarePng(file, 384);
      setPhoto(square);
      setBgWorking(true);
      try {
        const { ok, image } = await removeBackground(square);
        if (ok && image) {
          setPhoto(await toSquarePng(image, 256));   // transparent cut-out
        } else {
          setPhoto(await toSquarePng(square, 256));   // web build / no key — keep as-is
          if (!IS_WEB) setError('לא הוגדר מפתח API להסרת רקע (אזור הורים → הסרת רקע). התמונה נשמרה ללא הסרת רקע.');
        }
      } catch (bgErr) {
        setPhoto(await toSquarePng(square, 256));
        setError(bgErr.message + ' — התמונה נשמרה ללא הסרת רקע.');
      } finally {
        setBgWorking(false);
      }
    } catch {
      setError('לא הצלחנו לטעון את התמונה');
      setBgWorking(false);
    }
    e.target.value = '';
  }

  async function handleSave() {
    if (!name.trim()) { setError('צריך להזין שם'); return; }
    if (!subjects.length) { setError('צריך לבחור לפחות מקצוע אחד'); return; }
    setSaving(true);
    setError(null);
    try {
      const base = { name: name.trim(), gender, subjects, mathLevel };
      // Photo and avatar are mutually exclusive in what we store.
      const payload = photo
        ? { ...base, photo, avatar: '' }
        : { ...base, avatar, photo: '' };
      const { child } = isEdit
        ? await updateChild(editChild.id, payload)
        : await addChild(payload);
      onSaved(child);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>{isEdit ? '✏️ עריכת ילד/ה' : '➕ הוספת ילד/ה'}</h2>

        <div className="avatar-preview">
          {photo ? <img src={photo} alt="" className="preview-photo" /> : avatar}
        </div>

        {/* Photo upload is available only in the local (installed) version. */}
        {!IS_WEB && (
          <div className="photo-upload">
            <button type="button" className="photo-btn" disabled={bgWorking} onClick={() => fileRef.current?.click()}>
              📷 העלה תמונה
            </button>
            {bgWorking && <span className="bg-working">⏳ מסיר רקע…</span>}
            {photo && !bgWorking && <button type="button" className="photo-clear" onClick={() => setPhoto('')}>הסר תמונה</button>}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
          </div>
        )}

        <div className="field">
          <span>{IS_WEB ? 'בחרו דמות (אווטאר)' : 'או בחרו דמות'}</span>
          <div className="avatar-grid">
            {AVATARS.map(a => (
              <button
                key={a}
                type="button"
                className={`avatar-btn ${(!photo && avatar === a) ? 'on' : ''}`}
                onClick={() => pickAvatar(a)}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <label className="field">
          <span>שם</span>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="לדוגמה: נועה"
            maxLength={20}
            autoFocus
          />
        </label>

        <div className="field">
          <span>בן או בת?</span>
          <div className="toggle-row">
            <button className={`toggle-btn ${gender === 'boy' ? 'on' : ''}`} onClick={() => setGender('boy')}>👦 בן</button>
            <button className={`toggle-btn ${gender === 'girl' ? 'on' : ''}`} onClick={() => setGender('girl')}>👧 בת</button>
          </div>
        </div>

        <div className="field">
          <span>מה ללמוד? <small className="field-hint">(אפשר לבחור גם וגם)</small></span>
          <div className="toggle-row">
            <button
              type="button"
              className={`toggle-btn ${subjects.includes('math') ? 'on' : ''}`}
              onClick={() => toggleSubject('math')}
            >➕ חשבון</button>
            <button
              type="button"
              className={`toggle-btn ${subjects.includes('hebrew') ? 'on' : ''}`}
              onClick={() => toggleSubject('hebrew')}
            >🔤 עברית</button>
          </div>
        </div>

        {subjects.includes('math') && (
          <label className="field">
            <span>רמת חשבון</span>
            <select
              className="level-select"
              value={mathLevel ?? 'mixed'}
              onChange={e => setMathLevel(e.target.value === 'mixed' ? null : Number(e.target.value))}
            >
              <option value="mixed">מעורב — כל הנושאים (כיתה א׳–ב׳)</option>
              {MATH_LEVELS.map(n => (
                <option key={n} value={n}>חיבור וחיסור עד {n}</option>
              ))}
            </select>
          </label>
        )}

        {error && <div className="modal-error">{error}</div>}

        <button className="modal-save" onClick={handleSave} disabled={saving || bgWorking}>
          {saving ? 'שומר...' : (isEdit ? '💾 שמור שינויים' : '💾 הוסף')}
        </button>
      </div>
    </div>
  );
}
