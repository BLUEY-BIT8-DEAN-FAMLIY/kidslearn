import { useState, useEffect } from 'react';
import { fetchRewards } from '../api';
import { STICKER_POOL } from '../../../server/exercises/rewards.js';
import './RewardsModal.css';

// Sticker album + achievements for one child. Stickers are earned one per
// successful day; locked album slots show as "?" to spark collecting.
export default function RewardsModal({ child, childName, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRewards(child)
      .then(setData)
      .catch(err => setError(err.message));
  }, [child]);

  const owned = new Set((data?.stickers || []).map(s => s.emoji));
  // Only today's sticker is "new" — it gets the badge and the pop animation,
  // so the child never confuses older stickers with the one just earned.
  const today = new Date().toISOString().slice(0, 10);
  const newest = (data?.stickers || []).find(s => s.date === today)?.emoji || null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="rewards-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>🏆 האוצרות של {childName}</h2>

        {error && <div className="rewards-error">שגיאה: {error}</div>}
        {!data && !error && <div className="rewards-loading">טוען...</div>}

        {data && (
          <>
            <div className="rewards-stats">
              <div className="reward-stat">
                <div className="reward-num">⭐ {data.stars}</div>
                <div className="reward-label">כוכבים (תשובות נכונות)</div>
              </div>
              <div className="reward-stat">
                <div className="reward-num">🔥 {data.streak}</div>
                <div className="reward-label">ימי תרגול ברצף</div>
              </div>
              <div className="reward-stat">
                <div className="reward-num">📒 {data.stickers.length}</div>
                <div className="reward-label">מדבקות באלבום</div>
              </div>
            </div>

            <h3>📒 אלבום המדבקות</h3>
            <p className="rewards-hint">כל יום שמסיימים את הלמידה — מדבקה חדשה!</p>
            <div className="sticker-grid">
              {STICKER_POOL.map(s => (
                <div key={s} className={`sticker-slot ${owned.has(s) ? 'owned' : ''} ${newest === s ? 'newest' : ''}`}>
                  {owned.has(s) ? s : '❔'}
                  {newest === s && <span className="new-badge">חדש!</span>}
                </div>
              ))}
            </div>

            <h3>🎖️ הישגים</h3>
            <div className="achievements">
              {data.achievements.map(a => (
                <div key={a.id} className={`achievement ${a.earned ? 'earned' : ''}`}>
                  <span className="ach-icon">{a.icon}</span>
                  <span className="ach-text">
                    <strong>{a.title}</strong>
                    <small>{a.desc}</small>
                  </span>
                  {a.earned && <span className="ach-check">✓</span>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
