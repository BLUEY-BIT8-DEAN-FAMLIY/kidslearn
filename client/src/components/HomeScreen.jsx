import './HomeScreen.css';

export default function HomeScreen({ onSelect, onParents }) {
  return (
    <div className="home">
      <div className="home-title">
        <div className="home-stars">⭐ KidsLearn ⭐</div>
        <h1>ברוכים הבאים!</h1>
        <p>מי רוצה ללמוד היום?</p>
      </div>

      <div className="home-cards">
        <button className="child-card son" onClick={() => onSelect('son', 'דין')}>
          <img src="/dean.png" alt="דין" className="child-photo" />
          <div className="child-name">דין</div>
          <div className="child-desc">כיתה א' – חשבון</div>
          <div className="child-tag">20 תרגילי חיבור וחיסור עד 30</div>
        </button>

        <button className="child-card daughter" onClick={() => onSelect('daughter', 'ליה')}>
          <img src="/liya.png" alt="ליה" className="child-photo daughter-photo" />
          <div className="child-name">ליה</div>
          <div className="child-desc">גן חובה – עברית</div>
          <div className="child-tag">11 תרגילי אותיות</div>
        </button>
      </div>

      <div className="home-bottom">
        <div className="home-date">
          📅 {new Date().toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <button className="parents-btn" onClick={onParents}>
          👨‍👩‍👧 אזור הורים
        </button>
      </div>
    </div>
  );
}
