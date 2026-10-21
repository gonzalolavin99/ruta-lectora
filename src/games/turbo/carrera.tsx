// Escenario de Turbo: paisaje + pista de dos carriles (rival arriba, niño abajo)
// y el podio final. Todo con anchos explícitos y posiciones en %, para que se vea
// igual en Safari (iPad) que en el computador.
// Mientras la carrera está en marcha, el paisaje corre hacia atrás (nubes, cerros y
// las líneas de la pista), las ruedas giran y los dos corredores se mueven.

import type { ReactNode } from 'react';
import { PASOS_META } from './avance';
import { Personaje, colorRival } from './personajes';

export { PASOS_META };

/** Posición horizontal en la pista: 0 = largada, 1 = meta (el vehículo queda justo antes de la línea). */
function estiloPosicion(progreso: number) {
  const p = Math.max(0, Math.min(1, progreso)) * 100;
  return { left: `${p}%`, transform: `translateX(-${p}%)` };
}

// Cada tira de cerros tiene dos copias seguidas; al moverse la mitad del ancho, vuelve a empezar sin saltos.
// Los bordes del dibujo quedan fuera del cuadro para que no se vea una raya vertical en la unión.
const CERROS_ATRAS = 'M-10 210 L-10 120 L0 120 L120 40 L230 130 L360 20 L520 140 L650 50 L790 150 L900 60 L1000 120 L1010 120 L1010 210 Z';
const CERROS_ADELANTE = 'M-10 210 L-10 160 L0 160 L160 90 L300 170 L460 100 L620 175 L760 110 L900 170 L1000 160 L1010 160 L1010 210 Z';

function Tira({ d, clase }: { d: string; clase: string }) {
  return (
    <div className={`carrera-tira ${clase}`} aria-hidden>
      {[0, 1].map((i) => (
        <svg key={i} viewBox="0 0 1000 200" preserveAspectRatio="none">
          <path d={d} className={clase} />
        </svg>
      ))}
    </div>
  );
}

export function Confeti({ cantidad = 18 }: { cantidad?: number }) {
  return (
    <div className="confeti" aria-hidden>
      {Array.from({ length: cantidad }, (_, i) => (
        <span key={i} style={{ left: `${(i * 53) % 100}%`, animationDelay: `${(i % 6) * 0.12}s` }} />
      ))}
    </div>
  );
}

export function Carrera({
  personaje,
  pasosNino,
  pasosRival,
  turbo,
  enMarcha,
  llegada,
  children,
}: {
  personaje: string;
  pasosNino: number;
  pasosRival: number;
  turbo: number;
  enMarcha: boolean; // el paisaje corre y las ruedas giran
  llegada: 'nino' | 'rival' | null; // quién cruzó la meta (para la celebración)
  children: ReactNode; // la palabra o las opciones, en el cielo
}) {
  return (
    <div className={`carrera carrera-${personaje}${enMarcha ? ' en-marcha' : ''}${llegada === 'nino' ? ' celebrando' : ''}`}>
      <div className="carrera-cielo">
        <span className="nube n1" aria-hidden />
        <span className="nube n2" aria-hidden />
        <span className="nube n3" aria-hidden />
        <Tira d={CERROS_ATRAS} clase="cerro-atras" />
        <Tira d={CERROS_ADELANTE} clase="cerro-adelante" />
        <div className="carrera-centro">{children}</div>
      </div>

      <div className="carrera-pista">
        <div className="carrera-meta" aria-hidden />
        <div className="carril carril-rival">
          <div className="corredor" style={estiloPosicion(pasosRival / PASOS_META)}>
            <div className={`corredor-cuerpo${llegada === 'rival' ? ' cruza' : ''}`}>
              <Personaje id={personaje} color={colorRival(personaje)} />
            </div>
          </div>
        </div>
        <div className="carril carril-nino">
          <div className="corredor" style={estiloPosicion(pasosNino / PASOS_META)}>
            <div key={turbo} className={`corredor-cuerpo${turbo > 0 ? ' impulso' : ''}${llegada === 'nino' ? ' cruza' : ''}`}>
              <span className="corredor-tu">Tú</span>
              {turbo > 0 && <span className="pista-turbo" aria-hidden>⚡</span>}
              <Personaje id={personaje} />
            </div>
          </div>
        </div>
      </div>

      {llegada === 'nino' && (
        <div className="carrera-fiesta" aria-hidden>
          <Confeti cantidad={36} />
          {['12%', '50%', '86%'].map((left, i) => (
            <span key={left} className="fuego-artificial" style={{ left, animationDelay: `${i * 0.25}s` }} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Podio final: el niño arriba con la copa si ganó; si no, 2° lugar ("¡Casi!"). */
export function Podio({ personaje, gano }: { personaje: string; gano: boolean }) {
  const nino = <Personaje id={personaje} />;
  const rival = <Personaje id={personaje} color={colorRival(personaje)} />;
  return (
    <div className="podio">
      {gano && <Confeti />}
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
