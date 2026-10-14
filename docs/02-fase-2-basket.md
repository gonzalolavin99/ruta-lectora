# Fase 2: motor base, perfil del niño y Basket

> Estado: **lista para que Fran la pruebe y apruebe** (con sus respuestas del 13 oct ya incorporadas).

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

Se arman solas a partir de la lista de palabras del nivel del niño:
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
- Se puede **apagar por niño** en la zona de adulto.
- En iPad y iPhone no suena si el aparato está en modo silencio.

---

## Velocidad y nivel

- Hay **10 velocidades**. En la 1, cada pelota tarda 9 segundos en cruzar la pantalla y cae una cada 2,8 s. En la 10, tarda 3,4 s y cae una cada 1,3 s.
- Se aplica la regla del diseño en **bloques de 10 pelotas**. Cada pelota cuenta como una respuesta: atraparla si era correcta o dejarla pasar si era incorrecta es un acierto.
  - **80 % o más:** sube una velocidad.
  - **60–79 %:** se mantiene.
  - **Menos de 60 %:** bloque de refuerzo, todo un 25 % más lento. Si en el refuerzo vuelve a bajar de 60 %, baja una velocidad.
- La velocidad cambia **durante la ronda**.
- **Las palabras no cambian solas.** El nivel de lectura (niveles 1 a 11) lo fija Fran en el perfil.
- Desde la zona de adulto se puede **fijar la velocidad** y cambiar el tamaño del bloque.
- **Estrellas rayo:** cada 5 encestadas seguidas sin error se gana una. Es solo un bonus.
- Con esta mecánica ya no se mide el tiempo de reacción, porque el ritmo lo marca la caída. Se guarda si atrapó o dejó pasar cada pelota.

---

## Ajustes para ahorrar tiempo en sesión (pedido de Fran)

- **Velocidad dentro del juego:** arriba a la derecha está el control **− Velocidad +**. Funciona antes de apretar ¡Vamos! y durante el juego, y el cambio se nota al tiro, también en las pelotas que ya vienen cayendo. Queda guardado en el perfil. Al cambiarla a mano, el bloque de 10 parte de cero para que la regla 80/60 mida la velocidad nueva.
- **Sin PIN:** el botón "⚙️ Perfiles" entra directo. En "¿Quién juega?" hay una tarjeta **+ Nuevo jugador** para crear un perfil en segundos.

## Estilo visual, versión 2

- Fondos claros con puntitos, nunca oscuros. 2°–3° amarillo, 4°–5° menta y celeste, 6°–7° lila con lima.
- Bordes de tinta y sombras desplazadas (estilo sticker), botones redondos y tarjetas levemente giradas.
- Letra **Fredoka** (redondeada) solo para títulos y botones. **Las palabras que el niño lee siguen en Andika** (u OpenDyslexic), por legibilidad.
- Se mantienen las reglas clínicas: sin blanco puro, alto contraste y botones grandes.

## Qué más hay en esta fase

- **Elegir jugador:** cada niño toca su alias.
- **Inicio del niño:** con el estilo de su tramo. El Kiltro aparece grande en 2°–3°, chico en 4°–5° y no aparece en 6°–7°. Turbo y Crash se ven como "Pronto".
- **Perfiles** (sin PIN):
  - crear, editar y eliminar perfiles: alias, curso, nivel de lectura, velocidad, fijar velocidad, tamaño del bloque y letra (Andika u OpenDyslexic)
  - ver las últimas 15 rondas de cada niño: consigna, % de acierto, encestadas y cambio de velocidad
- **Se guarda cada respuesta** con la palabra, la consigna, si era correcta y el tiempo de reacción. Esos datos son la base de las métricas e informes de la Fase 6.
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

**En el iPad:**
- Con el computador y el iPad en el mismo wifi, se abre en Safari la dirección `http://192.168.x.x:5173` que muestra `npm run dev`.
- Para **instalarla como app** hay que publicarla en Vercel. Después, en Safari: Compartir → Agregar a inicio.

**Recorrido sugerido:**
1. En "¿Quién juega?" tocar **+ Nuevo jugador** y crear un perfil **inventado** (por ejemplo "PRUEBA", 3°, nivel de lectura 3).
2. Volver, elegir el perfil y jugar Basket.
3. Crear otro perfil de 5° y uno de 7° para ver los tres estilos.
4. Durante el juego, probar el control **− Velocidad +**.
5. En "⚙️ Perfiles" revisar el historial de rondas.

**Qué mirar:** ¿se leen bien las palabras? ¿Es cómodo arrastrar el aro en el iPad? ¿La velocidad 1 es lo bastante lenta para un niño que recién empieza?
