import { nivelesDisponibles, tipoDeBanco, type Banco, type Estimulo } from '../engine/contenido';
import { Kiltro } from '../ui/Kiltro';
import type { Tema } from '../ui/tema';

interface Props {
  curso: number;
  tema: Tema;
  alElegir: (nivel: number) => void;
  alVolver: () => void;
}

const GRUPOS: { tipo: Estimulo['tipo']; titulo: string }[] = [
  { tipo: 'silaba', titulo: 'Sílabas' },
  { tipo: 'palabra', titulo: 'Palabras' },
  { tipo: 'pseudopalabra', titulo: 'Pseudopalabras' },
];

// Dentro del curso: qué se va a trabajar hoy con el niño.
export function SelectorContenido({ curso, tema, alElegir, alVolver }: Props) {
  const bancos = nivelesDisponibles('decodificacion');

  return (
    <div className="pantalla">
      <header className="cabecera">
        <button className="boton boton-secundario" onClick={alVolver}>← Cursos</button>
        <div className="saludo">
          {tema.tramo === 'explorar' && <Kiltro tamano={72} />}
          <h1 className="titulo">{curso}° básico</h1>
        </div>
      </header>

      <main className="contenidos">
        <h2 className="titulo-seccion">¿Qué vamos a leer?</h2>
        <div className="grupos">
          {GRUPOS.map((g) => (
            <section key={g.tipo} className="grupo">
              <h3>{g.titulo}</h3>
              {bancos
                .filter((b) => tipoDeBanco(b) === g.tipo)
                .map((b) => (
                  <TarjetaContenido key={b.nivel} banco={b} alElegir={() => alElegir(b.nivel)} />
                ))}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

function TarjetaContenido({ banco, alElegir }: { banco: Banco; alElegir: () => void }) {
  const ejemplos = banco.estimulos.slice(0, 3).map((e) => e.texto).join(', ');
  return (
    <button className="tarjeta-contenido" onClick={alElegir} title={banco.titulo}>
      <span className="contenido-nombre">{banco.nombreCorto}</span>
      <span className="contenido-ejemplo">{ejemplos}…</span>
    </button>
  );
}
