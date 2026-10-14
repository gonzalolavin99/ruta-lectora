import Phaser from 'phaser';
import { useCallback, useEffect, useRef, useState } from 'react';
import { activarSonido } from '../../audio/efectos';
import { registrarRespuesta, type EstadoAdaptativo } from '../../engine/adaptativo';
import { obtenerBanco } from '../../engine/contenido';
import { db, nuevoId, type Perfil, type Respuesta } from '../../data/db';
import { FAMILIA_FUENTE, type Tema } from '../../ui/tema';
import { ALTO, ANCHO, BasketScene, type Decision } from './BasketScene';
import { armarCola, elegirRegla, textoConsigna, type Regla } from './reglas';
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

interface Props {
  perfil: Perfil;
  tema: Tema;
  alSalir: () => void;
}

const reglaATexto = (r: Regla) => `${r.tipo}:${r.valor}`;

export function BasketJuego({ perfil, tema, alSalir }: Props) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const juegoRef = useRef<Phaser.Game | null>(null);
  const escenaRef = useRef<BasketScene | null>(null);
  const estadoRef = useRef<EstadoAdaptativo>(perfil.basket);
  const rondaRef = useRef({ id: '', inicio: 0, velocidadInicial: 1, correctas: 0, total: 0, guardada: false });
  const reglaAnteriorRef = useRef<Regla | undefined>(undefined);

  const [fase, setFase] = useState<Fase>('cargando');
  const [regla, setRegla] = useState<Regla | null>(null);
  const [marcador, setMarcador] = useState({ vidas: VIDAS_POR_RONDA, encestadas: 0, estrellas: 0 });
  const [numeroRonda, setNumeroRonda] = useState(0);
  const marcadorRef = useRef(marcador);
  const actualizarMarcador = (m: typeof marcador) => {
    marcadorRef.current = m;
    setMarcador(m);
  };

  const banco = obtenerBanco('decodificacion', perfil.nivelLectura);
  const familia = FAMILIA_FUENTE[perfil.fuente];

  const guardarRonda = useCallback(async () => {
    const r = rondaRef.current;
    if (r.guardada || r.total === 0) return;
    r.guardada = true;
    const m = marcadorRef.current;
    await db.rondas.add({
      id: r.id,
      perfilId: perfil.id,
      juego: 'basket',
      inicio: r.inicio,
      fin: Date.now(),
      regla: reglaAnteriorRef.current ? reglaATexto(reglaAnteriorRef.current) : '',
      nivelLectura: perfil.nivelLectura,
      velocidadInicial: r.velocidadInicial,
      velocidadFinal: estadoRef.current.nivel,
      correctas: r.correctas,
      total: r.total,
      encestadas: m.encestadas,
      estrellas: m.estrellas,
      vidasPerdidas: VIDAS_POR_RONDA - m.vidas,
    });
    const actual = await db.perfiles.get(perfil.id);
    await db.perfiles.update(perfil.id, {
      basket: estadoRef.current,
      monedas: (actual?.monedas ?? 0) + m.encestadas + m.estrellas,
      actualizado: Date.now(),
    });
  }, [perfil.id, perfil.nivelLectura]);

  // Crea una ronda nueva cada vez que cambia numeroRonda.
  useEffect(() => {
    if (!banco || !contenedorRef.current) return;
    let cancelado = false;

    const nuevaRegla = elegirRegla(banco.estimulos, reglaAnteriorRef.current);
    reglaAnteriorRef.current = nuevaRegla;
    const proporcion = estadoRef.current.refuerzo ? PROPORCION_OBJETIVOS_REFUERZO : PROPORCION_OBJETIVOS;
    const cola = armarCola(banco.estimulos, nuevaRegla, PELOTAS_POR_RONDA, proporcion);
    const rondaId = nuevoId();
    rondaRef.current = {
      id: rondaId,
      inicio: Date.now(),
      velocidadInicial: estadoRef.current.nivel,
      correctas: 0,
      total: 0,
      guardada: false,
    };
    setRegla(nuevaRegla);
    actualizarMarcador({ vidas: VIDAS_POR_RONDA, encestadas: 0, estrellas: 0 });
    setFase('cargando');

    const alDecidir = (d: Decision) => {
      const r = rondaRef.current;
      r.total++;
      if (d.correcta) r.correctas++;
      const estadoAntes = estadoRef.current;
      const respuesta: Respuesta = {
        id: nuevoId(),
        perfilId: perfil.id,
        rondaId,
        juego: 'basket',
        fecha: Date.now(),
        estimuloId: d.item.estimulo.id,
        texto: d.item.estimulo.texto,
        regla: reglaATexto(nuevaRegla),
        esObjetivo: d.item.esObjetivo,
        atrapada: d.atrapada,
        correcta: d.correcta,
        velocidad: estadoAntes.nivel,
        refuerzo: estadoAntes.refuerzo,
        nivelLectura: perfil.nivelLectura,
      };
      void db.respuestas.add(respuesta);
      const { estado, cambio } = registrarRespuesta(estadoAntes, d.correcta, {
        tamanoBloque: perfil.tamanoBloque,
        min: VELOCIDAD_MIN,
        max: VELOCIDAD_MAX,
      });
      estadoRef.current = estado;
      if (cambio) void db.perfiles.update(perfil.id, { basket: estado, actualizado: Date.now() });
    };

    const escena = new BasketScene({
      colores: tema.cancha,
      familiaFuente: familia,
      sonido: perfil.sonido !== false,
      cola,
      vidas: VIDAS_POR_RONDA,
      parametros: () => parametros(estadoRef.current.nivel, estadoRef.current.refuerzo),
      alDecidir,
      alCambiarMarcador: actualizarMarcador,
      alTerminar: (m) => {
        actualizarMarcador(m);
        void guardarRonda();
        setFase('fin');
      },
    });

    // Esperar la letra antes de dibujar, para que las palabras no salgan con otra fuente.
    document.fonts
      .load(`700 40px ${familia}`)
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

  const salir = async () => {
    await guardarRonda();
    alSalir();
  };

  if (!banco) {
    return (
      <div className="pantalla centrada">
        <p>No hay palabras para el nivel {perfil.nivelLectura}.</p>
        <button className="boton" onClick={alSalir}>Volver</button>
      </div>
    );
  }

  return (
    <div className="juego">
      <header className="juego-barra">
        <button className="boton-icono" onClick={pausar} aria-label="Pausa" disabled={fase !== 'jugando'}>
          <span aria-hidden>❚❚</span>
        </button>
        {regla && <Consigna regla={regla} />}
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

      {fase === 'consigna' && regla && (
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
            <button className="boton boton-secundario" onClick={salir}>Salir</button>
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
            <button className="boton boton-grande" onClick={() => setNumeroRonda((n) => n + 1)}>Otra ronda</button>
            <button className="boton boton-secundario" onClick={alSalir}>Salir</button>
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
      <circle cx="20" cy="20" r="17" fill="#F08A5D" stroke="currentColor" strokeWidth="2.5" />
      <path d="M3 20h34M20 3v34M8 8c6 6 6 18 0 24M32 8c-6 6-6 18 0 24" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconoAro() {
  return (
    <svg viewBox="0 0 40 40" width="36" height="36" aria-hidden>
      <ellipse cx="20" cy="12" rx="15" ry="5" fill="none" stroke="#E4572E" strokeWidth="4" />
      <path d="M6 13l5 20h18l5-20M13 14l3 19M27 14l-3 19M9 22h22" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
