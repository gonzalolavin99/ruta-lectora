// Basket: caen pelotas con palabras y el niño ARRASTRA el aro para atraparlas.
// Sin mensajes ni voz: el niño lee. (Decisiones de Fran, Fase 2.)
//   - Atrapa una correcta     → encesta (+1, "swish" si el sonido está activo).
//   - Atrapa una incorrecta   → rebota en el aro y pierde una vida.
//   - Deja pasar una correcta → pierde una vida.
//   - Deja pasar una incorrecta → bien hecho, no pasa nada.

import Phaser from 'phaser';
import { sonarSwish } from '../../audio/efectos';
import { crearEtiqueta } from '../comun/etiqueta';
import type { ItemCola } from '../comun/reglas';
import { ALTO, ANCHO, type ConfigEscena, type EscenaArcade, type Marcador } from '../comun/tipos';
import { RACHA_RAYO, type ParametrosVelocidad } from '../comun/velocidad';

const ARO = { y: 690, ancho: 210, alto: 40 };
const TABLERO = { ancho: 300, alto: 170 };
const CARRILES = [170, 405, 640, 875, 1110];
const RADIO_BOLA = 58;
const Y_INICIO = -90;
const Y_FIN = ALTO + 90;
const VELOCIDAD_TECLADO = 0.9; // px por ms con las flechas (opcional en el Mac)

interface Bola {
  item: ItemCola;
  contenedor: Phaser.GameObjects.Container;
  etiqueta: Phaser.GameObjects.Container;
  velocidad: number; // px por ms
  resuelta: boolean; // ya se decidió (atrapada o pasó el aro)
  animando: boolean; // la mueve una animación, no la caída
}

const color = (hex: string) => Phaser.Display.Color.HexStringToColor(hex).color;

export class BasketScene extends Phaser.Scene implements EscenaArcade {
  private cfg: ConfigEscena;
  private bolas: Bola[] = [];
  private indice = 0;
  private espera = 0;
  private ultimoCarril = -1;
  private vidas = 0;
  private encestadas = 0;
  private estrellas = 0;
  private racha = 0;
  private jugando = false;
  private terminado = false;
  private aroX = ANCHO / 2;
  private aroAtras!: Phaser.GameObjects.Container;
  private aroFrente!: Phaser.GameObjects.Container;
  private red!: Phaser.GameObjects.Graphics;
  private pista!: Phaser.GameObjects.Container;
  private flechas?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(cfg: ConfigEscena) {
    super('basket');
    this.cfg = cfg;
    this.vidas = cfg.vidas;
  }

