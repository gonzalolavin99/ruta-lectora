import { JuegoArcade, type PropsJuego } from '../comun/JuegoArcade';
import { IconoBurbuja } from '../comun/ui';
import { CrashScene } from './CrashScene';

export function Crash(props: PropsJuego) {
  return (
    <JuegoArcade
      {...props}
      juego="crash"
      crearEscena={(cfg) => new CrashScene(cfg)}
      pista="👆 Toca para reventar"
      iconoPuntos={<IconoBurbuja />}
    />
  );
}
