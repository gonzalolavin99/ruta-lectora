// Crash: suben burbujas con palabras zigzagueando. El niño TOCA para reventar
// solo las que cumplen la consigna (decodificación + control inhibitorio).
//   - Revienta una correcta     → +1 ("pop" si el sonido está activo).
//   - Toca una incorrecta       → se pone gris, se va y pierde una vida.
//   - Deja escapar una correcta → pierde una vida (misma regla que Basket).
//   - Deja escapar una incorrecta → bien hecho, no pasa nada.

import Phaser from 'phaser';
import { sonarPop } from '../../audio/efectos';
import { crearEtiqueta } from '../comun/etiqueta';
import type { ItemCola } from '../comun/reglas';
import { ALTO, ANCHO, type ConfigEscena, type EscenaArcade, type Marcador } from '../comun/tipos';
import { RACHA_RAYO, type ParametrosVelocidad } from '../comun/velocidad';

const CARRILES = [170, 405, 640, 875, 1110];
const RADIO = 74;
const Y_INICIO = ALTO + 110;
const Y_FIN = -110;
const ONDA = { amplitud: 46, periodoMs: 2600 };

interface Burbuja {
  item: ItemCola;
  contenedor: Phaser.GameObjects.Container;
  xBase: number;
  fase: number;
  edad: number;
  velocidad: number; // px por ms (hacia arriba)
  resuelta: boolean;
}

const color = (hex: string) => Phaser.Display.Color.HexStringToColor(hex).color;

export class CrashScene extends Phaser.Scene implements EscenaArcade {
  private cfg: ConfigEscena;
  private burbujas: Burbuja[] = [];
  private indice = 0;
  private espera = 0;
  private ultimoCarril = -1;
  private vidas = 0;
  private reventadas = 0;
  private estrellas = 0;
  private racha = 0;
  private jugando = false;
  private terminado = false;

  constructor(cfg: ConfigEscena) {
    super('crash');
    this.cfg = cfg;
    this.vidas = cfg.vidas;
  }

  create() {
    this.dibujarFondo();
    this.crearTexturaBurbuja();
  }

  empezar() {
    this.jugando = true;
    this.espera = 500;
  }

  cambiarVelocidad(p: ParametrosVelocidad) {
    const velocidad = (Y_INICIO - Y_FIN) / p.caidaMs;
    for (const b of this.burbujas) b.velocidad = velocidad;
    this.espera = Math.min(this.espera, p.intervaloMs);
  }

  update(_t: number, dt: number) {
    if (!this.jugando || this.terminado) return;

    this.espera -= dt;
    if (this.espera <= 0 && this.indice < this.cfg.cola.length) {
      const p = this.cfg.parametros();
      this.soltarBurbuja(this.cfg.cola[this.indice++], p);
      this.espera = p.intervaloMs;
    }

    for (const b of this.burbujas) {
      if (b.resuelta) continue;
      b.edad += dt;
      b.contenedor.y -= b.velocidad * dt;
      b.contenedor.x = b.xBase + Math.sin(b.fase + (b.edad / ONDA.periodoMs) * Math.PI * 2) * ONDA.amplitud;
      if (b.contenedor.y < Y_FIN) {
        this.resolver(b, false);
        b.contenedor.destroy();
      }
    }
    this.burbujas = this.burbujas.filter((b) => b.contenedor.active);

    if (this.indice >= this.cfg.cola.length && this.burbujas.length === 0) this.terminar();
  }

  // ---------- burbujas ----------

  private soltarBurbuja(item: ItemCola, p: ParametrosVelocidad) {
    let carril = Phaser.Math.Between(0, CARRILES.length - 1);
    if (carril === this.ultimoCarril) carril = (carril + Phaser.Math.Between(1, CARRILES.length - 1)) % CARRILES.length;
    this.ultimoCarril = carril;

    const c = this.cfg.tema.cancha;
    const burbuja = this.add.image(0, 0, 'burbuja');
    const { contenedor: etiqueta, ancho } = crearEtiqueta(this, item.estimulo.texto, {
      familiaFuente: this.cfg.familiaFuente,
      colorearLetras: this.cfg.colorearLetras,
      fondo: c.etiqueta,
      borde: c.etiquetaBorde,
      texto: c.etiquetaTexto,
    });
    const contenedor = this.add.container(CARRILES[carril], Y_INICIO, [burbuja, etiqueta]).setDepth(5);
    contenedor.setSize(Math.max(ancho, RADIO * 2) + 16, RADIO * 2 + 16);
    contenedor.setInteractive({ useHandCursor: true });

    const b: Burbuja = {
      item,
      contenedor,
      xBase: CARRILES[carril],
      fase: Math.random() * Math.PI * 2,
      edad: 0,
      velocidad: (Y_INICIO - Y_FIN) / p.caidaMs,
      resuelta: false,
    };
    contenedor.on('pointerdown', () => this.tocar(b));
    this.burbujas.push(b);
  }

  private tocar(b: Burbuja) {
    if (b.resuelta || this.terminado) return;
    b.contenedor.disableInteractive();
    const rayo = this.resolver(b, true);
    if (b.item.esObjetivo) this.reventar(b, rayo);
    else this.fallar(b);
  }

