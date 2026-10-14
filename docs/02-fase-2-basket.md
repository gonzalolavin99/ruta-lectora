# Fase 2: motor base y Basket

> Estado: **lista para que Fran la pruebe y apruebe** (con sus pedidos del 13 y 14 oct ya incorporados).

## Cómo funciona una sesión (14 oct 2026)

**Ya no hay perfiles de niños.** La fonoaudióloga elige todo en el momento:

1. **¿Qué curso?** De 1° a 5° básico. El curso define cómo se ve: 1°–2° amarillo con el Kiltro, 3°–4° menta y celeste, 5° lila con lima.
2. **¿Qué vamos a leer?** Hay tres columnas:
   - **Sílabas:** con m, p, l, s, t, n, o todas las sílabas
   - **Palabras:** CV-CV, con CVC, trabadas, diptongos o largas
   - **Pseudopalabras:** CV-CV, con CVC, trabadas o diptongos
3. **Lee la palabra:** aparecen una por una, en grande, las 12 palabras de la ronda. La mitad cumple la consigna del juego y la otra mitad no. Se avanza con "Siguiente" (o tocando la palabra, o con la flecha derecha o la barra espaciadora en el Mac). El botón **ca·sa** muestra la palabra separada en sílabas de dos colores, como apoyo.
4. **¡A jugar!** Basket es el premio, y en él caen **solo las palabras que se leyeron**.
5. Al terminar la ronda: **Jugar otra vez** (mismas palabras), **Palabras nuevas** (vuelve a la lectura con otras 12) o **Salir**.

**Qué se guarda en el aparato:** solo la letra elegida, el sonido encendido o apagado y la última velocidad usada en cada curso. Ya no se guardan respuestas ni historial por niño.

> **Consecuencia:** sin perfiles, las fases de métricas, informes PDF y tarea para la casa (5 y 6 del plan original) hay que redefinirlas con Fran. Si más adelante quiere seguimiento por niño, se pueden volver a agregar perfiles.


---

## Decisiones de Fran (13 oct 2026)

| Tema | Decisión |
|---|---|
| Nombre | **Ruta Lectora**, con el **Kiltro** como mascota ✅ |
| Colores por tramo | **Versión 2** (pedido de Fran): más juvenil y claro, estilo "sticker" (ver abajo) |
| Escenario | Una cancha de básquet |
| Mecánica | Caen pelotas con palabras y el niño **arrastra el aro** para atrapar solo las que cumplen la consigna (ej. "las que tienen la letra o") |
| Dificultad | La **velocidad** |
| Vidas | **3 por ronda.** Pierde una si atrapa una incorrecta o si deja pasar una correcta |
| Retroalimentación | **Sin mensajes** |
| Audio | **Sin voz**, porque la idea es que el niño lea. Solo un "swish" sin derechos de autor al encestar |
| Consignas | Aprobadas, incluida la de cantidad de sílabas ✅ |
| Palabras | Listas de los niveles 1 a 11 revisadas y aprobadas ✅ |

### Qué cambia respecto del diseño original (`01-diseno.md`)

- **Basket ahora trabaja decodificación (lectura por letra), no conciencia fonológica.** Como no hay audio, el niño tiene que leer la palabra. La conciencia fonológica, que depende del sonido, quedará en otro juego o en un modo con audio más adelante.
- **En Basket la velocidad SÍ decide el nivel.** En el diseño general la velocidad era solo un bonus; para Basket manda esta decisión.
- **Sin mensajes ni voz en Basket.** La respuesta es visual (la pelota entra o rebota), más el "swish" opcional.
- Con el aro que se arrastra, Basket ya se diferencia de Crash (tocar estímulos en movimiento).

---

## Cómo se juega

1. Aparece la consigna en grande, por ejemplo "Encesta las que tienen la letra **o**", con la indicación "👆 Arrastra el aro". El niño aprieta **¡Vamos!**
2. Caen pelotas con palabras. La consigna queda siempre visible arriba.
3. Abajo hay un aro con tablero, sobre ruedas. El niño lo **arrastra** a izquierda y derecha con el dedo o con el mouse. En el Mac también sirven las flechas del teclado.
   - **Atrapa una correcta:** entra al aro, suma 1 encestada y suena un "swish" suave.
   - **Atrapa una incorrecta:** rebota en el aro y pierde 1 vida.
   - **Deja pasar una correcta:** pierde 1 vida.
   - **Deja pasar una incorrecta:** muy bien, no pasa nada.
4. Hay **3 vidas**. La ronda termina a las 30 pelotas o al perder las 3 vidas. Al final se muestran las encestadas y las estrellas rayo.

### Las consignas

Se arman solas a partir de la lista que eligió Fran:
- tienen la letra ___ (es la más frecuente)
- empiezan con la letra ___
- empiezan con la sílaba ___
- terminan con la letra ___
- tienen ___ sílabas

Se juzga **por letra**: "árbol" tiene la letra *a*. Las palabras que podrían confundir no salen en esa ronda. Por ejemplo, para la letra *c* no sale "chancho" (ch); para la *u* no sale "queso"; para la *l* no sale "grillo" (ll); para "empieza con u" no sale "huevo".
El texto de cada consigna se puede editar en `content/basket/consignas.json`.

