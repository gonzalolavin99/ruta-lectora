# Fase 1 — Diseño de la plataforma

> Documento para revisar y corregir. Todo lo marcado con **[DECIDIR]** necesita tu respuesta.
> Uso personal, no comercial.

---

## 1. Nombre

Como es de uso personal no hace falta registrar marca, pero igual buscamos que sea propio y original.

**Plataforma: Ruta Lectora** (propuesta: el **Kiltro** es la mascota que acompaña en la ruta) **[CONFIRMAR]**

- *Ruta Lectora* es neutro y no se siente infantil para 6°–7°.
- El Kiltro aparece como compañero visible en 2°–3°, más discreto en 4°–5°, y en 6°–7° solo como logo.

**Juegos (motores)** ✅ decidido

| Motor | Nombre |
|---|---|
| Choca choca | **Crash** |
| Baloncesto | **Basket** |
| Carrera de lectura | **Turbo** |

> **Actualización Fase 2:** Basket quedó como juego de lectura (decodificación por letra), sin audio ni mensajes, con la velocidad como dificultad. Ver `02-fase-2-basket.md`.

El nombre del motor es fijo; lo que cambia en cada mundo es su "disfraz" (en el mundo del mar, *Crash* son burbujas; en el espacio, meteoritos).

---

## 2. Cómo se organiza (explicado simple)

Hay **tres capas** que nunca se mezclan:

```
  TRAMO (por curso)          →  cómo SE VE      (2°–3°, 4°–5°, 6°–7°)
    └─ MUNDO temático        →  dónde juega     (5 a 10 mundos por tramo)
         └─ ETAPAS 1 a 15    →  cuánto avanzó   (el paisaje cambia, premios)

  NIVEL DE LECTURA (por objetivo)  →  qué tan DIFÍCIL es el contenido
                                      (lo decide su desempeño, no el curso)
```

- Un niño de 6° con nivel inicial ve un mundo de 6°–7° (skate, espacio…) pero con palabras de nivel inicial.
- Las **etapas** del mundo (1 a 15) son el avance visible que motiva: cambia el escenario, aparecen personajes y se ganan premios. No suben la dificultad.
- La **dificultad** la decide el nivel del niño en cada objetivo. Puede estar en nivel 6 de decodificación y en nivel 3 de conciencia fonológica al mismo tiempo.
- Tú puedes **fijar o bloquear** el nivel de cualquier objetivo desde el panel.

### Regla de subir y bajar de nivel

- Se evalúa en **bloques de 10 respuestas** (lo puedes cambiar en el panel).
- **80 % o más** de acierto → sube un nivel.
- **Entre 60 % y 79 %** → se mantiene.
- **Menos de 60 %** → la primera vez hace un **bloque de refuerzo** en el mismo nivel, con más tiempo y menos distractores. Si vuelve a bajar del 60 %, **baja un nivel**.
- **La velocidad es un bonus y no decide el nivel.** Si responde bien y rápido gana "estrellas rayo" (monedas extra). El tiempo se guarda igual para tus métricas.

---

## 3. Estilo visual por tramo

Reglas para los tres tramos:
- Fondos crema o gris suave, **nunca blanco puro**.
- Texto con contraste alto (7:1 o más).
- Letra **Andika** por defecto (con la "a" escolar y la b/d bien diferenciadas), y la opción OpenDyslexic.
- Palabras grandes (mínimo 32 px en juego) y con espacio extra entre letras.
- Botones de 64 px o más (el mínimo exigido es 48 px).
- Toda instrucción tiene un botón de 🔊.

Puedes ver los colores y la letra en **`docs/estilos-por-tramo.html`** (ábrelo con doble clic).

