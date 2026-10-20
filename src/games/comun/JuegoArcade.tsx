// Pantalla común de los juegos con estímulos en movimiento (Basket y Crash):
// consigna, control de velocidad, vidas, pausa y fin de ronda. Cada juego
// aporta solo su escena de Phaser.

import Phaser from 'phaser';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { activarSonido } from '../../audio/efectos';
import { registrarRespuesta, type EstadoAdaptativo } from '../../engine/adaptativo';
import type { Estimulo } from '../../engine/contenido';
import type { Fuente } from '../../data/db';
import { DISFRACES, nivelDe, resultadoDeRonda, type JuegoId, type ResultadoRonda } from '../../sesion/progreso';
import { FAMILIA_FUENTE, type Tema } from '../../ui/tema';
import { armarCola, type JuegoConConsigna, type Regla } from './reglas';
import { ALTO, ANCHO, type ConfigEscena, type EscenaArcade, type Marcador } from './tipos';
import { Consigna, ControlVelocidad, IconoVida, SelectorDisfraz } from './ui';
import {
  PELOTAS_POR_RONDA,
  PROPORCION_OBJETIVOS,
  PROPORCION_OBJETIVOS_REFUERZO,
  VELOCIDAD_MAX,
  VELOCIDAD_MIN,
  VIDAS_POR_RONDA,
  parametros,
} from './velocidad';

type Fase = 'cargando' | 'consigna' | 'jugando' | 'pausa' | 'fin';

const TAMANO_BLOQUE = 10;

export interface PropsJuego {
  tema: Tema;
  fuente: Fuente;
  colorearLetras: boolean;
  sonido: boolean;
  regla: Regla;
  palabras: Estimulo[]; // las mismas que se leyeron en la presentación
  velocidadInicial: number;
  velocidadFijaInicial: boolean;
  alCambiarVelocidad: (velocidad: number, fija: boolean) => void;
  estrellasSesion: number;
  alSumarEstrellas: (n: number) => void;
  disfraz: string;
  alElegirDisfraz: (id: string) => void;
  alOtroJuego: () => void;
  alPalabrasNuevas: () => void;
  alSalir: () => void;
}

interface Props extends PropsJuego {
  juego: JuegoConConsigna & JuegoId; // también es la clave de la escena en Phaser
  crearEscena: (cfg: ConfigEscena) => EscenaArcade;
  pista: string; // cómo se juega, en una línea
  iconoPuntos: ReactNode;
}

