# La Puerta Abierta — contexto del proyecto

Sitio estático (HTML/CSS/JS vanilla, sin build ni frameworks) de referencia
católica: versículos, meditación diaria, año litúrgico, oraciones (con
Rosario interactivo), santos y salmos. Autoría del contenido: Emir Segovia.
Repo: **https://github.com/Apache90/webiglesia** (rama `main`).

Este archivo existe para que una sesión nueva de Claude (sin memoria de las
conversaciones anteriores) pueda retomar el trabajo rápido, leyendo el
código en vez de tener que redescubrir decisiones ya tomadas.

## Estructura

```
index.html          markup, un solo archivo, app-shell (appbar + main + tabbar)
css/styles.css       todos los estilos, un solo archivo
js/data.js           datos: VS, CARDS, LITURGIA, ORACIONES, MISTERIOS_ROSARIO,
                     SANTOS_DESTACADOS, SANTOS, SALMOS
js/app.js            toda la lógica de render e interacción
manifest.json        PWA manifest (instalable)
assets/icons/        íconos de la app (favicon, apple-touch, PWA)
assets/img/santos/   imágenes de santos ya procesadas (sin texto quemado, .webp)
assets/referencias/  arte original de santos con texto quemado (NO usar en el sitio,
                     solo referencia de estilo para generar nuevas imágenes)
```

No hay build step. Se sirve directo (`python -m http.server` para probar local).

## Identidad visual

- Paleta oscura dorado/negro (`--bg:#0a0800`, `--gold:#c9a84c`, etc. en `:root`)
- Tipografías: `Cinzel` (títulos, small-caps look), `Crimson Text` (cuerpo),
  `IM Fell English` (citas/versículos, itálica)
