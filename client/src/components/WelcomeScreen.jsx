import './WelcomeScreen.css';

// Web-only entry screen. First stage: just "continue as guest".
// (Registration / login will be added later.)
export default function WelcomeScreen({ onGuest }) {
  return (
    <div className="welcome">
      <div className="welcome-card">
        <div className="welcome-stars">⭐</div>
        <h1>KidsLearn</h1>
        <p className="welcome-tagline">לימוד יומי כיף לילדים<br />חשבון · גאומטריה · עברית</p>

        <button className="welcome-guest" onClick={onGuest}>
          ▶️ המשך כאורח
        </button>

        <div className="welcome-soon">
          🔒 בקרוב: חשבון אישי לשמירת ההתקדמות מכל מכשיר
        </div>
      </div>

      <div className="welcome-footer">גרסת ווב · ההתקדמות נשמרת במכשיר זה</div>
    </div>
  );
}
