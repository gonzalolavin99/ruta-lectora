// Etiqueta con la palabra (fondo crema, borde de tinta y sombra tipo sticker).
// Phaser no puede pintar letras sueltas de otro color, así que la palabra se arma
// con un texto por cada trozo de color (p roja, b azul, d verde).

import Phaser from 'phaser';
import { trozosColoreados } from '../../ui/letras';

export interface OpcionesEtiqueta {
  familiaFuente: string;
  colorearLetras: boolean;
  fondo: string;
  borde: string;
  texto: string;
}

const TAMANO = 46;
const ESPACIADO = 3;
const ALTO = 76;

const color = (hex: string) => Phaser.Display.Color.HexStringToColor(hex).color;

export function crearEtiqueta(
  escena: Phaser.Scene,
  palabra: string,
  o: OpcionesEtiqueta,
): { contenedor: Phaser.GameObjects.Container; ancho: number } {
  const resolucion = Math.min(3, window.devicePixelRatio || 1);
  const textos = trozosColoreados(palabra, o.colorearLetras).map((t) =>
    escena.add
      .text(0, 0, t.texto, {
        fontFamily: o.familiaFuente,
        fontSize: `${TAMANO}px`,
        fontStyle: 'bold',
        color: t.color ?? o.texto,
      })
      .setOrigin(0, 0.5)
      .setLetterSpacing(ESPACIADO)
      .setResolution(resolucion),
  );
  const anchoTexto = textos.reduce((s, t) => s + t.width, 0);
  let x = -anchoTexto / 2;
  for (const t of textos) {
    t.x = x;
    x += t.width;
  }

  const ancho = Math.max(104, anchoTexto + 36);
  const fondo = escena.add.graphics();
  fondo.fillStyle(color(o.borde), 1); // sombra
  fondo.fillRoundedRect(-ancho / 2 + 5, -ALTO / 2 + 6, ancho, ALTO, 20);
  fondo.fillStyle(color(o.fondo), 1);
  fondo.fillRoundedRect(-ancho / 2, -ALTO / 2, ancho, ALTO, 20);
  fondo.lineStyle(5, color(o.borde), 1);
  fondo.strokeRoundedRect(-ancho / 2, -ALTO / 2, ancho, ALTO, 20);

  return { contenedor: escena.add.container(0, 0, [fondo, ...textos]), ancho };
}