### Sonido

- El único sonido es el **"swish" al encestar**. No hay voz ni sonido de error.
- El sonido **se genera con código** en el momento; no es un archivo grabado. Por eso no tiene derechos de autor y funciona igual en el Mac, el iPad y el iPhone, incluso sin internet.
- Se puede apagar en **⚙️ Ajustes**, en la pantalla de cursos.
- En iPad y iPhone no suena si el aparato está en modo silencio.

---

## Velocidad y nivel

- Hay **10 velocidades**. En la 1, cada pelota tarda 9 segundos en cruzar la pantalla y cae una cada 2,8 s. En la 10, tarda 3,4 s y cae una cada 1,3 s.
- Se aplica la regla del diseño en **bloques de 10 pelotas**. Cada pelota cuenta como una respuesta: atraparla si era correcta o dejarla pasar si era incorrecta es un acierto.
  - **80 % o más:** sube una velocidad.
  - **60–79 %:** se mantiene.
  - **Menos de 60 %:** bloque de refuerzo, todo un 25 % más lento. Si en el refuerzo vuelve a bajar de 60 %, baja una velocidad.
- La velocidad cambia **durante la ronda**.
- **Las palabras no cambian solas.** Las elige Fran al entrar al curso.
- La última velocidad que se usó en cada curso queda guardada para la próxima vez.
- **Estrellas rayo:** cada 5 encestadas seguidas sin error se gana una. Es solo un bonus.

---

## Ajustes para ahorrar tiempo en sesión (pedido de Fran)

- **Velocidad dentro del juego:** arriba a la derecha está el control **− Velocidad +**. Funciona antes de apretar ¡Vamos! y durante el juego, y el cambio se nota al tiro, también en las pelotas que ya vienen cayendo. Queda guardado para ese curso. Al cambiarla a mano, el bloque de 10 parte de cero para que la regla 80/60 mida la velocidad nueva.
- **Sin PIN ni perfiles:** se entra directo eligiendo curso y contenido.

## Estilo visual, versión 2

- Fondos claros con puntitos, nunca oscuros. 1°–2° amarillo, 3°–4° menta y celeste, 5° lila con lima.
- Bordes de tinta y sombras desplazadas (estilo sticker), botones redondos y tarjetas levemente giradas.
- Letra **Fredoka** (redondeada) solo para títulos y botones. **Las palabras que el niño lee siguen en Andika** (u OpenDyslexic), por legibilidad.
- Se mantienen las reglas clínicas: sin blanco puro, alto contraste y botones grandes.

## Qué más hay en esta fase

- **⚙️ Ajustes:** la letra de las palabras (Andika u OpenDyslexic) y el sonido al encestar.
- **PWA:** se instala y funciona sin internet. En el iPad, si se pone vertical, aparece "Gira el iPad para jugar".

### Contenido nuevo (todo `"revisado": false`)

| Nivel | Contenido | Cantidad |
|---|---|---|
| 1 | Sílabas CV con m, p, l, s, t, n | 30 |
| 2 | Sílabas CV con el resto de las consonantes, ch, ll, rr, que/qui, gue/gui, ce/ci, ge/gi | 55 |
| 3 | Palabras CV-CV frecuentes | 30 |
| 4 | Pseudopalabras CV-CV | 20 |
| 5 | Palabras con VC y CVC | 30 |
| 6 | Pseudopalabras con VC y CVC | 20 |
| 7 | Palabras con trabadas (CCV) | 30 |
| 8 | Pseudopalabras con trabadas | 20 |
| 9 | Palabras con diptongos e hiatos | 30 |
| 10 | Pseudopalabras con diptongos | 20 |
| 11 | Palabras infrecuentes de 3–4 sílabas | 30 |

Las listas están en `content/decodificacion/nivel-01.json` a `nivel-11.json`. Mientras no exista el editor (Fase 6), Fran puede revisarlas y mandarme las correcciones.

---

## Pendiente

- En las listas de palabras, Fran aprobó el contenido. El campo `"revisado"` se pasará a `true` con el editor de contenido (Fase 6) o cuando ella lo indique.

---

## Cómo probarla

**En el computador de Gonza:** doble clic en `iniciar.cmd` (abre el navegador solo), o en la terminal `npm.cmd run dev` y abrir http://localhost:5173.

**En el iPad o el Mac de Fran:** abrir **https://ruta-lectora-kappa.vercel.app** en Safari.
- iPad: Compartir → **Agregar a pantalla de inicio**.
- Mac: Archivo → **Agregar al Dock**.
- Después de abrirla una vez, funciona sin internet.

**Recorrido sugerido:**
1. Tocar **1° básico** → **Pseudopalabras → CV-CV**.
2. Leer las 12 palabras (probar el botón **ca·sa**) y tocar **¡A jugar!**
3. Durante el juego, probar el control **− Velocidad +**.
4. Al terminar, probar **Palabras nuevas**.
5. Entrar a 3° y a 5° para ver los otros estilos.

**Qué mirar:** ¿12 palabras es buena cantidad para leer antes de jugar? ¿Se leen bien? ¿Es cómodo arrastrar el aro en el iPad? ¿La velocidad 1 es lo bastante lenta para un niño que recién empieza?
