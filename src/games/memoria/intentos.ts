// Memoria (memoria de trabajo): se muestran N palabras en orden, se tapan,
// y el niño las busca en el mismo orden entre varias cartas.
// La dificultad es N (cuántas palabras recordar), de 2 a 5.

import type { Estimulo } from '../../engine/contenido';

export const CANTIDAD_MIN = 2;
export const CANTIDAD_MAX = 5;
export const INTENTOS_POR_RONDA = 6;
export const TAMANO_BLOQUE_MEMORIA = 3; // la regla 80/60 se evalúa cada 3 intentos
/** Distractores extra en la mesa, además de las palabras a recordar. */
export const DISTRACTORES = 3;
/** Tiempo para mirar: 1,5 s por palabra + 1 s. */
export const msParaMirar = (cantidad: number) => cantidad * 1500 + 1000;

export interface Intento {
  secuencia: Estimulo[]; // lo que hay que recordar, en orden
  mesa: Estimulo[]; // cartas para elegir (secuencia + distractores, mezcladas)
}

function barajar<T>(lista: T[], azar: () => number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function armarIntento(palabras: Estimulo[], cantidad: number, azar = Math.random): Intento {
  const unicas = palabras.filter((p, i) => palabras.findIndex((x) => x.texto === p.texto) === i);
  const n = Math.max(1, Math.min(cantidad, unicas.length - 1));
  const mezcladas = barajar(unicas, azar);
  const secuencia = mezcladas.slice(0, n);
  const distractores = mezcladas.slice(n, n + DISTRACTORES);
  return { secuencia, mesa: barajar([...secuencia, ...distractores], azar) };
}
