# Divina Inspiración — Productora Boutique &amp; Consultora de Eventos

Sitio institucional de una sola página, construido con **HTML, CSS y JavaScript vanilla**
(sin frameworks, sin paso de build, sin dependencias). Replica la estructura y los
contenidos del sitio original con un sistema visual propio en tonos **vino, dorado y marfil**,
accesibilidad **WCAG AA** y **tres niveles de intensidad visual** configurables desde el HTML.

---

## 1. Puesta en marcha

El sitio es estático: alcanza con abrir `index.html` en el navegador.

```bash
# Opción A — servidor local (recomendado, evita restricciones de file://)
npx serve .
# o
python -m http.server 8080
```

Luego visitá `http://localhost:8080`.

**Requisitos:** cualquier navegador moderno (Chrome, Edge, Firefox o Safari 16.4+).
La paleta se construye con `color-mix()` y `text-wrap: balance`, así que hace falta
Safari 16.4 o superior; en versiones anteriores los colores derivados no se resuelven.
No requiere Node.js, npm ni compilación.

---

## 2. Estructura de archivos

```
.
├── index.html                     # Documento completo: head con SEO, secciones y sprite SVG
├── manifest.webmanifest           # Manifiesto PWA
├── robots.txt
├── README.md
├── scripts/
│   └── generar-galeria.py         # Herramienta de desarrollo: optimiza las fotos y
│                                  # regenera assets/js/galeria-data.js
└── assets/
    ├── css/
     │   └── styles.css             # 21 bloques numerados: tokens, componentes, responsive
    ├── js/
    │   ├── main.js                # 14 secciones comentadas, IIFE en modo estricto
    │   └── galeria-data.js        # GENERADO: portada + items de las 7 categorías
    ├── images/
    │   ├── deborah-perfil.jpg/.webp
    │   ├── equipo-2026.jpg/.webp
    │   ├── novios-suiza.jpg/.webp
    │   ├── novias-exclusivo.jpg/.webp
    │   ├── icon-bendito-espejo.png
    │   ├── favicon-32.png · apple-touch-icon.png
    │   ├── icon-192.png · icon-512.png · og-image.png
    │   └── galeria/<categoría>/      # Salida del script: NN.jpg/.webp, NN-thumb.jpg/.webp, portada.jpg/.webp
    └── gallery/<carpeta>/            # FOTOS ORIGINALES (la fuente). No se borran ni se mueven.
        ├── 15-anos/ · bodas/ · artistas/ · corporativos/ · docencia/
```

Las imágenes se sirven con `<picture>`: la fuente **WebP** (≈37 % más liviana) y el **JPEG/PNG**
como respaldo. El `.webp` se deriva del nombre del archivo, así que los dos tienen que existir
siempre: si el `.webp` falta, el navegador **no** cae al `<img>` y la imagen queda rota.
`scripts/generar-galeria.py` se encarga de escribirlos parejos.

---

## 3. Secciones de la página

| Ancla | Sección | Contenido |
|---|---|---|
| `#inicio` | Hero | Propuesta de valor, dos CTAs y tres indicadores (12 años, 150+ eventos, +3 años de docencia) |
| `#productora` | La Productora | Ficha de Deborah Núñez con 5 credenciales y foto del equipo |
| `#servicios` | Áreas de Especialidad | Pilar 01 Producción (5 tarjetas, Bendito Espejo destacada) |
| `#asesorias` | Pilar 02 Consultoría | Etapas del cliente + panel de política de cupos |
| `#academia` | Pilar 03 Academia | 3 tarjetas de formación |
| `#galeria` | Galería | Mosaico de 7 categorías con fotos reales que abren un único visor (o el aviso *Próximamente*) |
| `#testimonios` | Testimonios | Carrusel de 12 reseñas con puntos, flechas, swipe y autoplay (6 s) |
| `#contacto` | Contacto | Formulario validado que deriva a WhatsApp |

Además: modal de **Bendito Espejo** y **visor de galería** (navegación por teclado, swipe,
tira de miniaturas y estado vacío con acceso a WhatsApp) y botón flotante de WhatsApp.

---

## 4. Intensidad visual

