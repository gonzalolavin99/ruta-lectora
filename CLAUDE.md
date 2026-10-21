# Ruta Lectora — instrucciones para Claude Code

PWA de juegos terapéuticos para niños con dislexia (1° a 6° básico), para la fonoaudióloga **Fran**
(Santiago, Chile). **Gonza** (esposo) lleva la parte técnica y **no es programador**: explicar en
español simple, sin jerga. Uso clínico personal, no comercial.

- Producción: **https://ruta-lectora-kappa.vercel.app** (Vercel, se publica solo con `git push` a `main`).
- Repo privado: `gonzalolavin99/ruta-lectora`.
- Prioridad de aparatos: **iPad (Safari) y Mac**. iPhone no importa.

## Reglas de trabajo

- Las **decisiones clínicas son de Fran**. Si algo clínico no está definido, decidir algo razonable,
  dejarlo marcado **[CONFIRMAR]** en un doc de `docs/` y avisar. Gonza suele pedir avanzar sin esperar.
- Cada cambio: pruebas (`npm test`), `npm run build`, verificar en el navegador (tamaño iPad 1180×820),
  commit en español con mensaje claro, `git push`, y confirmar que Vercel sirve la versión nueva.
- Documentar cada entrega en `docs/NN-tema.md` y sumar la fila en la tabla de `README.md`.
- Todo contenido nuevo (palabras, textos) lleva `"revisado": false`.
- Español de Chile, tuteo, nunca voseo. Nada de datos reales de niños en el repo.
- Fran valora **no perder tiempo en sesión (45 min)**: los controles van dentro del juego, sin PIN,
  sin pantallas intermedias. Estilo visual claro, vivo, "sticker" (nunca oscuro).

## Cómo funciona hoy (oct 2026)

Flujo: **¿Qué curso?** (1°–6°) → **¿Qué vamos a leer?** (sílabas / palabras / pseudopalabras por
estructura, 11 bancos) → **Lee la palabra** (12 palabras, una por una) → **¿A qué jugamos?** → juego.
Los 4 juegos usan las mismas 12 palabras.

| Juego | Mecánica | Dificultad |
|---|---|---|
| Basket (Phaser) | Caen pelotas con palabras; el niño **arrastra el aro** para atrapar solo las que cumplen la consigna ("Encesta las que tienen la letra o"). 3 vidas: pierde al atrapar una incorrecta o dejar pasar una correcta | Velocidad 1–10 |
| Crash (Phaser) | Suben burbujas; **tocar** para reventar solo las correctas. Mismas vidas | Velocidad 1–10 |
| Turbo (React) | Carrera vs. rival: palabra se muestra y se tapa; ambos avanzan con cada palabra (✓ niño +1 y rival +½, ✗ rival +1 y niño +¼, `avance.ts`); paisaje en movimiento; meta a 10 pasos → celebración en la pista → podio con copa. Modo "voz alta" (la fono marca ✓/✗, o flechas → ←) o "elige la palabra" (3 opciones parecidas). Personajes: auto, delfín (mar), cohete (espacio) | Tiempo de exposición (velocidad 1–10) |
| Memoria (React) | 2–5 palabras numeradas se tapan; tocar en el mismo orden entre distractoras. 6 intentos | Cantidad de palabras 2–5 |

Comunes:
- Control **− Velocidad +** siempre usable (las tarjetas no tapan la barra). Tocar −/+ deja la
  velocidad **fija 🔒**; botón **Auto** vuelve a la regla 80/60 (bloques de 10; ≥80 % sube, <60 % refuerzo
  y luego baja). Se guarda por juego y curso.
- **p roja, b azul, d verde** en todo lo que se lee (apagable en Ajustes).
- **Niveles de la sesión**: 1–3 ⭐ por ronda, nivel cada 3 ⭐, desbloquea disfraces
  (`src/sesion/progreso.ts`). **Medallas**: Todo terreno (4 juegos), En racha (3 rondas ⭐⭐⭐),
  Gran lector (3 listas). Solo motivación; no cambian la dificultad. Se reinician al volver a cursos.
- **Sin perfiles** (Fran los eliminó): solo se guardan en IndexedDB letra, colores, sonido y
  velocidades. Sin servidor de datos.
- Sonidos (swish, pop) generados con Web Audio: sin archivos ni copyright.
- Ajustes: letra Andika/OpenDyslexic, colores p/b/d, sonido, versión y botón **"Actualizar la app"**.

## Código

```
content/decodificacion/nivel-NN.json   Bancos de palabras (11 niveles)
content/juegos/consignas.json          Verbos y frases de las consignas
src/engine/        Regla adaptativa, carga de contenido, estructura silábica
src/games/comun/   Reglas/consignas, velocidades, JuegoArcade (pantalla de Basket/Crash), etiquetas, ui
src/games/basket|crash/  Escenas Phaser       src/games/turbo|memoria/  React
src/sesion/        Selectores, presentación, Sesion, progreso (niveles, disfraces, medallas)
src/panel/Ajustes.tsx    src/data/ (db.ts IndexedDB, actualizacion.ts PWA)    src/ui/ (tema, estilos.css, letras)
docs/              Un documento por entrega (01 diseño … 07 Turbo en movimiento)
```

Comandos (Windows, PowerShell bloquea `npm`: usar `npm.cmd`, o doble clic en `iniciar.cmd`):
`npm.cmd run dev` · `npm.cmd test` · `npm.cmd run build`. Servidor de pruebas: `.claude/launch.json` (puerto 5173).

## Trampas conocidas (leer antes de tocar)

- **Windows no distingue mayúsculas**: no crear `turbo.ts` junto a `Turbo.tsx` (por eso existen
  `exposicion.ts` e `intentos.ts`).
- **Safari/iPad**: usar anchos explícitos y posiciones en % (`left: p%` + `translateX(-p%)`); un
  `calc()` con anchos implícitos dejó la pista de Turbo aplastada a la izquierda.
- **Contenedores grid/flex con `PalabraColoreada`**: envolver en `<span>` o cada letra coloreada
  queda en una línea distinta.
- **Tarjetas de fin de ronda**: deben caber en ~650 px de alto (iPad en Safari con barra): por eso van
  en dos columnas.
- **PWA y caché**: el iPad guarda la app; `src/data/actualizacion.ts` busca versión nueva al abrir,
  al volver y cada hora, y recarga. Si no aparece un cambio: Ajustes → "Actualizar la app".
- **Navegador interno de Claude**: si la ventana no está visible no dibuja (requestAnimationFrame = 0):
  las animaciones CSS quedan en 0 y Phaser no avanza. En desarrollo el juego queda en
  `window.__juego`; avanzar con `__juego.step(t, 16.6)` y terminar animaciones con
  `document.getAnimations().forEach(a => a.finish())`. Las capturas a veces llegan atrasadas.
- **Bash del entorno**: heredocs con comillas simples dobles (`''`) rompen el comando; para CSS/JS
  con comillas, escribir el archivo con la herramienta Write.
- Al probar con datos, borrar después la base: `indexedDB.deleteDatabase('ruta-lectora')`.

## Pendiente / ideas

- Respuestas de Fran marcadas [CONFIRMAR] en `docs/03` a `docs/06`.
- Ideas no elegidas aún (docs/04): más disfraces, ronda especial cada 3 niveles, escenarios por curso
  ("mundos"), juego "Detective" (oración → dibujo, requiere pictogramas ARASAAC).
- Las fases originales de evaluación inicial, métricas e informes PDF quedaron sin base al quitar
  perfiles; redefinir con Fran si las quiere.
