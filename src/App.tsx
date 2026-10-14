import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { db } from './data/db';
import { BasketJuego } from './games/basket/BasketJuego';
import { ZonaAdulto } from './panel/ZonaAdulto';
import { Inicio } from './profile/Inicio';
import { SelectorPerfil } from './profile/SelectorPerfil';
import { TEMAS, tramoDeCurso, variablesCss } from './ui/tema';

type Pantalla = { tipo: 'perfiles' } | { tipo: 'inicio'; perfilId: string } | { tipo: 'basket'; perfilId: string } | { tipo: 'adulto'; nuevo?: boolean };

export function App() {
  const [pantalla, setPantalla] = useState<Pantalla>({ tipo: 'perfiles' });
  const perfilId = 'perfilId' in pantalla ? pantalla.perfilId : undefined;
  const perfil = useLiveQuery(() => (perfilId ? db.perfiles.get(perfilId) : undefined), [perfilId]);

  if (pantalla.tipo === 'perfiles') {
    return (
      <SelectorPerfil
        alElegir={(id) => setPantalla({ tipo: 'inicio', perfilId: id })}
        alAdulto={() => setPantalla({ tipo: 'adulto' })}
        alNuevo={() => setPantalla({ tipo: 'adulto', nuevo: true })}
      />
    );
  }
  if (pantalla.tipo === 'adulto') {
    return <ZonaAdulto nuevo={pantalla.nuevo} alSalir={() => setPantalla({ tipo: 'perfiles' })} />;
  }
  if (!perfil) return null; // cargando

  const tema = TEMAS[tramoDeCurso(perfil.curso)];
  return (
    <div
      className={`tramo tramo-${tema.tramo} fuente-${perfil.fuente}`}
      style={variablesCss(tema) as React.CSSProperties}
    >
      {pantalla.tipo === 'inicio' && (
        <Inicio
          perfil={perfil}
          tema={tema}
          alJugar={() => setPantalla({ tipo: 'basket', perfilId: perfil.id })}
          alCambiarJugador={() => setPantalla({ tipo: 'perfiles' })}
        />
      )}
      {pantalla.tipo === 'basket' && (
        <BasketJuego perfil={perfil} tema={tema} alSalir={() => setPantalla({ tipo: 'inicio', perfilId: perfil.id })} />
      )}
    </div>
  );
}