El atributo `data-intensity` del elemento `<html>` controla los efectos ornamentales.
**No hay control en la interfaz:** el nivel se cambia editando ese atributo en `index.html`
y el sitio arranca siempre en el valor que declare el HTML (por defecto `max`).

| Nivel | `data-intensity` | Qué cambia |
|---|---|---|
| Sutil | `sutil` | Sin degradés, texturas, brillos ni parallax. Máxima legibilidad. |
| Media | `media` | Degradé en botones, sombras ampliadas, separadores con rombo. |
| **Máxima** | `max` *(por defecto)* | Todo lo anterior **más** grano, monograma `DI` de fondo, resplandor dorado, barrido en botones, filigranas, parallax (12 px), pulso del FAB y Footprint de categorías. |

En CSS cada nivel redefine un mismo juego de variables, así que el resto de la hoja no cambia:

```css
html[data-intensity="max"] {
  --gradiente-boton: linear-gradient(135deg, var(--vino), var(--vino-luz) 48%, var(--vino-profundo));
  --textura: 0.045;      /* grano */
  --monograma: 0.055;    /* "DI" gigante de fondo */
  --parallax: 12px;      /* tope del desplazamiento */
  --pulse-fab: pulse-wa 2.6s ease-in-out infinite;
}
```

Para cambiar el nivel, editá el atributo en `index.html`:

```html
<html lang="es-AR" data-intensity="max">
```

---

## 5. Cargar contenido (galería, equipo, testimonios)

El contenido editable vive en `assets/js/main.js` (equipo y testimonios) y en
`assets/js/galeria-data.js` (los medios de la galería, que se genera con un script).

### 5.1 Galería

La galería tiene dos fuentes de datos que `main.js` fusiona al arrancar:

| Dónde | Qué aporta | Quién lo escribe |
|---|---|---|
| `GALERIA` en `assets/js/main.js` | `titulo` e `icono` de cada categoría | a mano |
| `window.DI_GALERIA` en `assets/js/galeria-data.js` | `portada` e `items` (los medios) | `scripts/generar-galeria.py` |

`index.html` carga `galeria-data.js` **antes** que `main.js` (ambos con `defer`). La fusión es
defensiva: si el archivo falta, no se cargó o le falta una clave, esa categoría queda vacía y
sigue mostrando la píldora *Próximamente* y el aviso del visor. No se rompe nada ni se dispara
un error de consola.

#### Flujo para agregar fotos

1. Copiar la foto a la carpeta de origen que le corresponde (tabla de mapeo más abajo).
2. Ejecutar el generador:

   ```bash
   python scripts/generar-galeria.py
   ```

   Es idempotente: regenera todo, no duplica nada y nunca borra los originales.
   Al terminar imprime una tabla con categoría, cantidad de fotos, portada elegida y peso.

3. Recargar el sitio. No hay paso de build: `assets/images/galeria/` y
   `assets/js/galeria-data.js` ya están served como archivos estáticos.

> El script necesita **Python 3 con Pillow** (`python -m pip install Pillow`), sólo para
> generar. El sitio en sí no depende de Python ni de ninguna otra herramienta.

#### Mapeo de carpetas → categorías

| Carpeta de origen | Clave de `GALERIA` | Título |
|---|---|---|
| `assets/gallery/15-anos/` | `quinceanos` | 15 Años |
| `assets/gallery/bodas/` | `bodas` | Bodas |
| `assets/gallery/novias/` | `novias` | Exclusivo Novias y Asesorías |
| `assets/gallery/artistas/` | `prensa` | Prensa |
| `assets/gallery/espejo/` | `espejo` | Bendito Espejo |
| `assets/gallery/corporativos/` | `corporativos` | Corporativos |
| `assets/gallery/docencia/` | `docencia` | Docencia y Formación |

Una carpeta inexistente deja la categoría vacía (aparece *Próximamente*). Hoy `espejo/` no
existe: queda vacía a propósito. `novias/` tampoco existe, así que el script usa
`assets/images/novias-exclusivo.jpg` como único item de esa categoría.

Detalles que resuelve el generador:

- **Orden**: natural por nombre (`xv-2` antes que `xv-10`) y numerado de salida `01`, `02`, …
- **Formatos**: si un nombre existe en `.jpg` y en `.webp`, se procesa sólo el `.jpg` (el
  `.webp` es su derivado) para no contar la misma foto dos veces.
