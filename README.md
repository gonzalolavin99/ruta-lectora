# Ruta Lectora

Juegos terapéuticos para niños con dislexia (2° a 7° básico). Uso personal y clínico, no comercial.
Mascota: el **Kiltro**.

- Funciona en el navegador (prioridad: **Mac e iPad**), se instala como app y funciona sin conexión.
- **Todos los datos quedan en el aparato.** No hay servidor de datos. Vercel solo publica el programa.
- Las decisiones clínicas las toma la fonoaudióloga. Todo contenido nuevo queda con `"revisado": false`.

## Documentos

| Archivo | Qué contiene |
|---|---|
| `docs/01-diseno.md` | Diseño general (Fase 1): capas, regla adaptativa, mundos, tablas de niveles |
| `docs/02-fase-2-basket.md` | Fase 2: cómo funciona Basket y lo que se decidió |
| `docs/estilos-por-tramo.html` | Colores y letra de cada tramo |

## Fases

1. ✅ Diseño
2. ✅ Motor base + perfil del niño + Basket *(esperando aprobación de Fran)*
3. Turbo (modo sesión y modo casa)
4. Crash
5. Evaluación inicial de ubicación
6. Panel de la fonoaudióloga, respaldo e informes PDF
7. Comprensión y funciones ejecutivas en las mecánicas
8. Recompensas, avatar y misiones

## Para programar (Gonza)

Se necesita Node.js LTS.

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
src/games/basket/ Juego Basket (escena Phaser + pantalla React)
src/profile/      Elegir jugador e inicio del niño
src/panel/        Zona de adulto con PIN
src/data/         Guardado local (IndexedDB) y PIN
src/ui/           Estilos por tramo, Kiltro, logo
mundos/           (Fase futura) paquetes de dibujos por mundo
public/audio/     (Fase futura) grabaciones, un archivo por id de estímulo
```

### Publicar en Vercel

1. Subir este repositorio a GitHub (privado).
2. En vercel.com → *Add New Project* → elegir el repositorio. Vercel detecta Vite solo
   (build `npm run build`, carpeta `dist`).
3. Cada `git push` publica una versión nueva.

**Privacidad:** el repositorio nunca debe tener datos de pacientes. Si se prueba, usar perfiles inventados.
