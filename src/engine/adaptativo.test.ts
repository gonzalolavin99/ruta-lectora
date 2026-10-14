import { describe, expect, it } from 'vitest';
import { evaluarBloque, registrarRespuesta, type EstadoAdaptativo } from './adaptativo';

const limites = { tamanoBloque: 10, min: 1, max: 10 };
const inicial: EstadoAdaptativo = { nivel: 3, fijado: false, refuerzo: false, bloque: [] };

function jugarBloque(estado: EstadoAdaptativo, correctas: number) {
  let r = { estado } as ReturnType<typeof registrarRespuesta>;
  for (let i = 0; i < 10; i++) r = registrarRespuesta(r.estado, i < correctas, limites);
  return r;
}

describe('regla de subir y bajar', () => {
  it('umbrales', () => {
    expect(evaluarBloque(80, false)).toBe('sube');
    expect(evaluarBloque(79, false)).toBe('mantiene');
    expect(evaluarBloque(60, false)).toBe('mantiene');
    expect(evaluarBloque(59, false)).toBe('refuerzo');
    expect(evaluarBloque(59, true)).toBe('baja');
    expect(evaluarBloque(60, true)).toBe('sale-refuerzo');
  });

  it('no evalúa antes de completar el bloque', () => {
    const r = registrarRespuesta(inicial, true, limites);
    expect(r.cambio).toBeUndefined();
    expect(r.estado.bloque).toEqual([true]);
  });

  it('8 de 10 sube un nivel', () => {
    const r = jugarBloque(inicial, 8);
    expect(r.cambio).toBe('sube');
    expect(r.estado.nivel).toBe(4);
    expect(r.estado.bloque).toEqual([]);
  });

  it('bajo 60 % primero refuerza y después baja', () => {
    const r1 = jugarBloque(inicial, 5);
    expect(r1.cambio).toBe('refuerzo');
    expect(r1.estado).toMatchObject({ nivel: 3, refuerzo: true });
    const r2 = jugarBloque(r1.estado, 5);
    expect(r2.cambio).toBe('baja');
    expect(r2.estado).toMatchObject({ nivel: 2, refuerzo: false });
  });

  it('si el refuerzo sale bien, vuelve a lo normal sin bajar', () => {
    const r = jugarBloque({ ...inicial, refuerzo: true }, 7);
    expect(r.estado).toMatchObject({ nivel: 3, refuerzo: false });
  });

  it('respeta los límites', () => {
    expect(jugarBloque({ ...inicial, nivel: 10 }, 10).estado.nivel).toBe(10);
    expect(jugarBloque({ ...inicial, nivel: 1, refuerzo: true }, 0).estado.nivel).toBe(1);
  });

  it('nivel fijado: registra pero no cambia', () => {
    const r = jugarBloque({ ...inicial, fijado: true }, 10);
    expect(r.cambio).toBe('sube');
    expect(r.estado.nivel).toBe(3);
  });
});
