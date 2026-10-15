import { JuegoArcade, type PropsJuego } from '../comun/JuegoArcade';
import { IconoAro } from '../comun/ui';
import { BasketScene } from './BasketScene';

export function Basket(props: PropsJuego) {
  return (
    <JuegoArcade
      {...props}
      juego="basket"
      crearEscena={(cfg) => new BasketScene(cfg)}
      pista="👆 Arrastra el aro"
      iconoPuntos={<IconoAro />}
    />
  );
}
