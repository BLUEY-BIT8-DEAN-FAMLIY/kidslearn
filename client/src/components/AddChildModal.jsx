import { useState, useRef } from 'react';
import { addChild, IS_WEB } from '../api';
import './AddChildModal.css';

// Kid-friendly avatar choices (always available).
const AVATARS = [
  '🦁', '🐯', '🐼', '🦊', '🐰', '🐸', '🐵', '🦄',
  '🐱', '🐶', '🐨', '🐷', '🐧', '🦉', '🦕', '🐠',
  '🌟', '🚀', '⚽', '🦋',
];

// Downscale an uploaded image to a small square data URL so it fits in storage.
function fileToDataUrl(file, max = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        const canvas = document.createElement('canvas');
        canvas.width = max; canvas.height = max;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, sx, sy, side, side, 0, 0, max, max);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function AddChildModal({ onClose, onAdded }) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('boy');
  const [subject, setSubject] = useState('math');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [photo, setPhoto] = useState('');         // data URL when a photo is uploaded
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  function pickGender(g) {
    setGender(g);
    setSubject(g === 'girl' ? 'hebrew' : 'math');
  }

  function pickAvatar(a) {
    setAvatar(a);
    setPhoto('');           // choosing an avatar clears any uploaded photo
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhoto(await fileToDataUrl(file));   // photo now takes precedence in the preview
    } catch {
      setError('לא הצלחנו לטעון את התמונה');
    }
  }

  async function handleSave() {
    if (!name.trim()) { setError('צריך להזין שם'); return; }
    setSaving(true);
    setError(null);
    try {
      // Photo and avatar are mutually exclusive in what we store.
      const payload = photo
        ? { name: name.trim(), gender, subject, photo, avatar: '' }
        : { name: name.trim(), gender, subject, avatar, photo: '' };
      const { child } = await addChild(payload);
      onAdded(child);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>➕ הוספת ילד/ה</h2>

        <div className="avatar-preview">
          {photo ? <img src={photo} alt="" className="preview-photo" /> : avatar}
        </div>

        {/* Photo upload is available only in the local (installed) version. */}
        {!IS_WEB && (
          <div className="photo-upload">
            <button type="button" className="photo-btn" onClick={() => fileRef.current?.click()}>
              📷 העלה תמונה
            </button>
            {photo && <button type="button" className="photo-clear" onClick={() => setPhoto('')}>הסר תמונה</button>}
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
            <button className={`toggle-btn ${gender === 'boy' ? 'on' : ''}`} onClick={() => pickGender('boy')}>👦 בן</button>
            <button className={`toggle-btn ${gender === 'girl' ? 'on' : ''}`} onClick={() => pickGender('girl')}>👧 בת</button>
          </div>
        </div>

        <div className="field">
          <span>מה ללמוד?</span>
          <div className="toggle-row">
            <button className={`toggle-btn ${subject === 'math' ? 'on' : ''}`} onClick={() => setSubject('math')}>➕ חשבון</button>
            <button className={`toggle-btn ${subject === 'hebrew' ? 'on' : ''}`} onClick={() => setSubject('hebrew')}>🔤 עברית</button>
          </div>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <button className="modal-save" onClick={handleSave} disabled={saving}>
          {saving ? 'שומר...' : '💾 הוסף'}
        </button>
      </div>
    </div>
  );
}
