// Memoria: se muestran N palabras numeradas, se tapan, y el niño toca las
// cartas en el mismo orden. 6 intentos por ronda.
//   - Acierta la secuencia completa → ⚡ y "pop".
//   - Se equivoca → la carta tiembla y se muestra el orden correcto un momento.
// La dificultad es cuántas palabras recordar (2 a 5), con − + / Auto como en los otros juegos.

import { useCallback, useEffect, useRef, useState } from 'react';
import { activarSonido, sonarPop } from '../../audio/efectos';
import { registrarRespuesta, type EstadoAdaptativo } from '../../engine/adaptativo';
import type { Estimulo } from '../../engine/contenido';
import { DISFRACES, nivelDe, resultadoDeRonda, type ResultadoRonda } from '../../sesion/progreso';
import { FAMILIA_FUENTE } from '../../ui/tema';
import { PalabraColoreada } from '../../ui/PalabraColoreada';
import { FinDeRonda, type PropsJuego } from '../comun/JuegoArcade';
import { ControlVelocidad, SelectorDisfraz } from '../comun/ui';
import {
  CANTIDAD_MAX,
  CANTIDAD_MIN,
  INTENTOS_POR_RONDA,
  TAMANO_BLOQUE_MEMORIA,
  armarIntento,
  msParaMirar,
  type Intento,
} from './intentos';

type Fase = 'inicio' | 'mirar' | 'buscar' | 'revision' | 'fin';

type Props = Omit<PropsJuego, 'regla'>;

