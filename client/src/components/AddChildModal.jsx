import { useState } from 'react';
import { addChild } from '../api';
import './AddChildModal.css';

// Kid-friendly avatar choices (no photos – privacy friendly).
const AVATARS = [
  '🦁', '🐯', '🐼', '🦊', '🐰', '🐸', '🐵', '🦄',
  '🐱', '🐶', '🐨', '🐷', '🐧', '🦉', '🦕', '🐠',
  '🌟', '🚀', '⚽', '🦋',
];

export default function AddChildModal({ onClose, onAdded }) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('boy');
  const [subject, setSubject] = useState('math');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // When gender changes, suggest the matching subject (parent can still override)
  function pickGender(g) {
    setGender(g);
    setSubject(g === 'girl' ? 'hebrew' : 'math');
  }

  async function handleSave() {
    if (!name.trim()) { setError('צריך להזין שם'); return; }
    setSaving(true);
    setError(null);
    try {
      const { child } = await addChild({ name: name.trim(), gender, subject, avatar });
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

        <div className="avatar-preview">{avatar}</div>

        <div className="field">
          <span>בחרו דמות (אווטאר)</span>
          <div className="avatar-grid">
            {AVATARS.map(a => (
              <button
                key={a}
                type="button"
                className={`avatar-btn ${avatar === a ? 'on' : ''}`}
                onClick={() => setAvatar(a)}
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
