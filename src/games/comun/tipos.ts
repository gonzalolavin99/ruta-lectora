// Tipos compartidos por los juegos "arcade" (Basket y Crash): estímulos en
// movimiento, una consigna, 3 vidas y velocidad ajustable.

import type Phaser from 'phaser';
import type { Disfraz } from '../../sesion/progreso';
import type { Tema } from '../../ui/tema';
import type { ItemCola } from './reglas';
import type { ParametrosVelocidad } from './velocidad';

export interface Decision {
  item: ItemCola;
  elegida: boolean; // atrapada (Basket) o reventada (Crash)
  correcta: boolean;
  rayo: boolean;
}

export interface Marcador {
  vidas: number;
  puntos: number;
  estrellas: number;
}

export interface ConfigEscena {
  tema: Tema;
  familiaFuente: string;
  colorearLetras: boolean;
  sonido: boolean;
  cola: ItemCola[];
  vidas: number;
  disfraz: () => Disfraz; // se lee al soltar cada estímulo (se puede cambiar antes de empezar)
  parametros: () => ParametrosVelocidad;
  alDecidir: (d: Decision) => void;
  alCambiarMarcador: (m: Marcador) => void;
  alTerminar: (m: Marcador) => void;
}

/** Lo que React necesita de cada escena. */
export interface EscenaArcade extends Phaser.Scene {
  empezar(): void;
  cambiarVelocidad(p: ParametrosVelocidad): void;
}

export const ANCHO = 1280;
export const ALTO = 860;
