// Estilo visual por tramo. El TRAMO define cómo se ve; nunca la dificultad.
// Versión 2 (pedido de Fran, oct 2026): más juvenil, claro y vivo, estilo "sticker":
// colores intensos, bordes de tinta y sombras desplazadas. Sin blanco puro.

export type Tramo = 'explorar' | 'aventura' | 'estilo';

export const CURSOS = [1, 2, 3, 4, 5, 6];

/** 1°–2° Explorar, 3°–4° Aventura, 5°–6° Estilo. */
export function tramoDeCurso(curso: number): Tramo {
  if (curso <= 2) return 'explorar';
  if (curso <= 4) return 'aventura';
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
  bgPuntos: string; // color del patrón de puntitos del fondo
  surface: string;
  text: string;
  ink: string; // bordes y sombras
  primary: string;
  onPrimary: string;
  accent: string;
  okBg: string;
  radio: number;
  cancha: ColoresCancha;
}

const CREMA = '#FFFDF7';
const TINTA = '#1D1640';

export const TEMAS: Record<Tramo, Tema> = {
  explorar: {
    tramo: 'explorar', nombre: 'Explorar', cursos: '1°–2° básico',
    bg: '#FFF1C9', bgPuntos: '#FFD978', surface: CREMA, text: TINTA, ink: TINTA,
    primary: '#FFC93C', onPrimary: TINTA, accent: '#FF6FB5', okBg: '#D4F1E4', radio: 28,
    cancha: {
      pared: '#FFE7A3', paredDetalle: '#FFDB80', piso: '#F7B267', pisoLinea: '#EFA052', lineas: CREMA,
      bola: '#FF8A3D', costura: TINTA, etiqueta: CREMA, etiquetaBorde: TINTA, etiquetaTexto: TINTA,
      aro: '#FF4F8B', tablero: CREMA, tableroBorde: TINTA, red: CREMA, poste: TINTA,
    },
  },
  aventura: {
    tramo: 'aventura', nombre: 'Aventura', cursos: '3°–4° básico',
    bg: '#D9F6EE', bgPuntos: '#A6E8D6', surface: CREMA, text: TINTA, ink: TINTA,
    primary: '#4CC9F0', onPrimary: TINTA, accent: '#C6F432', okBg: '#D9F2C2', radio: 20,
    cancha: {
      pared: '#BFEFE2', paredDetalle: '#A6E6D5', piso: '#57B6E6', pisoLinea: '#4AA6D6', lineas: CREMA,
      bola: '#FF8A3D', costura: TINTA, etiqueta: CREMA, etiquetaBorde: TINTA, etiquetaTexto: TINTA,
      aro: '#FF5A36', tablero: CREMA, tableroBorde: TINTA, red: CREMA, poste: TINTA,
    },
  },
  estilo: {
    tramo: 'estilo', nombre: 'Estilo', cursos: '5°–6° básico',
    bg: '#EDE4FF', bgPuntos: '#D5C3FF', surface: CREMA, text: TINTA, ink: TINTA,
    primary: '#C6F432', onPrimary: TINTA, accent: '#FF4FA3', okBg: '#E4F8B8', radio: 14,
    cancha: {
      pared: '#E0D2FF', paredDetalle: '#D3C0FF', piso: '#8F6BFF', pisoLinea: '#8360F5', lineas: '#C6F432',
      bola: '#FF8A3D', costura: TINTA, etiqueta: CREMA, etiquetaBorde: TINTA, etiquetaTexto: TINTA,
      aro: '#FF4FA3', tablero: CREMA, tableroBorde: TINTA, red: CREMA, poste: TINTA,
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
    '--bg-puntos': t.bgPuntos,
    '--surface': t.surface,
    '--text': t.text,
    '--ink': t.ink,
    '--primary': t.primary,
    '--on-primary': t.onPrimary,
    '--accent': t.accent,
    '--ok-bg': t.okBg,
    '--radio': `${t.radio}px`,
  };
}
