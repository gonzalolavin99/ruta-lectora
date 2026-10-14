import { describe, expect, it } from 'vitest';
import { nivelesDisponibles, type Estimulo } from '../../engine/contenido';
import { armarCola, clasificar, elegirRegla, reglasValidas } from './reglas';

const e = (texto: string, silabas: string[]): Estimulo =>
  ({ id: texto, texto, silabas, estructura: '', tipo: 'palabra', revisado: false });

describe('clasificar', () => {
  it('contiene letra, sin importar la tilde', () => {
    expect(clasificar(e('árbol', ['ár', 'bol']), { tipo: 'contiene-letra', valor: 'a' })).toBe(true);
    expect(clasificar(e('luna', ['lu', 'na']), { tipo: 'contiene-letra', valor: 'o' })).toBe(false);
  });
  it('dígrafos ambiguos quedan fuera', () => {
    expect(clasificar(e('chancho', ['chan', 'cho']), { tipo: 'contiene-letra', valor: 'c' })).toBeNull();
    expect(clasificar(e('queso', ['que', 'so']), { tipo: 'contiene-letra', valor: 'u' })).toBeNull();
    expect(clasificar(e('grillo', ['gri', 'llo']), { tipo: 'contiene-letra', valor: 'l' })).toBeNull();
    expect(clasificar(e('huevo', ['hue', 'vo']), { tipo: 'empieza-letra', valor: 'u' })).toBeNull();
  });
  it('ñ no es n', () => {
    expect(clasificar(e('ña', ['ña']), { tipo: 'contiene-letra', valor: 'n' })).toBe(false);
  });
  it('sílaba inicial y cantidad de sílabas', () => {
    expect(clasificar(e('mariposa', ['ma', 'ri', 'po', 'sa']), { tipo: 'empieza-silaba', valor: 'ma' })).toBe(true);
    expect(clasificar(e('mariposa', ['ma', 'ri', 'po', 'sa']), { tipo: 'num-silabas', valor: '4' })).toBe(true);
  });
});

describe('cada nivel tiene consignas posibles', () => {
  for (const b of nivelesDisponibles('decodificacion')) {
    it(`nivel ${b.nivel}`, () => {
      expect(reglasValidas(b.estimulos).length).toBeGreaterThan(3);
      const regla = elegirRegla(b.estimulos);
      const cola = armarCola(b.estimulos, regla, 30, 0.45);
      expect(cola).toHaveLength(30);
      for (const item of cola) expect(clasificar(item.estimulo, regla)).toBe(item.esObjetivo);
    });
  }
});