- **Limpieza**: se ignoran los archivos que no son imagen, se descartan los duplicados
  exactos (sha256), se corrige la orientación EXIF y se eliminan los metadatos, incluida la
  geolocalización GPS.
- **Tamaños**: `NN` hasta 1600 px de lado mayor (nunca agranda), `NN-thumb` hasta 480 px para
  la tira de miniaturas del visor, `portada` a 1200 px de ancho recortada a la proporción de
  la tarjeta. JPG progresivo calidad ~82 y WebP calidad ~80.
- **Elección de portada**: las tarjetas de 2 columnas (`quinceanos`, `bodas`) y la banda
  ancha (`docencia`) prefieren una foto horizontal de proporción ≥ 1,3; las de 1 columna
  (`novias`, `prensa`, `espejo`, `corporativos`) prefieren una vertical o cuadrada. Si
  ninguna cumple, se usa la primera.

#### Cambiar la portada de una categoría

La portada es la foto de fondo de la tarjeta. El script elige una sola automáticamente; para
fijarla a mano, editá el `portada` en `assets/js/galeria-data.js`:

```js
docencia: {
  portada: 'assets/images/galeria/docencia/portada.jpg',   // ← cambiar acá
  portadaW: 900,
  portadaH: 474,
  items: [ /* … */ ]
}
```

El `.webp` se deriva del nombre, así que tiene que existir el par. Ojo: al volver a ejecutar
`generar-galeria.py` la elección automática **pisa** la portada manual. Para que una carpeta
pase a tener una portada propia, conviene agregar el original que se quiera usar y revisar la
columna *Portada* de la tabla que imprime el script.

#### Textos alternativos (alt)

El generador escribe un alt por defecto `'<título de la categoría> — foto N'`
(por ejemplo `'15 Años — foto 1'`). Para mejorarlos hay dos formas:

1. **Recomendado** — cambiar los alt en `scripts/generar-galeria.py` (la línea que arma
   `"%s — foto %d"`) y volver a ejecutar. Es el único lugar permanente: `galeria-data.js`
   se reescribe por completo en cada corrida, así que lo que se edite a mano en el
   `.js` se pierde la próxima vez que se ejecute el generador.
2. Si sólo querés cambiar el **título** que se antepone a todos los alt, editar la tupla
   `CATEGORIAS` del mismo script. Eso regenera los alt y vuelve a elegir las portadas.

#### Agregar videos

El visor ya soporta videos: alcanza con sumar el objeto a `items` **en `main.js`** (el
generador no los produce).

```js
items: [
  { tipo: 'foto',  src: 'assets/images/galeria/bodas/01.jpg', thumb: '…/01-thumb.jpg', alt: 'Novios en la ceremonia' },
  { tipo: 'video', src: 'assets/video/bodas/boda-01.mp4',
    thumb:  'assets/images/galeria/bodas/boda-01-thumb.jpg',   // miniatura de la tira
    poster: 'assets/images/galeria/bodas/boda-01-poster.jpg',  // fotograma de carga
    alt: 'Video del primer baile' }
]
```

El `<video>` del visor se arma solo; la miniatura recibe la insignia de play y el contador
pasa a `"3 fotos · 1 video"`. La imagen del `poster` conviene sacarla del mismo video (un
fotograma) y pasarla por el generador para tener su `.webp` parejo.

#### Estados del render

- Una categoría **con medios** muestra la portada de fondo, el contador
  (`"3 fotos · 1 video"`) y abre el visor en la primera pieza.
- Una categoría **sin medios** muestra la píldora *Próximamente* y, al abrirla, el
  visor presenta el aviso funcional:
  *«Muy pronto sumamos fotos y videos reales de esta área.»*
- El mosaico se arma por posición, así que el layout no hay que tocarlo:
  fila 1 → 2 tarjetas de 2 columnas, fila 2 → 4 de 1 columna, fila 3 → 1 de 4 columnas.
- El visor acepta teclado (`←` `→` `Esc`), swipe horizontal y clic en la tira de
  miniaturas. Precarga los medios vecinos para que el avance sea instantáneo.


### 5.2 Equipo

