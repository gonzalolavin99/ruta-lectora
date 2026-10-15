// Piezas de interfaz que comparten los juegos.

import { PalabraColoreada } from '../../ui/PalabraColoreada';
import { textoConsigna, type JuegoConConsigna, type Regla } from './reglas';
import { VELOCIDAD_MAX, VELOCIDAD_MIN } from './velocidad';

/** Control "− Velocidad +" para que la fonoaudióloga ajuste ahí mismo. */
export function ControlVelocidad({ velocidad, alCambiar }: { velocidad: number; alCambiar: (delta: number) => void }) {
  return (
    <div className="control-velocidad">
      <button className="boton-vel" onClick={() => alCambiar(-1)} disabled={velocidad <= VELOCIDAD_MIN} aria-label="Más lento">−</button>
      <div className="vel-valor" aria-live="polite">
        <span>Velocidad</span>
        <strong>{velocidad}</strong>
      </div>
      <button className="boton-vel" onClick={() => alCambiar(1)} disabled={velocidad >= VELOCIDAD_MAX} aria-label="Más rápido">+</button>
    </div>
  );
}

export function Consigna({
  regla,
  juego,
  colorearLetras,
  grande = false,
}: {
  regla: Regla;
  juego: JuegoConConsigna;
  colorearLetras: boolean;
  grande?: boolean;
}) {
  return (
    <div className={grande ? 'consigna consigna-grande' : 'consigna'}>
      <span>{textoConsigna(regla, juego)}</span>
      <span className="consigna-valor">
        <span>
          <PalabraColoreada texto={regla.valor} activo={colorearLetras} />
        </span>
      </span>
    </div>
  );
}

export function IconoVida({ apagada }: { apagada: boolean }) {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" className={apagada ? 'vida apagada' : 'vida'} aria-hidden>
      <path
        d="M20 34s-13-7.6-13-17a7 7 0 0 1 13-3.6A7 7 0 0 1 33 17c0 9.4-13 17-13 17z"
        fill="#FF4F8B"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconoAro() {
  return (
    <svg viewBox="0 0 40 40" width="36" height="36" aria-hidden>
      <ellipse cx="20" cy="12" rx="15" ry="5" fill="none" stroke="#FF4F8B" strokeWidth="4" />
      <path d="M6 13l5 20h18l5-20M13 14l3 19M27 14l-3 19M9 22h22" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function IconoBurbuja() {
  return (
    <svg viewBox="0 0 40 40" width="36" height="36" aria-hidden>
      <circle cx="20" cy="20" r="15" fill="#4CC9F0" fillOpacity=".5" stroke="currentColor" strokeWidth="2.5" />
      <path d="M11 17a9 9 0 0 1 6-6" fill="none" stroke="#FFFDF7" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
