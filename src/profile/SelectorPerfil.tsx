import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { Logo } from '../ui/Logo';

interface Props {
  alElegir: (id: string) => void;
  alAdulto: () => void;
}

export function SelectorPerfil({ alElegir, alAdulto }: Props) {
  const perfiles = useLiveQuery(() => db.perfiles.orderBy('alias').toArray(), []);

  return (
    <div className="pantalla neutra">
      <header className="cabecera">
        <Logo />
        <button className="boton-adulto" onClick={alAdulto}>
          <span aria-hidden>🔒</span> Adulto
        </button>
      </header>

      <main className="centrada">
        {perfiles && perfiles.length === 0 && (
          <div className="tarjeta">
            <h2>¡Bienvenido!</h2>
            <p>Pide a un adulto que cree tu perfil.</p>
          </div>
        )}
        {perfiles && perfiles.length > 0 && (
          <>
            <h1 className="titulo">¿Quién juega?</h1>
            <div className="grilla-perfiles">
              {perfiles.map((p) => (
                <button key={p.id} className="tarjeta-perfil" onClick={() => alElegir(p.id)}>
                  <span className="perfil-alias">{p.alias}</span>
                  <span className="perfil-curso">{p.curso}° básico</span>
                </button>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
