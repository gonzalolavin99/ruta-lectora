// Carga los bancos de /content. Quedan dentro de la app, así funcionan sin conexión.

export type Objetivo = 'conciencia-fonologica' | 'decodificacion' | 'comprension' | 'funciones-ejecutivas';

export interface Estimulo {
  id: string;
  texto: string;
  silabas: string[];
  estructura: string;
  tipo: 'silaba' | 'palabra' | 'pseudopalabra';
  frecuencia?: string;
  imagen?: string;
  revisado: boolean;
}

export interface Banco {
  objetivo: Objetivo;
  nivel: number;
  titulo: string;
  nombreCorto: string;
  revisado: boolean;
  estimulos: Estimulo[];
}

/** Sílabas, palabras o pseudopalabras (según el primer estímulo del banco). */
export function tipoDeBanco(b: Banco): Estimulo['tipo'] {
  return b.estimulos[0]?.tipo ?? 'palabra';
}

const archivos = import.meta.glob<Banco>('/content/*/nivel-*.json', { eager: true, import: 'default' });

const bancos: Banco[] = Object.values(archivos).sort((a, b) => a.nivel - b.nivel);

export function obtenerBanco(objetivo: Objetivo, nivel: number): Banco | undefined {
  return bancos.find((b) => b.objetivo === objetivo && b.nivel === nivel);
}

export function nivelesDisponibles(objetivo: Objetivo): Banco[] {
  return bancos.filter((b) => b.objetivo === objetivo);
}
