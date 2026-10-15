// En Basket la dificultad es la VELOCIDAD (decisión de Fran, Fase 2).
// Nivel 1 = muy lento. Nivel 10 = rápido.

export const VELOCIDAD_MIN = 1;
export const VELOCIDAD_MAX = 10;

/** Milisegundos que tarda una pelota en cruzar la pantalla. */
const CAIDA_MS = [9000, 8200, 7400, 6700, 6000, 5400, 4800, 4300, 3800, 3400];
/** Milisegundos entre una pelota y la siguiente. */
const INTERVALO_MS = [2800, 2550, 2350, 2150, 1950, 1800, 1650, 1500, 1380, 1260];

/** En el bloque de refuerzo todo va un 25 % más lento. */
const FACTOR_REFUERZO = 1.25;

export interface ParametrosVelocidad {
  caidaMs: number;
  intervaloMs: number;
}

export function parametros(nivel: number, refuerzo: boolean): ParametrosVelocidad {
  const i = Math.min(VELOCIDAD_MAX, Math.max(VELOCIDAD_MIN, nivel)) - 1;
  const f = refuerzo ? FACTOR_REFUERZO : 1;
  return { caidaMs: CAIDA_MS[i] * f, intervaloMs: INTERVALO_MS[i] * f };
}

export const PELOTAS_POR_RONDA = 30;
export const VIDAS_POR_RONDA = 3;
export const PROPORCION_OBJETIVOS = 0.45;
export const PROPORCION_OBJETIVOS_REFUERZO = 0.5;
/** Cada 5 encestadas seguidas sin error se gana una estrella rayo (bonus). */
export const RACHA_RAYO = 5;
