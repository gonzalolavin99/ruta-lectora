import { CURSOS, TEMAS, tramoDeCurso } from '../ui/tema';
import { Logo } from '../ui/Logo';

interface Props {
  alElegir: (curso: number) => void;
  alAjustes: () => void;
}

// Página principal: la fonoaudióloga elige el curso del niño (define cómo se ve).
export function SelectorCurso({ alElegir, alAjustes }: Props) {
  return (
    <div className="pantalla neutra">
      <header className="cabecera">
        <Logo />
        <button className="boton boton-secundario" onClick={alAjustes}>
          <span aria-hidden>⚙️</span> Ajustes
        </button>
      </header>

      <main className="centrada">
        <h1 className="titulo-grande">¿Qué curso?</h1>
        <div className="grilla-cursos">
          {CURSOS.map((curso, i) => (
            <button
              key={curso}
              className="tarjeta-curso"
              style={{ background: TEMAS[tramoDeCurso(curso)].primary, rotate: `${i % 2 ? 1.5 : -1.5}deg` }}
              onClick={() => alElegir(curso)}
            >
              <span className="curso-numero">{curso}°</span>
              <span className="curso-texto">básico</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
