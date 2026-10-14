import type { Perfil } from '../data/db';
import { Kiltro } from '../ui/Kiltro';
import type { Tema } from '../ui/tema';

interface Props {
  perfil: Perfil;
  tema: Tema;
  alJugar: () => void;
  alCambiarJugador: () => void;
}

// Pantalla de inicio del niño. El Kiltro es protagonista en 2°–3°,
// más chico en 4°–5° y en 6°–7° no aparece (solo el logo).
export function Inicio({ perfil, tema, alJugar, alCambiarJugador }: Props) {
  return (
    <div className="pantalla">
      <header className="cabecera">
        <div className="saludo">
          {tema.tramo !== 'estilo' && <Kiltro tamano={tema.tramo === 'explorar' ? 96 : 64} />}
          <div>
            <div className="saludo-nombre">Hola, {perfil.alias}</div>
            <div className="monedas" aria-label={`${perfil.monedas} monedas`}>🪙 {perfil.monedas}</div>
          </div>
        </div>
        <button className="boton boton-secundario" onClick={alCambiarJugador}>Cambiar jugador</button>
      </header>

      <main className="juegos">
        <button className="tarjeta-juego" onClick={alJugar}>
          <span className="tarjeta-juego-icono" aria-hidden>🏀</span>
          <span className="tarjeta-juego-nombre">Basket</span>
        </button>
        <div className="tarjeta-juego bloqueada" aria-disabled>
          <span className="tarjeta-juego-icono" aria-hidden>🏁</span>
          <span className="tarjeta-juego-nombre">Turbo</span>
          <span className="pronto">Pronto</span>
        </div>
        <div className="tarjeta-juego bloqueada" aria-disabled>
          <span className="tarjeta-juego-icono" aria-hidden>💥</span>
          <span className="tarjeta-juego-nombre">Crash</span>
          <span className="pronto">Pronto</span>
        </div>
      </main>
    </div>
  );
}
