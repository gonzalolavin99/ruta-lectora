// Colores de apoyo para letras que se confunden (pedido de Fran):
// p roja, b azul, d verde. Se pueden apagar en Ajustes.
// Tonos oscuros para que se lean bien sobre fondo crema.

export const COLORES_LETRA: Record<string, string> = {
  p: '#D62828',
  b: '#1D4ED8',
  d: '#15803D',
};

export interface Trozo {
  texto: string;
  color: string | null; // null = color normal del texto
}

/** "bodega" → [b azul][o][d verde][ega]. Junta las letras seguidas del mismo color. */
export function trozosColoreados(texto: string, activo: boolean): Trozo[] {
  if (!activo) return [{ texto, color: null }];
  const trozos: Trozo[] = [];
  for (const letra of texto) {
    const color = COLORES_LETRA[letra.toLowerCase()] ?? null;
    const ultimo = trozos[trozos.length - 1];
    if (ultimo && ultimo.color === color) ultimo.texto += letra;
    else trozos.push({ texto: letra, color });
  }
  return trozos;
}
