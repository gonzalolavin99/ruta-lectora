// PIN de adulto: evita que el niño entre a la zona de la fonoaudióloga.
// Se guarda solo una "huella" (hash) con sal, nunca el PIN mismo.

import { db } from './db';

interface PinGuardado {
  sal: string;
  huella: string;
}

const hex = (b: ArrayBuffer | Uint8Array) =>
  [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');

async function huella(pin: string, sal: string): Promise<string> {
  const datos = new TextEncoder().encode(`${sal}:${pin}`);
  if (crypto.subtle) return hex(await crypto.subtle.digest('SHA-256', datos));
  // Sin https (solo en pruebas por red local) no existe crypto.subtle: hash simple de respaldo.
  let h = 2166136261;
  for (const x of datos) h = Math.imul(h ^ x, 16777619);
  return `fnv-${(h >>> 0).toString(16)}`;
}

export async function hayPin(): Promise<boolean> {
  return !!(await db.ajustes.get('pin'));
}

export async function guardarPin(pin: string): Promise<void> {
  const sal = hex(crypto.getRandomValues(new Uint8Array(16)));
  const valor: PinGuardado = { sal, huella: await huella(pin, sal) };
  await db.ajustes.put({ clave: 'pin', valor });
}

export async function verificarPin(pin: string): Promise<boolean> {
  const fila = await db.ajustes.get('pin');
  if (!fila) return false;
  const { sal, huella: esperada } = fila.valor as PinGuardado;
  return (await huella(pin, sal)) === esperada;
}
