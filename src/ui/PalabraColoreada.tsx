import { trozosColoreados } from './letras';

/** Muestra un texto con la p, b y d en sus colores de apoyo (si están activos). */
export function PalabraColoreada({ texto, activo }: { texto: string; activo: boolean }) {
  return (
    <>
      {trozosColoreados(texto, activo).map((t, i) =>
        t.color ? (
          <span key={i} style={{ color: t.color }}>{t.texto}</span>
        ) : (
          <span key={i}>{t.texto}</span>
        ),
      )}
    </>
  );
}