| | **2°–3°** "Explorar" | **4°–5°** "Aventura" | **6°–7°** "Estilo" |
|---|---|---|---|
| Sensación | Cálido, redondo, amigable | Ilustrado, de expedición | Plano, moderno, tipo app o videojuego |
| Colores | Pasteles saturados sobre crema | Tierra + turquesa | Fondo oscuro azul-gris con acentos neón |
| Personajes | Mascota tierna que habla | Compañero de expedición | Sin mascota infantil; el avatar es el protagonista |
| Voz y textos | "¡Muy bien! Encontraste la sílaba *ma*." | "¡Bien hecho! Esa es la sílaba *ma*." | "Correcto: *ma*. Racha x3." |
| Premios | Stickers, accesorios | Mapas, insignias, equipo | Skins, títulos, efectos |

### Mundos propuestos (5 por tramo para empezar; se pueden sumar hasta 10)

Muchos son lugares de Chile, para que los niños los sientan propios. **[DECIDIR]** cuáles te gustan y cuáles cambiarías.

**2°–3° básico**
1. Bosque Valdiviano: pudúes, monitos del monte y chucaos.
2. Mar de Chiloé: palafitos, lobos marinos y botes.
3. La Huerta: verduras con cara y una granja.
4. Valle de los Dinos.
5. Noche de Estrellas: cohete de cartón y planetas.

**4°–5° básico**
1. Expedición Atacama: observatorio, flamencos y salar.
2. Piratas del Pacífico.
3. Hielos Patagónicos: glaciares y pingüinos.
4. Ciudad Robot.
5. Templo Perdido (arqueología).

**6°–7° básico**
1. Skate Urbano: murales y rampas.
2. Estación Orbital (ciencia ficción).
3. Arcade Retro (pixel art).
4. Extremo: surf en Pichilemu y andinismo.
5. Caso Abierto: detectives y misterio.

> **Sobre los dibujos (dicho con honestidad):** yo puedo dibujar escenarios y personajes en vectores con estilo plano, limpio y coherente. No van a tener la calidad de un ilustrador profesional. Por eso el sistema queda hecho para que **cada mundo sea un "paquete"** (imágenes + un archivo de configuración). Si más adelante consigues ilustraciones mejores, se reemplazan sin tocar el código.
> Mi recomendación: **construir 2 mundos por tramo en las primeras fases** y sumar los demás cuando los juegos estén probados con niños.

**Imágenes de los estímulos:** pictogramas **ARASAAC**, permitidos para uso no comercial. La app tendrá una pantalla de créditos, como exige su licencia. Algunos pictogramas son de España, pero la palabra escrita y el audio serán siempre chilenos (por ejemplo, el dibujo de la fresa se rotula "frutilla").

---

## 4. Tabla de niveles por objetivo

Criterios acordados:
- **Conciencia fonológica:** se trabaja **por sonido**. "Zapato" empieza con /s/, "kilo" y "casa" con /k/, "llave" y "yate" con el mismo sonido.
- **Decodificación:** se trabaja **por letra**. Se enseñan explícitamente ca/que/qui, ga/gue/gui, ce/ci, ge/gi y los dígrafos ch, ll, rr.

### 4.1 Conciencia fonológica (CF)

| Nivel | Qué trabaja | Ejemplo |
|---|---|---|
| 1 | Contar sílabas, palabras de 2–3 sílabas CV | ca-sa → 2; za-pa-to → 3 |
| 2 | Contar sílabas, 1–4 sílabas, con CVC | sol → 1; ma-ri-po-sa → 4 |
| 3 | Unir sílabas (síntesis) | /pe/ /lo/ /ta/ → pelota |
| 4 | Identificar sílaba inicial igual | ¿cuál empieza como **ma**no? → **ma**leta |
| 5 | Identificar sílaba final y rima | gato – pato; ratón – botón |
| 6 | Omitir sílaba inicial o final | "casa" sin "ca" → sa |
| 7 | Fonema inicial: vocales y sonidos largos (/m/ /s/ /f/ /l/) | ¿empieza con /s/? → **s**ol, **z**orro |
| 8 | Fonema inicial: todos los sonidos | ¿empieza con /k/? → **c**ama, **k**iwi, **qu**eso |
| 9 | Fonema final | ¿termina en /l/? → so**l** |
| 10 | Unir fonemas | /s/ /o/ /l/ → sol |
| 11 | Segmentar y contar fonemas | pan → 3 sonidos |
| 12 | Omitir fonema inicial o final | "sala" sin /s/ → ala |
| 13 | Sustituir fonema | "pato", cambia /p/ por /g/ → gato |
| 14 | Invertir sílabas y fonemas | "sapo" al revés → posa; "la" al revés → al |
| 15 | Todo lo anterior con sílabas trabadas (CCV) | "plato" sin /l/ → pato |

