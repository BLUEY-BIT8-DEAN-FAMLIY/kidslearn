import { useState, useRef } from 'react';
import { addChild } from '../api';
import './AddChildModal.css';

// Downscale an uploaded image to a small square data URL so it fits in JSON.
function fileToDataUrl(file, max = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        // Crop to a centered square, then scale down to `max`.
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        const canvas = document.createElement('canvas');
        canvas.width = max;
        canvas.height = max;
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
  const [photo, setPhoto] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  // When gender changes, suggest the matching subject (parent can still override)
  function pickGender(g) {
    setGender(g);
    setSubject(g === 'girl' ? 'hebrew' : 'math');
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await fileToDataUrl(file);
      setPhoto(url);
    } catch {
      setError('לא הצלחנו לטעון את התמונה');
    }
  }

  async function handleSave() {
    if (!name.trim()) { setError('צריך להזין שם'); return; }
    setSaving(true);
    setError(null);
    try {
      const { child } = await addChild({ name: name.trim(), gender, subject, photo });
      onAdded(child);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  const fallbackEmoji = gender === 'girl' ? '👧' : '👦';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>➕ הוספת ילד/ה</h2>

        <div className="photo-picker" onClick={() => fileRef.current?.click()}>
          {photo
            ? <img src={photo} alt="" className="photo-preview" />
            : <div className="photo-placeholder">{fallbackEmoji}<span>הוסף תמונה</span></div>}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
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
