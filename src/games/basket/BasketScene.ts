// Basket: caen pelotas con palabras. El niño toca las que cumplen la consigna
// y la pelota vuela al aro. Sin audio ni mensajes: el niño lee.
//   - Toca una correcta → encesta (+1).
//   - Toca una incorrecta → pierde una vida (sin sonido ni mensaje de error).
//   - Deja pasar una correcta → no pierde vida; queda registrado como omisión.

import Phaser from 'phaser';
import type { ColoresCancha } from '../../ui/tema';
import type { ItemCola } from './reglas';
import { UMBRAL_RAYO, type ParametrosVelocidad } from './velocidad';

export const ANCHO = 1280;
export const ALTO = 860;

const ARO = { x: 1080, y: 330, ancho: 136, alto: 30 };
const CARRILES = [165, 395, 625, 850];
const RADIO_BOLA = 58;
const Y_INICIO = -90;
const Y_FIN = ALTO + 90;

export interface Decision {
  item: ItemCola;
  tocada: boolean;
  correcta: boolean;
  tiempoMs: number | null;
  rayo: boolean;
}

export interface ConfigBasket {
  colores: ColoresCancha;
  familiaFuente: string;
  cola: ItemCola[];
  vidas: number;
  parametros: () => ParametrosVelocidad;
  alDecidir: (d: Decision) => void;
  alCambiarMarcador: (m: { vidas: number; encestadas: number; estrellas: number }) => void;
  alTerminar: (m: { vidas: number; encestadas: number; estrellas: number }) => void;
}

interface Bola {
  item: ItemCola;
  contenedor: Phaser.GameObjects.Container;
  etiqueta: Phaser.GameObjects.Container;
  velocidad: number; // px por ms
  nacio: number;
  caidaMs: number;
  resuelta: boolean;
}

const color = (hex: string) => Phaser.Display.Color.HexStringToColor(hex).color;

export class BasketScene extends Phaser.Scene {
  private cfg: ConfigBasket;
  private bolas: Bola[] = [];
  private indice = 0;
  private espera = 0;
  private reloj = 0;
  private ultimoCarril = -1;
  private vidas = 0;
  private encestadas = 0;
  private estrellas = 0;
  private jugando = false;
  private terminado = false;
  private red!: Phaser.GameObjects.Graphics;

  constructor(cfg: ConfigBasket) {
    super('basket');
    this.cfg = cfg;
    this.vidas = cfg.vidas;
  }

  create() {
    this.dibujarCancha();
    this.dibujarAro();
    this.crearTexturaBola();
  }

  /** Lo llama React cuando el niño aprieta "¡Vamos!". */
  empezar() {
    this.jugando = true;
    this.espera = 400;
  }

  update(_t: number, dt: number) {
    if (!this.jugando || this.terminado) return;
    this.reloj += dt;

    this.espera -= dt;
    if (this.espera <= 0 && this.indice < this.cfg.cola.length) {
      const p = this.cfg.parametros();
      this.lanzarBola(this.cfg.cola[this.indice++], p);
      this.espera = p.intervaloMs;
    }

    for (const b of this.bolas) {
      if (b.resuelta) continue;
      b.contenedor.y += b.velocidad * dt;
      if (b.contenedor.y > Y_FIN) {
        this.resolver(b, false);
        b.contenedor.destroy();
      }
    }
    this.bolas = this.bolas.filter((b) => b.contenedor.active);

    if (this.indice >= this.cfg.cola.length && this.bolas.length === 0) this.terminar();
  }

  // ---------- pelotas ----------