- El nombre del sitio y su cita insignia (Apocalipsis 3,20 — "estoy a la
  puerta y llamo") son un tema visual recurrente: la sección "Cómo abrir la
  Palabra" en Liturgia usa una metáfora de puertas que se abren (giro 3D)
  precisamente por esto. Si se agregan más features "de descubrimiento",
  considerar si esa metáfora encaja antes de inventar una nueva.
- Patrón de interacción dominante: **plegado/acordeón** (`.sec-head` +
  `.sec-body`, clase `.open`, función `togSec()`). Todas las 6 secciones
  principales son plegables, la primera (Versículos) arranca abierta.
- Patrón secundario: **flip-card 3D** (`perspective` + `rotateY` +
  `backface-visibility:hidden`), usado en Meditación (una tarjeta), Santos
  (galería) y respeta `prefers-reduced-motion` con fallback a opacity.

## Las 6 secciones (tabbar inferior)

1. **Versículos** (`#vs`) — acordeón agrupado por estado de ánimo (VS array)
2. **Meditación** (`#md`) — flip-card única con filtro + mezclar (CARDS array)
3. **Liturgia** (`#li`) — 3 partes:
   - Widget "Hoy en la Liturgia": calcula tiempo litúrgico, color y ciclos
     del Leccionario (A/B/C, I/II) **en vivo, sin fechas fijas**
   - "Cómo abrir la Palabra": 5 puertas que giran en 3D con pasos de lectura
   - "Tiempos del año litúrgico": acordeón (LITURGIA array), con fechas
     móviles (Ceniza, Pascua, Pentecostés, Adviento) calculadas dinámicamente
4. **Oraciones** (`#or`) — oraciones clásicas (acordeón) + **Rosario
   interactivo**: 73 pasos generados programáticamente, detecta el misterio
   del día, cuentas que se van iluminando
5. **Santos** (`#sa`) — galería de flip-cards grandes (SANTOS_DESTACADOS,
   con imagen) + acordeón mensual (SANTOS)
6. **Salmos** (`#sl`) — acordeón con salmos completos (SALMOS)

## Motor de calendario litúrgico (importante, no reinventar)

En `app.js`: `easterDate(year)` calcula Pascua vía algoritmo de
Meeus/Jones/Butcher. De ahí se derivan `adventStart()`, `baptismOfLord()`,
Ceniza, Semana Santa, Pentecostés, etc. `getLiturgicalToday()` devuelve
tiempo/color/detalle/ciclos para una fecha dada. `cicloDominical()` y
`cicloFerial()` calculan A/B/C y I/II. Todo esto es **autosuficiente para
siempre** — no hardcodear fechas de años específicos en ningún lado del
sitio; si hace falta mostrar "próximo Miércoles de Ceniza" u otra fecha
móvil, usar `proximaOcurrencia()` (ya existe) en vez de escribir un año a mano.

## Reglas de contenido bíblico (revisadas una vez, no repetir el trabajo)

Las citas de la Biblia en `VS`, `CARDS` y `SALMOS` fueron verificadas contra
**"El Libro del Pueblo de Dios"**, que es la traducción que usa la Biblia
del sitio oficial de la Santa Sede (vatican.va/content/bibbia/es.html) —
ver nota en el footer del sitio y comentario al inicio de `data.js`. No
volver a meter fragmentos de Reina-Valera/NVI u otras traducciones
protestantes al agregar versículos nuevos; si hay dudas sobre una cita,
buscar "[cita] libro del pueblo de dios" antes de escribirla.

El comentario HTML al inicio de `index.html` y `data.js` es un pedido del
autor (Emir Segovia) de no alterar contenido bíblico/litúrgico sin
autorización y no quitar la autoría. Respetarlo.

## Bugs ya resueltos (para no repetirlos)

- **Cards con `position:absolute` no crecen con el contenido.** El flip-card
  de Meditación se solucionó midiendo con `ResizeObserver` sobre `.front`/
  `.back` y seteando `height` explícito en el contenedor (`ajustarAlturaCard()`
  en `app.js`). Si se agrega otro flip-card con contenido de longitud
  variable, replicar este patrón, no asumir que el contenedor se ajusta solo.
- **Elementos con glow/resplandor tapados por el fondo opaco del hermano
  siguiente.** Cuando se usa un pseudo-elemento o div absoluto para un efecto
  de luz debajo de contenido con fondo propio, hace falta `z-index` explícito
  o el glow queda invisible (pasó en `.puerta-luz` y en el `.santo-flip`).
- **Progreso "congelado" en un paso que no cambia el estado visual** (ej.
  pasar de "Ave María 3/3" a "Gloria": las cuentas ya estaban en 3/3, así que
  avanzar un paso no se sentía como progreso). Cuando se agregue cualquier
  otro stepper/wizard, pensar si CADA paso cambia algo visible, no solo el
  texto — si no, agregar una señal extra (animación + texto), no asumir que
  alcanza con el state interno estar bien.
- Fuentes de Google (`Cinzel`/`Crimson Text`) cargan async — si algo mide
  `scrollHeight` al iniciar, puede quedar corto antes del font-swap. Usar
  `document.fonts.ready` y/o `ResizeObserver`, no solo un cálculo al cargar.

## Convenciones de código

- JS sin punto y coma opcional pero consistente, funciones cortas, sin
  build/transpile — debe correr tal cual en navegadores modernos.
- Nombres de funciones/variables en español, mezclado con inglés técnico
  cuando corresponde (ya es el estilo existente, mantenerlo).
- CSS: variables en `:root`, un solo archivo, bloques separados por
  comentarios `/* ===== Nombre ===== */`.
- Todo nuevo componente interactivo debe: respetar `prefers-reduced-motion`,
  ser accesible por teclado (o usar `<button>` nativo), y probarse con
  Playwright headless apuntando a Chrome instalado en
  `C:/Program Files/Google/Chrome/Application/chrome.exe` vía
  `playwright-core` (no está Playwright completo instalado, usar ese browser
  del sistema — patrón ya usado en toda la sesión anterior).

## Checklist pendiente (del usuario, no técnico)

- Nombre real de parroquia, WhatsApp, horarios — el sitio actual es
  "La Puerta Abierta" genérico, no el de comunidad-joven (proyecto anterior,
  descartado, no confundir si aparece en el historial de git o memoria).
- Revisión pastoral/teológica del contenido antes de publicar (pedido
  explícito del autor en el header del archivo).
