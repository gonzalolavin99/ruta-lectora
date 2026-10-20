// Turbo: una carrera de lectura. Aparece una palabra por un momento, se tapa,
// y el personaje avanza. Personajes: auto (carretera), delfín (mar) y cohete (espacio).
// Dos modos:
//   - "Leo en voz alta": el niño lee y la fonoaudióloga marca ✓ o ✗
//     (botones discretos abajo, o flechas → ← en el Mac).
//   - "Elijo la palabra": al taparse, el niño elige entre 3 cuál vio.
// El personaje avanza siempre (nunca se castiga); acertar le da turbo ⚡.

import { useCallback, useEffect, useRef, useState } from 'react';
import { registrarRespuesta, type EstadoAdaptativo } from '../../engine/adaptativo';
import type { Estimulo } from '../../engine/contenido';
import { DISFRACES, nivelDe, resultadoDeRonda, type ResultadoRonda } from '../../sesion/progreso';
import { FAMILIA_FUENTE } from '../../ui/tema';
import { PalabraColoreada } from '../../ui/PalabraColoreada';
import { FinDeRonda, type PropsJuego } from '../comun/JuegoArcade';
import { ControlVelocidad, SelectorDisfraz } from '../comun/ui';
import { VELOCIDAD_MAX, VELOCIDAD_MIN } from '../comun/velocidad';
import { barajar, exposicionMs, opcionesElegir } from './exposicion';
import { Personaje } from './personajes';

type Modo = 'voz' | 'elegir';
type Fase = 'modo' | 'mostrando' | 'tapada' | 'revision' | 'fin';

interface Props extends Omit<PropsJuego, 'regla' | 'sonido'> {
  banco: Estimulo[]; // banco completo, para las opciones del modo "Elige"
}

const TAMANO_BLOQUE = 10;

