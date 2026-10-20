import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { leerPreferencias, PREFERENCIAS_INICIALES } from './data/db';
import { Ajustes } from './panel/Ajustes';
import { SelectorContenido } from './sesion/SelectorContenido';
import { SelectorCurso } from './sesion/SelectorCurso';
import { progresoInicial } from './sesion/progreso';
import { Sesion } from './sesion/Sesion';
import { TEMAS, tramoDeCurso, variablesCss } from './ui/tema';

type Pantalla = { tipo: 'cursos' } | { tipo: 'contenidos'; curso: number } | { tipo: 'sesion'; curso: number; nivel: number };

export function App() {
  const [pantalla, setPantalla] = useState<Pantalla>({ tipo: 'cursos' });
  const [ajustesAbiertos, setAjustesAbiertos] = useState(false);
  // Estrellas y niveles del niño en esta sesión: se reinician al volver a la lista de cursos.
  const [progreso, setProgreso] = useState(progresoInicial);
  const preferencias = useLiveQuery(leerPreferencias, []) ?? PREFERENCIAS_INICIALES;

  let contenido;
  if (pantalla.tipo === 'cursos') {
    contenido = <SelectorCurso alElegir={(curso) => setPantalla({ tipo: 'contenidos', curso })} alAjustes={() => setAjustesAbiertos(true)} />;
  } else {
    const tema = TEMAS[tramoDeCurso(pantalla.curso)];
    contenido = (
      <div className={`tramo tramo-${tema.tramo} fuente-${preferencias.fuente}`} style={variablesCss(tema) as React.CSSProperties}>
        {pantalla.tipo === 'contenidos' && (
          <SelectorContenido
            curso={pantalla.curso}
            tema={tema}
            alElegir={(nivel) => setPantalla({ tipo: 'sesion', curso: pantalla.curso, nivel })}
            alVolver={() => {
              setProgreso(progresoInicial());
              setPantalla({ tipo: 'cursos' });
            }}
          />
        )}
        {pantalla.tipo === 'sesion' && (
          <Sesion
            curso={pantalla.curso}
            nivel={pantalla.nivel}
            tema={tema}
            preferencias={preferencias}
            progreso={progreso}
            alCambiarProgreso={setProgreso}
            alSalir={() => setPantalla({ tipo: 'contenidos', curso: pantalla.curso })}
          />
        )}
      </div>
    );
  }

  return (
    <>
      {contenido}
      {ajustesAbiertos && <Ajustes preferencias={preferencias} alCerrar={() => setAjustesAbiertos(false)} />}
    </>
  );
}
