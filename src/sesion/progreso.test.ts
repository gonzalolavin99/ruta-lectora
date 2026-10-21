import { describe, expect, it } from 'vitest';
import { DISFRACES, disfracesDisponibles, estrellasDeRonda, nivelDe, progresoInicial, registrarLectura, registrarRonda, resultadoDeRonda } from './progreso';

describe('niveles de la sesión', () => {
  it('estrellas por ronda (siempre al menos 1)', () => {
    expect(estrellasDeRonda(30, 30)).toBe(3);
    expect(estrellasDeRonda(27, 30)).toBe(3);
    expect(estrellasDeRonda(21, 30)).toBe(2);
    expect(estrellasDeRonda(3, 30)).toBe(1);
    expect(estrellasDeRonda(0, 0)).toBe(1);
  });

  it('cada 3 estrellas se sube un nivel', () => {
    expect(nivelDe(0)).toBe(1);
    expect(nivelDe(2)).toBe(1);
    expect(nivelDe(3)).toBe(2);
    expect(nivelDe(9)).toBe(4);
  });

  it('al llegar a nivel 2 se desbloquean fútbol, globos y gatos', () => {
    const r = resultadoDeRonda(1, 30, 30); // 1 + 3 = 4 estrellas → nivel 2
    expect(r.nivelAntes).toBe(1);
    expect(r.nivel).toBe(2);
    expect(r.desbloqueos.map((d) => d.id).sort()).toEqual(['futbol', 'gatos', 'globo']);
  });

  it('auto y delfín están disponibles desde el inicio', () => {
    expect(disfracesDisponibles('turbo', 1).map((d) => d.id)).toEqual(['auto', 'delfin']);
  });

  it('ids únicos', () => {
    const ids = Object.values(DISFRACES).flat().map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('medallas', () => {
  it('Todo terreno al jugar los 4 juegos', () => {
    let p = progresoInicial();
    for (const j of ['basket', 'crash', 'turbo'] as const) p = registrarRonda(p, j, 1);
    expect(p.medallas).toEqual([]);
    p = registrarRonda(p, 'memoria', 1);
    expect(p.medallas).toEqual(['todo-terreno']);
    p = registrarRonda(p, 'basket', 1);
    expect(p.medallas).toEqual(['todo-terreno']); // no se repite
  });

  it('En racha con 3 rondas seguidas de 3 estrellas; se corta con menos', () => {
    let p = progresoInicial();
    p = registrarRonda(p, 'basket', 3);
    p = registrarRonda(p, 'basket', 3);
    p = registrarRonda(p, 'basket', 2);
    expect(p.racha).toBe(0);
    for (let i = 0; i < 3; i++) p = registrarRonda(p, 'crash', 3);
    expect(p.medallas).toContain('racha');
  });

  it('Gran lector al leer 3 listas', () => {
    let p = progresoInicial();
    p = registrarLectura(registrarLectura(p));
    expect(p.medallas).toEqual([]);
    p = registrarLectura(p);
    expect(p.medallas).toEqual(['lector']);
  });
});
