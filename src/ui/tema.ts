// Estilo visual por tramo (docs/estilos-por-tramo.html, colores aprobados por Fran).
// El TRAMO define cómo se ve; nunca la dificultad.

export type Tramo = 'explorar' | 'aventura' | 'estilo';

export function tramoDeCurso(curso: number): Tramo {
  if (curso <= 3) return 'explorar';
  if (curso <= 5) return 'aventura';
  return 'estilo';
}

export interface ColoresCancha {
  pared: string;
  paredDetalle: string;
  piso: string;
  pisoLinea: string;
  lineas: string;
  bola: string;
  costura: string;
  etiqueta: string;
  etiquetaBorde: string;
  etiquetaTexto: string;
  aro: string;
  tablero: string;
  tableroBorde: string;
  red: string;
  poste: string;
}

export interface Tema {
  tramo: Tramo;
  nombre: string;
  cursos: string;
  bg: string;
  surface: string;
  text: string;
  primary: string;
  onPrimary: string;
  okBg: string;
  radio: number;
  cancha: ColoresCancha;
}

export const TEMAS: Record<Tramo, Tema> = {
  explorar: {
    tramo: 'explorar', nombre: 'Explorar', cursos: '2°–3° básico',
    bg: '#FFF6E5', surface: '#FFE6BF', text: '#2B2340', primary: '#F08A5D', onPrimary: '#2B2340', okBg: '#D4F1E4', radio: 28,
    cancha: {
      pared: '#FBE3C4', paredDetalle: '#F7D3A6', piso: '#EDB97E', pisoLinea: '#E0A866', lineas: '#FFF6E5',
      bola: '#F08A5D', costura: '#2B2340', etiqueta: '#FFF6E5', etiquetaBorde: '#2B2340', etiquetaTexto: '#2B2340',
      aro: '#E4572E', tablero: '#FFF6E5', tableroBorde: '#2B2340', red: '#FFF6E5', poste: '#6C5B7B',
    },
  },
  aventura: {
    tramo: 'aventura', nombre: 'Aventura', cursos: '4°–5° básico',
    bg: '#F3EDE2', surface: '#E4D8C2', text: '#1F2A30', primary: '#146B69', onPrimary: '#FBF7F0', okBg: '#D9E8D0', radio: 14,
    cancha: {
      pared: '#E4D8C2', paredDetalle: '#D6C6A8', piso: '#C99A64', pisoLinea: '#B88752', lineas: '#F3EDE2',
      bola: '#D9733A', costura: '#1F2A30', etiqueta: '#F3EDE2', etiquetaBorde: '#146B69', etiquetaTexto: '#1F2A30',
      aro: '#C4502A', tablero: '#F3EDE2', tableroBorde: '#146B69', red: '#F3EDE2', poste: '#146B69',
    },
  },
  estilo: {
    tramo: 'estilo', nombre: 'Estilo', cursos: '6°–7° básico',
    bg: '#1A2230', surface: '#243042', text: '#EEF1F5', primary: '#3CE0C5', onPrimary: '#1A2230', okBg: '#1F3D3F', radio: 8,
    cancha: {
      pared: '#1A2230', paredDetalle: '#202A3B', piso: '#243042', pisoLinea: '#2B384D', lineas: '#3CE0C5',
      bola: '#FF8A3D', costura: '#1A2230', etiqueta: '#1A2230', etiquetaBorde: '#3CE0C5', etiquetaTexto: '#EEF1F5',
      aro: '#FF5C8A', tablero: '#243042', tableroBorde: '#3CE0C5', red: '#EEF1F5', poste: '#3CE0C5',
    },
  },
};

export const FAMILIA_FUENTE = {
  andika: '"Andika", "Trebuchet MS", sans-serif',
  opendyslexic: '"OpenDyslexic", "Andika", sans-serif',
} as const;

/** Variables CSS para que React use los colores del tramo. */
export function variablesCss(t: Tema): Record<string, string> {
  return {
    '--bg': t.bg,
    '--surface': t.surface,
    '--text': t.text,
    '--primary': t.primary,
    '--on-primary': t.onPrimary,
    '--ok-bg': t.okBg,
    '--radio': `${t.radio}px`,
  };
}
