// Personajes de Turbo, dibujados en SVG con el estilo "sticker" (bordes de tinta).
// Miran hacia la derecha, que es hacia donde avanza la carrera.
// `color` permite pintar distinto al rival.

export function Personaje({ id, color }: { id: string; color?: string }) {
  if (id === 'delfin') return <Delfin color={color ?? '#6CC4F0'} />;
  if (id === 'cohete') return <Cohete color={color ?? 'var(--accent)'} />;
  return <Auto color={color ?? 'var(--accent)'} />;
}

/** Color del rival según el personaje del niño. */
export function colorRival(id: string): string {
  if (id === 'delfin') return '#B9A8FF';
  if (id === 'cohete') return '#4CC9F0';
  return '#4CC9F0';
}

function Auto({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 160 80" width="160" height="80" aria-hidden>
      {/* alerón */}
      <path d="M8 26 L30 26 L34 44 L14 44 Z" fill={color} stroke="var(--ink)" strokeWidth="4.5" strokeLinejoin="round" />
      {/* cuerpo de auto de carrera */}
      <path d="M14 56 L20 42 Q26 36 40 36 L70 34 Q82 18 98 18 Q110 18 114 32 L138 40 Q154 44 154 54 L154 58 L12 58 Z" fill={color} stroke="var(--ink)" strokeWidth="5" strokeLinejoin="round" />
      {/* casco del piloto */}
      <circle cx="96" cy="28" r="10" fill="var(--surface)" stroke="var(--ink)" strokeWidth="4" />
      <path d="M96 22 Q104 24 105 30 L96 30 Z" fill="#6CC4F0" />
      {/* ruedas */}
      <circle cx="42" cy="60" r="15" fill="var(--ink)" />
      <circle cx="42" cy="60" r="6" fill="var(--surface)" />
      <circle cx="126" cy="60" r="15" fill="var(--ink)" />
      <circle cx="126" cy="60" r="6" fill="var(--surface)" />
    </svg>
  );
}

function Delfin({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 150 90" width="150" height="90" className="delfin" aria-hidden>
      <path d="M22 44 Q8 30 4 22 Q18 26 26 36 Q30 22 40 14 Q38 32 34 46 Z" fill={color} stroke="var(--ink)" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M70 26 Q78 6 96 4 Q88 16 88 30 Z" fill={color} stroke="var(--ink)" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M28 46 Q46 22 88 24 Q118 26 132 42 Q146 44 146 50 Q140 56 128 56 Q110 70 76 68 Q44 66 28 46 Z" fill={color} stroke="var(--ink)" strokeWidth="5" strokeLinejoin="round" />
      <path d="M60 60 Q90 70 122 56 Q104 66 78 66 Q66 65 60 60 Z" fill="var(--surface)" />
      <path d="M80 62 Q78 78 66 84 Q70 70 68 62 Z" fill={color} stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="116" cy="40" r="4.5" fill="var(--ink)" />
      <circle cx="117.5" cy="38.5" r="1.4" fill="var(--surface)" />
      <path d="M128 52 Q136 54 142 50" fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Cohete({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 150 80" width="150" height="80" aria-hidden>
      <path d="M30 32 Q6 40 30 48 Q18 40 30 32 Z" fill="#FFC93C" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" className="fuego" />
      <path d="M32 34 Q0 40 32 46" fill="#FF8A3D" />
      <path d="M52 22 L38 6 L66 18 Z M52 58 L38 74 L66 62 Z" fill={color} stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round" />
      <path d="M32 26 L104 22 Q134 26 146 40 Q134 54 104 58 L32 54 Z" fill="var(--surface)" stroke="var(--ink)" strokeWidth="5" strokeLinejoin="round" />
      <path d="M120 25 Q136 30 146 40 Q136 50 120 55 Q126 40 120 25 Z" fill={color} stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="88" cy="40" r="11" fill="#6CC4F0" stroke="var(--ink)" strokeWidth="4" />
    </svg>
  );
}
