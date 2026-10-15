import { describe, expect, it } from 'vitest';
import { COLORES_LETRA, trozosColoreados } from './letras';

describe('colores de p, b y d', () => {
  it('colorea solo p, b y d', () => {
    expect(trozosColoreados('bodega', true)).toEqual([
      { texto: 'b', color: COLORES_LETRA.b },
      { texto: 'o', color: null },
      { texto: 'd', color: COLORES_LETRA.d },
      { texto: 'ega', color: null },
    ]);
  });
  it('mayúsculas también', () => {
    expect(trozosColoreados('Pan', true)[0]).toEqual({ texto: 'P', color: COLORES_LETRA.p });
  });
  it('apagado devuelve el texto entero', () => {
    expect(trozosColoreados('padre', false)).toEqual([{ texto: 'padre', color: null }]);
  });
});
