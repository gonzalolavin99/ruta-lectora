// Piezas de interfaz que comparten los juegos.

import { PalabraColoreada } from '../../ui/PalabraColoreada';
import type { Disfraz } from '../../sesion/progreso';
import { textoConsigna, type JuegoConConsigna, type Regla } from './reglas';
import { VELOCIDAD_MAX, VELOCIDAD_MIN } from './velocidad';

/**
 * Control "− Velocidad +" para que la fonoaudióloga ajuste ahí mismo.
 * Al tocar − o + la velocidad queda FIJA (🔒) y ya no cambia sola;
 * el botón "Auto" vuelve a dejar que la regla 80/60 la ajuste.
 */
export function ControlVelocidad({
  velocidad,
  fija,
  alCambiar,
  alAlternarAuto,
  etiqueta = 'Velocidad',
  min = VELOCIDAD_MIN,
  max = VELOCIDAD_MAX,
}: {
  velocidad: number;
  fija: boolean;
  alCambiar: (delta: number) => void;
  alAlternarAuto: () => void;
  etiqueta?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className="control-velocidad">
      <button className="boton-vel" onClick={() => alCambiar(-1)} disabled={velocidad <= min} aria-label={`Menos (${etiqueta})`}>−</button>
      <div className="vel-valor" aria-live="polite">
        <span>{fija ? `🔒 ${etiqueta}` : etiqueta}</span>
        <strong>{velocidad}</strong>
      </div>
      <button className="boton-vel" onClick={() => alCambiar(1)} disabled={velocidad >= max} aria-label={`Más (${etiqueta})`}>+</button>
      <button
        className={fija ? 'boton-auto' : 'boton-auto activo'}
        onClick={alAlternarAuto}
        aria-pressed={!fija}
        title={fija ? 'Volver a ajuste automático' : 'La velocidad se ajusta sola según los aciertos'}
      >
        Auto
      </button>
    </div>
  );
}

/** Fila de disfraces para elegir; los que faltan por desbloquear muestran el nivel. */
export function SelectorDisfraz({
  disfraces,
  nivel,
  elegido,
  alElegir,
}: {
  disfraces: Disfraz[];
  nivel: number;
  elegido: string;
  alElegir: (id: string) => void;
}) {
  return (
    <div className="disfraces" role="radiogroup" aria-label="Elige tu personaje">
      {disfraces.map((d) => {
        const bloqueado = d.nivel > nivel;
        return (
          <button
            key={d.id}
            className={d.id === elegido ? 'disfraz elegido' : 'disfraz'}
            onClick={() => !bloqueado && alElegir(d.id)}
            disabled={bloqueado}
            role="radio"
            aria-checked={d.id === elegido}
            aria-label={bloqueado ? `${d.nombre}, se desbloquea en el nivel ${d.nivel}` : d.nombre}
          >
            <span className="disfraz-emoji" aria-hidden>{bloqueado ? '🔒' : d.emoji}</span>
            <span className="disfraz-nombre">{bloqueado ? `Nivel ${d.nivel}` : d.nombre}</span>
          </button>
        );
      })}
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
