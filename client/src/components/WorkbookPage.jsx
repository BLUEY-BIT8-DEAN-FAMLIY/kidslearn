import { useState, useEffect } from 'react';
import { speakParts, speakHebrew, stopSpeech } from '../lib/tts';
import AnalogClock from './AnalogClock';
import './WorkbookPage.css';

// One page of an interactive workbook (חוברת עבודה אינטראקטיבית):
//   kind 'teach'   – a teaching page (lines + visual), read aloud.
//   kind 'example' – a worked example; steps reveal one at a time, each
//                    spoken, ending with the result. Learning by doing —
//                    exactly like the MoE workbooks, but alive.
export default function WorkbookPage({ workbook, page, pageIndex, total, childName, onNext }) {
  const isExample = page.kind === 'example';
  const [revealed, setRevealed] = useState(0);   // steps shown so far

  useEffect(() => {
    setRevealed(0);
    const parts = isExample
      ? [{ text: `${page.title} ${childName}!`, lang: 'he' }]
      : [{ text: page.title, lang: 'he' }, ...page.lines.map(text => ({ text, lang: 'he' }))];
    const t = setTimeout(() => speakParts(parts), 400);
    return () => { clearTimeout(t); stopSpeech(); };
  }, [pageIndex]);

  function revealNext() {
    const next = revealed + 1;
    setRevealed(next);
    const say = next <= page.steps.length ? page.steps[next - 1] : page.result;
    if (say) { stopSpeech(); speakHebrew(say); }
  }

  const allRevealed = isExample && revealed >= page.steps.length;
  const isLast = pageIndex === total - 1;

  return (
    <div className="wb-screen">
      <div className="wb-card">
        <div className="wb-badge">📖 חוברת · עמוד {pageIndex + 1} מתוך {total}</div>
        <div className="wb-progress">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`wb-dot ${i < pageIndex ? 'done' : i === pageIndex ? 'now' : ''}`} />
          ))}
        </div>

        <div className="wb-icon">{workbook.icon}</div>
        <h1 className="wb-title">{page.title}</h1>

        {!isExample && page.lines.map((line, i) => (
          <p key={i} className="wb-line">{line}</p>
        ))}

        {(page.clock || page.display) && (
          <div className="wb-visual" dir="ltr">
            {page.clock
              ? <AnalogClock h={page.clock.h} m={page.clock.m} size={150} />
              : <div className="wb-display">{page.display}</div>}
          </div>
        )}

        {isExample && (
          <div className="wb-steps">
            {page.steps.slice(0, revealed).map((s, i) => (
              <div key={i} className="wb-step">
                <span className="wb-step-num">{i + 1}</span>
                <span className="wb-step-text">{s}</span>
              </div>
            ))}
            {allRevealed && page.result && (
              <div className="wb-result">✨ {page.result}</div>
            )}
          </div>
        )}

        {isExample && !allRevealed ? (
          <button className="wb-next" onClick={revealNext}>
            👣 {revealed === 0 ? 'בואו נפתור יחד!' : 'הצעד הבא'}
          </button>
        ) : (
          <button className="wb-next" onClick={() => { stopSpeech(); onNext(); }}>
            {isLast ? '💪 מתחילים לתרגל!' : 'המשך ←'}
          </button>
        )}
      </div>
    </div>
  );
}
