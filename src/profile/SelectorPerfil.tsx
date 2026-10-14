import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { TEMAS, tramoDeCurso } from '../ui/tema';
import { Logo } from '../ui/Logo';

interface Props {
  alElegir: (id: string) => void;
  alAdulto: () => void;
  alNuevo: () => void;
}

export function SelectorPerfil({ alElegir, alAdulto, alNuevo }: Props) {
  const perfiles = useLiveQuery(() => db.perfiles.orderBy('alias').toArray(), []);

  return (
    <div className="pantalla neutra">
      <header className="cabecera">
        <Logo />
        <button className="boton boton-secundario" onClick={alAdulto}>
          <span aria-hidden>⚙️</span> Perfiles
        </button>
      </header>

      <main className="centrada">
        {perfiles && (
          <>
            <h1 className="titulo-grande">¿Quién juega?</h1>
            <div className="grilla-perfiles">
              {perfiles.map((p, i) => {
                const tema = TEMAS[tramoDeCurso(p.curso)];
                return (
                  <button
                    key={p.id}
                    className="tarjeta-perfil"
                    style={{ background: tema.primary, rotate: `${i % 2 ? 1.5 : -1.5}deg` }}
                    onClick={() => alElegir(p.id)}
                  >
                    <span className="perfil-alias">{p.alias}</span>
                    <span className="perfil-curso">{p.curso}° básico</span>
                  </button>
                );
              })}
              <button className="tarjeta-perfil tarjeta-nuevo" onClick={alNuevo}>
                <span className="perfil-alias" aria-hidden>+</span>
                <span className="perfil-curso">Nuevo jugador</span>
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