### 4.2 Decodificación y automatización (DEC)

Para cada estructura se pasa de **palabras reales a pseudopalabras**.

| Nivel | Estructura | Tipo | Ejemplo |
|---|---|---|---|
| 1 | CV con m, p, l, s, t, n | sílabas | ma, pe, lo, su |
| 2 | CV con todas las consonantes, dígrafos (ch, ll, rr) y ortografía contextual (que, gui, ce) | sílabas | che, qui, gue, rra |
| 3 | CV-CV | palabras frecuentes | casa, mesa, luna |
| 4 | CV-CV | pseudopalabras | lami, tefo |
| 5 | VC y CVC | palabras | sol, pan, árbol, campo |
| 6 | VC y CVC | pseudopalabras | sermo, tolpa |
| 7 | CCV (pl, pr, bl, br, tr, dr, cl, cr, fl, fr, gl, gr) | palabras | plato, tren, globo |
| 8 | CCV | pseudopalabras | flami, tropi |
| 9 | CVV (diptongos) y hiatos | palabras | pie, cuento, día |
| 10 | CVV | pseudopalabras | fuema, tiela |
| 11 | Mixtas de 3–4 sílabas | palabras infrecuentes | brújula, tiburón |
| 12 | Mixtas largas | pseudopalabras | plintoreja |

Además, en cualquier nivel se pueden activar **contrastes visuales** (b/d, p/q, m/n, inversiones como "los/sol"). Así trabajas un patrón de error específico sin cambiar de nivel.

**Velocidad (bonus):** el tiempo de exposición empieza holgado y solo se acorta en el "modo turbo" opcional, que da estrellas rayo. No afecta el nivel.

### 4.3 Comprensión lectora (COMP)

El **nivel** define la dificultad y el **tramo** define el tema y el vocabulario del texto. Un texto de nivel 7 tiene una versión para cada tramo; por ejemplo, el mismo tipo de pregunta sobre un pudú (2°–3°) o sobre un skater (6°–7°).

| Nivel | Qué trabaja | Ejemplo |
|---|---|---|
| 1 | Palabra → imagen (sustantivos concretos) | "perro" → 🐕 |
| 2 | Palabra → imagen con distractor parecido | "pato" entre pato, gato, plato |
| 3 | Oración simple → imagen | "El niño come pan." |
| 4 | Oración con negación o ubicación | "El gato **no** está **sobre** la mesa." |
| 5 | Instrucción escrita de 1 paso | "Toca la estrella azul." |
| 6 | Instrucción escrita de 2 pasos | "Toca la estrella y después el sol." |
| 7 | Texto de 2–3 oraciones, preguntas literales | ¿Qué comió? ¿Dónde estaba? |
| 8 | Texto de 2–3 oraciones, inferencia simple | ¿Cómo se sentía? ¿Por qué? |
| 9 | Texto de 4–6 oraciones, literal + inferencial | — |
| 10 | Texto de 6–10 oraciones: idea principal, palabra por contexto | — |

### 4.4 Funciones ejecutivas (FE)

No tienen juegos propios. Se integran como "perillas" dentro de los motores (Fase 7). Cada perilla tiene 10 niveles.

| Función | Cómo se trabaja | Qué sube con el nivel |
|---|---|---|
| Memoria de trabajo | Recordar una secuencia de sílabas o palabras y luego elegirla | Largo de la secuencia (2 → 6); después, en orden inverso |
| Control inhibitorio | En *Crash*: tocar solo lo correcto | Más distractores, más parecidos al objetivo (b/d) |
| Flexibilidad cognitiva | La regla cambia en medio del juego ("ahora toca las que tienen **d**") | Cambios más frecuentes y sin aviso visual |
| Atención sostenida | Bloques largos con pocos objetivos | Duración del bloque (1 → 4 min), objetivos más escasos |

