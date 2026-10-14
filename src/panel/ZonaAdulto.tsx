// Perfiles (sin PIN, pedido de Fran: en sesión no hay tiempo que perder).
// Crear y editar perfiles, y ver las últimas rondas. El panel completo llega en la Fase 6.

import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { db, perfilNuevo, type Fuente, type Perfil } from '../data/db';
import { nivelesDisponibles } from '../engine/contenido';
import { VELOCIDAD_MAX } from '../games/basket/velocidad';
import { FAMILIA_FUENTE, TEMAS, tramoDeCurso } from '../ui/tema';

/** Si `nuevo` es true, abre directo el formulario de un jugador nuevo y al guardar vuelve. */
export function ZonaAdulto({ alSalir, nuevo = false }: { alSalir: () => void; nuevo?: boolean }) {
  if (nuevo) return <EditorPerfil perfil={null} alCerrar={alSalir} />;
  return <Panel alSalir={alSalir} />;
}

function Panel({ alSalir }: { alSalir: () => void }) {
  const perfiles = useLiveQuery(() => db.perfiles.orderBy('alias').toArray(), []);
  const [editando, setEditando] = useState<Perfil | 'nuevo' | null>(null);

  if (editando) {
    return <EditorPerfil perfil={editando === 'nuevo' ? null : editando} alCerrar={() => setEditando(null)} />;
  }

  return (
    <div className="pantalla neutra">
      <header className="cabecera">
        <h1 className="titulo">Perfiles</h1>
        <div className="fila">
          <button className="boton" onClick={() => setEditando('nuevo')}>+ Nuevo jugador</button>
          <button className="boton boton-secundario" onClick={alSalir}>Salir</button>
        </div>
      </header>
      <main className="panel-lista">
        {perfiles?.length === 0 && <p>Todavía no hay perfiles. Crea el primero.</p>}
        {perfiles?.map((p) => (
          <button key={p.id} className="fila-perfil" onClick={() => setEditando(p)}>
            <strong>{p.alias}</strong>
            <span>{p.curso}° básico · {TEMAS[tramoDeCurso(p.curso)].nombre}</span>
            <span>Lectura nivel {p.nivelLectura}</span>
            <span>Basket velocidad {p.basket.nivel}{p.basket.fijado ? ' (fijada)' : ''}{p.basket.refuerzo ? ' · refuerzo' : ''}</span>
          </button>
        ))}
      </main>
    </div>
  );
}

