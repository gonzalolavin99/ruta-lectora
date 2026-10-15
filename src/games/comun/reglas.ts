// Consignas de Basket: se calculan solas a partir del banco de palabras.
// Criterio de decodificación: POR LETRA. Las palabras que podrían confundir
// (ej. "chancho" para la letra c, "queso" para la u) no aparecen en esa ronda.

import consignasJson from '../../../content/juegos/consignas.json';
import type { Estimulo } from '../../engine/contenido';
import { grafemas, sinTildes } from '../../engine/estructura';

export type TipoRegla = 'contiene-letra' | 'empieza-letra' | 'empieza-silaba' | 'termina-letra' | 'num-silabas';

export interface Regla {
  tipo: TipoRegla;
  valor: string; // letra, sílaba o número de sílabas
}

export interface ItemCola {
  estimulo: Estimulo;
  esObjetivo: boolean;
}

const LETRAS = 'aeioubcdfgjlmnñprstvz'.split('');
// Letras que, dentro de un dígrafo, hacen ambigua la pregunta.
const DIGRAFOS_AMBIGUOS: Record<string, string[]> = {
  c: ['ch'],
  l: ['ll'],
  r: ['rr'],
  u: ['qu', 'gu'],
};

export type JuegoConConsigna = keyof typeof consignasJson.verbos;

export function textoConsigna(regla: Regla, juego: JuegoConConsigna): string {
  return `${consignasJson.verbos[juego]} ${consignasJson.consignas[regla.tipo]}`;
}

/** true = es objetivo, false = distractor, null = ambiguo (no se usa en esta ronda). */
export function clasificar(e: Estimulo, regla: Regla): boolean | null {
  const texto = sinTildes(e.texto);
  const gs = grafemas(e.texto);
  const v = regla.valor;
  switch (regla.tipo) {
    case 'contiene-letra': {
      const ambiguos = DIGRAFOS_AMBIGUOS[v] ?? [];
      if (gs.some((g) => ambiguos.includes(g))) return null;
      return texto.includes(v);
    }
    case 'empieza-letra': {
      if (texto.startsWith('h') || gs[0].length > 1) return null;
      return texto[0] === v;
    }
    case 'termina-letra': {
      if (texto.endsWith('y')) return null;
      return texto[texto.length - 1] === v;
    }
    case 'empieza-silaba':
      return sinTildes(e.silabas[0]) === v;
    case 'num-silabas':
      return e.silabas.length === Number(v);
  }
}

function candidatas(estimulos: Estimulo[]): Regla[] {
  const reglas: Regla[] = [];
  const sonPalabras = estimulos.some((e) => e.tipo !== 'silaba');
  for (const l of LETRAS) {
    reglas.push({ tipo: 'contiene-letra', valor: l });
    reglas.push({ tipo: 'empieza-letra', valor: l });
    if (sonPalabras) reglas.push({ tipo: 'termina-letra', valor: l });
  }
  if (sonPalabras) {
    for (const s of new Set(estimulos.map((e) => sinTildes(e.silabas[0])))) {
      reglas.push({ tipo: 'empieza-silaba', valor: s });
    }
    for (const n of new Set(estimulos.map((e) => e.silabas.length))) {
      reglas.push({ tipo: 'num-silabas', valor: String(n) });
    }
  }
  return reglas;
}

/** Reglas que tienen suficientes objetivos y distractores en el banco. */
export function reglasValidas(estimulos: Estimulo[], minimo = 4): Regla[] {
  return candidatas(estimulos).filter((r) => {
    let si = 0;
    let no = 0;
    for (const e of estimulos) {
      const c = clasificar(e, r);
      if (c === true) si++;
      if (c === false) no++;
    }
    return si >= minimo && no >= minimo;
  });
}

export function elegirRegla(estimulos: Estimulo[], anterior?: Regla, azar = Math.random): Regla {
  const validas = reglasValidas(estimulos);
  // "Contiene letra" es la consigna base; las demás aparecen con menos frecuencia.
  const peso = (r: Regla) => (r.tipo === 'contiene-letra' ? 3 : 1);
  const opciones = validas.filter((r) => !(anterior && r.tipo === anterior.tipo && r.valor === anterior.valor));
  const lista = opciones.length ? opciones : validas;
  const total = lista.reduce((s, r) => s + peso(r), 0);
  let x = azar() * total;
  for (const r of lista) {
    x -= peso(r);
    if (x <= 0) return r;
  }
  return lista[lista.length - 1];
}

/** Arma la secuencia de pelotas de una ronda (sin repetir la misma palabra seguida). */
export function armarCola(
  estimulos: Estimulo[],
  regla: Regla,
  cantidad: number,
  proporcionObjetivos: number,
  azar = Math.random,
): ItemCola[] {
  const objetivos = estimulos.filter((e) => clasificar(e, regla) === true);
  const distractores = estimulos.filter((e) => clasificar(e, regla) === false);
  const cola: ItemCola[] = [];
  let anterior = '';
  for (let i = 0; i < cantidad; i++) {
    const esObjetivo = azar() < proporcionObjetivos;
    const fuente = esObjetivo ? objetivos : distractores;
    let e = fuente[Math.floor(azar() * fuente.length)];
    if (e.id === anterior && fuente.length > 1) e = fuente[(fuente.indexOf(e) + 1) % fuente.length];
    anterior = e.id;
    cola.push({ estimulo: e, esObjetivo });
  }
  return cola;
}

function barajar<T>(lista: T[], azar: () => number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Palabras de la ronda: mitad cumplen la consigna y mitad no, sin repetir.
 * Son las que se presentan primero para leer y luego caen en el juego.
 */
export function elegirPalabras(estimulos: Estimulo[], regla: Regla, cantidad = 12, azar = Math.random): Estimulo[] {
  const objetivos = barajar(estimulos.filter((e) => clasificar(e, regla) === true), azar);
  const distractores = barajar(estimulos.filter((e) => clasificar(e, regla) === false), azar);
  const mitad = Math.ceil(cantidad / 2);
  const elegidos = [...objetivos.slice(0, mitad), ...distractores.slice(0, cantidad - Math.min(mitad, objetivos.length))];
  return barajar(elegidos.slice(0, cantidad), azar);
}