  private lanzarBola(item: ItemCola, p: ParametrosVelocidad) {
    let carril = Phaser.Math.Between(0, CARRILES.length - 1);
    if (carril === this.ultimoCarril) carril = (carril + 1 + Phaser.Math.Between(0, 2)) % CARRILES.length;
    this.ultimoCarril = carril;

    const c = this.cfg.colores;
    const imagen = this.add.image(0, 0, 'bola');
    const texto = this.add
      .text(0, 0, item.estimulo.texto, {
        fontFamily: this.cfg.familiaFuente,
        fontSize: '46px',
        fontStyle: 'bold',
        color: c.etiquetaTexto,
      })
      .setOrigin(0.5)
      .setLetterSpacing(3)
      .setResolution(Math.min(3, window.devicePixelRatio || 1));
    const anchoEtiqueta = Math.max(104, texto.width + 36);
    const fondo = this.add.graphics();
    fondo.fillStyle(color(c.etiqueta), 1);
    fondo.fillRoundedRect(-anchoEtiqueta / 2, -38, anchoEtiqueta, 76, 20);
    fondo.lineStyle(4, color(c.etiquetaBorde), 1);
    fondo.strokeRoundedRect(-anchoEtiqueta / 2, -38, anchoEtiqueta, 76, 20);
    const etiqueta = this.add.container(0, 0, [fondo, texto]);

    const contenedor = this.add.container(CARRILES[carril], Y_INICIO, [imagen, etiqueta]).setDepth(5);
    const anchoToque = Math.max(anchoEtiqueta, RADIO_BOLA * 2) + 16;
    contenedor.setSize(anchoToque, RADIO_BOLA * 2 + 24);
    contenedor.setInteractive({ useHandCursor: true });

    const bola: Bola = {
      item,
      contenedor,
      etiqueta,
      velocidad: (Y_FIN - Y_INICIO) / p.caidaMs,
      nacio: this.reloj,
      caidaMs: p.caidaMs,
      resuelta: false,
    };
    contenedor.on('pointerdown', () => this.tocar(bola));
    this.bolas.push(bola);
  }

  private tocar(b: Bola) {
    if (b.resuelta || this.terminado) return;
    b.contenedor.disableInteractive();
    if (b.item.esObjetivo) this.encestar(b);
    else this.fallar(b);
  }

  private resolver(b: Bola, tocada: boolean) {
    if (b.resuelta) return;
    b.resuelta = true;
    const tiempoMs = tocada ? Math.round(this.reloj - b.nacio) : null;
    const correcta = tocada === b.item.esObjetivo;
    const rayo = tocada && correcta && tiempoMs !== null && tiempoMs < b.caidaMs * UMBRAL_RAYO;
    if (rayo) this.estrellas++;
    this.cfg.alDecidir({ item: b.item, tocada, correcta, tiempoMs, rayo });
    if (rayo) this.mostrarRayo();
  }

