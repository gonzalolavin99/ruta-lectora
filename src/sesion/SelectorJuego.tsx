interface Props {
  alElegir: (juego: Juego) => void;
  alVolver: () => void;
}

export type Juego = 'basket' | 'crash' | 'turbo';

const JUEGOS: { id: Juego; nombre: string; icono: string; como: string }[] = [
  { id: 'basket', nombre: 'Basket', icono: '🏀', como: 'Mueve el aro' },
  { id: 'crash', nombre: 'Crash', icono: '🫧', como: 'Revienta burbujas' },
  { id: 'turbo', nombre: 'Turbo', icono: '🏎️', como: 'Carrera de lectura' },
];

// Después de leer las palabras, el niño elige su premio.
export function SelectorJuego({ alElegir, alVolver }: Props) {
  return (
    <div className="pantalla">
      <header className="cabecera">
        <button className="boton boton-secundario" onClick={alVolver}>← Volver</button>
      </header>
      <main className="centrada">
        <h1 className="titulo-grande">¿A qué jugamos?</h1>
        <div className="juegos">
          {JUEGOS.map((j, i) => (
            <button key={j.id} className="tarjeta-juego" style={{ rotate: `${(i - 1) * 2}deg` }} onClick={() => alElegir(j.id)}>
              <span className="tarjeta-juego-icono" aria-hidden>{j.icono}</span>
              <span className="tarjeta-juego-nombre">{j.nombre}</span>
              <span className="tarjeta-juego-como">{j.como}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
