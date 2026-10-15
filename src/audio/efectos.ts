// Efectos de sonido generados con código (Web Audio). No usan archivos de audio,
// así que no tienen derechos de autor y funcionan sin conexión en Mac, iPad y iPhone.
// Ojo: en iPad/iPhone no suenan si el aparato está en modo silencio.

let contexto: AudioContext | null = null;

/** Hay que llamarlo dentro de un toque del usuario (Safari no deja sonar antes). */
export function activarSonido(): void {
  try {
    contexto ??= new AudioContext();
    if (contexto.state === 'suspended') void contexto.resume();
  } catch {
    contexto = null; // navegador sin Web Audio: el juego sigue en silencio
  }
}

/** "Swish" de la red: ruido suave filtrado que baja de tono. */
export function sonarSwish(): void {
  const ctx = contexto;
  if (!ctx || ctx.state !== 'running') return;
  const duracion = 0.38;
  const ahora = ctx.currentTime;

  const muestras = Math.floor(ctx.sampleRate * duracion);
  const buffer = ctx.createBuffer(1, muestras, ctx.sampleRate);
  const datos = buffer.getChannelData(0);
  for (let i = 0; i < muestras; i++) datos[i] = Math.random() * 2 - 1;

  const ruido = ctx.createBufferSource();
  ruido.buffer = buffer;

  const filtro = ctx.createBiquadFilter();
  filtro.type = 'bandpass';
  filtro.Q.value = 1.2;
  filtro.frequency.setValueAtTime(4200, ahora);
  filtro.frequency.exponentialRampToValueAtTime(900, ahora + duracion);

  const volumen = ctx.createGain();
  volumen.gain.setValueAtTime(0.0001, ahora);
  volumen.gain.exponentialRampToValueAtTime(0.35, ahora + 0.03);
  volumen.gain.exponentialRampToValueAtTime(0.0001, ahora + duracion);

  ruido.connect(filtro).connect(volumen).connect(ctx.destination);
  ruido.start(ahora);
  ruido.stop(ahora + duracion);
}

/** "Pop" de burbuja: un tono corto que baja rápido. */
export function sonarPop(): void {
  const ctx = contexto;
  if (!ctx || ctx.state !== 'running') return;
  const ahora = ctx.currentTime;
  const tono = ctx.createOscillator();
  tono.type = 'sine';
  tono.frequency.setValueAtTime(880, ahora);
  tono.frequency.exponentialRampToValueAtTime(220, ahora + 0.12);
  const volumen = ctx.createGain();
  volumen.gain.setValueAtTime(0.0001, ahora);
  volumen.gain.exponentialRampToValueAtTime(0.4, ahora + 0.01);
  volumen.gain.exponentialRampToValueAtTime(0.0001, ahora + 0.15);
  tono.connect(volumen).connect(ctx.destination);
  tono.start(ahora);
  tono.stop(ahora + 0.16);
}