```js
const EQUIPO = [
  { nombre: 'Deborah Núñez', rol: 'Dirección Ejecutiva',
    foto: 'assets/images/deborah-perfil.jpg', webp: 'assets/images/deborah-perfil.webp' }
];
```

Las dos fotografías de la sección *La Productora* están marcadas en el HTML. `EQUIPO` queda
disponible para ampliar la sección con más miembros.

### 5.3 Testimonios

```js
const TESTIMONIOS = [
  {
    texto: 'Reseña del cliente, sin comillas…',
    autor: 'Pablo Ceballos',
    detalle: 'Papá de Cami (15 años)',   // se muestra tal cual, con o sin paréntesis
    fuente: 'Instagram'                  // 'Instagram' | 'Casamientos.com.ar'
  }
];
```

Las 12 reseñas se renderizan en un **carrusel** (`#reviewsTrack` dentro de `#reviewsViewport`):
mueve el bloque con `transform`, calcula cuántas reseñas entran por pantalla y arma un botón de
punto por grupo. La cantidad por pantalla queda entre `POR_PANTALLA_MOVIL` (1) y
`POR_PANTALLA_DESKTOP` (3), cerca del inicio de `initTestimonios()`.

- Orden vertical de cada tarjeta: estrellas, texto (con la comilla dorada de apertura aportada
  por el CSS de `.review-text`), línea de fuente y fila del autor (avatar con la inicial, nombre
  y detalle).
- La línea de fuente se arma en el render como `'Reseña verificada en ' + fuente`, con
  `--dorado-texto` (AA sobre la tarjeta clara).
- Todos los textos entran por `textContent`; no se usa `innerHTML` con datos.
- La fila del autor lleva `margin-top: auto` y el track estira las tarjetas (`align-items:
  stretch`): las filas de autores quedan alineadas al pie en todas las tarjetas visibles.
- Autoplay de 6 s (`REPRODUCCION_AUTO_MS`). Se pausa al pasar el mouse, al enfocar el carrusel,
  al ocultar la pestaña y con `prefers-reduced-motion` (que lo desactiva por completo). No hay
  botón de pausa: en la primera interacción del usuario (flecha, punto, teclado o swipe) el
  autoplay se detiene **para siempre** y el carrusel pasa a control manual.
- Navegación con flechas del teclado (`←`, `→`, `Home`, `End`) y swipe táctil.
- Los puntos son `<button>` con `aria-label="Ir al grupo de reseñas N"`; el activo lleva
  `aria-current`. El viewport tiene `role="region"`, `aria-roledescription="carrusel"` y
  `aria-label="Testimonios"`.
- Las tarjetas fuera de pantalla quedan con `aria-hidden` e `inert`, fuera del orden de tabulación.
- `initReveal` se corre **después** de `initTestimonios` para que el viewport quede observado.

---

## 6. Formulario de consulta

El formulario valida en el cliente y deriva a WhatsApp con el mensaje armado y
codificado con `encodeURIComponent`.

- **Campos obligatorios:** nombre (mín. 2 caracteres), teléfono (mín. 8 dígitos) y tipo de evento.
- Los valores se **sanean** (se eliminan etiquetas HTML y se colapsan espacios).
- Los errores se muestran debajo del campo, con `aria-invalid`, `aria-describedby` y foco
  al primer campo con problema.
- Los resultados se anuncian con `role="status"` y `aria-live="polite"`.
- El botón se bloquea durante el envío y vuelve a su estado original a los 4 s.

Para activar un envío por HTTP en lugar de sólo abrir WhatsApp, asigná la URL en la constante
`apiEndpoint` (línea ~214 de `main.js`):

```js
const apiEndpoint = null;              // 'https://tu-api.com/leads'
```

Con valor no nulo el sitio hace `POST` en JSON
(`nombre`, `telefono`, `tipo`, `detalles`, `origen`) y sólo entonces abre WhatsApp; si la
petición falla, muestra un aviso y rehabilita el botón.

**Datos de contacto:** WhatsApp `+54 9 351 225-946` (`WHATSAPP_NUMBER`) e Instagram
`@d.inspiracioneventos`.

---

## 7. Accesibilidad

