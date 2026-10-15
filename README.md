# Ruta Lectora

Juegos terapéuticos para niños con dislexia (1° a 6° básico). Uso personal y clínico, no comercial.
Mascota: el **Kiltro**.

- Funciona en el navegador (prioridad: **Mac e iPad**), se instala como app y funciona sin conexión.
- **Todos los datos quedan en el aparato.** No hay servidor de datos. Vercel solo publica el programa.
- Las decisiones clínicas las toma la fonoaudióloga. Todo contenido nuevo queda con `"revisado": false`.

## Dirección publicada

**https://ruta-lectora-kappa.vercel.app**

Para instalarla en el iPad o iPhone: abrir la dirección en **Safari** → Compartir → **Agregar a pantalla de inicio**.
En el Mac: en Safari, menú Archivo → **Agregar al Dock**; en Chrome, el ícono de instalar en la barra de direcciones.
Después de abrirla una vez, funciona sin internet.

La dirección no aparece en Google (está marcada como no indexable). No se activó Vercel Analytics, para no
registrar visitas.

## Documentos

| Archivo | Qué contiene |
|---|---|
| `docs/01-diseno.md` | Diseño general (Fase 1): capas, regla adaptativa, mundos, tablas de niveles |
| `docs/02-fase-2-basket.md` | Fase 2: cómo funciona una sesión y Basket, y lo que se decidió |
| `docs/03-crash-y-turbo.md` | Crash, Turbo, colores de p/b/d y 6° básico |
| `docs/estilos-por-tramo.html` | Colores y letra de cada tramo |

## Fases

1. ✅ Diseño
2. ✅ Motor base + Basket, con selección por curso y presentación de palabras
3. ✅ Turbo (modo voz alta con marcación de la fono, y modo "elige la palabra") *(a probar por Fran)*
4. ✅ Crash *(a probar por Fran)*
5. Evaluación inicial de ubicación
6. Panel de la fonoaudióloga, respaldo e informes PDF
7. Comprensión y funciones ejecutivas en las mecánicas
8. Recompensas, avatar y misiones

## Para programar (Gonza)

Se necesita Node.js LTS. **Lo más fácil en Windows: doble clic en `iniciar.cmd`.**

En PowerShell, `npm` puede fallar con "la ejecución de scripts está deshabilitada". En ese caso
usa `npm.cmd` en vez de `npm` (por ejemplo `npm.cmd run dev`).

```bash
npm install        # la primera vez
npm run dev        # abre la app en http://localhost:5173
npm test           # pruebas automáticas (contenido, regla adaptativa, consignas)
npm run build      # versión final en dist/
```

Para probar en el iPad dentro de la misma red wifi: `npm run dev` muestra una dirección
`http://192.168.x.x:5173`; ábrela en Safari del iPad. (Para *instalarla* como app hace falta https,
o sea, la versión publicada en Vercel.)

### Carpetas

```
content/          Bancos de palabras (JSON editables). content/decodificacion/nivel-NN.json
src/engine/       Regla adaptativa, carga de contenido, análisis de sílabas
src/games/comun/  Lo compartido: reglas/consignas, velocidades, pantalla de juego, etiquetas
src/games/basket/ Basket (escena Phaser)
src/games/crash/  Crash (escena Phaser)
src/games/turbo/  Turbo (React)
src/sesion/       Elegir curso y contenido, presentación de palabras, sesión
src/panel/        Ajustes (letra, colores de p/b/d y sonido)
src/data/         Guardado local (IndexedDB)
src/ui/           Estilos por tramo, colores de letras, Kiltro, logo
mundos/           (Fase futura) paquetes de dibujos por mundo
public/audio/     (Fase futura) grabaciones, un archivo por id de estímulo
```

### Publicar en Vercel

Ya está conectado: repositorio privado `gonzalolavin99/ruta-lectora` → proyecto `ruta-lectora` en Vercel.
Cada `git push` a `main` publica una versión nueva en unos segundos. Los encabezados de seguridad y
caché están en `vercel.json`.

**Privacidad:** el repositorio nunca debe tener datos de pacientes. Si se prueba, usar perfiles inventados.
