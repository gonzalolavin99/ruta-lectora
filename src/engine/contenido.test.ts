// Revisa que los bancos de palabras estén bien armados.
import { describe, expect, it } from 'vitest';
import { nivelesDisponibles } from './contenido';
import { estructura, normalizar } from './estructura';

const bancos = nivelesDisponibles('decodificacion');

describe('bancos de decodificación', () => {
  it('existen los niveles 1 a 11', () => {
    expect(bancos.map((b) => b.nivel)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  for (const b of bancos) {
    describe(`nivel ${b.nivel}`, () => {
      it('las sílabas unidas forman la palabra', () => {
        for (const e of b.estimulos) expect(e.silabas.join(''), e.id).toBe(normalizar(e.texto));
      });
      it('la estructura coincide con las sílabas', () => {
        for (const e of b.estimulos) expect(e.estructura, e.id).toBe(estructura(e.silabas));
      });
      it('ids únicos y con el formato dec-NN-palabra', () => {
        const ids = b.estimulos.map((e) => e.id);
        expect(new Set(ids).size).toBe(ids.length);
        const nn = String(b.nivel).padStart(2, '0');
        for (const e of b.estimulos) expect(e.id).toBe(`dec-${nn}-${e.texto}`);
      });
      it('todo lo generado está marcado para revisión', () => {
        for (const e of b.estimulos) expect(typeof e.revisado).toBe('boolean');
      });
    });
  }
});

describe('estructura silábica', () => {
  it.each([
    [['ca', 'sa'], 'CV-CV'],
    [['plan', 'ta'], 'CCVC-CV'],
    [['que', 'so'], 'CV-CV'],
    [['chin', 'chi', 'lla'], 'CVC-CV-CV'],
    [['hue', 'vo'], 'VV-CV'],
    [['pin', 'güi', 'no'], 'CVC-CVV-CV'],
    [['ya', 'te'], 'CV-CV'],
    [['muy'], 'CVV'],
  ])('%j → %s', (silabas, esperado) => {
    expect(estructura(silabas)).toBe(esperado);
  });
});
