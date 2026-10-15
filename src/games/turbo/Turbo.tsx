// Turbo: una carrera de lectura. Aparece una palabra por un momento, se tapa,
// y el auto avanza. Dos modos:
//   - "Leo en voz alta": el niño lee y la fonoaudióloga marca ✓ o ✗
//     (botones discretos abajo, o flechas → ← en el Mac).
//   - "Elijo la palabra": al taparse, el niño elige entre 3 cuál vio.
// El auto avanza siempre (nunca se castiga); acertar le da turbo ⚡.

import { useCallback, useEffect, useRef, useState } from 'react';
import { registrarRespuesta, type EstadoAdaptativo } from '../../engine/adaptativo';
import type { Estimulo } from '../../engine/contenido';
import { FAMILIA_FUENTE } from '../../ui/tema';
import { PalabraColoreada } from '../../ui/PalabraColoreada';
import { FinDeRonda, type PropsJuego } from '../comun/JuegoArcade';
import { ControlVelocidad } from '../comun/ui';
import { VELOCIDAD_MAX, VELOCIDAD_MIN } from '../comun/velocidad';
import { barajar, exposicionMs, opcionesElegir } from './exposicion';

type Modo = 'voz' | 'elegir';
type Fase = 'modo' | 'mostrando' | 'tapada' | 'revision' | 'fin';

interface Props extends Omit<PropsJuego, 'regla' | 'sonido'> {
  banco: Estimulo[]; // banco completo, para las opciones del modo "Elige"
}

const TAMANO_BLOQUE = 10;

