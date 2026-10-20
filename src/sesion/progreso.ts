// Niveles de la sesión: cada ronda terminada da de 1 a 3 estrellas, y cada
// 3 estrellas se sube un nivel. Subir de nivel desbloquea disfraces para los juegos.
// Es solo motivación: NO cambia la dificultad (eso lo maneja la velocidad).
// Sin perfiles, el progreso dura lo que dura la sesión.

export const ESTRELLAS_POR_NIVEL = 3;

export type JuegoId = 'basket' | 'crash' | 'turbo';

export interface Disfraz {
  id: string;
  nombre: string;
  emoji: string;
  nivel: number; // nivel de la sesión en que se desbloquea
}

export const DISFRACES: Record<JuegoId, Disfraz[]> = {
  basket: [
    { id: 'basquet', nombre: 'Pelota', emoji: '🏀', nivel: 1 },
    { id: 'futbol', nombre: 'Fútbol', emoji: '⚽', nivel: 2 },
    { id: 'tenis', nombre: 'Tenis', emoji: '🎾', nivel: 3 },
    { id: 'dona', nombre: 'Dona', emoji: '🍩', nivel: 5 },
  ],
  crash: [
    { id: 'burbuja', nombre: 'Burbujas', emoji: '🫧', nivel: 1 },
    { id: 'globo', nombre: 'Globos', emoji: '🎈', nivel: 2 },
    { id: 'planeta', nombre: 'Planetas', emoji: '🪐', nivel: 4 },
  ],
  turbo: [
    { id: 'auto', nombre: 'Auto', emoji: '🏎️', nivel: 1 },
    { id: 'delfin', nombre: 'Delfín', emoji: '🐬', nivel: 1 },
    { id: 'cohete', nombre: 'Cohete', emoji: '🚀', nivel: 3 },
  ],
};

/** Progreso de la sesión con un niño: se reinicia al volver a elegir curso. */
export interface ProgresoSesion {
  estrellas: number;
  disfraces: Record<JuegoId, string>; // disfraz elegido en cada juego
}

export function progresoInicial(): ProgresoSesion {
  return { estrellas: 0, disfraces: { basket: 'basquet', crash: 'burbuja', turbo: 'auto' } };
}

/** Estrellas de una ronda según el porcentaje de aciertos. Siempre al menos 1. */
export function estrellasDeRonda(correctas: number, total: number): 1 | 2 | 3 {
  const p = total > 0 ? correctas / total : 0;
  if (p >= 0.9) return 3;
  if (p >= 0.7) return 2;
  return 1;
}

export function nivelDe(estrellas: number): number {
  return Math.floor(estrellas / ESTRELLAS_POR_NIVEL) + 1;
}

export function disfracesDisponibles(juego: JuegoId, nivel: number): Disfraz[] {
  return DISFRACES[juego].filter((d) => d.nivel <= nivel);
}

export interface ResultadoRonda {
  estrellas: 1 | 2 | 3;
  nivelAntes: number;
  nivel: number;
  desbloqueos: Disfraz[]; // de todos los juegos
}

export function resultadoDeRonda(estrellasSesion: number, correctas: number, total: number): ResultadoRonda {
  const estrellas = estrellasDeRonda(correctas, total);
  const nivelAntes = nivelDe(estrellasSesion);
  const nivel = nivelDe(estrellasSesion + estrellas);
  const desbloqueos = Object.values(DISFRACES)
    .flat()
    .filter((d) => d.nivel > nivelAntes && d.nivel <= nivel);
  return { estrellas, nivelAntes, nivel, desbloqueos };
}
