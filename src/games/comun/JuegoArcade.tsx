// Pantalla común de los juegos con estímulos en movimiento (Basket y Crash):
// consigna, control de velocidad, vidas, pausa y fin de ronda. Cada juego
// aporta solo su escena de Phaser.

import Phaser from 'phaser';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { activarSonido } from '../../audio/efectos';
import { registrarRespuesta, type EstadoAdaptativo } from '../../engine/adaptativo';
import type { Estimulo } from '../../engine/contenido';
import type { Fuente } from '../../data/db';
import { FAMILIA_FUENTE, type Tema } from '../../ui/tema';
import { armarCola, type JuegoConConsigna, type Regla } from './reglas';
import { ALTO, ANCHO, type ConfigEscena, type EscenaArcade, type Marcador } from './tipos';
import { Consigna, ControlVelocidad, IconoVida } from './ui';
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
  alCambiarVelocidad: (velocidad: number) => void;
  alOtroJuego: () => void;
  alPalabrasNuevas: () => void;
  alSalir: () => void;
}

interface Props extends PropsJuego {
  juego: JuegoConConsigna; // también es la clave de la escena en Phaser
  crearEscena: (cfg: ConfigEscena) => EscenaArcade;
  pista: string; // cómo se juega, en una línea
  iconoPuntos: ReactNode;
}

export function JuegoArcade(props: Props) {
  const { juego, tema, fuente, colorearLetras, sonido, regla, palabras, velocidadInicial, alCambiarVelocidad } = props;
  const contenedorRef = useRef<HTMLDivElement>(null);
  const juegoRef = useRef<Phaser.Game | null>(null);
  const escenaRef = useRef<EscenaArcade | null>(null);
  const estadoRef = useRef<EstadoAdaptativo>({ nivel: velocidadInicial, fijado: false, refuerzo: false, bloque: [] });

  const [fase, setFase] = useState<Fase>('cargando');
  const [marcador, setMarcador] = useState<Marcador>({ vidas: VIDAS_POR_RONDA, puntos: 0, estrellas: 0 });
  const [numeroRonda, setNumeroRonda] = useState(0);
  const [velocidad, setVelocidad] = useState(velocidadInicial);

  const familia = FAMILIA_FUENTE[fuente];

  const fijarVelocidad = useCallback(
    (estado: EstadoAdaptativo) => {
      estadoRef.current = estado;
      setVelocidad(estado.nivel);
      alCambiarVelocidad(estado.nivel);
    },
    [alCambiarVelocidad],
  );

  // Crea una ronda nueva cada vez que cambia numeroRonda (mismas palabras y consigna).
  useEffect(() => {
    if (!contenedorRef.current) return;
    let cancelado = false;

    const proporcion = estadoRef.current.refuerzo ? PROPORCION_OBJETIVOS_REFUERZO : PROPORCION_OBJETIVOS;
    const cola = armarCola(palabras, regla, PELOTAS_POR_RONDA, proporcion);
    setMarcador({ vidas: VIDAS_POR_RONDA, puntos: 0, estrellas: 0 });
    setFase('cargando');

    const escena = props.crearEscena({
      tema,
      familiaFuente: familia,
      colorearLetras,
      sonido,
      cola,
      vidas: VIDAS_POR_RONDA,
      parametros: () => parametros(estadoRef.current.nivel, estadoRef.current.refuerzo),
      alDecidir: (d) => {
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

  // La fonoaudióloga ajusta la velocidad ahí mismo, sin salir del juego.
  // El bloque en curso parte de cero para que la regla 80/60 mida la velocidad nueva.
  const cambiarVelocidad = (delta: number) => {
    const nivel = Math.min(VELOCIDAD_MAX, Math.max(VELOCIDAD_MIN, estadoRef.current.nivel + delta));
    if (nivel === estadoRef.current.nivel) return;
    fijarVelocidad({ ...estadoRef.current, nivel, refuerzo: false, bloque: [] });
    escenaRef.current?.cambiarVelocidad(parametros(nivel, false));
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
        <ControlVelocidad velocidad={velocidad} alCambiar={cambiarVelocidad} />
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

      <div className="juego-lienzo" ref={contenedorRef} />

      {fase === 'consigna' && (
        <div className="capa">
          <div className="tarjeta tarjeta-consigna">
            <Consigna regla={regla} juego={juego} colorearLetras={colorearLetras} grande />
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
  );
}

/** Tarjeta de fin de ronda, igual en todos los juegos. */
export function FinDeRonda(p: {
  resumen: ReactNode;
  alOtraVez: () => void;
  alOtroJuego: () => void;
  alPalabrasNuevas: () => void;
  alSalir: () => void;
}) {
  return (
    <div className="capa">
      <div className="tarjeta">
        <h2>Fin de la ronda</h2>
        <div className="resumen">{p.resumen}</div>
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
