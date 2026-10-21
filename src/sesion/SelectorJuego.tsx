import { ESTRELLAS_POR_NIVEL, MEDALLAS, nivelDe } from './progreso';

interface Props {
  estrellas: number;
  medallas: string[];
  alElegir: (juego: Juego) => void;
  alVolver: () => void;
}

export type Juego = 'basket' | 'crash' | 'turbo' | 'memoria';

const JUEGOS: { id: Juego; nombre: string; icono: string; como: string }[] = [
  { id: 'basket', nombre: 'Basket', icono: '🏀', como: 'Mueve el aro' },
  { id: 'crash', nombre: 'Crash', icono: '🫧', como: 'Revienta burbujas' },
  { id: 'turbo', nombre: 'Turbo', icono: '🏎️', como: 'Carrera de lectura' },
  { id: 'memoria', nombre: 'Memoria', icono: '🧠', como: 'Recuerda el orden' },
];

// Después de leer las palabras, el niño elige su premio.
export function SelectorJuego({ estrellas, medallas, alElegir, alVolver }: Props) {
  const nivel = nivelDe(estrellas);
  const enEsteNivel = estrellas % ESTRELLAS_POR_NIVEL;
  return (
    <div className="pantalla">
      <header className="cabecera">
        <button className="boton boton-secundario" onClick={alVolver}>← Volver</button>
        <div className="nivel-sesion" aria-label={`Nivel ${nivel}, ${estrellas} estrellas`}>
          <strong>Nivel {nivel}</strong>
          <span className="nivel-barra" aria-hidden>
            {Array.from({ length: ESTRELLAS_POR_NIVEL }, (_, i) => (
              <span key={i} className={i < enEsteNivel ? 'estrella llena' : 'estrella'}>★</span>
            ))}
          </span>
        </div>
      </header>
      <main className="centrada">
        <h1 className="titulo-grande">¿A qué jugamos?</h1>
        <div className="juegos">
          {JUEGOS.map((j, i) => (
            <button key={j.id} className="tarjeta-juego" style={{ rotate: `${(i % 2 ? 1 : -1) * 2}deg` }} onClick={() => alElegir(j.id)}>
              <span className="tarjeta-juego-icono" aria-hidden>{j.icono}</span>
              <span className="tarjeta-juego-nombre">{j.nombre}</span>
              <span className="tarjeta-juego-como">{j.como}</span>
            </button>
          ))}
        </div>
        <div className="medallas" aria-label="Medallas de hoy">
          {MEDALLAS.map((m) => {
            const ganada = medallas.includes(m.id);
            return (
              <div key={m.id} className={ganada ? 'medalla ganada' : 'medalla'} title={m.descripcion}>
                <span className="medalla-emoji" aria-hidden>{m.emoji}</span>
                <span className="medalla-texto">
                  <strong>{m.nombre}</strong>
                  <small>{m.descripcion}</small>
                </span>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
