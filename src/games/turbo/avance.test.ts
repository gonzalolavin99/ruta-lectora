import { describe, expect, it } from 'vitest';
import { avanzar, ganador, PASOS_META, type Pasos } from './avance';

function correr(respuestas: boolean[]): { pasos: Pasos; palabras: number } {
  let pasos: Pasos = { nino: 0, rival: 0 };
  let palabras = 0;
  for (const r of respuestas) {
    if (ganador(pasos)) break;
    pasos = avanzar(pasos, r);
    palabras++;
  }
  return { pasos, palabras };
}

/** Repite un patrón de respuestas hasta que alguien gane. */
function patron(p: boolean[]) {
  return correr(Array.from({ length: 200 }, (_, i) => p[i % p.length]));
}

describe('avance de la carrera', () => {
  it('los dos corredores se mueven con cada palabra', () => {
    expect(avanzar({ nino: 0, rival: 0 }, true)).toEqual({ nino: 1, rival: 0.5 });
    expect(avanzar({ nino: 0, rival: 0 }, false)).toEqual({ nino: 0.25, rival: 1 });
  });

  it('leyendo todo bien gana en 10 palabras con el rival a la mitad', () => {
    const { pasos, palabras } = patron([true]);
    expect(palabras).toBe(PASOS_META);
    expect(ganador(pasos)).toBe('nino');
    expect(pasos.rival).toBe(PASOS_META / 2);
  });

  it('con 7 de cada 10 bien gana el niño', () => {
    const { pasos } = patron([true, true, false, true, true, false, true, true, false, true]);
    expect(ganador(pasos)).toBe('nino');
  });

  it('con la mitad bien gana el rival', () => {
    expect(ganador(patron([true, false]).pasos)).toBe('rival');
  });

  it('nadie pasa de la meta', () => {
    const { pasos } = patron([false]);
    expect(pasos.rival).toBe(PASOS_META);
    expect(pasos.nino).toBeLessThan(PASOS_META);
  });
});
