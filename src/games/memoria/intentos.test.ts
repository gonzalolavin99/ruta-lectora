import { describe, expect, it } from 'vitest';
import { nivelesDisponibles } from '../../engine/contenido';
import { elegirPalabras, elegirRegla } from '../comun/reglas';
import { CANTIDAD_MAX, CANTIDAD_MIN, DISTRACTORES, armarIntento } from './intentos';

describe('Memoria', () => {
  for (const b of nivelesDisponibles('decodificacion')) {
    it(`nivel ${b.nivel}: secuencia sin repetir y toda en la mesa`, () => {
      const palabras = elegirPalabras(b.estimulos, elegirRegla(b.estimulos));
      for (let n = CANTIDAD_MIN; n <= CANTIDAD_MAX; n++) {
        const { secuencia, mesa } = armarIntento(palabras, n);
        expect(secuencia).toHaveLength(n);
        expect(new Set(secuencia.map((e) => e.texto)).size).toBe(n);
        expect(mesa).toHaveLength(n + DISTRACTORES);
        expect(new Set(mesa.map((e) => e.texto)).size).toBe(mesa.length);
        for (const e of secuencia) expect(mesa.some((m) => m.texto === e.texto)).toBe(true);
      }
    });
  }
});
