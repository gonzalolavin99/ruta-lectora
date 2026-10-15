import { describe, expect, it } from 'vitest';
import { nivelesDisponibles } from '../../engine/contenido';
import { exposicionMs, opcionesElegir } from './exposicion';

describe('Turbo', () => {
  it('la exposición se acorta al subir la velocidad', () => {
    expect(exposicionMs(1)).toBeGreaterThan(exposicionMs(5));
    expect(exposicionMs(5)).toBeGreaterThan(exposicionMs(10));
    expect(exposicionMs(99)).toBe(exposicionMs(10));
  });

  for (const b of nivelesDisponibles('decodificacion')) {
    it(`nivel ${b.nivel}: 3 opciones distintas e incluye la correcta`, () => {
      const ronda = b.estimulos.slice(0, 12);
      for (const correcta of ronda) {
        const opciones = opcionesElegir(correcta, ronda, b.estimulos);
        expect(opciones).toHaveLength(3);
        expect(new Set(opciones.map((o) => o.texto)).size).toBe(3);
        expect(opciones.some((o) => o.texto === correcta.texto)).toBe(true);
      }
    });
  }
});