export function Turbo({ fuente, colorearLetras, palabras, banco, velocidadInicial, alCambiarVelocidad, alOtroJuego, alPalabrasNuevas, alSalir }: Props) {
  const estadoRef = useRef<EstadoAdaptativo>({ nivel: velocidadInicial, fijado: false, refuerzo: false, bloque: [] });
  const [velocidad, setVelocidad] = useState(velocidadInicial);
  const [modo, setModo] = useState<Modo | null>(null);
  const [fase, setFase] = useState<Fase>('modo');
  const [cola, setCola] = useState<Estimulo[]>(() => barajar(palabras));
  const [indice, setIndice] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [opciones, setOpciones] = useState<Estimulo[]>([]);
  const [elegida, setElegida] = useState<string | null>(null);
  const [turbo, setTurbo] = useState(0); // cambia en cada acierto para repetir la animación
  const inicioRef = useRef(0);
  const [segundos, setSegundos] = useState(0);

  const palabra = cola[indice];
  const familia = FAMILIA_FUENTE[fuente];

  const fijarVelocidad = useCallback(
    (estado: EstadoAdaptativo) => {
      estadoRef.current = estado;
      setVelocidad(estado.nivel);
      alCambiarVelocidad(estado.nivel);
    },
    [alCambiarVelocidad],
  );

  const empezar = (m: Modo) => {
    setModo(m);
    setCola(barajar(palabras));
    setIndice(0);
    setAciertos(0);
    inicioRef.current = performance.now();
    setFase('mostrando');
  };

  // Después del tiempo de exposición, la palabra se tapa.
  useEffect(() => {
    if (fase !== 'mostrando') return;
    const id = setTimeout(() => {
      if (modo === 'elegir') setOpciones(opcionesElegir(palabra, palabras, banco));
      setFase('tapada');
    }, exposicionMs(estadoRef.current.nivel));
    return () => clearTimeout(id);
  }, [fase, indice, modo, palabra, palabras, banco]);

  const avanzar = useCallback(() => {
    setElegida(null);
    if (indice + 1 >= cola.length) {
      setSegundos(Math.round((performance.now() - inicioRef.current) / 1000));
      setIndice(cola.length);
      setFase('fin');
    } else {
      setIndice((i) => i + 1);
      setFase('mostrando');
    }
  }, [indice, cola.length]);

  const registrar = useCallback(
    (correcta: boolean) => {
      if (correcta) {
        setAciertos((a) => a + 1);
        setTurbo((t) => t + 1);
      }
      const anterior = estadoRef.current.nivel;
      const { estado } = registrarRespuesta(estadoRef.current, correcta, {
        tamanoBloque: TAMANO_BLOQUE,
        min: VELOCIDAD_MIN,
        max: VELOCIDAD_MAX,
      });
      if (estado.nivel !== anterior) fijarVelocidad(estado);
      else estadoRef.current = estado;
    },
    [fijarVelocidad],
  );

  // Modo voz: la fonoaudióloga marca (se puede marcar apenas el niño termina de leer).
  const marcar = useCallback(
    (correcta: boolean) => {
      if (modo !== 'voz' || (fase !== 'mostrando' && fase !== 'tapada')) return;
      registrar(correcta);
      avanzar();
    },
    [modo, fase, registrar, avanzar],
  );

  // Modo elegir: el niño toca una opción. Si se equivoca, se marca la correcta un momento.
  const elegir = (opcion: Estimulo) => {
    if (fase !== 'tapada' || elegida) return;
    const correcta = opcion.texto === palabra.texto;
    setElegida(opcion.texto);
    registrar(correcta);
    setFase('revision');
    setTimeout(avanzar, correcta ? 450 : 1100);
  };

  // En el Mac: → o Enter = bien leída; ← o Retroceso = con error.
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') marcar(true);
      if (e.key === 'ArrowLeft' || e.key === 'Backspace') marcar(false);
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [marcar]);

  const cambiarVelocidad = (delta: number) => {
    const nivel = Math.min(VELOCIDAD_MAX, Math.max(VELOCIDAD_MIN, estadoRef.current.nivel + delta));
    if (nivel !== estadoRef.current.nivel) fijarVelocidad({ ...estadoRef.current, nivel, refuerzo: false, bloque: [] });
  };

  const progreso = cola.length ? Math.min(indice, cola.length) / cola.length : 0;
  const ppm = segundos > 0 ? Math.round((cola.length / segundos) * 60) : 0;

  return (
    <div className="juego turbo">
      <header className="juego-barra">
        <button className="boton-icono" onClick={alSalir} aria-label="Salir">✕</button>
        <div className="consigna">
          <span>{modo === 'elegir' ? 'Mira la palabra y elige cuál era' : modo === 'voz' ? 'Lee la palabra en voz alta' : 'Turbo'}</span>
        </div>
        <ControlVelocidad velocidad={velocidad} alCambiar={cambiarVelocidad} />
        <div className="marcador">
          <div className="encestadas" aria-label={`${aciertos} turbos`}>⚡ {aciertos}</div>
        </div>
      </header>

      <main className="turbo-escena">
        <div className="turbo-centro">
          {(fase === 'mostrando' || (fase === 'tapada' && modo === 'voz')) && palabra && (
            <div key={palabra.id + indice} className={fase === 'mostrando' ? 'turbo-palabra' : 'turbo-palabra tapada'} style={{ fontFamily: familia }}>
              <span>{fase === 'mostrando' ? <PalabraColoreada texto={palabra.texto} activo={colorearLetras} /> : '?'}</span>
            </div>
          )}
          {(fase === 'tapada' || fase === 'revision') && modo === 'elegir' && (
            <div className="turbo-opciones">
              {opciones.map((o) => {
                const estado =
                  elegida === null ? '' : o.texto === palabra.texto ? ' correcta' : o.texto === elegida ? ' elegida' : ' apagada';
                return (
                  <button key={o.texto} className={`turbo-opcion${estado}`} style={{ fontFamily: familia }} onClick={() => elegir(o)}>
                    <PalabraColoreada texto={o.texto} activo={colorearLetras} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Pista progreso={progreso} turbo={turbo} />

        {modo === 'voz' && (fase === 'mostrando' || fase === 'tapada') && (
          <div className="turbo-fono" aria-label="Botones de la fonoaudióloga">
            <button className="boton-fono error" onClick={() => marcar(false)} aria-label="Leyó con error">✗</button>
            <button className="boton-fono bien" onClick={() => marcar(true)} aria-label="Leyó bien">✓</button>
          </div>
        )}
      </main>

      {fase === 'modo' && (
        <div className="capa">
          <div className="tarjeta tarjeta-consigna">
            <h2>¿Cómo jugamos?</h2>
            <button className="boton boton-grande" onClick={() => empezar('voz')}>🗣️ Leo en voz alta</button>
            <button className="boton boton-grande boton-secundario" onClick={() => empezar('elegir')}>👆 Elijo la palabra</button>
            <small className="nota-fono">En "voz alta", la fono marca ✓ / ✗ abajo a la derecha (o flechas → ← en el Mac).</small>
          </div>
        </div>
      )}

      {fase === 'fin' && (
        <FinDeRonda
          resumen={
            <div className="resumen-turbo">
              <div>🏁 <strong>{cola.length}</strong> palabras</div>
              <div>⏱ <strong>{segundos}</strong> s · ⚡ <strong>{aciertos}</strong></div>
              {modo === 'voz' && <small>≈ {ppm} palabras por minuto</small>}
            </div>
          }
          alOtraVez={() => empezar(modo ?? 'voz')}
          alOtroJuego={alOtroJuego}
          alPalabrasNuevas={alPalabrasNuevas}
          alSalir={alSalir}
        />
      )}
    </div>
  );
}

/** Pista de carrera con el auto. */
function Pista({ progreso, turbo }: { progreso: number; turbo: number }) {
  return (
    <div className="pista">
      <div className="pista-camino">
        <div className="pista-meta" aria-hidden />
        <div className="pista-auto" style={{ left: `calc(${progreso} * (100% - 150px))` }}>
          {turbo > 0 && <span key={turbo} className="pista-turbo" aria-hidden>⚡</span>}
          <Auto />
        </div>
      </div>
    </div>
  );
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
