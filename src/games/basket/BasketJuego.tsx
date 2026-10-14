import Phaser from 'phaser';
import { useCallback, useEffect, useRef, useState } from 'react';
import { activarSonido } from '../../audio/efectos';
import { registrarRespuesta, type EstadoAdaptativo } from '../../engine/adaptativo';
import type { Estimulo } from '../../engine/contenido';
import type { Fuente } from '../../data/db';
import { FAMILIA_FUENTE, type Tema } from '../../ui/tema';
import { ALTO, ANCHO, BasketScene, type Marcador } from './BasketScene';
import { armarCola, textoConsigna, type Regla } from './reglas';
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

interface Props {
  tema: Tema;
  fuente: Fuente;
  sonido: boolean;
  regla: Regla;
  palabras: Estimulo[]; // las mismas que se leyeron en la presentación
  velocidadInicial: number;
  alCambiarVelocidad: (velocidad: number) => void;
  alPalabrasNuevas: () => void;
  alSalir: () => void;
}

export function BasketJuego({ tema, fuente, sonido, regla, palabras, velocidadInicial, alCambiarVelocidad, alPalabrasNuevas, alSalir }: Props) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const juegoRef = useRef<Phaser.Game | null>(null);
  const escenaRef = useRef<BasketScene | null>(null);
  const estadoRef = useRef<EstadoAdaptativo>({ nivel: velocidadInicial, fijado: false, refuerzo: false, bloque: [] });

  const [fase, setFase] = useState<Fase>('cargando');
  const [marcador, setMarcador] = useState<Marcador>({ vidas: VIDAS_POR_RONDA, encestadas: 0, estrellas: 0 });
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
    setMarcador({ vidas: VIDAS_POR_RONDA, encestadas: 0, estrellas: 0 });
    setFase('cargando');

    const escena = new BasketScene({
      colores: tema.cancha,
      familiaFuente: familia,
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
    juegoRef.current.scene.pause('basket');
    setFase('pausa');
  }, []);

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
    juegoRef.current?.scene.resume('basket');
    setFase('jugando');
  };

  return (
    <div className="juego">
      <header className="juego-barra">
        <button className="boton-icono" onClick={pausar} aria-label="Pausa" disabled={fase !== 'jugando'}>
          <span aria-hidden>❚❚</span>
        </button>
        <Consigna regla={regla} />
        <div className="control-velocidad">
          <button className="boton-vel" onClick={() => cambiarVelocidad(-1)} disabled={velocidad <= VELOCIDAD_MIN} aria-label="Más lento">−</button>
          <div className="vel-valor" aria-live="polite">
            <span>Velocidad</span>
            <strong>{velocidad}</strong>
          </div>
          <button className="boton-vel" onClick={() => cambiarVelocidad(1)} disabled={velocidad >= VELOCIDAD_MAX} aria-label="Más rápido">+</button>
        </div>
        <div className="marcador">
          <div className="vidas" aria-label={`${marcador.vidas} vidas`}>
            {Array.from({ length: VIDAS_POR_RONDA }, (_, i) => (
              <IconoBola key={i} apagada={i >= marcador.vidas} />
            ))}
          </div>
          <div className="encestadas" aria-label={`${marcador.encestadas} encestadas`}>
            <IconoAro /> {marcador.encestadas}
          </div>
        </div>
      </header>

      <div className="juego-lienzo" ref={contenedorRef} />

      {fase === 'consigna' && (
        <div className="capa">
          <div className="tarjeta tarjeta-consigna">
            <Consigna regla={regla} grande />
            <p className="pista-arrastrar"><span aria-hidden>👆</span> Arrastra el aro</p>
            <button className="boton boton-grande" onClick={vamos}>¡Vamos!</button>
          </div>
        </div>
      )}

      {fase === 'pausa' && (
        <div className="capa">
          <div className="tarjeta">
            <h2>Pausa</h2>
            <button className="boton boton-grande" onClick={seguir}>Seguir</button>
            <button className="boton boton-secundario" onClick={alSalir}>Salir</button>
          </div>
        </div>
      )}

      {fase === 'fin' && (
        <div className="capa">
          <div className="tarjeta">
            <h2>Fin de la ronda</h2>
            <div className="resumen">
              <div><IconoAro /> <strong>{marcador.encestadas}</strong></div>
              {marcador.estrellas > 0 && <div>⚡ <strong>{marcador.estrellas}</strong></div>}
            </div>
            <button className="boton boton-grande" onClick={() => setNumeroRonda((n) => n + 1)}>Jugar otra vez</button>
            <div className="fila">
              <button className="boton boton-secundario" onClick={alPalabrasNuevas}>Palabras nuevas</button>
              <button className="boton boton-secundario" onClick={alSalir}>Salir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Consigna({ regla, grande = false }: { regla: Regla; grande?: boolean }) {
  return (
    <div className={grande ? 'consigna consigna-grande' : 'consigna'}>
      <span>{textoConsigna(regla)}</span>
      <span className="consigna-valor">{regla.valor}</span>
    </div>
  );
}

function IconoBola({ apagada }: { apagada: boolean }) {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" className={apagada ? 'vida apagada' : 'vida'} aria-hidden>
      <circle cx="20" cy="20" r="17" fill="#FF8A3D" stroke="currentColor" strokeWidth="2.5" />
      <path d="M3 20h34M20 3v34M8 8c6 6 6 18 0 24M32 8c-6 6-6 18 0 24" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconoAro() {
  return (
    <svg viewBox="0 0 40 40" width="36" height="36" aria-hidden>
      <ellipse cx="20" cy="12" rx="15" ry="5" fill="none" stroke="#FF4F8B" strokeWidth="4" />
      <path d="M6 13l5 20h18l5-20M13 14l3 19M27 14l-3 19M9 22h22" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
