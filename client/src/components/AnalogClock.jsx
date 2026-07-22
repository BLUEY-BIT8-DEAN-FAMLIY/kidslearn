// A real analog clock the kids can actually read: numbers 1-12, tick marks,
// a short hour hand and a long red minute hand. Pure SVG — no assets.
export default function AnalogClock({ h, m = 0, size = 160 }) {
  const rad = a => ((a - 90) * Math.PI) / 180;
  const hourAngle = ((h % 12) + m / 60) * 30;
  const minAngle = (m % 60) * 6;
  const hx = 50 + 22 * Math.cos(rad(hourAngle));
  const hy = 50 + 22 * Math.sin(rad(hourAngle));
  const mx = 50 + 33 * Math.cos(rad(minAngle));
  const my = 50 + 33 * Math.sin(rad(minAngle));

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className="analog-clock"
      role="img"
      aria-label={`שעון שמראה ${h}:${String(m).padStart(2, '0')}`}
    >
      <circle cx="50" cy="50" r="47" fill="#fff" stroke="#3949ab" strokeWidth="4" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = rad((i + 1) * 30);
        return (
          <line
            key={`t${i}`}
            x1={50 + 42.5 * Math.cos(a)} y1={50 + 42.5 * Math.sin(a)}
            x2={50 + 45 * Math.cos(a)} y2={50 + 45 * Math.sin(a)}
            stroke="#5c6bc0" strokeWidth="1.6"
          />
        );
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1;
        const a = rad(n * 30);
        return (
          <text
            key={`n${n}`}
            x={50 + 36.5 * Math.cos(a)} y={50 + 36.5 * Math.sin(a)}
            textAnchor="middle" dominantBaseline="central"
            fontSize="9.6" fontWeight="700" fill="#333"
          >
            {n}
          </text>
        );
      })}
      <line x1="50" y1="50" x2={hx} y2={hy} stroke="#222" strokeWidth="5" strokeLinecap="round" />
      <line x1="50" y1="50" x2={mx} y2={my} stroke="#e53935" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="50" r="2.6" fill="#222" />
    </svg>
  );
}