- `lang="es-AR"`, un solo `<h1>` y jerarquía de encabezados sin saltos.
- Skip link al contenido principal y foco visible con `:focus-visible`.
- Dos capas modales (visor de galería y Bendito Espejo) con `role="dialog"`,
  `aria-modal`, `aria-hidden`, cierre con `Escape` y trampa de foco. El `visibility`
  del overlay cambia de golpe al abrir (no se transiciona) para que el foco entre
  en el mismo frame en que se muestra.
- Menú móvil con `aria-expanded`/`aria-controls`, bloqueo de scroll y cierre con `Escape`.
- Scroll spy con `IntersectionObserver` que marca `aria-current` en el enlace activo.
- Revelado progresivo por `IntersectionObserver` (si no hay soporte, todo se muestra).
- `prefers-reduced-motion` desactiva transiciones, animaciones, parallax y autoplay.
- `prefers-contrast: more` refuerza bordes y colores de texto.
- Contraste verificado **AA** en texto normal (≥ 4.5:1) y en texto grande (≥ 3:1).
- Etiquetas ARIA en todos los iconos decorativos (`aria-hidden`) y en los botones de sólo icono.

---

## 8. Rendimiento y SEO

- Sin frameworks ni dependencias; **un** archivo CSS y **uno** JS (`defer`).
- Imágenes en WebP con respaldo, `loading="lazy"` y `decoding="async"` salvo la primera foto.
- Fuentes de Google con `preconnect` y `display=swap`; títulos en Playfair Display, texto en Jost.
- Barrido dorado en los botones sólo en nivel máximo, y sólo al pasar el mouse.
- `IntersectionObserver` para revelado, parallax, contadores y spy: sin listeners de scroll por
  elemento.
- SEO completo: `title`, `description`, canonical, keywords, Open Graph, Twitter Card y JSON-LD
  `EventPlanner` con `founder`, `areaServed`, `makesOffer` y `contactPoint`.
- `manifest.webmanifest`, `robots.txt`, favicon, apple-touch-icon e imagen OG de 1200×630.

---

## 9. Personalización rápida

**Colores** — al principio de `assets/css/styles.css`, bloque `:root`. La paleta se divide
en cinco anclas, una base y sus derivados:

```css
/* Anclas: no se derivan. Son la identidad y el resto sale de mezclarlas. */
--vino: #7c1f2d;          --vino-profundo: #4f1420;   /* footer y botones de vino */
--dorado: #c19a4b;       --dorado-luz: #e4cd97;      /* botones dorados */
--whatsapp: #25d366;                                    /* verde de marca, intocable */

/* Base: fondos, tinta y texto */
--marfil: #fdf9f4;       --champagne: #f6ebdc;       --rosa-polvo: #f3e2e0;
--tinta: #3b1018;        --texto: #5a4347;            --texto-suave: #7a6468;
--dorado-texto: #7d5a1c; --rosa-antiguo: #b86b77;     --borde: #e8d8c8;
```

Sobre ellos se derivan el resto, con `color-mix()` para que ningún color quede escrito a
mano fuera de `:root`: `--vino-logo`, `--vino-luz`, `--vino-noche`, `--sombra`,
`--texto-etapa`, `--placeholder`, `--dorado-claro`, `--borde-dorado`, `--borde-tenue`,
`--line`, `--line-media`, `--line-dorada`, `--line-dorada-tenue`, `--whatsapp-oscuro` y
`--whatsapp-claro`. `--vino-noche` y `--sombra` son el tinte de los velos y las sombras:
se mantienen cerca del negro con matiz vino, nunca gris neutro.

Reglas para tocar la paleta:

- **Anclas:** cambiar `--vino`, `--vino-profundo`, `--dorado`, `--dorado-luz` o `--whatsapp`
  se propaga a todo el sitio. El footer y los botones dorados dependen de ellas.
- **Fuera de `:root`:** todo color va como `var(--token)` o `color-mix(in srgb, var(--token) N%, transparent)`.
  No se admiten literales: las sombras, velos y degradados se derivan de los tokens.
- **`--mascara`:** negro técnico, solo para las máscaras del sprite SVG y la impresión.
- **Fuera del CSS:** `manifest.webmanifest` (`background_color` replica `--marfil`,
  `theme_color` replica `--vino`) y el `<meta name="theme-color">` de `index.html` no pueden
  leer variables CSS, así que hay que actualizarlos a mano junto con `:root`.
