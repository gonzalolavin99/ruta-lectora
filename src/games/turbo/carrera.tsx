// Escenario de Turbo: paisaje + pista de dos carriles (rival arriba, niño abajo)
// y el podio final. Todo con anchos explícitos y posiciones en %, para que se vea
// igual en Safari (iPad) que en el computador.

import type { ReactNode } from 'react';
import { Personaje, colorRival } from './personajes';

export const PASOS_META = 10;

/** Posición horizontal en la pista: 0 = largada, 1 = meta (el vehículo queda justo antes de la línea). */
function estiloPosicion(progreso: number) {
  const p = Math.max(0, Math.min(1, progreso)) * 100;
  return { left: `${p}%`, transform: `translateX(-${p}%)` };
}

export function Carrera({
  personaje,
  pasosNino,
  pasosRival,
  turbo,
  children,
}: {
  personaje: string;
  pasosNino: number;
  pasosRival: number;
  turbo: number;
  children: ReactNode; // la palabra o las opciones, en el cielo
}) {
  return (
    <div className={`carrera carrera-${personaje}`}>
      <div className="carrera-cielo">
        <span className="nube n1" aria-hidden />
        <span className="nube n2" aria-hidden />
        <span className="nube n3" aria-hidden />
        <svg className="carrera-cerros" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden>
          <path d="M0 200 L0 120 L120 40 L230 130 L360 20 L520 140 L650 50 L790 150 L900 60 L1000 120 L1000 200 Z" className="cerro-atras" />
          <path d="M0 200 L0 160 L160 90 L300 170 L460 100 L620 175 L760 110 L900 170 L1000 130 L1000 200 Z" className="cerro-adelante" />
        </svg>
        <div className="carrera-centro">{children}</div>
      </div>

      <div className="carrera-pista">
        <div className="carrera-meta" aria-hidden />
        <div className="carril carril-rival">
          <div className="corredor" style={estiloPosicion(pasosRival / PASOS_META)}>
            <Personaje id={personaje} color={colorRival(personaje)} />
          </div>
        </div>
        <div className="carril carril-nino">
          <div className="corredor" style={estiloPosicion(pasosNino / PASOS_META)}>
            <span className="corredor-tu">Tú</span>
            {turbo > 0 && <span key={turbo} className="pista-turbo" aria-hidden>⚡</span>}
            <Personaje id={personaje} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Podio final: el niño arriba con la copa si ganó; si no, 2° lugar ("¡Casi!"). */
export function Podio({ personaje, gano }: { personaje: string; gano: boolean }) {
  const nino = <Personaje id={personaje} />;
  const rival = <Personaje id={personaje} color={colorRival(personaje)} />;
  return (
    <div className="podio">
      {gano && (
        <div className="confeti" aria-hidden>
          {Array.from({ length: 18 }, (_, i) => (
            <span key={i} style={{ left: `${(i * 53) % 100}%`, animationDelay: `${(i % 6) * 0.12}s` }} />
          ))}
        </div>
      )}
      <div className="podio-titulo">{gano ? '¡Ganaste la carrera!' : '¡Casi! Segundo lugar'}</div>
      <div className="podio-bloques">
        <div className="podio-puesto puesto-2">
          <div className="podio-corredor">{gano ? rival : nino}</div>
          <div className="podio-bloque">2</div>
        </div>
        <div className="podio-puesto puesto-1">
          <div className="podio-copa" aria-hidden>🏆</div>
          <div className="podio-corredor">{gano ? nino : rival}</div>
          <div className="podio-bloque">1</div>
        </div>
        <div className="podio-puesto puesto-3">
          <div className="podio-bloque">3</div>
        </div>
      </div>
    </div>
  );
}