  private encestar(b: Bola) {
    this.resolver(b, true);
    const { contenedor } = b;
    const desde = new Phaser.Math.Vector2(contenedor.x, contenedor.y);
    const hasta = new Phaser.Math.Vector2(ARO.x, ARO.y - 40);
    const control = new Phaser.Math.Vector2((desde.x + hasta.x) / 2, Math.min(desde.y, hasta.y) - 240);
    const curva = new Phaser.Curves.QuadraticBezier(desde, control, hasta);

    this.tweens.add({ targets: b.etiqueta, alpha: 0, duration: 180 });
    this.tweens.add({ targets: contenedor, scale: 0.72, duration: 520 });
    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 520,
      ease: 'Sine.easeInOut',
      onUpdate: (tw) => {
        const punto = curva.getPoint(tw.getValue() ?? 0);
        contenedor.setPosition(punto.x, punto.y);
      },
      onComplete: () => {
        this.encestadas++;
        this.avisarMarcador();
        this.agitarRed();
        this.tweens.add({
          targets: contenedor,
          y: ARO.y + 110,
          alpha: 0,
          duration: 380,
          ease: 'Quad.easeIn',
          onComplete: () => contenedor.destroy(),
        });
      },
    });
  }

  private fallar(b: Bola) {
    this.resolver(b, true);
    this.vidas = Math.max(0, this.vidas - 1);
    this.avisarMarcador();
    this.tweens.add({
      targets: b.contenedor,
      x: b.contenedor.x + 10,
      duration: 60,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.tweens.add({
          targets: b.contenedor,
          alpha: 0,
          scale: 0.85,
          duration: 300,
          onComplete: () => b.contenedor.destroy(),
        });
      },
    });
    if (this.vidas === 0) this.time.delayedCall(700, () => this.terminar());
  }

  private terminar() {
    if (this.terminado) return;
    this.terminado = true;
    for (const b of this.bolas) {
      b.resuelta = true;
      b.contenedor.disableInteractive();
      this.tweens.add({ targets: b.contenedor, alpha: 0, duration: 300 });
    }
    this.time.delayedCall(500, () =>
      this.cfg.alTerminar({ vidas: this.vidas, encestadas: this.encestadas, estrellas: this.estrellas }),
    );
  }

  private avisarMarcador() {
    this.cfg.alCambiarMarcador({ vidas: this.vidas, encestadas: this.encestadas, estrellas: this.estrellas });
  }

  private mostrarRayo() {
    const t = this.add.text(ARO.x - 10, ARO.y - 110, '⚡', { fontSize: '56px' }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: t, y: t.y - 70, alpha: 0, duration: 900, onComplete: () => t.destroy() });
  }

  private agitarRed() {
    this.tweens.add({ targets: this.red, scaleY: 1.3, scaleX: 0.9, duration: 120, yoyo: true, ease: 'Sine.easeOut' });
  }

  // ---------- dibujo ----------

  private crearTexturaBola() {
    const c = this.cfg.colores;
    const r = RADIO_BOLA;
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(color(c.bola), 1);
    g.fillCircle(r + 3, r + 3, r);
    g.lineStyle(4, color(c.costura), 0.9);
    g.strokeCircle(r + 3, r + 3, r);
    g.lineBetween(3, r + 3, 2 * r + 3, r + 3);
    g.lineBetween(r + 3, 3, r + 3, 2 * r + 3);
    g.beginPath();
    g.arc(r + 3 - r * 1.15, r + 3, r * 0.95, -0.9, 0.9);
    g.strokePath();
    g.beginPath();
    g.arc(r + 3 + r * 1.15, r + 3, r * 0.95, Math.PI - 0.9, Math.PI + 0.9);
    g.strokePath();
    g.generateTexture('bola', 2 * r + 6, 2 * r + 6);
    g.destroy();
  }

  private dibujarCancha() {
    const c = this.cfg.colores;
    const g = this.add.graphics();
    const piso = 640;

    // Pared del gimnasio con franjas suaves
    g.fillStyle(color(c.pared), 1);
    g.fillRect(0, 0, ANCHO, piso);
    g.fillStyle(color(c.paredDetalle), 1);
    for (let y = 40; y < piso; y += 90) g.fillRect(0, y, ANCHO, 34);

    // Piso de madera
    g.fillStyle(color(c.piso), 1);
    g.fillRect(0, piso, ANCHO, ALTO - piso);
    g.lineStyle(2, color(c.pisoLinea), 1);
    for (let y = piso + 36; y < ALTO; y += 44) g.lineBetween(0, y, ANCHO, y);

    // Líneas de la cancha (vista en perspectiva)
    g.lineStyle(6, color(c.lineas), 0.95);
    g.lineBetween(0, piso + 8, ANCHO, piso + 8);
    g.strokeEllipse(ANCHO * 0.36, piso + 110, 420, 120);
    g.beginPath();
    g.arc(ANCHO + 40, piso + 120, 560, Math.PI * 0.94, Math.PI * 1.06);
    g.strokePath();
    g.strokeRect(ANCHO - 330, piso + 30, 360, 170);
  }

  private dibujarAro() {
    const c = this.cfg.colores;
    const g = this.add.graphics().setDepth(1);

    // Poste y brazo
    g.fillStyle(color(c.poste), 1);
    g.fillRect(1222, 240, 22, ALTO - 240);
    g.fillRect(1180, 252, 52, 16);

    // Tablero (de lado)
    g.fillStyle(color(c.tablero), 1);
    g.fillRoundedRect(1162, 180, 22, 200, 6);
    g.lineStyle(4, color(c.tableroBorde), 1);
    g.strokeRoundedRect(1162, 180, 22, 200, 6);

    // Soporte del aro
    g.fillStyle(color(c.aro), 1);
    g.fillRect(ARO.x + ARO.ancho / 2 - 6, ARO.y - 5, 1162 - (ARO.x + ARO.ancho / 2) + 6, 10);

    // Red (se agita al encestar)
    this.red = this.add.graphics({ x: ARO.x, y: ARO.y }).setDepth(9);
    this.red.lineStyle(3, color(c.red), 0.9);
    const arriba = ARO.ancho / 2;
    const abajo = arriba * 0.55;
    const largo = 95;
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      this.red.lineBetween(-arriba + 2 * arriba * t, 0, -abajo + 2 * abajo * t, largo);
    }
    for (let j = 1; j <= 3; j++) {
      const y = (largo * j) / 3;
      const a = arriba - (arriba - abajo) * (j / 3);
      this.red.lineBetween(-a, y, a, y);
    }

    // Mitad de adelante del aro (por delante de la pelota)
    const frente = this.add.graphics().setDepth(10);
    frente.lineStyle(8, color(c.aro), 1);
    frente.strokeEllipse(ARO.x, ARO.y, ARO.ancho, ARO.alto);
  }
}