  create() {
    this.dibujarCancha();
    this.crearAro();
    this.crearTexturaBola();
    this.crearPista();

    // Arrastrar: el aro sigue al dedo (o al mouse con el botón apretado).
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.moverAro(p.x));
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.isDown) this.moverAro(p.x);
    });
    this.flechas = this.input.keyboard?.createCursorKeys();
  }

  /** Lo llama React cuando el niño aprieta "¡Vamos!". */
  empezar() {
    this.jugando = true;
    this.espera = 600;
  }

  /** La fonoaudióloga cambió la velocidad: se nota al tiro, también en las pelotas que ya caen. */
  cambiarVelocidad(p: ParametrosVelocidad) {
    const velocidad = (Y_FIN - Y_INICIO) / p.caidaMs;
    for (const b of this.bolas) b.velocidad = velocidad;
    this.espera = Math.min(this.espera, p.intervaloMs);
  }

  update(_t: number, dt: number) {
    if (!this.jugando || this.terminado) return;

    if (this.flechas?.left.isDown) this.moverAro(this.aroX - VELOCIDAD_TECLADO * dt);
    if (this.flechas?.right.isDown) this.moverAro(this.aroX + VELOCIDAD_TECLADO * dt);

    this.espera -= dt;
    if (this.espera <= 0 && this.indice < this.cfg.cola.length) {
      const p = this.cfg.parametros();
      this.lanzarBola(this.cfg.cola[this.indice++], p);
      this.espera = p.intervaloMs;
    }

    for (const b of this.bolas) {
      if (b.animando) continue;
      const antes = b.contenedor.y;
      b.contenedor.y += b.velocidad * dt;
      // ¿Cruzó la altura del aro en este cuadro?
      if (!b.resuelta && antes < ARO.y && b.contenedor.y >= ARO.y) this.cruzarAro(b);
      if (b.contenedor.y > Y_FIN) b.contenedor.destroy();
    }
    this.bolas = this.bolas.filter((b) => b.contenedor.active);

    if (this.indice >= this.cfg.cola.length && this.bolas.length === 0) this.terminar();
  }

  // ---------- aro ----------

  private moverAro(x: number) {
    if (this.terminado) return;
    const margen = TABLERO.ancho / 2 + 6;
    this.aroX = Phaser.Math.Clamp(x, margen, ANCHO - margen);
    this.aroAtras.x = this.aroX;
    this.aroFrente.x = this.aroX;
    if (this.pista.visible && this.jugando) {
      this.tweens.add({ targets: this.pista, alpha: 0, duration: 300, onComplete: () => this.pista.setVisible(false) });
    }
    this.pista.x = this.aroX;
  }

  // ---------- pelotas ----------

  private lanzarBola(item: ItemCola, p: ParametrosVelocidad) {
    let carril = Phaser.Math.Between(0, CARRILES.length - 1);
    if (carril === this.ultimoCarril) carril = (carril + Phaser.Math.Between(1, CARRILES.length - 1)) % CARRILES.length;
    this.ultimoCarril = carril;

    const c = this.cfg.tema.cancha;
    const disfraz = this.cfg.disfraz();
    const imagen =
      disfraz.id === 'basquet'
        ? this.add.image(0, 0, 'bola')
        : this.add.text(0, 0, disfraz.emoji, { fontSize: '112px' }).setOrigin(0.5);
    const { contenedor: etiqueta } = crearEtiqueta(this, item.estimulo.texto, {
      familiaFuente: this.cfg.familiaFuente,
      colorearLetras: this.cfg.colorearLetras,
      fondo: c.etiqueta,
      borde: c.etiquetaBorde,
      texto: c.etiquetaTexto,
    });
    const contenedor = this.add.container(CARRILES[carril], Y_INICIO, [imagen, etiqueta]).setDepth(5);

    this.bolas.push({
      item,
      contenedor,
      etiqueta,
      velocidad: (Y_FIN - Y_INICIO) / p.caidaMs,
      resuelta: false,
      animando: false,
    });
  }

  private cruzarAro(b: Bola) {
    b.resuelta = true;
    const atrapada = Math.abs(b.contenedor.x - this.aroX) <= ARO.ancho / 2;
    const correcta = atrapada === b.item.esObjetivo;

    let rayo = false;
    if (atrapada && correcta) {
      this.racha++;
      if (this.racha % RACHA_RAYO === 0) {
        rayo = true;
        this.estrellas++;
      }
    } else if (!correcta) {
      this.racha = 0;
    }
    this.cfg.alDecidir({ item: b.item, elegida: atrapada, correcta, rayo });

    if (atrapada && correcta) this.encestar(b, rayo);
    else if (atrapada) this.rebotar(b);
    else if (!correcta) this.dejarPasarCorrecta(b);
    // Incorrecta que pasa de largo: sigue cayendo, no pasa nada.
  }

  private encestar(b: Bola, rayo: boolean) {
    b.animando = true;
    const { contenedor } = b;
    contenedor.setDepth(7); // pasa por detrás del frente del aro
    this.encestadas++;
    this.avisarMarcador();
    if (this.cfg.sonido) sonarSwish();
    this.agitarRed();
    if (rayo) this.mostrarRayo();
    this.tweens.add({ targets: b.etiqueta, alpha: 0, duration: 150 });
    this.tweens.add({
      targets: contenedor,
      x: this.aroX,
      y: ARO.y + 120,
      scale: 0.7,
      alpha: 0,
      duration: 420,
      ease: 'Quad.easeIn',
      onComplete: () => contenedor.destroy(),
    });
  }

  private rebotar(b: Bola) {
    b.animando = true;
    this.perderVida();
    const lado = b.contenedor.x < this.aroX ? -1 : 1;
    this.tweens.add({
      targets: b.contenedor,
      x: b.contenedor.x + lado * 160,
      y: ARO.y - 110,
      angle: lado * 25,
      duration: 380,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: b.contenedor,
          y: ALTO + 100,
          alpha: 0,
          duration: 500,
          ease: 'Quad.easeIn',
          onComplete: () => b.contenedor.destroy(),
        });
      },
    });
  }

  private dejarPasarCorrecta(b: Bola) {
    this.perderVida();
    this.tweens.add({ targets: b.contenedor, alpha: 0.25, duration: 300 });
  }

  private perderVida() {
    this.vidas = Math.max(0, this.vidas - 1);
    this.avisarMarcador();
    if (this.vidas === 0) this.time.delayedCall(700, () => this.terminar());
  }

  private terminar() {
    if (this.terminado) return;
    this.terminado = true;
    for (const b of this.bolas) {
      b.animando = true;
      this.tweens.add({ targets: b.contenedor, alpha: 0, duration: 300 });
    }
    this.time.delayedCall(500, () => this.cfg.alTerminar(this.marcador()));
  }

  private marcador(): Marcador {
    return { vidas: this.vidas, puntos: this.encestadas, estrellas: this.estrellas };
  }

  private avisarMarcador() {
    this.cfg.alCambiarMarcador(this.marcador());
  }

  private mostrarRayo() {
    const t = this.add.text(this.aroX, ARO.y - 150, '⚡', { fontSize: '64px' }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: t, y: t.y - 80, alpha: 0, duration: 900, onComplete: () => t.destroy() });
  }

  private agitarRed() {
    this.tweens.add({ targets: this.red, scaleY: 1.3, scaleX: 0.88, duration: 120, yoyo: true, ease: 'Sine.easeOut' });
  }

  // ---------- dibujo ----------

  private crearTexturaBola() {
    const c = this.cfg.tema.cancha;
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
    const c = this.cfg.tema.cancha;
    const g = this.add.graphics();
    const piso = 600;

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

    // Líneas de la cancha
    g.lineStyle(6, color(c.lineas), 0.95);
    g.lineBetween(0, piso + 8, ANCHO, piso + 8);
    g.strokeEllipse(ANCHO / 2, piso + 150, 520, 150);
    g.lineBetween(ANCHO / 2, piso + 8, ANCHO / 2, ALTO);
  }

  private crearAro() {
    const c = this.cfg.tema.cancha;

    // Atrás (por detrás de las pelotas): tablero y poste con ruedas.
    const atras = this.add.graphics();
    atras.fillStyle(color(c.poste), 1);
    atras.fillRect(-9, -20, 18, ALTO - ARO.y + 20);
    atras.fillRoundedRect(-70, ALTO - ARO.y - 34, 140, 22, 8);
    const tx = -TABLERO.ancho / 2;
    const ty = -TABLERO.alto + 20;
    atras.fillStyle(color(c.tablero), 1);
    atras.fillRoundedRect(tx, ty, TABLERO.ancho, TABLERO.alto, 12);
    atras.lineStyle(6, color(c.tableroBorde), 1);
    atras.strokeRoundedRect(tx, ty, TABLERO.ancho, TABLERO.alto, 12);
    atras.lineStyle(5, color(c.aro), 1);
    atras.strokeRect(-55, -78, 110, 74);
    this.aroAtras = this.add.container(this.aroX, ARO.y, [atras]).setDepth(3);

    // Adelante (por delante de las pelotas): red y aro.
    this.red = this.add.graphics();
    this.red.lineStyle(3, color(c.red), 0.9);
    const arriba = ARO.ancho / 2;
    const abajo = arriba * 0.55;
    const largo = 100;
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      this.red.lineBetween(-arriba + 2 * arriba * t, 0, -abajo + 2 * abajo * t, largo);
    }
    for (let j = 1; j <= 3; j++) {
      const y = (largo * j) / 3;
      const a = arriba - (arriba - abajo) * (j / 3);
      this.red.lineBetween(-a, y, a, y);
    }
    const aro = this.add.graphics();
    aro.lineStyle(10, color(c.aro), 1);
    aro.strokeEllipse(0, 0, ARO.ancho, ARO.alto);
    this.aroFrente = this.add.container(this.aroX, ARO.y, [this.red, aro]).setDepth(10);
  }

  /** Flechas ◀ ▶ junto al aro que muestran que se puede arrastrar. Se van al moverlo. */
  private crearPista() {
    const c = this.cfg.tema.cancha;
    const estilo = { fontSize: '64px', fontStyle: 'bold', color: c.etiquetaBorde };
    const izq = this.add.text(-TABLERO.ancho / 2 - 50, -40, '◀', estilo).setOrigin(0.5);
    const der = this.add.text(TABLERO.ancho / 2 + 50, -40, '▶', estilo).setOrigin(0.5);
    this.pista = this.add.container(this.aroX, ARO.y, [izq, der]).setDepth(11);
    this.tweens.add({ targets: izq, x: izq.x - 14, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: der, x: der.x + 14, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
}