export function Turbo(props: Props) {
  const { fuente, colorearLetras, palabras, banco, alCambiarVelocidad } = props;
  const estadoRef = useRef<EstadoAdaptativo>({
    nivel: props.velocidadInicial,
    fijado: props.velocidadFijaInicial,
    refuerzo: false,
    bloque: [],
  });
  const [velocidad, setVelocidad] = useState(props.velocidadInicial);
  const [fija, setFija] = useState(props.velocidadFijaInicial);
  const [modo, setModo] = useState<Modo | null>(null);
  const [fase, setFase] = useState<Fase>('modo');
  const [cola, setCola] = useState<Estimulo[]>(() => barajar(palabras));
  const [indice, setIndice] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [opciones, setOpciones] = useState<Estimulo[]>([]);
  const [elegida, setElegida] = useState<string | null>(null);
  const [turbo, setTurbo] = useState(0); // cambia en cada acierto para repetir la animación
  const [resultado, setResultado] = useState<ResultadoRonda | null>(null);
  const inicioRef = useRef(0);
  const aciertosRef = useRef(0);
  const [segundos, setSegundos] = useState(0);

  const palabra = cola[indice];
  const familia = FAMILIA_FUENTE[fuente];
  const personaje = DISFRACES.turbo.find((d) => d.id === props.disfraz)?.id ?? 'auto';
  const nivelSesion = nivelDe(props.estrellasSesion);

  const fijarVelocidad = useCallback(
    (estado: EstadoAdaptativo) => {
      estadoRef.current = estado;
      setVelocidad(estado.nivel);
      setFija(estado.fijado);
      alCambiarVelocidad(estado.nivel, estado.fijado);
    },
    [alCambiarVelocidad],
  );

  const empezar = (m: Modo) => {
    setModo(m);
    setCola(barajar(palabras));
    setIndice(0);
    setAciertos(0);
    aciertosRef.current = 0;
    setResultado(null);
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
      const r = resultadoDeRonda(props.estrellasSesion, aciertosRef.current, cola.length);
      setResultado(r);
      props.alSumarEstrellas(r.estrellas);
      setFase('fin');
    } else {
      setIndice((i) => i + 1);
      setFase('mostrando');
    }
  }, [indice, cola.length, props]);

  const registrar = useCallback(
    (correcta: boolean) => {
      if (correcta) {
        aciertosRef.current++;
        setAciertos(aciertosRef.current);
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

  // Tocar − o + deja la velocidad fija; "Auto" vuelve al ajuste automático.
  const cambiarVelocidad = (delta: number) => {
    const nivel = Math.min(VELOCIDAD_MAX, Math.max(VELOCIDAD_MIN, estadoRef.current.nivel + delta));
    fijarVelocidad({ ...estadoRef.current, nivel, fijado: true, refuerzo: false, bloque: [] });
  };
  const alternarAuto = () => fijarVelocidad({ ...estadoRef.current, fijado: !estadoRef.current.fijado, refuerzo: false, bloque: [] });

  const progreso = cola.length ? Math.min(indice, cola.length) / cola.length : 0;
  const ppm = segundos > 0 ? Math.round((cola.length / segundos) * 60) : 0;

  return (
    <div className="juego turbo">
      <header className="juego-barra">
        <button className="boton-icono" onClick={props.alSalir} aria-label="Salir">✕</button>
        <div className="consigna">
          <span>{modo === 'elegir' ? 'Mira la palabra y elige cuál era' : modo === 'voz' ? 'Lee la palabra en voz alta' : 'Turbo'}</span>
        </div>
        <ControlVelocidad velocidad={velocidad} fija={fija} alCambiar={cambiarVelocidad} alAlternarAuto={alternarAuto} />
        <div className="marcador">
          <div className="encestadas" aria-label={`${aciertos} turbos`}>⚡ {aciertos}</div>
        </div>
      </header>

      <main className={`turbo-escena escena-${personaje}`}>
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
                    <span>
                      <PalabraColoreada texto={o.texto} activo={colorearLetras} />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Pista personaje={personaje} progreso={progreso} turbo={turbo} />

        {modo === 'voz' && (fase === 'mostrando' || fase === 'tapada') && (
          <div className="turbo-fono" aria-label="Botones de la fonoaudióloga">
            <button className="boton-fono error" onClick={() => marcar(false)} aria-label="Leyó con error">✗</button>
            <button className="boton-fono bien" onClick={() => marcar(true)} aria-label="Leyó bien">✓</button>
          </div>
        )}

        {fase === 'modo' && (
          <div className="capa">
            <div className="tarjeta tarjeta-consigna">
              <h2>¿Con quién corres?</h2>
              <SelectorDisfraz disfraces={DISFRACES.turbo} nivel={nivelSesion} elegido={personaje} alElegir={props.alElegirDisfraz} />
              <div className="fila">
                <button className="boton boton-grande" onClick={() => empezar('voz')}>🗣️ Leo en voz alta</button>
                <button className="boton boton-grande boton-secundario" onClick={() => empezar('elegir')}>👆 Elijo la palabra</button>
              </div>
              <small className="nota-fono">En "voz alta", la fono marca ✓ / ✗ abajo a la derecha (o flechas → ← en el Mac).</small>
            </div>
          </div>
        )}

        {fase === 'fin' && (
          <FinDeRonda
            resultado={resultado}
            resumen={
              <div className="resumen-turbo">
                <div>🏁 <strong>{cola.length}</strong> palabras</div>
                <div>⏱ <strong>{segundos}</strong> s · ⚡ <strong>{aciertos}</strong></div>
                {modo === 'voz' && <small>≈ {ppm} palabras por minuto</small>}
              </div>
            }
            alOtraVez={() => setFase('modo')}
            alOtroJuego={props.alOtroJuego}
            alPalabrasNuevas={props.alPalabrasNuevas}
            alSalir={props.alSalir}
          />
        )}
      </main>
    </div>
  );
}

/** Pista de carrera: carretera, mar o espacio según el personaje. */
function Pista({ personaje, progreso, turbo }: { personaje: string; progreso: number; turbo: number }) {
  return (
    <div className="pista">
      <div className={`pista-camino pista-${personaje}`}>
        <div className="pista-meta" aria-hidden />
        <div className="pista-auto" style={{ left: `calc(${progreso} * (100% - 160px))` }}>
          {turbo > 0 && <span key={turbo} className="pista-turbo" aria-hidden>⚡</span>}
          <Personaje id={personaje} />
        </div>
      </div>
    </div>
  );
}
