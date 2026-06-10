import { useState, useEffect } from 'react';
import { fetchChildren, deleteChild, IS_WEB } from '../api';
import AddChildModal from './AddChildModal';
import './HomeScreen.css';

const SUBJECT_DESC = {
  math: { desc: 'חשבון', tag: 'תרגילי חשבון' },
  hebrew: { desc: 'עברית', tag: 'תרגילי אותיות' },
};

export default function HomeScreen({ onSelect, onParents }) {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editMode, setEditMode] = useState(false);

  function load() {
    fetchChildren()
      .then(data => { setChildren(data.children || []); setLoading(false); })
      .catch(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleDelete(e, child) {
    e.stopPropagation();
    if (!window.confirm(`למחוק את ${child.name}? (ההיסטוריה תישאר)`)) return;
    try {
      await deleteChild(child.id);
      setChildren(cs => cs.filter(c => c.id !== child.id));
    } catch (err) {
      alert(err.message);
    }
  }

  function photoFor(child) {
    const emoji = child.avatar || (child.gender === 'girl' ? '👧' : '👦');
    // Legacy data may still carry a photo; otherwise show the avatar emoji.
    if (child.photo && !child.avatar) {
      return (
        <img
          src={child.photo}
          alt={child.name}
          className="child-photo"
          onError={e => { e.target.outerHTML = `<div class="child-photo child-emoji">${emoji}</div>`; }}
        />
      );
    }
    return <div className="child-photo child-emoji">{emoji}</div>;
  }

  return (
    <div className="home">
      <div className="home-title">
        <div className="home-stars">⭐ KidsLearn ⭐</div>
        <h1>ברוכים הבאים!</h1>
        <p>{!loading && children.length === 0 ? 'הוסיפו ילד/ה כדי להתחיל ✨' : 'מי רוצה ללמוד היום?'}</p>
      </div>

      <div className="home-cards">
        {loading && <div className="home-loading">טוען...</div>}

        {!loading && children.map(child => {
          const info = SUBJECT_DESC[child.subject] || SUBJECT_DESC.math;
          return (
            <button
              key={child.id}
              className={`child-card ${child.subject === 'hebrew' ? 'daughter' : 'son'}`}
              onClick={() => !editMode && onSelect(child.id, child.name, child.subject)}
            >
              {editMode && (
                <span className="card-delete" onClick={e => handleDelete(e, child)}>✕</span>
              )}
              {photoFor(child)}
              <div className="child-name">{child.name}</div>
              <div className="child-desc">{info.desc}</div>
              <div className="child-tag">{info.tag}</div>
            </button>
          );
        })}

        {!loading && (
          <button className="child-card add-card" onClick={() => setShowAdd(true)}>
            <div className="add-plus">＋</div>
            <div className="child-name">הוסף ילד/ה</div>
            <div className="child-tag">שם · אווטאר · בן/בת</div>
          </button>
        )}
      </div>

      <div className="home-bottom">
        <div className="home-date">
          📅 {new Date().toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <div className="home-actions">
          {IS_WEB && (
            <a className="upgrade-btn" href="../pricing.html">💎 מנוי KidsLearn</a>
          )}
          <button className="edit-btn" onClick={() => setEditMode(m => !m)}>
            {editMode ? '✓ סיום' : '✏️ עריכה'}
          </button>
          <button className="parents-btn" onClick={onParents}>
            👨‍👩‍👧 אזור הורים
          </button>
        </div>
      </div>

      {showAdd && (
        <AddChildModal
          onClose={() => setShowAdd(false)}
          onAdded={(child) => { setShowAdd(false); setChildren(cs => [...cs, child]); }}
        />
      )}
    </div>
  );
}
