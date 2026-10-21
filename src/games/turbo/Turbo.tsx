// Turbo: carrera de lectura contra un rival. Aparece una palabra por un momento y se tapa.
//   - Bien leída  → el niño avanza mucho (con turbo ⚡) y el rival un poco.
//   - Con error   → el rival avanza mucho y el niño un poco (ver avance.ts).
// El paisaje corre mientras dura la carrera. Gana el primero que llega a la meta (10 pasos):
// si es el niño, celebración en la pista y luego podio con copa.
// Personajes: auto (carretera), delfín (mar), cohete (espacio). Dos modos:
//   - "Leo en voz alta": la fonoaudióloga marca ✓ / ✗ (botones grandes abajo o flechas → ← en el Mac).
//   - "Elijo la palabra": al taparse, el niño elige entre 3 cuál vio.

import { useCallback, useEffect, useRef, useState } from 'react';
import { registrarRespuesta, type EstadoAdaptativo } from '../../engine/adaptativo';
import type { Estimulo } from '../../engine/contenido';
import { DISFRACES, nivelDe, resultadoDeRonda, type ResultadoRonda } from '../../sesion/progreso';
import { FAMILIA_FUENTE } from '../../ui/tema';
import { PalabraColoreada } from '../../ui/PalabraColoreada';
import { FinDeRonda, type PropsJuego } from '../comun/JuegoArcade';
import { ControlVelocidad, SelectorDisfraz } from '../comun/ui';
import { VELOCIDAD_MAX, VELOCIDAD_MIN } from '../comun/velocidad';
import { avanzar, ganador, PASOS_META, type Pasos } from './avance';
import { Carrera, Podio } from './carrera';
import { barajar, exposicionMs, opcionesElegir } from './exposicion';

type Modo = 'voz' | 'elegir';
type Fase = 'modo' | 'mostrando' | 'tapada' | 'revision' | 'meta' | 'fin';

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
  const [indice, setIndice] = useState(0); // palabras mostradas (la cola se recorre en círculo)
  const [pasos, setPasos] = useState<Pasos>({ nino: 0, rival: 0 });
  const pasosRef = useRef<Pasos>({ nino: 0, rival: 0 });
  const conteoRef = useRef({ bien: 0, error: 0 });
  const [conteo, setConteo] = useState({ bien: 0, error: 0 });
  const [opciones, setOpciones] = useState<Estimulo[]>([]);
  const [elegida, setElegida] = useState<string | null>(null);
  const [turbo, setTurbo] = useState(0); // cambia en cada acierto para repetir la animación
  const [resultado, setResultado] = useState<ResultadoRonda | null>(null);
  const inicioRef = useRef(0);
  const [segundos, setSegundos] = useState(0);

  const palabra = cola[indice % cola.length];
  const familia = FAMILIA_FUENTE[fuente];
  const personaje = DISFRACES.turbo.find((d) => d.id === props.disfraz)?.id ?? 'auto';
  const nivelSesion = nivelDe(props.estrellasSesion);
  const llegada = ganador(pasos);
  const gano = llegada === 'nino';

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
    pasosRef.current = { nino: 0, rival: 0 };
    setPasos(pasosRef.current);
    conteoRef.current = { bien: 0, error: 0 };
    setConteo(conteoRef.current);
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

  // Al llegar alguien a la meta: ver el cruce (y la celebración si ganó el niño) y luego el podio.
  useEffect(() => {
    if (fase !== 'meta') return;
    const id = setTimeout(() => setFase('fin'), gano ? 2600 : 1400);
    return () => clearTimeout(id);
  }, [fase, gano]);

  const siguiente = useCallback(() => {
    setElegida(null);
    if (ganador(pasosRef.current)) {
      setSegundos(Math.round((performance.now() - inicioRef.current) / 1000));
      const { bien, error } = conteoRef.current;
      const r = resultadoDeRonda(props.estrellasSesion, bien, bien + error);
      setResultado(r);
      props.alSumarEstrellas(r.estrellas);
      setFase('meta');
    } else {
      setIndice((i) => i + 1);
      setFase('mostrando');
    }
  }, [props]);

  const registrar = useCallback(
    (correcta: boolean) => {
      pasosRef.current = avanzar(pasosRef.current, correcta);
      setPasos(pasosRef.current);
      const c = conteoRef.current;
      conteoRef.current = correcta ? { ...c, bien: c.bien + 1 } : { ...c, error: c.error + 1 };
      setConteo(conteoRef.current);
      if (correcta) setTurbo((t) => t + 1);
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
      siguiente();
    },
    [modo, fase, registrar, siguiente],
  );

  // Modo elegir: el niño toca una opción. Si se equivoca, se marca la correcta un momento.
  const elegir = (opcion: Estimulo) => {
    if (fase !== 'tapada' || elegida) return;
    const correcta = opcion.texto === palabra.texto;
    setElegida(opcion.texto);
    registrar(correcta);
    setFase('revision');
    setTimeout(siguiente, correcta ? 500 : 1100);
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

  const leidas = conteo.bien + conteo.error;
  const ppm = segundos > 0 ? Math.round((leidas / segundos) * 60) : 0;
  const enJuego = fase === 'mostrando' || fase === 'tapada' || fase === 'revision';

  return (
    <div className="juego turbo">
      <header className="juego-barra">
        <button className="boton-icono" onClick={props.alSalir} aria-label="Salir">✕</button>
        <div className="consigna">
          <span>{modo === 'elegir' ? 'Mira la palabra y elige cuál era' : modo === 'voz' ? 'Lee la palabra en voz alta' : 'Turbo'}</span>
        </div>
        <ControlVelocidad velocidad={velocidad} fija={fija} alCambiar={cambiarVelocidad} alAlternarAuto={alternarAuto} />
        <div className="marcador">
          <div className="encestadas" aria-label={`${Math.floor(pasos.nino)} de ${PASOS_META} pasos`}>🏁 {Math.floor(pasos.nino)}/{PASOS_META}</div>
        </div>
      </header>

      <main className="turbo-escena">
        <Carrera
          personaje={personaje}
          pasosNino={pasos.nino}
          pasosRival={pasos.rival}
          turbo={turbo}
          enMarcha={enJuego || fase === 'meta'}
          llegada={fase === 'meta' ? llegada : null}
        >
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
          {fase === 'meta' && (
            <div className={gano ? 'carrera-llegada ganaste' : 'carrera-llegada'}>{gano ? '🏆 ¡Ganaste!' : '🏁 ¡Casi!'}</div>
          )}
        </Carrera>

        {modo === 'voz' && enJuego && (
          <div className="turbo-fono" aria-label="Botones de la fonoaudióloga">
            <button className="boton-fono bien" onClick={() => marcar(true)} aria-label="Leyó bien">✓</button>
            <button className="boton-fono error" onClick={() => marcar(false)} aria-label="Leyó con error">✗</button>
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
              <small className="nota-fono">
                Bien leída: tú aceleras. Con error: acelera el rival. Gana el primero en llegar a la meta.
                En "voz alta", la fono marca ✓ / ✗ abajo (o flechas → ← en el Mac).
              </small>
            </div>
          </div>
        )}

        {fase === 'fin' && (
          <FinDeRonda
            resultado={resultado}
            resumen={
              <div className="resumen-turbo">
                <Podio personaje={personaje} gano={gano} />
                <div>
                  ✓ <strong>{conteo.bien}</strong> · ✗ <strong>{conteo.error}</strong> · ⏱ <strong>{segundos}</strong> s
                </div>
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
