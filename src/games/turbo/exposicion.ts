// Turbo: lectura con exposición breve (fluidez y automatización).
// La velocidad define cuánto tiempo se ve la palabra antes de taparse.

import type { Estimulo } from '../../engine/contenido';

/** Milisegundos que se ve la palabra, por velocidad (1 = lento … 10 = rápido). */
const EXPOSICION_MS = [4000, 3400, 2900, 2500, 2150, 1850, 1600, 1350, 1150, 950];

export function exposicionMs(velocidad: number): number {
  return EXPOSICION_MS[Math.min(10, Math.max(1, velocidad)) - 1];
}

/** Cuánto se parecen dos palabras a la vista: mismo largo, misma primera y última letra, letras en común. */
function parecido(a: string, b: string): number {
  let puntos = 0;
  if (a.length === b.length) puntos += 3;
  else if (Math.abs(a.length - b.length) === 1) puntos += 1;
  if (a[0] === b[0]) puntos += 2;
  if (a[a.length - 1] === b[b.length - 1]) puntos += 1;
  for (const letra of new Set(a)) if (b.includes(letra)) puntos += 0.5;
  return puntos;
}

/**
 * Modo "Elige": la palabra correcta más 2 parecidas, en orden al azar.
 * Las parecidas salen de la ronda (ya leídas) o, si faltan, del banco completo.
 */
export function opcionesElegir(correcta: Estimulo, ronda: Estimulo[], banco: Estimulo[], azar = Math.random): Estimulo[] {
  const candidatas = [...ronda, ...banco].filter((e, i, lista) => e.texto !== correcta.texto && lista.findIndex((x) => x.texto === e.texto) === i);
  const ordenadas = candidatas
    .map((e) => ({ e, puntos: parecido(correcta.texto, e.texto) + azar() }))
    .sort((x, y) => y.puntos - x.puntos)
    .slice(0, 2)
    .map((x) => x.e);
  const opciones = [correcta, ...ordenadas];
  for (let i = opciones.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
  }
  return opciones;
}

export function barajar<T>(lista: T[], azar = Math.random): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