- **Contraste:** `--texto`, `--texto-etapa`, `--texto-suave`, `--dorado-texto`, `--placeholder`
  y `--vino` superan AA (4,5:1) sobre `--marfil`, `--champagne` y `--rosa-polvo`. El texto
  claro sobre foto depende del velo `--vino-noche`: si se aclara, hay que volver a medirlo.
- Los dos tonos de estado `--exito` y `--error` son literales, y también el verde de WhatsApp
  y su familia, que son colores funcionales y no forman parte de la paleta decorativa.

**Iconos** — sprite SVG al final de `index.html`. Cada símbolo es un `<symbol id="i-…">` y se
usa con `<use href="#i-…">`. Ya están definidos: anillos, corona, maletín, micrófono/prensa,
espejo de mano, birrete, diamante, cámara, brújula, WhatsApp, Instagram, check, flecha,
chevrones, estrella, barras y cierre.

**Ancho máximo** — `--container: 1200px`; **alto del header** — `--header-alto: 86px`.

**Ritmo vertical** — un solo token gobierna el padding de todas las secciones:

```css
--section-y: clamp(44px, 5.5vw, 76px);   /* 76px a 1440px y más; 44px en móvil */
```

Reglas que lo consumen:

- `.section { padding-block: var(--section-y) }`; hero y footer usan variantes.
- `.section + .section` y `.hero + .section` recortan 8 px para que el ritmo no se dispare.
- `.section--continua` (servicios → galería → testimonios) reduce el padding superior
  a `clamp(34px, 3.4vw, 52px)` porque el fondo champagne es compartido: los tres bloques
  se leen como una sola banda. Testimonios lo recuperó al volver al carrusel sobre la
  banda champagne original.
- `.pilar + .pilar` mantiene 44 px entre los tres pilares de servicios.
- Los `> :first-child` y `> :last-child` de cada `.container` llevan `margin: 0`, así que
  ningún encabezado ni grilla suma espacio extra al de su sección.
- `.separator` es `position: absolute` con `height: 0`: la línea decorativa no
  participa del cálculo de altura.
- En `max-width: 700px`, `--section-y` baja a `44px`.

Para ajustar el aire de toda la página, alcanza con tocar `--section-y`.

---

## 10. Verificación realizada

- `node --check assets/js/main.js` — sintaxis válida.
- Llaves CSS balanceadas y sin selectores huérfanos.
- Las clases del HTML tienen regla en la hoja de estilos.
- Los IDs consultados por JavaScript existen en el documento.
- Las referencias a iconos resuelven dentro del sprite.
- Los assets referenciados por HTML y JS existen en disco.
- HTML semántico: un `<h1>`, jerarquía sin saltos, canonical, JSON-LD y 2 diálogos accesibles.

**Comportamiento del sitio (navegador real, seis anchos: 1920 / 1440 / 1280 / 1024 / 768 / 390)**

- 0 errores de consola y de red; 0 scroll horizontal.
- Mosaico de galería: 4 columnas con filas `[2, 4, 1]` desde 1024 px; 2 columnas en 768 px;
  1 columna en 390 px. Ninguna tarjeta se solapa ni se sale de la grilla.
- Las 7 categorías arrancan vacías: la tarjeta muestra *Próximamente* y el aviso
  funcional del visor entra completo en la ventana en los seis anchos.
- Con medios inyectados en caliente, el visor abre `1 / 3`, decodifica la imagen con
  altura real y ubica la figura entre la barra y la tira de miniaturas.
- Ritmo vertical medido entre bloques de contenido:
  1440 px → `145 · 144 · 126 · 126 · 145 · 144`; 768 y 390 px → `79–81`.
  Servicios, galería y testimonios forman una banda champagne continua.
- Testimonios: carrusel con las 12 reseñas, 3 por pantalla en escritorio (1 en móvil),
  puntos por grupo, autoplay de 6 s que se pausa al hover/enfoque y se apaga para siempre
  al primer clic, tecla o swipe, flechas y swipe;
  cada tarjeta lleva su línea "Reseña verificada en …" y sin rastro de la grilla
  estática anterior.

---

© 2026 Divina Inspiración · Dirección General: Deborah Núñez ·
Villa Carlos Paz, Valle de Punilla, Córdoba, Argentina.
