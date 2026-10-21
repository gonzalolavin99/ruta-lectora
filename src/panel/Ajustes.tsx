import { forzarActualizacion, VERSION } from '../data/actualizacion';
import { guardarPreferencias, type Preferencias } from '../data/db';
import { COLORES_LETRA } from '../ui/letras';
import { FAMILIA_FUENTE } from '../ui/tema';

// Ajustes de la fonoaudióloga (se guardan en este aparato).
export function Ajustes({ preferencias, alCerrar }: { preferencias: Preferencias; alCerrar: () => void }) {
  const { fuente, sonido, colorearLetras } = preferencias;
  return (
    <div className="capa" onClick={alCerrar}>
      <div className="tarjeta ajustes" onClick={(e) => e.stopPropagation()}>
        <h2>Ajustes</h2>
        <div className="campo">
          <span>Letra de las palabras</span>
          <div className="opciones">
            <button
              className={fuente === 'andika' ? 'opcion activa' : 'opcion'}
              style={{ fontFamily: FAMILIA_FUENTE.andika }}
              onClick={() => void guardarPreferencias({ fuente: 'andika' })}
            >
              Andika: casa
            </button>
            <button
              className={fuente === 'opendyslexic' ? 'opcion activa' : 'opcion'}
              style={{ fontFamily: FAMILIA_FUENTE.opendyslexic }}
              onClick={() => void guardarPreferencias({ fuente: 'opendyslexic' })}
            >
              OpenDyslexic: casa
            </button>
          </div>
        </div>
        <label className="casilla">
          <input type="checkbox" checked={colorearLetras} onChange={(e) => void guardarPreferencias({ colorearLetras: e.target.checked })} />
          <span>
            Colorear <span style={{ color: COLORES_LETRA.p }}>p</span>, <span style={{ color: COLORES_LETRA.b }}>b</span> y{' '}
            <span style={{ color: COLORES_LETRA.d }}>d</span>
          </span>
        </label>
        <label className="casilla">
          <input type="checkbox" checked={sonido} onChange={(e) => void guardarPreferencias({ sonido: e.target.checked })} />
          Sonido al acertar
        </label>
        <small>En iPad no suena si está en modo silencio.</small>
        <button className="boton" onClick={alCerrar}>Listo</button>
        <div className="version">
          <small>Versión {VERSION}</small>
          <button className="boton boton-secundario" onClick={() => void forzarActualizacion()}>Actualizar la app</button>
        </div>
      </div>
    </div>
  );
}
