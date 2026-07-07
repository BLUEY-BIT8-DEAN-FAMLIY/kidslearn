import { useState, useEffect } from 'react';
import { authStatus, registerAccount, loginAccount } from '../api';
import './AuthScreen.css';

export default function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState('login');      // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // First run (no accounts yet) → start on the register form.
  useEffect(() => {
    authStatus().then(s => { if (!s.hasUsers) setMode('register'); }).catch(() => {});
  }, []);

  const isRegister = mode === 'register';

  async function submit(e) {
    e?.preventDefault();
    setError(null);
    if (!email.trim() || !password) { setError('צריך להזין אימייל וסיסמה'); return; }
    setBusy(true);
    try {
      const r = isRegister
        ? await registerAccount(email, password, name)
        : await loginAccount(email, password);
      onAuthed({
        token: r.token,
        email: r.user?.email || email.trim().toLowerCase(),
        name: r.user?.name || '',
      });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-stars">⭐</div>
        <h1>KidsLearn</h1>
        <p className="auth-sub">{isRegister ? 'יצירת חשבון חדש' : 'התחברות לחשבון'}</p>

        {isRegister && (
          <label className="auth-field">
            <span>שם (לא חובה)</span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="לדוגמה: משפחת אברהם"
              maxLength={40}
            />
          </label>
        )}

        <label className="auth-field">
          <span>אימייל</span>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="name@example.com"
            dir="ltr"
            autoComplete="username"
            autoFocus
          />
        </label>

        <label className="auth-field">
          <span>סיסמה</span>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={isRegister ? 'לפחות 6 תווים' : '••••••'}
            dir="ltr"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
          />
        </label>

        {error && <div className="auth-error">{error}</div>}

        <button type="submit" className="auth-submit" disabled={busy}>
          {busy ? '…' : (isRegister ? '✨ צור חשבון' : '🔑 התחבר')}
        </button>

        <button
          type="button"
          className="auth-toggle"
          onClick={() => { setError(null); setMode(isRegister ? 'login' : 'register'); }}
        >
          {isRegister ? 'כבר יש חשבון? התחברו' : 'אין עדיין חשבון? הירשמו'}
        </button>
      </form>
      <div className="auth-footer">🔒 הסיסמה נשמרת מוצפנת על המחשב הזה</div>
    </div>
  );
}
