// Guardado local en el aparato (IndexedDB). Ningún dato sale del aparato.
// Desde oct 2026 no hay perfiles de niños (pedido de Fran): solo se guardan
// preferencias de la fonoaudióloga y la última velocidad usada en cada curso.

import Dexie, { type EntityTable } from 'dexie';

export type Fuente = 'andika' | 'opendyslexic';

export interface Preferencias {
  fuente: Fuente;
  sonido: boolean; // efectos al acertar (swish, pop)
  colorearLetras: boolean; // p roja, b azul, d verde
  velocidades: Record<string, number>; // clave juego-curso, ej. basket-3
  velocidadesFijas: Record<string, boolean>; // true = la fono la fijó (no cambia sola)
}

interface Ajuste {
  clave: string;
  valor: unknown;
}

export const db = new Dexie('ruta-lectora') as Dexie & {
  ajustes: EntityTable<Ajuste, 'clave'>;
};

db.version(1).stores({
  perfiles: 'id, alias',
  respuestas: 'id, perfilId, rondaId, fecha',
  rondas: 'id, perfilId, inicio',
  ajustes: 'clave',
});
// Versión 2: se eliminan perfiles, respuestas y rondas.
db.version(2).stores({ perfiles: null, respuestas: null, rondas: null, ajustes: 'clave' });

export const PREFERENCIAS_INICIALES: Preferencias = { fuente: 'andika', sonido: true, colorearLetras: true, velocidades: {}, velocidadesFijas: {} };

export async function leerPreferencias(): Promise<Preferencias> {
  const fila = await db.ajustes.get('preferencias');
  return { ...PREFERENCIAS_INICIALES, ...(fila?.valor as Partial<Preferencias> | undefined) };
}

export async function guardarPreferencias(cambios: Partial<Preferencias>): Promise<void> {
  const actual = await leerPreferencias();
  await db.ajustes.put({ clave: 'preferencias', valor: { ...actual, ...cambios } });
}

export const claveVelocidad = (juego: string, curso: number) => `${juego}-${curso}`;

export async function guardarVelocidad(juego: string, curso: number, velocidad: number, fija: boolean): Promise<void> {
  const actual = await leerPreferencias();
  const clave = claveVelocidad(juego, curso);
  await guardarPreferencias({
    velocidades: { ...actual.velocidades, [clave]: velocidad },
    velocidadesFijas: { ...actual.velocidadesFijas, [clave]: fija },
  });
}

/** Pide al navegador que no borre los datos cuando falte espacio (importante en Safari/iPad). */
export async function pedirAlmacenamientoPersistente(): Promise<void> {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist();
  } catch {
    // Si el navegador no lo permite, seguimos igual.
  }
}
