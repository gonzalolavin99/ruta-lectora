// Regla de subir y bajar (docs/01-diseno.md §2), en bloques de N respuestas:
//   ≥ 80 %  → sube
//   60–79 % → se mantiene
//   < 60 %  → primera vez: bloque de refuerzo (más fácil, mismo nivel);
//             si en el refuerzo vuelve a bajar de 60 % → baja un nivel.
// Si la fonoaudióloga fijó el nivel, se registra todo pero el nivel no cambia.

export interface EstadoAdaptativo {
  nivel: number;
  fijado: boolean;
  refuerzo: boolean;
  bloque: boolean[]; // respuestas del bloque en curso (true = correcta)
}

export type Cambio = 'sube' | 'mantiene' | 'refuerzo' | 'baja' | 'sale-refuerzo';

export interface Limites {
  tamanoBloque: number;
  min: number;
  max: number;
}

export function evaluarBloque(porcentaje: number, enRefuerzo: boolean): Cambio {
  if (enRefuerzo) return porcentaje < 60 ? 'baja' : 'sale-refuerzo';
  if (porcentaje >= 80) return 'sube';
  if (porcentaje >= 60) return 'mantiene';
  return 'refuerzo';
}

export function registrarRespuesta(
  estado: EstadoAdaptativo,
  correcta: boolean,
  limites: Limites,
): { estado: EstadoAdaptativo; cambio?: Cambio; porcentaje?: number } {
  const bloque = [...estado.bloque, correcta];
  if (bloque.length < limites.tamanoBloque) return { estado: { ...estado, bloque } };

  const porcentaje = Math.round((bloque.filter(Boolean).length / bloque.length) * 100);
  const cambio = evaluarBloque(porcentaje, estado.refuerzo);
  const nuevo: EstadoAdaptativo = { ...estado, bloque: [] };

  if (!estado.fijado) {
    if (cambio === 'sube') nuevo.nivel = Math.min(limites.max, estado.nivel + 1);
    if (cambio === 'baja') nuevo.nivel = Math.max(limites.min, estado.nivel - 1);
    nuevo.refuerzo = cambio === 'refuerzo';
  }
  return { estado: nuevo, cambio, porcentaje };
}
