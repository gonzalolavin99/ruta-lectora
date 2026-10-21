// Reglas de avance de la carrera de Turbo. Los dos corredores se mueven con cada palabra,
// como en una carrera de verdad, pero el que lee bien avanza mucho más:
//   - Bien leída → el niño avanza 1 paso y el rival medio paso.
//   - Con error  → el rival avanza 1 paso y el niño un cuarto de paso.
// Leyendo todo bien, el niño llega a la meta (10 pasos) con el rival en la mitad.
// El niño gana si lee bien más o menos 6 de cada 10 palabras. [CONFIRMAR con Fran]

export const PASOS_META = 10;

export const AVANCE = {
  bien: { nino: 1, rival: 0.5 },
  error: { nino: 0.25, rival: 1 },
};

export interface Pasos {
  nino: number;
  rival: number;
}

export function avanzar(pasos: Pasos, correcta: boolean): Pasos {
  const a = correcta ? AVANCE.bien : AVANCE.error;
  return {
    nino: Math.min(PASOS_META, pasos.nino + a.nino),
    rival: Math.min(PASOS_META, pasos.rival + a.rival),
  };
}

/** Quién llegó a la meta (el niño primero: si llegan juntos, gana él). */
export function ganador(pasos: Pasos): 'nino' | 'rival' | null {
  if (pasos.nino >= PASOS_META) return 'nino';
  if (pasos.rival >= PASOS_META) return 'rival';
  return null;
}
