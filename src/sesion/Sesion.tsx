import { useEffect, useRef, useState } from 'react';
import { claveVelocidad, guardarVelocidad, type Preferencias } from '../data/db';
import { obtenerBanco, type Banco } from '../engine/contenido';
import { Basket } from '../games/basket/Basket';
import type { PropsJuego } from '../games/comun/JuegoArcade';
import { elegirPalabras, elegirRegla, type Regla } from '../games/comun/reglas';
import { Crash } from '../games/crash/Crash';
import { Memoria } from '../games/memoria/Memoria';
import { Turbo } from '../games/turbo/Turbo';
import type { Tema } from '../ui/tema';
import { Presentacion } from './Presentacion';
import { MEDALLAS, registrarLectura, registrarRonda, type Medalla, type ProgresoSesion } from './progreso';
import { SelectorJuego, type Juego } from './SelectorJuego';

interface Props {
  curso: number;
  nivel: number;
  tema: Tema;
  preferencias: Preferencias;
  progreso: ProgresoSesion;
  alCambiarProgreso: (cambio: (p: ProgresoSesion) => ProgresoSesion) => void;
  alSalir: () => void;
}

interface Ronda {
  id: number;
  regla: Regla;
  palabras: Banco['estimulos'];
}

function nuevaRonda(banco: Banco, anterior?: Regla): Ronda {
  const regla = elegirRegla(banco.estimulos, anterior);
  return { id: Date.now(), regla, palabras: elegirPalabras(banco.estimulos, regla) };
}

type Fase = { tipo: 'presentacion' } | { tipo: 'elegir' } | { tipo: 'jugar'; juego: Juego };

// Una sesión: primero se leen las palabras, después el niño elige a qué jugar,
// y todos los juegos usan esas mismas palabras.
export function Sesion({ curso, nivel, tema, preferencias, progreso, alCambiarProgreso, alSalir }: Props) {
  const banco = obtenerBanco('decodificacion', nivel)!;
  const [ronda, setRonda] = useState(() => nuevaRonda(banco));
  const [fase, setFase] = useState<Fase>({ tipo: 'presentacion' });
  const { estrellas, disfraces } = progreso;

  // Aviso grande cuando se gana una medalla nueva (se va solo).
  const [aviso, setAviso] = useState<Medalla | null>(null);
  const medallasVistas = useRef(progreso.medallas.length);
  useEffect(() => {
    if (progreso.medallas.length > medallasVistas.current) {
      const id = progreso.medallas[progreso.medallas.length - 1];
      setAviso(MEDALLAS.find((m) => m.id === id) ?? null);
      const t = setTimeout(() => setAviso(null), 4000);
      medallasVistas.current = progreso.medallas.length;
      return () => clearTimeout(t);
    }
    medallasVistas.current = progreso.medallas.length;
  }, [progreso.medallas]);
  const avisoMedalla = aviso && (
    <div className="aviso-medalla" role="status" onClick={() => setAviso(null)}>
      <span className="aviso-medalla-emoji" aria-hidden>{aviso.emoji}</span>
      <div>
        <strong>¡Medalla nueva!</strong>
        <span>{aviso.nombre}</span>
      </div>
    </div>
  );

  if (fase.tipo === 'presentacion') {
    return (
      <Presentacion
        key={ronda.id}
        palabras={ronda.palabras}
        colorearLetras={preferencias.colorearLetras}
        alTerminar={() => {
          alCambiarProgreso(registrarLectura);
          setFase({ tipo: 'elegir' });
        }}
        alVolver={alSalir}
      />
    );
  }
  if (fase.tipo === 'elegir') {
    return (
      <>
      {avisoMedalla}
      <SelectorJuego
        estrellas={estrellas}
        medallas={progreso.medallas}
        alElegir={(juego) => setFase({ tipo: 'jugar', juego })}
        alVolver={() => setFase({ tipo: 'presentacion' })}
      />
      </>
    );
  }

  const { juego } = fase;
  const props: PropsJuego = {
    tema,
    fuente: preferencias.fuente,
    colorearLetras: preferencias.colorearLetras,
    sonido: preferencias.sonido,
    regla: ronda.regla,
    palabras: ronda.palabras,
    velocidadInicial: preferencias.velocidades[claveVelocidad(juego, curso)] ?? (juego === 'memoria' ? 2 : 1),
    velocidadFijaInicial: preferencias.velocidadesFijas[claveVelocidad(juego, curso)] ?? false,
    alCambiarVelocidad: (v, fija) => void guardarVelocidad(juego, curso, v, fija),
    estrellasSesion: estrellas,
    alSumarEstrellas: (n) => alCambiarProgreso((p) => registrarRonda(p, juego, n)),
    disfraz: disfraces[juego],
    alElegirDisfraz: (id) => alCambiarProgreso((p) => ({ ...p, disfraces: { ...p.disfraces, [juego]: id } })),
    alOtroJuego: () => setFase({ tipo: 'elegir' }),
    alPalabrasNuevas: () => {
      setRonda(nuevaRonda(banco, ronda.regla));
      setFase({ tipo: 'presentacion' });
    },
    alSalir,
  };
  const clave = `${ronda.id}-${juego}`;
  let pantallaJuego;
  if (juego === 'basket') pantallaJuego = <Basket key={clave} {...props} />;
  else if (juego === 'crash') pantallaJuego = <Crash key={clave} {...props} />;
  else if (juego === 'memoria') pantallaJuego = <Memoria key={clave} {...props} />;
  else pantallaJuego = <Turbo key={clave} {...props} banco={banco.estimulos} />;
  return (
    <>
      {pantallaJuego}
      {avisoMedalla}
    </>
  );
}
