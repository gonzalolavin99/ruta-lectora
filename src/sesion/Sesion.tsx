import { useState } from 'react';
import { claveVelocidad, guardarVelocidad, type Preferencias } from '../data/db';
import { obtenerBanco, type Banco } from '../engine/contenido';
import { Basket } from '../games/basket/Basket';
import type { PropsJuego } from '../games/comun/JuegoArcade';
import { elegirPalabras, elegirRegla, type Regla } from '../games/comun/reglas';
import { Crash } from '../games/crash/Crash';
import { Turbo } from '../games/turbo/Turbo';
import type { Tema } from '../ui/tema';
import { Presentacion } from './Presentacion';
import type { ProgresoSesion } from './progreso';
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

  if (fase.tipo === 'presentacion') {
    return (
      <Presentacion
        key={ronda.id}
        palabras={ronda.palabras}
        colorearLetras={preferencias.colorearLetras}
        alTerminar={() => setFase({ tipo: 'elegir' })}
        alVolver={alSalir}
      />
    );
  }
  if (fase.tipo === 'elegir') {
    return (
      <SelectorJuego
        estrellas={estrellas}
        alElegir={(juego) => setFase({ tipo: 'jugar', juego })}
        alVolver={() => setFase({ tipo: 'presentacion' })}
      />
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
    velocidadInicial: preferencias.velocidades[claveVelocidad(juego, curso)] ?? 1,
    velocidadFijaInicial: preferencias.velocidadesFijas[claveVelocidad(juego, curso)] ?? false,
    alCambiarVelocidad: (v, fija) => void guardarVelocidad(juego, curso, v, fija),
    estrellasSesion: estrellas,
    alSumarEstrellas: (n) => alCambiarProgreso((p) => ({ ...p, estrellas: p.estrellas + n })),
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
  if (juego === 'basket') return <Basket key={clave} {...props} />;
  if (juego === 'crash') return <Crash key={clave} {...props} />;
  return <Turbo key={clave} {...props} banco={banco.estimulos} />;
}