export function JuegoArcade(props: Props) {
  const { juego, tema, fuente, colorearLetras, sonido, regla, palabras, alCambiarVelocidad } = props;
  const contenedorRef = useRef<HTMLDivElement>(null);
  const juegoRef = useRef<Phaser.Game | null>(null);
  const escenaRef = useRef<EscenaArcade | null>(null);
  const estadoRef = useRef<EstadoAdaptativo>({
    nivel: props.velocidadInicial,
    fijado: props.velocidadFijaInicial,
    refuerzo: false,
    bloque: [],
  });
  const conteoRef = useRef({ correctas: 0, total: 0 });
  const estrellasSesionRef = useRef(props.estrellasSesion);
  estrellasSesionRef.current = props.estrellasSesion;
  const disfrazRef = useRef(props.disfraz);
  disfrazRef.current = props.disfraz;

  const [fase, setFase] = useState<Fase>('cargando');
  const [marcador, setMarcador] = useState<Marcador>({ vidas: VIDAS_POR_RONDA, puntos: 0, estrellas: 0 });
  const [numeroRonda, setNumeroRonda] = useState(0);
  const [velocidad, setVelocidad] = useState(props.velocidadInicial);
  const [fija, setFija] = useState(props.velocidadFijaInicial);
  const [resultado, setResultado] = useState<ResultadoRonda | null>(null);

  const familia = FAMILIA_FUENTE[fuente];
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

  // Crea una ronda nueva cada vez que cambia numeroRonda (mismas palabras y consigna).
  useEffect(() => {
    if (!contenedorRef.current) return;
    let cancelado = false;

    const proporcion = estadoRef.current.refuerzo ? PROPORCION_OBJETIVOS_REFUERZO : PROPORCION_OBJETIVOS;
    const cola = armarCola(palabras, regla, PELOTAS_POR_RONDA, proporcion);
    conteoRef.current = { correctas: 0, total: 0 };
    setMarcador({ vidas: VIDAS_POR_RONDA, puntos: 0, estrellas: 0 });
    setResultado(null);
    setFase('cargando');

    const escena = props.crearEscena({
      tema,
      familiaFuente: familia,
      colorearLetras,
      sonido,
      cola,
      vidas: VIDAS_POR_RONDA,
      disfraz: () => DISFRACES[juego].find((d) => d.id === disfrazRef.current) ?? DISFRACES[juego][0],
      parametros: () => parametros(estadoRef.current.nivel, estadoRef.current.refuerzo),
      alDecidir: (d) => {
        conteoRef.current.total++;
        if (d.correcta) conteoRef.current.correctas++;
        const anterior = estadoRef.current.nivel;
        const { estado } = registrarRespuesta(estadoRef.current, d.correcta, {
          tamanoBloque: TAMANO_BLOQUE,
          min: VELOCIDAD_MIN,
          max: VELOCIDAD_MAX,
        });
        if (estado.nivel !== anterior) fijarVelocidad(estado);
        else estadoRef.current = estado;
      },
      alCambiarMarcador: setMarcador,
      alTerminar: (m) => {
        setMarcador(m);
        const r = resultadoDeRonda(estrellasSesionRef.current, conteoRef.current.correctas, conteoRef.current.total);
        setResultado(r);
        props.alSumarEstrellas(r.estrellas);
        setFase('fin');
      },
    });

    // Esperar la letra antes de dibujar, para que las palabras no salgan con otra fuente.
    document.fonts
      .load(`700 46px ${familia}`)
      .catch(() => undefined)
      .then(() => {
        if (cancelado || !contenedorRef.current) return;
        escenaRef.current = escena;
        juegoRef.current = new Phaser.Game({
          type: Phaser.AUTO,
          parent: contenedorRef.current,
          width: ANCHO,
          height: ALTO,
          backgroundColor: tema.bg,
          scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
          input: { activePointers: 3 },
          audio: { noAudio: true },
          banner: false,
          scene: escena,
        });
        if (import.meta.env.DEV) (window as unknown as { __juego?: Phaser.Game }).__juego = juegoRef.current;
        setFase('consigna');
      });

    return () => {
      cancelado = true;
      juegoRef.current?.destroy(true);
      juegoRef.current = null;
      escenaRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numeroRonda]);

  const pausar = useCallback(() => {
    if (!juegoRef.current) return;
    juegoRef.current.scene.pause(juego);
    setFase('pausa');
  }, [juego]);

  // Si se cambia de app o se apaga la pantalla, el juego se pausa solo.
  useEffect(() => {
    const alOcultar = () => {
      if (document.hidden && fase === 'jugando') pausar();
    };
    document.addEventListener('visibilitychange', alOcultar);
    return () => document.removeEventListener('visibilitychange', alOcultar);
  }, [fase, pausar]);

  // La fonoaudióloga ajusta la velocidad ahí mismo (en cualquier momento) y queda FIJA.
  // El bloque en curso parte de cero para que la regla 80/60 mida la velocidad nueva.
  const cambiarVelocidad = (delta: number) => {
    const nivel = Math.min(VELOCIDAD_MAX, Math.max(VELOCIDAD_MIN, estadoRef.current.nivel + delta));
    fijarVelocidad({ ...estadoRef.current, nivel, fijado: true, refuerzo: false, bloque: [] });
    escenaRef.current?.cambiarVelocidad(parametros(nivel, false));
  };

  const alternarAuto = () => {
    fijarVelocidad({ ...estadoRef.current, fijado: !estadoRef.current.fijado, refuerzo: false, bloque: [] });
  };

  const vamos = () => {
    activarSonido();
    escenaRef.current?.empezar();
    setFase('jugando');
  };

  const seguir = () => {
    activarSonido();
    juegoRef.current?.scene.resume(juego);
    setFase('jugando');
  };

  return (
    <div className="juego">
      <header className="juego-barra">
        <button className="boton-icono" onClick={pausar} aria-label="Pausa" disabled={fase !== 'jugando'}>
          <span aria-hidden>❚❚</span>
        </button>
        <Consigna regla={regla} juego={juego} colorearLetras={colorearLetras} />
        <ControlVelocidad velocidad={velocidad} fija={fija} alCambiar={cambiarVelocidad} alAlternarAuto={alternarAuto} />
        <div className="marcador">
          <div className="vidas" aria-label={`${marcador.vidas} vidas`}>
            {Array.from({ length: VIDAS_POR_RONDA }, (_, i) => (
              <IconoVida key={i} apagada={i >= marcador.vidas} />
            ))}
          </div>
          <div className="encestadas" aria-label={`${marcador.puntos} puntos`}>
            {props.iconoPuntos} {marcador.puntos}
          </div>
        </div>
      </header>

      {/* Las tarjetas cubren solo el área de juego: la barra de arriba (velocidad) siempre se puede usar. */}
      <div className="juego-area">
        <div className="juego-lienzo" ref={contenedorRef} />

        {fase === 'consigna' && (
          <div className="capa">
            <div className="tarjeta tarjeta-consigna">
              <Consigna regla={regla} juego={juego} colorearLetras={colorearLetras} grande />
              <SelectorDisfraz disfraces={DISFRACES[juego]} nivel={nivelSesion} elegido={props.disfraz} alElegir={props.alElegirDisfraz} />
              <p className="pista-arrastrar">{props.pista}</p>
              <button className="boton boton-grande" onClick={vamos}>¡Vamos!</button>
            </div>
          </div>
        )}

        {fase === 'pausa' && (
          <div className="capa">
            <div className="tarjeta">
              <h2>Pausa</h2>
              <button className="boton boton-grande" onClick={seguir}>Seguir</button>
              <button className="boton boton-secundario" onClick={props.alSalir}>Salir</button>
            </div>
          </div>
        )}

        {fase === 'fin' && (
          <FinDeRonda
            resultado={resultado}
            resumen={
              <>
                <div>{props.iconoPuntos} <strong>{marcador.puntos}</strong></div>
                {marcador.estrellas > 0 && <div>⚡ <strong>{marcador.estrellas}</strong></div>}
              </>
            }
            alOtraVez={() => setNumeroRonda((n) => n + 1)}
            alOtroJuego={props.alOtroJuego}
            alPalabrasNuevas={props.alPalabrasNuevas}
            alSalir={props.alSalir}
          />
        )}
      </div>
    </div>
  );
}

/** Tarjeta de fin de ronda, igual en todos los juegos: estrellas, nivel y lo desbloqueado. */
export function FinDeRonda(p: {
  resultado: ResultadoRonda | null;
  resumen: ReactNode;
  alOtraVez: () => void;
  alOtroJuego: () => void;
  alPalabrasNuevas: () => void;
  alSalir: () => void;
}) {
  const r = p.resultado;
  return (
    <div className="capa">
      <div className="tarjeta">
        <h2>Fin de la ronda</h2>
        {r && (
          <div className="estrellas-ronda" aria-label={`${r.estrellas} de 3 estrellas`}>
            {[1, 2, 3].map((n) => (
              <span key={n} className={n <= r.estrellas ? 'estrella llena' : 'estrella'} style={{ animationDelay: `${n * 0.15}s` }}>★</span>
            ))}
          </div>
        )}
        <div className="resumen">{p.resumen}</div>
        {r && r.nivel > r.nivelAntes && (
          <div className="subio-nivel">
            <strong>¡Nivel {r.nivel}!</strong>
            {r.desbloqueos.length > 0 && <span>Nuevo: {r.desbloqueos.map((d) => `${d.emoji} ${d.nombre}`).join(' · ')}</span>}
          </div>
        )}
        <button className="boton boton-grande" onClick={p.alOtraVez}>Jugar otra vez</button>
        <div className="fila">
          <button className="boton boton-secundario" onClick={p.alOtroJuego}>Otro juego</button>
          <button className="boton boton-secundario" onClick={p.alPalabrasNuevas}>Palabras nuevas</button>
          <button className="boton boton-secundario" onClick={p.alSalir}>Salir</button>
        </div>
      </div>
    </div>
  );
}
