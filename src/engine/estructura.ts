// Análisis de letras y estructura silábica (CV, CVC, CCV…).
// Decodificación se trabaja POR LETRA: ch, ll, rr y qu/gu (+e/i) cuentan como una unidad.

const VOCALES = 'aeiouáéíóúü';
const SIN_TILDE: Record<string, string> = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u' };

export function normalizar(texto: string): string {
  return texto.trim().toLowerCase().normalize('NFC');
}

/** Quita tildes y diéresis, pero conserva la ñ. */
export function sinTildes(texto: string): string {
  return normalizar(texto).replace(/[áéíóúü]/g, (c) => SIN_TILDE[c]);
}

export function esVocal(g: string): boolean {
  return g.length === 1 && VOCALES.includes(g);
}

/** Divide un texto en grafemas: "queso" → ["qu", "e", "s", "o"]. */
export function grafemas(texto: string): string[] {
  const s = normalizar(texto);
  const out: string[] = [];
  let i = 0;
  while (i < s.length) {
    const dos = s.slice(i, i + 2);
    const siguiente = s[i + 2] ?? '';
    if (dos === 'ch' || dos === 'll' || dos === 'rr') {
      out.push(dos);
      i += 2;
    } else if ((dos === 'qu' || dos === 'gu') && 'eiéí'.includes(siguiente) && siguiente !== '') {
      out.push(dos);
      i += 2;
    } else {
      out.push(s[i]);
      i += 1;
    }
  }
  return out;
}

function tipoGrafema(gs: string[], i: number): 'C' | 'V' | '' {
  const g = gs[i];
  if (g === 'h') return ''; // la h no suena
  if (g === 'y') {
    const sig = gs[i + 1];
    return sig && esVocal(sig) ? 'C' : 'V'; // "yate" → C, "muy" → V
  }
  return esVocal(g) ? 'V' : 'C';
}

export function estructuraSilaba(silaba: string): string {
  const gs = grafemas(silaba);
  return gs.map((_, i) => tipoGrafema(gs, i)).join('');
}

/** ["ca","sa"] → "CV-CV" */
export function estructura(silabas: string[]): string {
  return silabas.map(estructuraSilaba).join('-');
}