### 4.5 Patrones de error que se registran

- Confusión b/d, p/q y m/n
- Omisión de la segunda consonante en trabadas (plato → pato)
- Inversiones (pla → pal, los → sol)
- Sustitución entre sonidos parecidos (p/b, t/d, f/v, k/g)
- Lexicalización de pseudopalabras (cafa → casa)
- Omisión o adición de sílabas

---

## 5. Arquitectura (qué hay en cada carpeta)

```
juegos-dislexia/
├── content/          Bancos de palabras y textos (archivos JSON que puedes editar)
│   ├── conciencia-fonologica/nivel-01.json …
│   ├── decodificacion/nivel-01.json …
│   ├── comprension/…
│   └── funciones-ejecutivas/…
├── mundos/           Un "paquete" por mundo: dibujos + configuración (colores, disfraces)
├── src/
│   ├── engine/       El "cerebro" común: nivel adaptativo, rotación de juegos,
│   │                 registro de respuestas y retroalimentación
│   ├── games/        Los motores: basket/, crash/, turbo/
│   ├── profile/      Perfil del niño: avatar, monedas, logros
│   ├── panel/        Tu panel (con PIN): pacientes, métricas, editor, informes
│   ├── audio/        Reproduce tus grabaciones; usa voz sintética solo de respaldo
│   └── data/         Guardado local (IndexedDB) y respaldo cifrado
└── docs/             Estos documentos
```

### Dónde viven los datos
- **Todo queda en el aparato** (tu computador o la tablet de la casa). No se usa ningún servidor.
- **Flujo con la tablet de la casa:**
  1. En tu computador exportas el perfil del niño con su plan de tarea. Queda un archivo cifrado con contraseña.
  2. La familia lo importa en la tablet.
  3. El niño juega en casa.
  4. La familia exporta el resultado y te lo manda.
  5. Tú lo importas y se suman las métricas.
- **Audio:** cada estímulo tiene un id (por ejemplo `dec-03-casa`). Tu grabación se guarda con ese nombre, ya sea con la grabadora del panel o como archivo `audio/dec-03-casa.mp3`. Si falta, usa la voz sintética, excepto en pseudopalabras y fonemas aislados, que **siempre** requieren grabación.
- **Contenido nuevo** generado por mí → `"revisado": false`. En el editor verás un filtro "pendientes de revisar".
- **Preparado para el futuro:** si algún día se quieren cuentas o sincronización, solo se cambia la capa `src/data/`.

### Sesiones
- Duran entre 10 y 15 minutos (configurable por paciente).
- Rotan de juego cada 3–4 minutos, priorizando los objetivos que asignaste.
- Si es tarea para la casa, tiene límite de tiempo diario y la app se cierra amablemente: "¡Listo por hoy! Vuelve mañana."

---

## 6. Formato del contenido (ejemplo)

```json
{
  "objetivo": "decodificacion",
  "nivel": 3,
  "titulo": "Palabras CV-CV frecuentes",
  "estimulos": [
    {
      "id": "dec-03-casa",
      "texto": "casa",
      "silabas": ["ca", "sa"],
      "estructura": "CV-CV",
      "tipo": "palabra",
      "frecuencia": "alta",
      "imagen": "arasaac:PENDIENTE",
      "revisado": false
    }
  ]
}
```

Hay ejemplos reales en `content/`.

---

## 7. Lo que queda pendiente de ti

1. Elegir el **nombre** de la plataforma y de los juegos.
2. Aprobar, cambiar o quitar **mundos** de la lista.
3. Revisar las **tablas de niveles** (sección 4): orden, ejemplos y si falta o sobra algo.
4. Revisar los archivos de ejemplo de `content/`, que están marcados `"revisado": false`.
