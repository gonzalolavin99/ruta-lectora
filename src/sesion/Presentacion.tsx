import { useCallback, useEffect, useState } from 'react';
import type { Estimulo } from '../engine/contenido';

interface Props {
  palabras: Estimulo[];
  alTerminar: () => void;
  alVolver: () => void;
}

// Antes del juego: el niño lee una por una las palabras de la ronda.
// El juego es el premio por haberlas leído todas.
export function Presentacion({ palabras, alTerminar, alVolver }: Props) {
  const [indice, setIndice] = useState(0);
  const [verSilabas, setVerSilabas] = useState(false);
  const palabra = palabras[indice];
  const ultima = indice === palabras.length - 1;

  const siguiente = useCallback(() => {
    if (ultima) alTerminar();
    else setIndice((i) => i + 1);
  }, [ultima, alTerminar]);
  const anterior = useCallback(() => setIndice((i) => Math.max(0, i - 1)), []);

  // En el Mac: flecha derecha o espacio = siguiente; flecha izquierda = anterior.
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        siguiente();
      } else if (e.key === 'ArrowLeft') anterior();
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [siguiente, anterior]);

  return (
    <div className="pantalla presentacion">
      <header className="cabecera">
        <button className="boton boton-secundario" onClick={alVolver}>← Volver</button>
        <div className="progreso" aria-label={`Palabra ${indice + 1} de ${palabras.length}`}>
          {palabras.map((p, i) => (
            <span key={p.id} className={i < indice ? 'paso hecho' : i === indice ? 'paso actual' : 'paso'} />
          ))}
        </div>
        <button
          className={verSilabas ? 'boton' : 'boton boton-secundario'}
          onClick={() => setVerSilabas((v) => !v)}
          aria-pressed={verSilabas}
          title="Ver separado en sílabas"
        >
          ca·sa
        </button>
      </header>

      <main className="centrada">
        <p className="titulo-seccion">Lee la palabra</p>
        <button key={palabra.id} className="tarjeta-palabra" onClick={siguiente}>
          {verSilabas
            ? palabra.silabas.map((s, i) => (
                <span key={i} className={i % 2 ? 'silaba silaba-b' : 'silaba silaba-a'}>{s}</span>
              ))
            : palabra.texto}
        </button>
        <div className="fila">
          <button className="boton boton-secundario boton-redondo" onClick={anterior} disabled={indice === 0} aria-label="Anterior">◀</button>
          <button className="boton boton-grande" onClick={siguiente}>
            {ultima ? '¡A jugar! 🏀' : 'Siguiente ▶'}
          </button>
        </div>
      </main>
    </div>
  );
}
