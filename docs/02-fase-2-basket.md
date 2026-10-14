# Fase 2: motor base, perfil del niño y Basket

> Estado: **lista para que Fran la revise y apruebe**.
> Lo marcado **[CONFIRMAR]** lo decidí yo como punto de partida. Se cambia fácil.

---

## Decisiones de Fran (13 oct 2026)

| Tema | Decisión |
|---|---|
| Nombre | **Ruta Lectora**, con el **Kiltro** como mascota ✅ |
| Colores por tramo | Aprobados ✅ |
| Escenario | Una cancha de básquet |
| Mecánica | Caen pelotas con palabras. El niño encesta **solo las que cumplen la consigna** (ej. "las que tienen la letra o"). Hay **un aro** |
| Dificultad | La **velocidad** |
| Error | No pasa nada: **pierde una vida** |
| Retroalimentación | **Sin mensajes** |
| Audio | **Sin audio**, porque la idea es que el niño lea |
| Palabras | Aprobado que yo prepare las listas (quedan con `"revisado": false`) |

### Qué cambia respecto del diseño original (`01-diseno.md`)

- **Basket ahora trabaja decodificación (lectura por letra), no conciencia fonológica.** Como no hay audio, el niño tiene que leer la palabra. La conciencia fonológica, que depende del sonido, quedará en otro juego o en un modo con audio más adelante.
- **En Basket la velocidad SÍ decide el nivel.** En el diseño general la velocidad era solo un bonus; para Basket manda esta decisión.
- **Sin mensajes de retroalimentación ni audio en Basket.** La única respuesta es visual: la pelota entra al aro o se desvanece.
- **Ojo para la Fase 4:** Basket quedó parecido a Crash ("tocar solo los correctos"). Cuando lleguemos a Crash conviene darle una mecánica distinta.

---

## Cómo se juega

1. Aparece la consigna en grande, por ejemplo "Encesta las que tienen la letra **o**", y el niño aprieta **¡Vamos!**
2. Las pelotas caen de a una, cada una con una palabra. La consigna queda siempre visible arriba.
3. El niño **toca** una pelota y esta vuela al aro.
   - Si cumple la consigna, entra y suma 1 encestada.
   - Si no la cumple, se desvanece y pierde 1 de sus 3 vidas.
   - Si deja pasar una correcta, no pierde vida, pero queda registrado como omisión.
4. La ronda termina a las 30 pelotas o al perder las 3 vidas. Al final se muestran las encestadas y las estrellas rayo.

### Las consignas

Se arman solas a partir de la lista de palabras del nivel del niño:
- tienen la letra ___ (es la más frecuente)
- empiezan con la letra ___
- empiezan con la sílaba ___
- terminan con la letra ___
- tienen ___ sílabas

Se juzga **por letra**: "árbol" tiene la letra *a*. Las palabras que podrían confundir no salen en esa ronda. Por ejemplo, para la letra *c* no sale "chancho" (ch); para la *u* no sale "queso"; para la *l* no sale "grillo" (ll); para "empieza con u" no sale "huevo".
El texto de cada consigna se puede editar en `content/basket/consignas.json`.

---

## Velocidad y nivel

- Hay **10 velocidades**. En la 1, cada pelota tarda 9 segundos en cruzar la pantalla y cae una cada 2,8 s. En la 10, tarda 3,4 s y cae una cada 1,3 s.
- Se aplica la regla del diseño en **bloques de 10 pelotas**. Cada pelota cuenta como una respuesta: encestar una correcta, dejar pasar una incorrecta, tocar una incorrecta o dejar pasar una correcta.
  - **80 % o más:** sube una velocidad.
  - **60–79 %:** se mantiene.
  - **Menos de 60 %:** bloque de refuerzo, todo un 25 % más lento. Si en el refuerzo vuelve a bajar de 60 %, baja una velocidad.
- La velocidad cambia **durante la ronda**: las pelotas siguientes ya caen más rápido o más lento.
- **Las palabras no cambian solas.** El nivel de lectura (niveles 1 a 11 de decodificación) lo fija Fran en el perfil. Cuando exista la evaluación inicial (Fase 5) se podrá proponer automáticamente.
- Desde la zona de adulto se puede **fijar la velocidad** para que no suba ni baje, y cambiar el tamaño del bloque.
- **Estrellas rayo:** encestar una correcta en la primera mitad de su caída (antes del 45 % del recorrido) da una estrella rayo. Es solo un bonus.

---

## Qué más hay en esta fase

- **Elegir jugador:** cada niño toca su alias.
- **Inicio del niño:** con el estilo de su tramo. El Kiltro aparece grande en 2°–3°, chico en 4°–5° y no aparece en 6°–7°. Turbo y Crash se ven como "Pronto".
- **Zona de adulto con PIN** (4 números, se crea la primera vez):
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

## Puntos para confirmar con Fran **[CONFIRMAR]**

1. **Tocar en vez de arrastrar:** el niño toca la pelota y esta vuela sola al aro. Con pelotas que caen rápido, tocar es más justo que arrastrar. ¿Está bien?
2. **3 vidas** por ronda, y la ronda dura **30 pelotas**. ¿Está bien, o prefiere otra cantidad?
3. **Dejar pasar una correcta no quita vida**, pero cuenta como error para subir o bajar. ¿O debería quitar vida también?
4. **Sin ningún sonido**, ni siquiera el "swish" al encestar. ¿O un sonido suave de acierto (que se puede apagar) sí?
5. **Texto de las consignas:** "Encesta las que tienen la letra ___". ¿Lo cambiaría (por ejemplo "Mete al aro las que…")?
6. **Las consignas por cantidad de sílabas** ("tienen 3 sílabas") son más de conciencia silábica que de lectura. ¿Se dejan o se quitan?
7. **Revisar las listas de palabras** de los niveles 1 a 11.

---

## Cómo probarla

**En el computador de Gonza:** `npm run dev` y abrir http://localhost:5173.

**En el iPad:**
- Con el computador y el iPad en el mismo wifi, se abre en Safari la dirección `http://192.168.x.x:5173` que muestra `npm run dev`.
- Para **instalarla como app** hay que publicarla en Vercel. Después, en Safari: Compartir → Agregar a inicio.

**Recorrido sugerido:**
1. Zona de adulto → crear un PIN → crear un perfil **inventado** (por ejemplo "PRUEBA", 3°, nivel de lectura 3).
2. Volver, elegir el perfil y jugar Basket.
3. Crear otro perfil de 5° y uno de 7° para ver los tres estilos.
4. Volver a la zona de adulto y revisar el historial de rondas.

**Qué mirar:** ¿se leen bien las palabras? ¿La velocidad inicial es lo bastante lenta para un niño que recién empieza? ¿Las consignas se entienden sin audio?
