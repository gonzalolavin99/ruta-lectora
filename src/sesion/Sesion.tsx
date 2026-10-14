import { useState } from 'react';
import { guardarVelocidad, type Preferencias } from '../data/db';
import { obtenerBanco, type Banco } from '../engine/contenido';
import { BasketJuego } from '../games/basket/BasketJuego';
import { elegirPalabras, elegirRegla, type Regla } from '../games/basket/reglas';
import type { Tema } from '../ui/tema';
import { Presentacion } from './Presentacion';

interface Props {
  curso: number;
  nivel: number;
  tema: Tema;
  preferencias: Preferencias;
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

// Una sesión: primero se leen las palabras y después se juega con esas mismas palabras.
export function Sesion({ curso, nivel, tema, preferencias, alSalir }: Props) {
  const banco = obtenerBanco('decodificacion', nivel)!;
  const [ronda, setRonda] = useState(() => nuevaRonda(banco));
  const [fase, setFase] = useState<'presentacion' | 'juego'>('presentacion');

  if (fase === 'presentacion') {
    return <Presentacion key={ronda.id} palabras={ronda.palabras} alTerminar={() => setFase('juego')} alVolver={alSalir} />;
  }
  return (
    <BasketJuego
      key={ronda.id}
      tema={tema}
      fuente={preferencias.fuente}
      sonido={preferencias.sonido}
      regla={ronda.regla}
      palabras={ronda.palabras}
      velocidadInicial={preferencias.velocidadPorCurso[curso] ?? 1}
      alCambiarVelocidad={(v) => void guardarVelocidad(curso, v)}
      alPalabrasNuevas={() => {
        setRonda(nuevaRonda(banco, ronda.regla));
        setFase('presentacion');
      }}
      alSalir={alSalir}
    />
  );
}