export function Memoria(props: Props) {
  const { fuente, colorearLetras, palabras, alCambiarVelocidad } = props;
  const inicial = Math.min(CANTIDAD_MAX, Math.max(CANTIDAD_MIN, props.velocidadInicial));
  const estadoRef = useRef<EstadoAdaptativo>({ nivel: inicial, fijado: props.velocidadFijaInicial, refuerzo: false, bloque: [] });
  const [cantidad, setCantidad] = useState(inicial);
  const [fija, setFija] = useState(props.velocidadFijaInicial);
  const [fase, setFase] = useState<Fase>('inicio');
  const [numero, setNumero] = useState(0); // intento actual (0..5)
  const [intento, setIntento] = useState<Intento | null>(null);
  const [tocadas, setTocadas] = useState<string[]>([]); // textos tocados bien, en orden
  const [error, setError] = useState<string | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const aciertosRef = useRef(0);
  const [resultado, setResultado] = useState<ResultadoRonda | null>(null);

  const familia = FAMILIA_FUENTE[fuente];
  const reverso = DISFRACES.memoria.find((d) => d.id === props.disfraz)?.emoji ?? '⭐';
  const nivelSesion = nivelDe(props.estrellasSesion);

  const fijar = useCallback(
    (estado: EstadoAdaptativo) => {
      estadoRef.current = estado;
      setCantidad(estado.nivel);
      setFija(estado.fijado);
      alCambiarVelocidad(estado.nivel, estado.fijado);
    },
    [alCambiarVelocidad],
  );

  const nuevoIntento = useCallback(() => {
    setIntento(armarIntento(palabras, estadoRef.current.nivel));
    setTocadas([]);
    setError(null);
    setFase('mirar');
  }, [palabras]);

  const empezar = () => {
    activarSonido();
    setNumero(0);
    setAciertos(0);
    aciertosRef.current = 0;
    setResultado(null);
    nuevoIntento();
  };

  // Mirar las palabras un rato y después taparlas.
  useEffect(() => {
    if (fase !== 'mirar' || !intento) return;
    const id = setTimeout(() => setFase('buscar'), msParaMirar(intento.secuencia.length));
    return () => clearTimeout(id);
  }, [fase, intento]);

  const terminarIntento = useCallback(
    (correcto: boolean) => {
      if (correcto) {
        aciertosRef.current++;
        setAciertos(aciertosRef.current);
      }
      const anterior = estadoRef.current.nivel;
      const { estado } = registrarRespuesta(estadoRef.current, correcto, {
        tamanoBloque: TAMANO_BLOQUE_MEMORIA,
        min: CANTIDAD_MIN,
        max: CANTIDAD_MAX,
      });
      if (estado.nivel !== anterior) fijar(estado);
      else estadoRef.current = estado;

      setFase('revision');
      setTimeout(
        () => {
          if (numero + 1 >= INTENTOS_POR_RONDA) {
            const r = resultadoDeRonda(props.estrellasSesion, aciertosRef.current, INTENTOS_POR_RONDA);
            setResultado(r);
            props.alSumarEstrellas(r.estrellas);
            setFase('fin');
          } else {
            setNumero((n) => n + 1);
            nuevoIntento();
          }
        },
        correcto ? 900 : 2000,
      );
    },
    [fijar, numero, nuevoIntento, props],
  );

  const tocar = (carta: Estimulo) => {
    if (fase !== 'buscar' || !intento || tocadas.includes(carta.texto)) return;
    const esperada = intento.secuencia[tocadas.length];
    if (carta.texto === esperada.texto) {
      const nuevas = [...tocadas, carta.texto];
      setTocadas(nuevas);
      if (nuevas.length === intento.secuencia.length) {
        if (props.sonido) sonarPop();
        terminarIntento(true);
      }
    } else {
      setError(carta.texto);
      terminarIntento(false);
    }
  };

  // − / + dejan la cantidad fija (se aplica en el próximo intento); "Auto" vuelve al ajuste por aciertos.
  const cambiarCantidad = (delta: number) => {
    const nivel = Math.min(CANTIDAD_MAX, Math.max(CANTIDAD_MIN, estadoRef.current.nivel + delta));
    fijar({ ...estadoRef.current, nivel, fijado: true, refuerzo: false, bloque: [] });
  };
  const alternarAuto = () => fijar({ ...estadoRef.current, fijado: !estadoRef.current.fijado, refuerzo: false, bloque: [] });

  const mostrarOrden = fase === 'revision' && error !== null;

  return (
    <div className="juego memoria">
      <header className="juego-barra">
        <button className="boton-icono" onClick={props.alSalir} aria-label="Salir">✕</button>
        <div className="consigna">
          <span>
            {fase === 'mirar' ? 'Mira y recuerda el orden' : fase === 'buscar' || fase === 'revision' ? 'Toca las palabras en el mismo orden' : 'Memoria'}
          </span>
        </div>
        <ControlVelocidad
          velocidad={cantidad}
          fija={fija}
          alCambiar={cambiarCantidad}
          alAlternarAuto={alternarAuto}
          etiqueta="Palabras"
          min={CANTIDAD_MIN}
          max={CANTIDAD_MAX}
        />
        <div className="marcador">
          <div className="encestadas" aria-label={`Intento ${Math.min(numero + 1, INTENTOS_POR_RONDA)} de ${INTENTOS_POR_RONDA}`}>
            🧠 {Math.min(numero + 1, INTENTOS_POR_RONDA)}/{INTENTOS_POR_RONDA}
          </div>
        </div>
      </header>

      <main className="memoria-escena">
        {intento && fase !== 'inicio' && fase !== 'fin' && (
          <>
            {/* Huecos numerados: arriba se ve el orden (al mirar) o lo que el niño va encontrando */}
            <div className="memoria-huecos">
              {intento.secuencia.map((e, i) => {
                const visible = fase === 'mirar' || tocadas.length > i || mostrarOrden;
                return (
                  <div key={i} className={`hueco${visible ? ' lleno' : ''}${mostrarOrden && tocadas.length <= i ? ' pista' : ''}`} style={{ fontFamily: familia }}>
                    <span className="hueco-numero">{i + 1}</span>
                    {visible ? (
                      <span className="hueco-palabra">
                        <PalabraColoreada texto={e.texto} activo={colorearLetras} />
                      </span>
                    ) : (
                      <span className="hueco-reverso" aria-hidden>{reverso}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {fase === 'mirar' && (
              <div className="memoria-reloj" aria-hidden>
                <div className="memoria-reloj-barra" style={{ animationDuration: `${msParaMirar(intento.secuencia.length)}ms` }} />
              </div>
            )}

            {(fase === 'buscar' || fase === 'revision') && (
              <div className="memoria-mesa">
                {intento.mesa.map((carta) => {
                  const usada = tocadas.includes(carta.texto);
                  const clase = usada ? ' usada' : error === carta.texto ? ' error' : '';
                  return (
                    <button key={carta.texto} className={`memoria-carta${clase}`} style={{ fontFamily: familia }} onClick={() => tocar(carta)} disabled={fase !== 'buscar'}>
                      {usada && <span className="carta-numero">{tocadas.indexOf(carta.texto) + 1}</span>}
                      <span>
                        <PalabraColoreada texto={carta.texto} activo={colorearLetras} />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {fase === 'inicio' && (
          <div className="capa">
            <div className="tarjeta tarjeta-consigna">
              <h2>Memoria 🧠</h2>
              <p className="pista-arrastrar">Mira las palabras, recuerda el orden y búscalas.</p>
              <SelectorDisfraz disfraces={DISFRACES.memoria} nivel={nivelSesion} elegido={props.disfraz} alElegir={props.alElegirDisfraz} />
              <button className="boton boton-grande" onClick={empezar}>¡Vamos!</button>
            </div>
          </div>
        )}

        {fase === 'fin' && (
          <FinDeRonda
            resultado={resultado}
            resumen={<div>🧠 <strong>{aciertos}</strong> de {INTENTOS_POR_RONDA}</div>}
            alOtraVez={() => setFase('inicio')}
            alOtroJuego={props.alOtroJuego}
            alPalabrasNuevas={props.alPalabrasNuevas}
            alSalir={props.alSalir}
          />
        )}
      </main>
    </div>
  );
}
