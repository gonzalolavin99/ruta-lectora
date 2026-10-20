// Personajes de Turbo, dibujados en SVG con el estilo "sticker" (bordes de tinta).
// Miran hacia la derecha, que es hacia donde avanza la carrera.

export function Personaje({ id }: { id: string }) {
  if (id === 'delfin') return <Delfin />;
  if (id === 'cohete') return <Cohete />;
  return <Auto />;
}

function Auto() {
  return (
    <svg viewBox="0 0 140 80" width="140" height="80" aria-hidden>
      <path d="M14 52 L24 30 Q30 20 44 20 L84 20 Q96 20 104 30 L118 44 Q132 46 132 56 L132 60 L10 60 Q8 54 14 52 Z" fill="var(--accent)" stroke="var(--ink)" strokeWidth="5" strokeLinejoin="round" />
      <path d="M44 28 L80 28 Q88 28 94 36 L98 42 L36 42 Z" fill="var(--surface)" stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="38" cy="62" r="13" fill="var(--ink)" />
      <circle cx="38" cy="62" r="5" fill="var(--surface)" />
      <circle cx="106" cy="62" r="13" fill="var(--ink)" />
      <circle cx="106" cy="62" r="5" fill="var(--surface)" />
    </svg>
  );
}

function Delfin() {
  return (
    <svg viewBox="0 0 150 90" width="150" height="90" className="delfin" aria-hidden>
      {/* cola */}
      <path d="M22 44 Q8 30 4 22 Q18 26 26 36 Q30 22 40 14 Q38 32 34 46 Z" fill="#4AA8E0" stroke="var(--ink)" strokeWidth="4.5" strokeLinejoin="round" />
      {/* aleta de arriba */}
      <path d="M70 26 Q78 6 96 4 Q88 16 88 30 Z" fill="#4AA8E0" stroke="var(--ink)" strokeWidth="4.5" strokeLinejoin="round" />
      {/* cuerpo */}
      <path d="M28 46 Q46 22 88 24 Q118 26 132 42 Q146 44 146 50 Q140 56 128 56 Q110 70 76 68 Q44 66 28 46 Z" fill="#6CC4F0" stroke="var(--ink)" strokeWidth="5" strokeLinejoin="round" />
      {/* panza */}
      <path d="M60 60 Q90 70 122 56 Q104 66 78 66 Q66 65 60 60 Z" fill="var(--surface)" />
      {/* aleta de abajo */}
      <path d="M80 62 Q78 78 66 84 Q70 70 68 62 Z" fill="#4AA8E0" stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round" />
      {/* ojo y sonrisa */}
      <circle cx="116" cy="40" r="4.5" fill="var(--ink)" />
      <circle cx="117.5" cy="38.5" r="1.4" fill="var(--surface)" />
      <path d="M128 52 Q136 54 142 50" fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Cohete() {
  return (
    <svg viewBox="0 0 150 80" width="150" height="80" aria-hidden>
      {/* fuego */}
      <path d="M30 32 Q6 40 30 48 Q18 40 30 32 Z" fill="#FFC93C" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" className="fuego" />
      <path d="M32 34 Q0 40 32 46" fill="#FF8A3D" />
      {/* alas */}
      <path d="M52 22 L38 6 L66 18 Z M52 58 L38 74 L66 62 Z" fill="var(--accent)" stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round" />
      {/* cuerpo */}
      <path d="M32 26 L104 22 Q134 26 146 40 Q134 54 104 58 L32 54 Z" fill="var(--surface)" stroke="var(--ink)" strokeWidth="5" strokeLinejoin="round" />
      <path d="M120 25 Q136 30 146 40 Q136 50 120 55 Q126 40 120 25 Z" fill="var(--accent)" stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round" />
      {/* ventana */}
      <circle cx="88" cy="40" r="11" fill="#6CC4F0" stroke="var(--ink)" strokeWidth="4" />
    </svg>
  );
}