  /** Registra la decisión. Devuelve true si ganó estrella rayo. */
  private resolver(b: Burbuja, tocada: boolean): boolean {
    b.resuelta = true;
    const correcta = tocada === b.item.esObjetivo;
    let rayo = false;
    if (tocada && correcta) {
      this.racha++;
      if (this.racha % RACHA_RAYO === 0) {
        rayo = true;
        this.estrellas++;
      }
    } else if (!correcta) {
      this.racha = 0;
    }
    this.cfg.alDecidir({ item: b.item, elegida: tocada, correcta, rayo });
    if (!tocada && b.item.esObjetivo) this.perderVida(); // se escapó una correcta
    return rayo;
  }

  private reventar(b: Burbuja, rayo: boolean) {
    const { x, y } = b.contenedor;
    this.reventadas++;
    this.avisarMarcador();
    if (this.cfg.sonido) sonarPop();
    this.estallido(x, y);
    if (rayo) this.mostrarRayo(x, y);
    this.tweens.add({
      targets: b.contenedor,
      scale: 1.35,
      alpha: 0,
      duration: 180,
      ease: 'Quad.easeOut',
      onComplete: () => b.contenedor.destroy(),
    });
  }

  private fallar(b: Burbuja) {
    this.perderVida();
    b.contenedor.list.forEach((o) => {
      if (o instanceof Phaser.GameObjects.Image) o.setTint(0x9a96aa);
    });
    this.tweens.add({
      targets: b.contenedor,
      x: b.contenedor.x + 12,
      duration: 60,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.tweens.add({ targets: b.contenedor, alpha: 0, y: b.contenedor.y - 60, duration: 400, onComplete: () => b.contenedor.destroy() });
      },
    });
  }

  private perderVida() {
    this.vidas = Math.max(0, this.vidas - 1);
    this.avisarMarcador();
    if (this.vidas === 0) this.time.delayedCall(700, () => this.terminar());
  }

  private terminar() {
    if (this.terminado) return;
    this.terminado = true;
    for (const b of this.burbujas) {
      b.resuelta = true;
      b.contenedor.disableInteractive();
      this.tweens.add({ targets: b.contenedor, alpha: 0, duration: 300 });
    }
    this.time.delayedCall(500, () => this.cfg.alTerminar(this.marcador()));
  }

  private marcador(): Marcador {
    return { vidas: this.vidas, puntos: this.reventadas, estrellas: this.estrellas };
  }

  private avisarMarcador() {
    this.cfg.alCambiarMarcador(this.marcador());
  }

  // ---------- efectos y dibujo ----------

  /** Gotitas que salen disparadas al reventar. */
  private estallido(x: number, y: number) {
    const t = this.cfg.tema;
    const colores = [t.primary, t.accent, t.cancha.bola];
    for (let i = 0; i < 10; i++) {
      const angulo = (i / 10) * Math.PI * 2;
      const gota = this.add.circle(x, y, Phaser.Math.Between(7, 12), color(colores[i % 3])).setDepth(15);
      gota.setStrokeStyle(3, color(t.ink));
      this.tweens.add({
        targets: gota,
        x: x + Math.cos(angulo) * Phaser.Math.Between(90, 140),
        y: y + Math.sin(angulo) * Phaser.Math.Between(90, 140),
        alpha: 0,
        scale: 0.4,
        duration: 420,
        ease: 'Quad.easeOut',
        onComplete: () => gota.destroy(),
      });
    }
  }

  private mostrarRayo(x: number, y: number) {
    const t = this.add.text(x, y - 90, '⚡', { fontSize: '64px' }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: t, y: t.y - 80, alpha: 0, duration: 900, onComplete: () => t.destroy() });
  }

  private crearTexturaBurbuja() {
    const t = this.cfg.tema;
    const r = RADIO;
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(color(t.primary), 0.45);
    g.fillCircle(r + 4, r + 4, r);
    g.lineStyle(5, color(t.ink), 1);
    g.strokeCircle(r + 4, r + 4, r);
    g.lineStyle(7, color(t.surface), 0.9);
    g.beginPath();
    g.arc(r + 4, r + 4, r * 0.72, Math.PI * 1.1, Math.PI * 1.45);
    g.strokePath();
    g.fillStyle(color(t.surface), 0.9);
    g.fillCircle(r + 4 + r * 0.42, r + 4 - r * 0.5, 7);
    g.generateTexture('burbuja', 2 * r + 8, 2 * r + 8);
    g.destroy();
  }

  private dibujarFondo() {
    const t = this.cfg.tema;
    const g = this.add.graphics();
    g.fillStyle(color(t.cancha.pared), 1);
    g.fillRect(0, 0, ANCHO, ALTO);
    // Burbujas grandes de adorno, quietas y suaves
    g.fillStyle(color(t.bgPuntos), 0.55);
    const adornos: [number, number, number][] = [
      [90, 140, 60], [300, 620, 90], [560, 220, 40], [820, 700, 70], [1040, 160, 80], [1200, 520, 50], [700, 450, 30],
    ];
    for (const [x, y, r] of adornos) g.fillCircle(x, y, r);
    // Ondas en el fondo
    g.lineStyle(6, color(t.bgPuntos), 1);
    for (let fila = 0; fila < 3; fila++) {
      const y = ALTO - 40 - fila * 34;
      g.beginPath();
      for (let x = 0; x <= ANCHO; x += 20) {
        const yy = y + Math.sin(x / 60 + fila) * 8;
        if (x === 0) g.moveTo(x, yy);
        else g.lineTo(x, yy);
      }
      g.strokePath();
    }
  }
}
