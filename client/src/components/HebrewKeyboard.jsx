import './HebrewKeyboard.css';

const ROWS = [
  ['ק', 'ר', 'א', 'ט', 'ו', 'ן', 'ם', 'פ'],
  ['ש', 'ד', 'ג', 'כ', 'ע', 'י', 'ח', 'ל', 'ך', 'ף'],
  ['ז', 'ס', 'ב', 'ה', 'נ', 'מ', 'צ', 'ת', 'ץ'],
];

export default function HebrewKeyboard({ onKey, onBackspace, onSubmit, disabled }) {
  return (
    <div className={`hebrew-kbd ${disabled ? 'disabled' : ''}`}>
      {ROWS.map((row, ri) => (
        <div key={ri} className="kbd-row">
          {row.map(letter => (
            <button
              key={letter}
              className="kbd-key"
              onClick={() => onKey(letter)}
              disabled={disabled}
              type="button"
            >
              {letter}
            </button>
          ))}
        </div>
      ))}
      <div className="kbd-row kbd-actions">
        <button
          className="kbd-key kbd-back"
          onClick={onBackspace}
          disabled={disabled}
          type="button"
          aria-label="מחק"
        >
          ⌫
        </button>
        {onSubmit && (
          <button
            className="kbd-key kbd-submit"
            onClick={onSubmit}
            disabled={disabled}
            type="button"
          >
            ✔ אישור
          </button>
        )}
      </div>
    </div>
  );
}