function EditorPerfil({ perfil, alCerrar }: { perfil: Perfil | null; alCerrar: () => void }) {
  const niveles = nivelesDisponibles('decodificacion');
  const [alias, setAlias] = useState(perfil?.alias ?? '');
  const [curso, setCurso] = useState(perfil?.curso ?? 2);
  const [nivelLectura, setNivelLectura] = useState(perfil?.nivelLectura ?? 1);
  const [velocidad, setVelocidad] = useState(perfil?.basket.nivel ?? 1);
  const [fijado, setFijado] = useState(perfil?.basket.fijado ?? false);
  const [tamanoBloque, setTamanoBloque] = useState(perfil?.tamanoBloque ?? 10);
  const [fuente, setFuente] = useState<Fuente>(perfil?.fuente ?? 'andika');
  const [sonido, setSonido] = useState(perfil?.sonido !== false);
  const [confirmarBorrar, setConfirmarBorrar] = useState(false);

  const guardar = async () => {
    if (!alias.trim()) return;
    const base = perfil ?? perfilNuevo(alias, curso, nivelLectura);
    const velocidadCambio = base.basket.nivel !== velocidad;
    await db.perfiles.put({
      ...base,
      alias: alias.trim(),
      curso,
      nivelLectura,
      fuente,
      sonido,
      tamanoBloque,
      basket: {
        nivel: velocidad,
        fijado,
        // Si la velocidad se cambia a mano, el bloque en curso parte de cero.
        refuerzo: velocidadCambio ? false : base.basket.refuerzo,
        bloque: velocidadCambio ? [] : base.basket.bloque,
      },
      actualizado: Date.now(),
    });
    alCerrar();
  };

  const borrar = async () => {
    if (!perfil) return;
    await db.transaction('rw', db.perfiles, db.rondas, db.respuestas, async () => {
      await db.respuestas.where('perfilId').equals(perfil.id).delete();
      await db.rondas.where('perfilId').equals(perfil.id).delete();
      await db.perfiles.delete(perfil.id);
    });
    alCerrar();
  };

  return (
    <div className="pantalla neutra">
      <header className="cabecera">
        <h1 className="titulo">{perfil ? `Perfil: ${perfil.alias}` : 'Nuevo jugador'}</h1>
        <div className="fila">
          <button className="boton" onClick={guardar} disabled={!alias.trim()}>Guardar</button>
          <button className="boton boton-secundario" onClick={alCerrar}>Cancelar</button>
        </div>
      </header>

      <main className="formulario">
        <label className="campo">
          <span>Alias o iniciales</span>
          <input value={alias} maxLength={12} onChange={(e) => setAlias(e.target.value)} placeholder="Ej: TomiR" />
          <small>Nunca el nombre completo del niño.</small>
        </label>

        <div className="campo">
          <span>Curso (define cómo se ve)</span>
          <div className="opciones">
            {[2, 3, 4, 5, 6, 7].map((c) => (
              <button key={c} className={c === curso ? 'opcion activa' : 'opcion'} onClick={() => setCurso(c)}>{c}°</button>
            ))}
          </div>
          <small>Tramo: {TEMAS[tramoDeCurso(curso)].nombre} ({TEMAS[tramoDeCurso(curso)].cursos})</small>
        </div>

        <label className="campo">
          <span>Nivel de lectura (define qué palabras salen)</span>
          <select value={nivelLectura} onChange={(e) => setNivelLectura(Number(e.target.value))}>
            {niveles.map((b) => (
              <option key={b.nivel} value={b.nivel}>{b.nivel} · {b.titulo}</option>
            ))}
          </select>
        </label>

        <div className="campo">
          <span>Velocidad de Basket (1 = muy lento, {VELOCIDAD_MAX} = rápido)</span>
          <div className="opciones">
            {Array.from({ length: VELOCIDAD_MAX }, (_, i) => i + 1).map((v) => (
              <button key={v} className={v === velocidad ? 'opcion activa' : 'opcion'} onClick={() => setVelocidad(v)}>{v}</button>
            ))}
          </div>
          <label className="casilla">
            <input type="checkbox" checked={fijado} onChange={(e) => setFijado(e.target.checked)} />
            Fijar velocidad (no sube ni baja sola)
          </label>
        </div>

        <label className="campo">
          <span>Respuestas por bloque (para subir o bajar)</span>
          <input type="number" min={5} max={30} value={tamanoBloque} onChange={(e) => setTamanoBloque(Math.max(5, Math.min(30, Number(e.target.value) || 10)))} />
        </label>

        <div className="campo">
          <span>Letra</span>
          <div className="opciones">
            <button className={fuente === 'andika' ? 'opcion activa' : 'opcion'} style={{ fontFamily: FAMILIA_FUENTE.andika }} onClick={() => setFuente('andika')}>Andika: casa</button>
            <button className={fuente === 'opendyslexic' ? 'opcion activa' : 'opcion'} style={{ fontFamily: FAMILIA_FUENTE.opendyslexic }} onClick={() => setFuente('opendyslexic')}>OpenDyslexic: casa</button>
          </div>
        </div>

        <div className="campo">
          <span>Sonido</span>
          <label className="casilla">
            <input type="checkbox" checked={sonido} onChange={(e) => setSonido(e.target.checked)} />
            "Swish" suave al encestar (en iPad no suena si está en modo silencio)
          </label>
        </div>

        {perfil && <Historial perfilId={perfil.id} />}

        {perfil && (
          <div className="zona-peligro">
            {!confirmarBorrar ? (
              <button className="boton boton-secundario" onClick={() => setConfirmarBorrar(true)}>Eliminar perfil</button>
            ) : (
              <div className="fila">
                <span>¿Eliminar a {perfil.alias} y todos sus datos?</span>
                <button className="boton boton-peligro" onClick={borrar}>Sí, eliminar</button>
                <button className="boton boton-secundario" onClick={() => setConfirmarBorrar(false)}>No</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function Historial({ perfilId }: { perfilId: string }) {
  const rondas = useLiveQuery(
    () => db.rondas.where('perfilId').equals(perfilId).reverse().sortBy('inicio').then((r) => r.slice(0, 15)),
    [perfilId],
  );
  if (!rondas?.length) return <p className="campo">Todavía no hay rondas jugadas.</p>;
  return (
    <div className="campo">
      <span>Últimas rondas de Basket</span>
      <table className="tabla">
        <thead>
          <tr><th>Fecha</th><th>Consigna</th><th>Acierto</th><th>Encestadas</th><th>Velocidad</th></tr>
        </thead>
        <tbody>
          {rondas.map((r) => (
            <tr key={r.id}>
              <td>{new Date(r.inicio).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}</td>
              <td>{r.regla.replace(':', ' → ')}</td>
              <td>{Math.round((r.correctas / r.total) * 100)} % ({r.correctas}/{r.total})</td>
              <td>{r.encestadas}{r.estrellas ? ` · ⚡${r.estrellas}` : ''}</td>
              <td>{r.velocidadInicial === r.velocidadFinal ? r.velocidadInicial : `${r.velocidadInicial} → ${r.velocidadFinal}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
