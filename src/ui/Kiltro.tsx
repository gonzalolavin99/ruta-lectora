// El Kiltro: mascota de Ruta Lectora (dibujo provisorio, se puede reemplazar).
export function Kiltro({ tamano = 96 }: { tamano?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={tamano} height={tamano} role="img" aria-label="Kiltro">
      {/* orejas caídas */}
      <path d="M22 30 C6 34 4 64 16 74 C24 70 30 52 34 40 Z" fill="#6B4A2F" />
      <path d="M98 30 C114 34 116 64 104 74 C96 70 90 52 86 40 Z" fill="#6B4A2F" />
      {/* cabeza */}
      <ellipse cx="60" cy="58" rx="38" ry="36" fill="#C98A4B" />
      {/* mancha en el ojo */}
      <ellipse cx="44" cy="50" rx="13" ry="12" fill="#8A5A33" />
      {/* hocico */}
      <ellipse cx="60" cy="76" rx="22" ry="17" fill="#F2D3A8" />
      {/* ojos */}
      <circle cx="45" cy="51" r="5" fill="#2B2340" />
      <circle cx="75" cy="51" r="5" fill="#2B2340" />
      <circle cx="46.5" cy="49.5" r="1.6" fill="#FFF6E5" />
      <circle cx="76.5" cy="49.5" r="1.6" fill="#FFF6E5" />
      {/* nariz y boca */}
      <ellipse cx="60" cy="68" rx="7" ry="5" fill="#2B2340" />
      <path d="M60 73 V78 M60 78 C55 83 50 82 48 79 M60 78 C65 83 70 82 72 79" fill="none" stroke="#2B2340" strokeWidth="2.5" strokeLinecap="round" />
      {/* lengua */}
      <path d="M56 82 C56 92 64 92 64 82 Z" fill="#F07A7A" />
    </svg>
  );
}
