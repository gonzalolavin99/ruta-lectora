// Guardado local en el aparato (IndexedDB). Ningún dato sale del aparato.
// Si algún día se agrega sincronización, solo cambia esta carpeta (src/data/).

import Dexie, { type EntityTable } from 'dexie';
import type { EstadoAdaptativo } from '../engine/adaptativo';

export type Fuente = 'andika' | 'opendyslexic';

export interface Perfil {
  id: string;
  alias: string; // alias o iniciales, nunca nombre completo
  curso: number; // 2 a 7 → define el tramo (cómo se ve)
  nivelLectura: number; // nivel de decodificación → qué palabras salen
  fuente: Fuente;
  tamanoBloque: number;
  basket: EstadoAdaptativo; // nivel = velocidad
  monedas: number;
  creado: number;
  actualizado: number;
}

export interface Respuesta {
  id: string;
  perfilId: string;
  rondaId: string;
  juego: 'basket';
  fecha: number;
  estimuloId: string;
  texto: string;
  regla: string;
  esObjetivo: boolean;
  tocada: boolean;
  correcta: boolean;
  tiempoMs: number | null;
  velocidad: number;
  refuerzo: boolean;
  nivelLectura: number;
}

export interface Ronda {
  id: string;
  perfilId: string;
  juego: 'basket';
  inicio: number;
  fin: number;
  regla: string;
  nivelLectura: number;
  velocidadInicial: number;
  velocidadFinal: number;
  correctas: number;
  total: number;
  encestadas: number;
  estrellas: number;
  vidasPerdidas: number;
}

export interface Ajuste {
  clave: string;
  valor: unknown;
}

export const db = new Dexie('ruta-lectora') as Dexie & {
  perfiles: EntityTable<Perfil, 'id'>;
  respuestas: EntityTable<Respuesta, 'id'>;
  rondas: EntityTable<Ronda, 'id'>;
  ajustes: EntityTable<Ajuste, 'clave'>;
};

db.version(1).stores({
  perfiles: 'id, alias',
  respuestas: 'id, perfilId, rondaId, fecha',
  rondas: 'id, perfilId, inicio',
  ajustes: 'clave',
});

/** Id único. Usa crypto.getRandomValues, que funciona también sin https (pruebas en red local). */
export function nuevoId(): string {
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** Pide al navegador que no borre los datos cuando falte espacio (importante en Safari/iPad). */
export async function pedirAlmacenamientoPersistente(): Promise<void> {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist();
  } catch {
    // Si el navegador no lo permite, seguimos igual.
  }
}

export function perfilNuevo(alias: string, curso: number, nivelLectura: number): Perfil {
  const ahora = Date.now();
  return {
    id: nuevoId(),
    alias: alias.trim(),
    curso,
    nivelLectura,
    fuente: 'andika',
    tamanoBloque: 10,
    basket: { nivel: 1, fijado: false, refuerzo: false, bloque: [] },
    monedas: 0,
    creado: ahora,
    actualizado: ahora,
  };
}
