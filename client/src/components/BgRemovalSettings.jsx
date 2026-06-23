import { useState, useEffect } from 'react';
import { fetchBgConfig, saveBgConfig } from '../api';
import './EmailSettings.css';   // reuse the shared settings styles

export default function BgRemovalSettings() {
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [keyLength, setKeyLength] = useState(0);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function reload() {
    const c = await fetchBgConfig();
    setHasKey(c.hasKey);
    setKeyLength(c.keyLength || 0);
    return c;
  }

  useEffect(() => { reload().then(() => setLoading(false)); }, []);

  async function handleSave() {
    setSaving(true);
    setStatus(null);
    try {
      await saveBgConfig({ apiKey });
      const fresh = await reload();
      setApiKey('');
      setStatus({ type: 'success', msg: `✅ נשמר. אורך המפתח השמור: ${fresh.keyLength} תווים.` });
    } catch (err) {
      setStatus({ type: 'error', msg: '❌ ' + err.message });
    }
    setSaving(false);
  }

  if (loading) return <div className="loading">טוען...</div>;

  return (
    <div className="email-settings">
      <div className="email-header">
        <h2>🪄 הסרת רקע מתמונות</h2>
        {hasKey && (
          <small className="badge" style={{ background: '#43a047' }}>
            מפתח שמור: {keyLength} תווים ✓
          </small>
        )}
      </div>

      <p style={{ fontSize: '0.88rem', color: '#666', margin: '4px 0 14px', lineHeight: 1.6 }}>
        כשמעלים תמונה של ילד/ה, הרקע יוסר אוטומטית והתמונה תישמר עם רקע שקוף.
        צריך מפתח API חינמי מהשירות <strong dir="ltr">remove.bg</strong> —
        נרשמים ב-<span dir="ltr">remove.bg/api</span> ומעתיקים את המפתח לכאן.
      </p>

      <div className="form-grid">
        <label className="full-width">
          <span>מפתח API של remove.bg</span>
          <input
            type="text"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder={hasKey ? 'הקלידי מפתח חדש כדי להחליף' : 'הדביקי כאן את המפתח'}
            dir="ltr"
            autoComplete="off"
            spellCheck="false"
          />
        </label>
      </div>

      {status && <div className={`status-msg ${status.type}`}>{status.msg}</div>}

      <div className="email-actions">
        <button className="btn-primary" onClick={handleSave} disabled={saving || !apiKey.trim()}>
          {saving ? '💾 שומר...' : '💾 שמור מפתח'}
        </button>
      </div>
    </div>
  );
}
