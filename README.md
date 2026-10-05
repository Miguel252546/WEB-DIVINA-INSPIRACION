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
│   ├── generar-galeria.py         # Herramienta de desarrollo: optimiza las fotos y
│   │                              # regenera assets/js/galeria-data.js
│   └── agregar-video.py           # Herramienta de desarrollo: recomprime los videos,
│                                  # arma poster + miniatura y regenera
│                                  # assets/js/galeria-videos.js
└── assets/
    ├── css/
     │   └── styles.css             # 21 bloques numerados: tokens, componentes, responsive
    ├── js/
    │   ├── main.js                # 14 secciones comentadas, IIFE en modo estricto
    │   ├── galeria-data.js        # GENERADO: portada + items de las 7 categorías
    │   └── galeria-videos.js      # GENERADO: los videos, fusionados sobre esas fotos
    ├── video/
    │   ├── videos.json            # FUENTE de los videos (la edita agregar-video.py)
    │   └── <categoría>/           # NN-slug.mp4, NN-slug.jpg/.webp, NN-slug-thumb.jpg/.webp
    │       bodas/ · espejo/ · novias/ · prensa/ · quinceanos/   # las 5 con videos (11)
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
| `#testimonios` | Testimonios | Carrusel de 12 reseñas con flechas laterales, puntos, swipe y autoplay (6 s) |
| `#contacto` | Contacto | Formulario validado que deriva a WhatsApp y tarjeta "Atención Directa vía WhatsApp" con botón **ESCRIBINOS** |

Además: modal de **Bendito Espejo** y **visor de galería** (navegación por teclado, swipe,
tira de miniaturas y estado vacío con acceso a WhatsApp) y dos botones flotantes, el de
WhatsApp y el de Instagram apilado encima. Ningún botón muestra el número de teléfono como
texto: los de WhatsApp dicen **ESCRIBINOS** (ver [sección 6](#6-formulario-de-consulta)).

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

El contenido editable vive en `assets/js/main.js` (equipo y testimonios) y en las dos
fuentes de la galería: `assets/js/galeria-data.js` (fotos, generado con un script) y
`assets/video/videos.json` (videos, generado con otro).

### 5.1 Galería

La galería tiene tres fuentes de datos que `main.js` fusiona al arrancar:

| Dónde | Qué aporta | Quién lo escribe |
|---|---|---|
| `GALERIA` en `assets/js/main.js` | `titulo` e `icono` de cada categoría | a mano |
| `window.DI_GALERIA` en `assets/js/galeria-data.js` | `portada` e `items` (las fotos) | `scripts/generar-galeria.py` |
| `window.DI_GALERIA_VIDEOS` en `assets/js/galeria-videos.js` | los videos, con su `poster` y su lugar en la lista | `scripts/agregar-video.py` |

`index.html` carga `galeria-data.js`, después `galeria-videos.js` y después `main.js`
(los tres con `defer`). La fusión es defensiva: si un archivo falta, no se cargó o
le falta una clave, esa parte queda vacía y la categoría sigue mostrando la píldora
*Próximamente* y el aviso del visor. No se rompe nada ni se dispara un error de
consola.

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
- **Marco blanco**: antes de recortar la portada se le quita el marco blanco de la foto
  (`quitar_margen_blanco`). Una banda sólo cuenta como marco si es blanca en *toda* su
  altura o en *todo* su ancho, así que el ruido del JPEG no engaña al recorte, y nunca se
  descarta más del 12 % de ese lado: un fondo de estudio claro o un vestido blanco que
  llegan al borde siguen intactos. Sólo afecta a la portada; los originales de
  `assets/gallery/` nunca se tocan. Con eso la portada de *15 Años* pasó de
  900×474 a **783×412** (proporción 1,90, igual que la tarjeta) y quedó sin el marco
  blanco; las otras seis categorías no cambian.

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

#### Videos en la galería

Los videos tienen su propia herramienta, `scripts/agregar-video.py`: recomprime el
archivo, le arma el poster y la miniatura, y deja la entrada escrita en
`assets/video/videos.json`. **No se editan a mano ni `main.js` ni
`assets/js/galeria-data.js`.**

```
pip install Pillow          # sólo para generar el poster y la miniatura
winget install Gyan.FFmpeg  # sólo para recomprimir y sacar fotogramas (opcional)

python scripts/agregar-video.py agregar "C:\Videos\boda.mp4" --categoria Bodas
python scripts/agregar-video.py agregar "boda.mov" --categoria Bodas --posicion 2
python scripts/agregar-video.py listar
python scripts/agregar-video.py mover  01-boda.mp4 --posicion 3
python scripts/agregar-video.py quitar 01-boda.mp4
```

Qué hace `agregar`, paso por paso:

| Paso | Resultado |
|---|---|
| Valida la extensión | `mp4`, `mov`, `m4v` o `webm` |
| Detecta duplicados | por hash del contenido: el mismo clip con otro nombre tampoco se sube dos veces |
| Recompime (con ffmpeg) | H.264 `yuv420p`, CRF 26, preset medium, AAC 128 kb/s, `+faststart`, sin metadatos, lado mayor máx. 1280 px |
| O copia tal cual | con `--sin-recomprimir`, o si no hay ffmpeg: avisa del códec y del peso. El poster igual sale de un fotograma si hay ffmpeg; `--poster` es obligatorio sólo si no hay ffmpeg o si el fotograma no se puede extraer |
| Genera el poster | de `--poster`, o del fotograma del segundo 1 (el primero si el video es más corto). JPEG + WebP, máx. 1200 px |
| Genera la miniatura | JPEG + WebP, máx. 480 px, para la tira del visor |
| Escribe el item | `assets/video/videos.json` |
| Regenera el `.js` | `assets/js/galeria-videos.js`, ordenado por `posicion` y luego por orden de carga |

Los archivos quedan en `assets/video/<clave>/`, que es una carpeta **nueva y
aparte**: `scripts/generar-galeria.py` sigue leyendo sólo `assets/gallery/` y
escribiendo sólo en `assets/images/galeria/`, así que las dos herramientas nunca
se pisan.

`videos.json` se puede editar a mano sin problema: cualquier comando del script
(comprobado con `listar`) regenera `galeria-videos.js` si quedó desfasado, así
que el sitio nunca muestra una lista vieja. El `.js` sólo se escribe cuando su
contenido cambia de verdad.

Guarías del script, comprobadas una por una:

- **No deja archivos a medias.** Si algo falla después de copiar el video (un
  poster inexistente, un códec que ffmpeg no puede leer), borra todo lo que
  escribió antes de salir, y los temporales quedan fuera del repo.
- **Detecta el mismo clip con otro nombre** por el sha256 del contenido, con un
  registro interno `_hashes` que se borra solo cuando queda vacío. A mano no hay
  que tocarlo.
- **No pisa un `_hashes` mal formado**: si esa clave viniera con otro tipo de
  contenido, se reemplaza por un diccionario limpio.
- **Avisa con un mensaje claro** si `videos.json` tiene un error de sintaxis, en
  lugar de tirar un `traceback`.
- **Lee bien el códec de origen.** ffprobe imprime los campos de cada stream en
  orden alfabético, así que `codec_name` va **antes** que `codec_type`: si se
  toman en el orden en que llegan, el script informaba `aac` (el códec del audio)
  en lugar de `h264`, y el aviso de HEVC para Safari nunca disparaba. `probe()`
  guarda el último `codec_name` y lo usa recién cuando el stream se declara de
  video.
- Es **idempotente**: volver a cargar no duplica nada y `quitar` borra del disco
  los cinco archivos del video (`.mp4`, poster y miniatura en `.jpg` y `.webp`).
- Los originales nunca se borran ni se mueven.

`index.html` carga los tres archivos en este orden (todos con `defer`):
`galeria-data.js` → `galeria-videos.js` → `main.js`. `main.js` fusiona las fotos
primero y **después** inserta los videos encima, así que el orden final se decide
por el campo `posicion` de cada video, contando fotos y videos:

- `posicion` es el lugar final en la categoría: `1` es el primero.
- Sin `posicion`, el video va al final de su categoría, en el orden en que se
  cargó.
- Un video sin `poster` ni `thumb` se descarta: sin imagen de presentación la
  tarjeta quedaría rota.
- Si la categoría no tiene portada y no tiene fotos (como `espejo`, que hoy ya
  tiene videos pero ninguna foto), el poster del primer video pasa a ser el fondo
  de la tarjeta. Con fotos presentes gana la primera foto, porque una portada de
  video vertical no sirve para una tarjeta ancha.

El `<video>` del visor se arma solo; la miniatura recibe la insignia de play y el
contador pasa a `"3 fotos · 1 video"`.

#### Estado actual de los videos

**11 videos en 5 categorías**, cargados el 4/10/2026. La columna **Pos.** es el
lugar final dentro de la categoría **contando fotos y videos**, que es como
funciona `posicion`: por eso los de *quinceanos* (11 fotos) empiezan en la 12 y
los de *espejo*, que no tiene ninguna foto, arrancan en la 1.

| Categoría | Fotos | Pos. | Archivo en el sitio | Origen | Peso |
|---|---|---|---|---|---|
| quinceanos | 11 | 12 | `assets/video/quinceanos/01-xv-01.mp4` | `assets/gallery/15-anos/xv-01.mp4` | 1,26 MB |
| quinceanos | 11 | 13 | `assets/video/quinceanos/02-xv-02.mp4` | `assets/gallery/15-anos/xv-02.mp4` | 3,64 MB |
| bodas | 8 | 9 | `assets/video/bodas/01-boda-01.mp4` | `assets/gallery/bodas/boda-01.mp4` | 1,58 MB |
| bodas | 8 | 10 | `assets/video/bodas/02-boda-02.mp4` | `assets/gallery/bodas/boda-02.mp4` | 2,51 MB |
| bodas | 8 | 11 | `assets/video/bodas/03-boda-03.mp4` | `assets/gallery/bodas/boda-03.mp4` | 1,96 MB |
| bodas | 8 | 12 | `assets/video/bodas/04-boda-suiza.mp4` | `assets/gallery/bodas/boda-suiza.mp4` | 1,76 MB |
| prensa | 5 | 6 | `assets/video/prensa/01-prensa-01.mp4` | `assets/gallery/artistas/prensa-01.mp4` | 2,85 MB |
| novias | 1 | 2 | `assets/video/novias/01-novias-asesoria.mp4` | `assets/images/galeria/novias/novias_asesoria.mp4` | 3,35 MB |
| espejo | 0 | 1 | `assets/video/espejo/01-espejo-01.mp4` | `assets/images/galeria/bendito espejo/espejo-01.mp4` | 3,34 MB |
| espejo | 0 | 2 | `assets/video/espejo/02-espejo-02.mp4` | `assets/images/galeria/bendito espejo/espejo-02.mp4` | 2,47 MB |
| espejo | 0 | 3 | `assets/video/espejo/03-espejo-03.mp4` | `assets/images/galeria/bendito espejo/espejo-03.mp4` | 2,08 MB |

Cada video trae sus cinco archivos: el `.mp4`, el poster y la miniatura en `.jpg`
y `.webp` (55 archivos en total). Los posters salen del fotograma del segundo 1 y
son de 512×910, igual que la miniatura en 270×480; el de *novias* es 576×1024,
que es el tamaño del original.

La carpeta de origen no importa: el script toma la ruta que se le pase. Los
cuatro de *bodas*, los dos de *quinceanos* y el de *prensa* estaban sueltos en
`assets/gallery/<carpeta>/`, junto a las fotos, y el de *novias* dentro de
`assets/images/galeria/novias/`. Los originales nunca se borran ni se mueven; la
copia que usa el sitio es la de `assets/video/<clave>/`.

Ojo con esas carpetas de fotos: `generar-galeria.py` ignora todo lo que no sea
`.jpg`, `.jpeg`, `.png` o `.webp`, así que los `.mp4` que conviven ahí no entran
en la galería de fotos ni se tocan.

Para sumar uno nuevo, la categoría decide la posición:

```bash
python scripts/agregar-video.py agregar "assets/gallery/bodas/boda-04.mp4" --categoria bodas --posicion 13
```

Sin `--posicion` el video se va al final de la categoría, que es lo que hay que
usar cuando la categoría es de fotos y los videos van detrás.

#### Recomprimir o copiar tal cual

El CRF 26 por defecto sirve para material crudo (un `.mov` de cámara, un VHS, una
grabación sin comprimir): ahí baja el peso y normaliza el códec. Pero si el
archivo **ya venía optimizado para web**, recomprimirlo lo engorda. Los 11
clips del repo tienen el mismo perfil — H.264 High, `yuv420p`, *faststart*,
512×910 (576×1024 el de novias) y 230–612 kb/s — así que **pasaron los 8
primeros con `--sin-recomprimir` y los 3 de Espejo con el CRF 26**, que fue el
error que motivó esta corrección:

| Lote | Originales | Instalados | |
|---|---|---|---|
| 3 de Espejo (CRF 26) | 5,48 MB | 7,89 MB | +44 % |
| 8 del resto (tal cual) | 19,37 MB | 19,37 MB | 0 % |
| Medido con el CRF 26 sobre `boda-02` | 2,51 MB | 3,71 MB | +48 % |

O sea: los 8 tal cual pesan lo mismo que sus originales y, de haberlos
recomprimido, habrían salido alrededor de 28 MB (+9 MB de sobra).

```bash
python scripts/agregar-video.py agregar "<origen>" --categoria espejo --sin-recomprimir
```

El poster y la miniatura se siguen generando (de un fotograma, si hay ffmpeg); lo
único que se pierde es el borrado de metadatos y la normalización de códec. Para
decidir antes de subir, un vistazo al original:

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height,bit_rate -of default=noprint_wrappers=1 "video.mp4"
```

El propio script también lo avisa: con `--sin-recomprimir` imprime el códec de
origen que leyó, y si es HEVC (lo habitual en `.mov` y `.m4v` del celular)
recuerda que Chrome y Firefox lo ven pero Safari a veces no.

Para deshacer el error de los 3 de Espejo alcanza con volver a cargarlos con
`--sin-recomprimir`, quitando antes los archivos instalados:

```bash
python scripts/agregar-video.py quitar 01-espejo-01.mp4 --categoria espejo
python scripts/agregar-video.py agregar "assets/images/galeria/bendito espejo/espejo-01.mp4" --categoria espejo --sin-recomprimir
```

#### Con qué nombre se puede llamar a un video

`mover` y `quitar` aceptan varias formas, así que no hace falta acordarse del
nombre exacto con el que quedó instalado:

| Se escribe | También funciona |
|---|---|
| `01-espejo-01.mp4` | `espejo-01.mp4`, `espejo-01.mov`, `a`, `01`, `1`, `assets/video/espejo/01-espejo-01.mp4` |

Si la referencia coincide con más de un video, el script pregunta a qué categoría
se refiere en vez de elegir por su cuenta.

#### Los videos no se pisan con `generar-galeria.py`

Vale dejarlo por escrito porque `generar-galeria.py` **borra** lo que genera, y
las dos herramientas comparten la palabra `galeria` en la ruta:

- `limpiar_destino()` borra únicamente lo que el propio script escribe, según el
  patrón `^(\d{2}(-thumb)?\.(jpg|jpeg|webp)|portada\.(jpg|jpeg|webp))$`. Un
  `.mp4` nunca coincide, así que un video que alguien dejara dentro de
  `assets/images/galeria/<clave>/` se salva.
- Hay un `shutil.rmtree()` en `procesar_categoria()`, pero es la única rama
  destructiva y es fácil de leer: se ejecuta sólo cuando la categoría se queda
  **sin una sola imagen de origen utilizable y sin foto de reemplazo**, y borra
  `assets/images/galeria/<clave>` completa. Las siete claves que el script
  maneja son `quinceanos`, `bodas`, `novias`, `prensa`, `espejo`,
  `corporativos` y `docencia`.

Dónde cae hoy cada video, entonces:

| Carpeta | Qué es | ¿La toca el generador? |
|---|---|---|
| `assets/video/<clave>/` | copia canónica, la que usa el sitio | no: el generador ni sabe que existe |
| `assets/images/galeria/bendito espejo/` | originales a mano | no: `espejo` es una clave, pero la carpeta se llama `bendito espejo` y nunca coincide con el destino |
| `assets/gallery/<origen>/` | fotos originales | no: sólo lee imágenes; los `.mp4` que conviven ahí se ignoran |
| `assets/images/galeria/novias/` | fotos generadas de *Exclusivo Novias* | parcial: regenera `01*` y `portada*`; `novias_asesoria.mp4` no se toca |

Ojo con `espejo`: hoy **no existe** `assets/images/galeria/espejo/`, porque la
fuente está en la carpeta manual `bendito espejo`. Si algún día se creara
`assets/gallery/espejo/` con fotos, el generador empezaría a escribir
`assets/images/galeria/espejo/` — y como `espejo` no tiene entrada en `RESALTOS`,
si esa fuente quedara vacía borraría esa carpeta (que entonces sería sólo
generada). Los videos están a salvo en `assets/video/espejo/` en cualquier
caso, y por eso conviene no dejar `.mp4` sueltos en las carpetas de fotos: la
copia de `assets/video/<clave>/` es la única que el sitio lee.

Los 8 que se cargaron el 4/10/2026 vienen de las carpetas de fotos, y es un caso
real que conviene tener controlado:

| Origen | Categoría | Destino |
|---|---|---|
| `assets/gallery/15-anos/xv-01.mp4`, `xv-02.mp4` | quinceanos | `assets/video/quinceanos/` |
| `assets/gallery/bodas/boda-01..03.mp4`, `boda-suiza.mp4` | bodas | `assets/video/bodas/` |
| `assets/gallery/artistas/prensa-01.mp4` | prensa | `assets/video/prensa/` |
| `assets/images/galeria/novias/novias_asesoria.mp4` | novias | `assets/video/novias/` |

Mientras el script no se vuelva a ejecutar, esos originales están donde siempre.
Si algún día se corre `generar-galeria.py`, los de `assets/gallery/` se ignoran
(no son imágenes) y el de `novias_asesoria.mp4` se salva del `rmtree` porque
`novias` tiene foto de reemplazo. Aun así, la copia buena es la de
`assets/video/<clave>/`: si un original se perdiera, el sitio sigue sirviendo.

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

Las 12 reseñas se renderizan en un **carrusel** (`#reviewsTrack` dentro de `#reviewsViewport`,
que a su vez está dentro de `.carousel-stage`): mueve el bloque con `transform`, calcula cuántas
reseñas entran por pantalla y arma un botón de punto por grupo. La cantidad por pantalla queda
entre `POR_PANTALLA_MOVIL` (1) y `POR_PANTALLA_DESKTOP` (3), cerca del inicio de
`initTestimonios()`.

#### Las flechas, a los costados

La pista y las dos flechas viven en `.carousel-stage` (`position: relative`), así que los
botones se apoyan **a los laterales de las tarjetas** y quedan centrados contra su altura con
`top: 50%` + `translateY(-50%)`. Los puntos siguen debajo, centrados, en `.carousel-controls`.

| Qué | Dónde |
|---|---|
| Carril lateral reservado | `--flecha-gutter` (56 px desde 720 px, 40 px de 480 a 720 px, 0 por debajo de 480 px) |
| Diámetro del botón | `--flecha-size` (46 px desde 720 px, 36 px de 480 a 720 px) |
| Posición | `.carousel-btn--prev` a la izquierda, `--next` a la derecha, con el offset calculado para que el círculo quede centrado en su carril |
| Ancho de la pista | `overflow: clip` en `.reviews-viewport`: recorta sin volverlo un contenedor de scroll |

El **orden del DOM es el del teclado**: anterior, pista, siguiente. Por eso el `role="region"`
con `aria-roledescription="carrusel"` pasó del viewport al stage, que ahora es lo que contiene
los controles. Cada flecha sigue con su `aria-label`, su estado `[disabled]` en los extremos y
el anillo dorado de `:focus-visible`. Por debajo de 480 px las flechas se ocultan
(`display: none`): a 36 px sobre un carril de 40 px quedan pegadas a la tarjeta, así que
mandan el swipe y los puntos.

El ancho de la tarjeta se deriva del carril disponible —una tarjeta a lo ancho hasta 720 px,
dos de 720 a 980 px y tres desde 980 px— para que N tarjetas más sus N-1 separaciones llenen el
carril exacto. Así el borde de recorte cae en el hueco entre la última tarjeta visible y la
siguiente: **no asoma ninguna tarjeta parcial**, que era el filo que se veía antes. El mismo
cálculo hace el JS con el ancho medido, así que la cuenta de "reseñas por pantalla" coincide.

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
  `aria-current`.
- Las tarjetas fuera de pantalla quedan con `aria-hidden` e `inert`, fuera del orden de tabulación.
- `initReveal` se corre **después** de `initTestimonios` para que el stage quede observado.

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

### Los botones de WhatsApp dicen "ESCRIBINOS", no el número

Ningún botón ni enlace muestra el teléfono como texto visible: **ninguno de los ocho** deja el
número en el cuerpo del enlace, y los que llevan rótulo propio dicen **`ESCRIBINOS`**. El
número queda solo en el `href` y en el `aria-label`.

| Botón | Selector | Texto visible | `href` |
|---|---|---|---|
| Header (píldora vino) | `.nav-cta > a.btn-primary` | `Escribinos` | `https://wa.me/549351225946` |
| Menú móvil (pie) | `#mobileMenu .mobile-menu__foot > a.btn-gold` | `Escribinos` | `https://wa.me/549351225946` |
| Consultoría (política) | `.policy-box > a.btn-gold` | `Consultar Disponibilidad de Agenda` | `https://wa.me/549351225946` |
| Contacto, tarjeta "Atención Directa" | `.wa-card > a.btn-gold` | `Escribinos` | `https://wa.me/549351225946` |
| Galería sin fotos (lightbox) | `#lightboxEmpty a.btn-gold` | `Escribinos` | `https://wa.me/549351225946` |
| Modal Bendito Espejo | `.modal-actions > a.btn-primary` | `Reservar Disponibilidad vía WhatsApp` | `https://wa.me/549351225946?text=…` |
| Footer (icono) | `.footer-social > a[href*="wa.me"]` | — (solo ícono) | `https://wa.me/549351225946` |
| Flotante | `a.floating-wa` | — (solo ícono) | `https://wa.me/549351225946` |

**Los cuatro que no dicen "ESCRIBINOS" y por qué:** los dos de ícono (footer y flotante) no
tienen texto que rotular, así que llevan el rótulo en el `aria-label`
(`WhatsApp de Divina Inspiración` y `Escribinos por WhatsApp`). Los otros dos —el de la
política de Consultoría y el del modal— anuncian su propia acción en vez del rótulo
genérico, porque el modal además precarga un mensaje: son llamados a la acción con intención
propia y se dejaron intactos a propósito. El cambio fue quirúrgico: solo se modificaron los
botones que **mostraban el número** (menú móvil y tarjeta de Contacto) y el rótulo del header.
La auditoría final verificó los ocho: 0 con el teléfono visible, 4 con `Escribinos` en el
texto y 2 con el `aria-label` completo.

- **Las mayúsculas no se escriben en el HTML:** el texto va literal como `Escribinos` y
  `.btn` aplica `text-transform: uppercase` (y `letter-spacing: 0.09em`). Por eso el header
  y los dos botones de la tabla que antes mostraban el número ahora se leen igual.
- **Accesibilidad:** los dos botones que mostraban el número (menú móvil y tarjeta de
  Contacto) llevan `aria-label="Escribinos por WhatsApp al +54 9 351 225-946"`, que arranca
  con el texto visible y le agrega el número a quien usa lector de pantalla. El `aria-label`
  pisa el contenido textual, así que hay que actualizarlo junto con el texto si alguno cambia.
- **Dónde se cambia el número:** en los `href` `https://wa.me/549351225946` de `index.html`
  (ocho lugares), en la constante `WHATSAPP_NUMBER` de `main.js` (línea ~264) que arma el
  `window.open` del formulario, y en el `aria-label` de los dos botones de arriba. El
  `telephone` del JSON-LD (`+549351225946`) y el mensaje de estado del formulario lo citan
  en texto plano y no se tocan al cambiar el rótulo.
- **Tamaño:** el botón de Contacto mide `170.63 × 53.67 px` (antes `222.61 × 53.67 px` con el
  número). Se conserva el `padding` de `.btn` (`14px 26px`), con el que la proporción
  ancho/alto queda en 3,18:1, dentro de la familia de los demás `.btn-gold` (2,71:1 a 5,72:1),
  y las métricas del texto son las mismas que las del botón del header. El alto no se movió.

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
- El texto claro sobre la foto de las tarjetas de categoría (título, contador e ícono) no
  depende de la foto: se apoya en el velo `--vino-noche` y en las sombras de texto. Medido
  sobre capturas reales a 1440, 1024, 768 y 390 px, lo más bajo del sitio en esa zona es
  **6,07:1** (ícono de *Corporativos* a 768 px) y los títulos van de 7,03:1 a 15,36:1.
  La auditoría final lo volvió a medir a 1440 px con otro método —el texto oculto y el píxel
  de fondo predominante de su propia caja— y dio **7,01:1** en el contador y **7,12:1** en el
  título, sin que el velo tocara el mínimo. El footer, que es vino y no foto, baja a
  **5,31:1** en su línea de copyright.
- Etiquetas ARIA en todos los iconos decorativos (`aria-hidden`) y en los botones de sólo icono.

### El hover sólo existe en lo que se puede clickear

Regla del sitio: **si no se puede hacer clic, no reacciona al pasar el mouse**. Ningún
elemento informativo cambia de color, borde, sombra, transform ni relleno al recibir el
puntero; el hover es una señal de "acá se puede actuar", así que sólo la tienen los
elementos interactivos.

**Mantienen hover** (y por lo tanto su `transition`):

| Elemento | Selector |
|---|---|
| Botones y píldoras | `.btn-primary`, `.btn-gold`, `.btn-outline`, `.btn-ghost`, `button` |
| Botón ESCRIBINOS del header | `.nav-cta .btn` (y el brillo `::after` a `data-intensity="max"`) |
| Logo (es un link a `#inicio`) | `.logo` |
| Links del menú y del menú móvil | `.nav-links a`, `.mobile-menu__list a` |
| Hamburguesa | `.burger` |
| Tarjetas de la galería (abren el visor) | `.gallery-cat-card` y sus hijos |
| Tarjeta Bendito Espejo (abre el modal) | `button.service-card.is-featured` |
| Visor de galería | `.lightbox__close`, `.lightbox__nav`, `.lightbox__thumb` |
| Carrusel de reseñas | `.carousel-btn`, `.carousel-dot` |
| Modal | `.modal-close` |
| Redes del footer | `.footer-social a` |
| Botones flotantes | `.floating-wa`, `.floating-ig` |

**Sin hover** (se eliminó la regla y la `transition` que solo servía para ella):

- `.credential-item` — credenciales de La Productora (5 `div`).
- `article.service-card` — las 7 tarjetas de servicios Informativos. La regla quedó
  limitada a `button.service-card`, que es la única clickeable (Bendito Espejo): las
  tarjetas `<article>` y sus `.service-icon` ya no se elevan ni giran.
- `.etapa-item` — etapas de Consultoría (3 `div`).
- `.review-card` — las 12 reseñas (`li`), que antes se elevaban al pasar el mouse.

Nunca tuvieron hover y por eso no se tocó nada: fotos de Deborah y del equipo, métricas
(`.stat`), panel de Consultoría (`.consultoria-block`), tarjeta del formulario
(`.contact-form`), tarjeta de WhatsApp (`.wa-card`), `.policy-box` y los `.cat-line`
decorativos.

Los estados que **no** son hover siguen intactos: `:focus-visible` (foco por teclado),
`aria-current` en el enlace activo del menú, los estados del carrusel y del visor, y las
animaciones de aparición al hacer scroll (`.reveal`), los contadores y el parallax, que no
dependen del mouse.

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
--fondo-pastel: #f3eff8; --fondo-pastel-suave: #f8f5fb;
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
- **Fuera del CSS:** `manifest.webmanifest` (`background_color` replica `--fondo-pastel`,
  `theme_color` replica `--vino`) y el `<meta name="theme-color">` de `index.html` no pueden
  leer variables CSS, así que hay que actualizarlos a mano junto con `:root`.
- **Contraste:** `--texto`, `--texto-etapa`, `--texto-suave`, `--dorado-texto`, `--placeholder`
  y `--vino` superan AA (4,5:1) sobre `--marfil`, `--champagne`, `--rosa-polvo`,
  `--fondo-pastel` y `--fondo-pastel-suave`. El texto
  claro sobre foto depende del velo `--vino-noche`: si se aclara, hay que volver a medirlo.
- Los dos tonos de estado `--exito` y `--error` son literales, y también el verde de WhatsApp
  y su familia y el degradé de Instagram, que son colores de marca y no forman parte de la
  paleta decorativa.

**Fondo pastel de sección** — el sitio entero se apoya en un solo tono, lavanda pastel, y en
una variante apenas más clara para que el salto entre secciones casi no llame la atención.
Las dos variables están declaradas junto a la base en `:root`:

```css
--fondo-pastel: #f3eff8;        /* lavanda pastel, el tono principal */
--fondo-pastel-suave: #f8f5fb;  /* la misma lavanda, apenas más clara */
```

Reparto actual, y dónde se edita cada una:

| Zona | Selector | Fondo |
|---|---|---|
| Página | `html`, `body` | `--fondo-pastel` |
| Hero | `.hero` | `--fondo-pastel` (degradé en 3 paradas) |
| Productora | `.about` | `--fondo-pastel` |
| Servicios (incluye Consultoría) | `.services` | `--fondo-pastel-suave` |
| Galería | `.gallery-section` | `--fondo-pastel-suave` |
| Testimonios | `.reviews-section` | `--fondo-pastel-suave` (+ radial dorado) |
| Contacto | `.contact` | `--fondo-pastel` |

**Para un único color en todo el sitio alcanza con igualar las dos variables**
(`--fondo-pastel-suave: var(--fondo-pastel)`, o el mismo valor hexadecimal en las dos): el
reparto por zona queda como está y las separaciones siguen existiendo, pero ya no se ve
ningún cambio de tono entre secciones.

Para cambiar el tono general, alcanza con editar esos dos valores en `:root` y, en el mismo
movimiento, `background_color` en `manifest.webmanifest`. El reparto por zona se cambia en
la regla de cada sección. Ningún otro color del sitio depende de esta decisión: las tarjetas,
paneles, botones, textos, header, footer y el campo del formulario conservan sus propios
fondos, y `--marfil` y `--champagne` siguen disponibles para los paneles claros.

Ojo con dos efectos que se superponen al fondo y bajan el contraste real del hero: el
monograma `DI` y el grano (nivel `max`). Medido sobre los píxeles realmente pintados, las
métricas del hero quedan en 4,55 – 4,73:1, justo por encima de AA; sin esas capas el lavanda
puro da 4,89:1. Si hace falta aire, hay que ajustar `--monograma` o `--textura`, no el pastel.

**Iconos** — sprite SVG al final de `index.html`. Cada símbolo es un `<symbol id="i-…">` y se
usa con `<use href="#i-…">`. Ya están definidos: anillos, corona, maletín, micrófono/prensa,
espejo de mano, birrete, diamante, cámara, brújula, WhatsApp, Instagram, check, flecha,
chevrones, estrella, barras y cierre.

**Velo de las tarjetas con foto** — cuatro variables en `.gallery-cat-card--con-medios`
gobiernan el degradé que se apoya sobre la foto para que el título, el contador y el ícono
se lean sin importar qué haya en la imagen:

```css
.gallery-cat-card--con-medios {
  --velo-limpio: 38%;   /* tramo superior sin tinte: la foto se ve limpia */
  --velo-medio: 48%;    /* acá la meseta ya es total */
  --velo-plato: 62%;    /* opacidad de la meseta */
  --velo-hover: 72%;    /* opacidad al apuntar o enfocar */
}
```

El degradé es vertical (de arriba hacia abajo) y todos los colores salen de `--vino-noche`
con `color-mix()`. La zona limpia **no es un 40 % fijo**: el bloque de texto va anclado abajo
y arranca entre el 15 % (390 px) y el 43 % (1440 px) de la altura de la tarjeta, así que cada
breakpoint la ajusta y el 40 % dejaba el ícono y el título sobre foto sin velar (1,3:1 medido
en Chrome). Valores por tramo:

| Ancho | `--velo-limpio` | `--velo-medio` | Zona limpia real |
|---|---|---|---|
| 1440 px y más | 38 % | 48 % | 38 % |
| 1024 px | 26 % | 38 % | 26 % |
| 768 px | 20 % | 31 % | 20 % |
| 390 px | 10 % | 21 % | 10 % |

Dos reglas más: la tarjeta ancha de *Docencia* (`.gallery-cat-card:nth-child(7)`) usa el
mismo velo en **horizontal**, con la meseta entre el 26 % y el 74 % porque el texto va en una
fila centrada; y por debajo de 700 px esa tarjeta vuelve al velo vertical como las demás.
Si se aclara `--vino-noche` o se sube `--velo-plato`, hay que volver a medir el contraste:
es el único punto del sitio donde el texto claro se apoya en la foto.

**Botón flotante de Instagram** — es el `<a class="floating-ig">` de `index.html`: un círculo
fijo abajo a la derecha, con el glifo `#i-instagram` en claro, apilado 12 px encima del de
WhatsApp (`.floating-wa`), que no se mueve. El perfil se cambia en el `href` de ese `<a>` (va
con `target="_blank"` y `rel="noopener noreferrer"`). El degradé es color de marca de la red, no
de la paleta del sitio: son los cuatro tokens `--instagram-1` (amarillo), `--instagram-2`
(magenta), `--instagram-3` (violeta) y `--instagram-4` (azul) de `:root`. El tamaño y la
separación de la pila salen de `--fab-size`, `--fab-bottom` y `--fab-gap`; el pulso, de
`--pulse-fab-ig` (más suave y desfasado del de WhatsApp para que no laten a la vez). Ninguno de
los dos se oculta por código: los tapan el visor y el modal, que están por encima.

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
- Las 7 categorías arrancaban vacías (hoy `espejo` ya tiene 3 videos): la tarjeta
  muestra *Próximamente* y el aviso funcional del visor entra completo en la
  ventana en los seis anchos.
- Con medios inyectados en caliente, el visor abre `1 / 3`, decodifica la imagen con
  altura real y ubica la figura entre la barra y la tira de miniaturas.
- Ritmo vertical medido entre bloques de contenido:
  1440 px → `145 · 144 · 126 · 126 · 145 · 144`; 768 y 390 px → `79–81`.
  Servicios, galería y testimonios forman una banda pastel suave continua.
- Testimonios: carrusel con las 12 reseñas, 3 por pantalla desde 980 px, 2 de 720 a 980 px
  y 1 por debajo (3 / 1 en el JS antes de este ajuste), puntos por grupo, autoplay de 6 s que
  se pausa al hover/enfoque y se apaga para siempre al primer clic, tecla o swipe, flechas y
  swipe; cada tarjeta lleva su línea "Reseña verificada en …" y sin rastro de la grilla
  estática anterior.

**Flechas del carrusel de testimonios (Chrome/CDP, nueve anchos: 1920 / 1440 / 1100 / 1024 /
980 / 979 / 720 / 600 / 480 / 479 / 390 px)**

- 0 errores de consola y `scrollWidth` igual a `clientWidth` en todos los anchos.
- Orden del DOM = orden del teclado: `reviewPrev` → `reviewsViewport` → `reviewNext`; los
  puntos siguen debajo, con desvío 0 px del centro del contenedor.
- Centro vertical de las flechas contra las tarjetas: **0 px de diferencia** en los cuatro
  anchos pedidos y en los cinco de borde. Aire entre el círculo y la tarjeta: 5 px (carril de
  56 px, flecha de 46 px) desde 720 px y 2 px de 480 a 720 px. Solape con tarjetas visibles: 0.
- Tarjetas por pantalla: 3 desde 980 px, 2 de 720 a 980 px, 1 por debajo; en los cinco anchos de
  borde (479 / 480 / 719 / 720 / 979 / 980) el número cambia exactamente en el breakpoint y
  **la holgura a la derecha del recorte es 0 px**: no asoma ninguna tarjeta parcial, en el
  estado inicial ni después de avanzar. Antes asomaban 4 px a 1440, 6 px a 1024, 184 px a
  768 y 48 px a 390.
- Hover: fondo vino `rgb(124, 31, 45)` y chevron champagne `rgb(246, 235, 220)`.
  Foco por `Tab`: anillo `2px solid rgb(193, 154, 75)` (el `--dorado`) a 3 px de offset, con
  el círculo conservando `border-radius: 50%`.
- Clic con mouse, `←` / `→` y swipe mueven el carrusel y los puntos quedan sincronizados; en el
  último grupo la flecha siguiente queda `[disabled]` y la anterior habilitada. El autoplay
  avanza solo a los 6 s de cargar y queda detenido para siempre después de la primera
  interacción. Por debajo de 480 px las flechas no están en el DOM visual (`display: none`),
  y el teclado sigue funcionando a través de los puntos.

**Velo de la galería con contenido real (Chrome/CDP, capturas a 1440 / 1024 / 768 / 390 px)**

Con las 6 categorías con fotos inyectadas en `assets/js/galeria-data.js`: 0 errores de
consola, `scrollWidth` igual a `clientWidth` en los cuatro anchos y el velo arrancando
exactamente donde se lo pidió (38 / 26 / 20 / 10 %). Contraste de los píxeles reales de
cada captura:

| Texto | Mínimo del sitio | Dónde |
|---|---|---|
| Ícono dorado | 6,07:1 | *Corporativos*, 768 px |
| Título | 7,03:1 | *Exclusivo Novias*, 390 px |
| Contador de fotos | 7,87:1 | *Exclusivo Novias*, 1440 px |

El hover y el foco llevan la meseta a 0,72, como fijó el diseño, y no bajan de AA. En 390 px
el header también se ajustó (`@media (max-width: 420px)`: marca de logo, tipografía y
padding de botones) porque el logo más el botón de cita no entraban en 383 px de contenido
dentro de 390 px de ventana: ahora `.site-nav` mide 358 px y no hay scroll horizontal.

**Portada de 15 Años** — `scripts/generar-galeria.py` le quita el marco blanco antes de
recortar: 900×474 → **783×412** (1,90, la proporción de la tarjeta), `.webp` derivado igual y
`portadaW`/`portadaH` de `assets/js/galeria-data.js` actualizados. El original
`assets/gallery/15-anos/xv-04.jpg` está intacto y las otras seis portadas no cambian al
re-e-executar el script.

**Un solo color de fondo: lavanda pastel (Chrome/CDP, cinco anchos: 1440 / 1280 / 1024 / 768 / 390 px)**

Contraste calculado sobre los píxeles realmente pintados detrás de cada texto (se vuelve el
texto transparente y se mide su propia caja), en lugar de contra el color de la sección.
100 mediciones (20 textos × 5 anchos), 0 fallos de AA:

| Zona | Elemento | Antes (rosa / salvia) | Ahora (lavanda) |
|---|---|---|---|
| Hero | eyebrow · h1 · lead | 4,15 – 4,31:1 | 5,45 · 11,42 – 11,92 · 4,57 – 4,71:1 |
| Hero | métricas (`b` · `span`) | 4,37 – 4,54:1 | 8,03 – 8,35 · 4,55 – 4,73:1 |
| Productora | eyebrow · h2 · role-tag | 5,20:1 | 5,51 – 5,52 · 12,74 · 4,99 – 5,16:1 |
| Servicios | eyebrow · h2 · subtítulo | 4,63:1 | 5,80 · 13,38 · 5,05:1 |
| Galería | eyebrow · h2 · subtítulo | 4,63:1 | 5,80 · 13,38 · 5,05:1 |
| Testimonios | eyebrow · h2 · subtítulo | 4,51 – 4,54:1 | 5,33 – 5,38 · 12,87 – 13,10 · 4,93 – 5,00:1 |
| Contacto | eyebrow · h2 · subtítulo | 5,20:1 | 5,52 · 12,74 · 4,81:1 |

El lavanda como tono principal mejora el contraste en casi todo: los fondos de las secciones
claras suben y el hero, que antes quedaba justo por debajo de AA en las métricas, ahora pasa
con 4,55 – 4,73:1. El mínimo de todo el sitio son las métricas del hero (4,55:1), por el
monograma `DI` y el grano que se superponen al fondo; el resto va entre 4,81 y 13,38:1.

Las luminancias relativas de los pasteles quedan en 0,876 (`--fondo-pastel`) y 0,922
(`--fondo-pastel-suave`), por encima del piso de 0,85. Al comparar los estilos computados de
los 765 elementos (1440 px) y 767 (390 px) entre la versión anterior y la actual, con las
animaciones congeladas para que el diff sea reproducible, salen **5 diferencias por ancho
(10 en total)**: las cinco son `background-color` de sección (`.about`, `.services`,
`.gallery-section`, `.reviews-section`, `.contact`), más el fondo de `html`/`body`. Ningún
color de texto, borde, sombra o fondo de tarjeta se movió. 0 errores de consola y
`scrollWidth` igual a `clientWidth` en los cinco anchos.

Dos notas que conviene no olvidar: el `background` del `.hero` está descartado por el
navegador desde antes de este cambio (el `color-mix()` con `calc()` multiplicativo no es
válido en CSS), así que el hero no pinta ese degradé y hereda el fondo de `body`; y el
`box-shadow` del botón flotante de WhatsApp se congela al diff porque lo anima
`pulse-wa` en bucle infinito. Los resplandores no se tocan.

**Videos en la galería (Chrome/CDP, una sola pasada, con los 11 videos cargados)**

Comprobado sobre el sitio real, no sobre los datos: los contadores se contrastan
contra `window.DI_GALERIA` (fotos) y `window.DI_GALERIA_VIDEOS` (videos), se
recorre la tira de cada categoría para leer el orden final, y **los 11 videos se
abren de verdad** en el visor.

| Chequeo | Resultado |
|---|---|
| Contadores de las 7 categorías | «11 fotos · 2 videos» · «8 fotos · 4 videos» · «1 foto · 1 video» · «5 fotos · 1 video» · «3 videos» · «6 fotos» · «5 fotos» |
| Orden final de la tira | los videos caen **detrás** de las fotos y en el orden pedido: `FFFFFFFFFFVV` · `FFFFFFFFVVVV` · `FV` · `FFFFFV` · `VVV` |
| Apertura de los 11 videos | `readyState 4` en los once, con su poster, sin error de medios y con el `<video>` visible |
| Duraciones | xv-01 15,84 s · xv-02 100,71 s · boda-01 22,90 s · boda-02 50,67 s · boda-03 43,47 s · boda-suiza 42,17 s · prensa-01 46,25 s · novias 44,81 s · espejo 28,70 / 24,10 / 20,27 s |
| Dimensiones | 512×910 los diez, 576×1024 el de novias (es el tamaño del original) |
| Consola y red | 0 errores de consola y 0 peticiones con error (28 abortos `ERR_ABORTED` de carga lazy, del navegador) |
| Scroll horizontal | `scrollWidth` = `clientWidth` = 1440 |
| Estático | 7 claves, 11 items, 55 archivos en disco, **0 inconsistencias** entre `videos.json`, `galeria-videos.js` y el disco; los 55 archivos decodifican (Pillow `verify()` y caja `ftyp` de los mp4) |

Los scripts de verificación se ejecutaron **fuera del repositorio**
(`C:\Users\migue\AppData\Local\Temp\opencode\`, con `puppeteer-core` instalado
fuera también) y se borran al terminar, para no dejar archivos de prueba en el
proyecto: `puppeteer` contra el Chrome del sistema
(`C:\Program Files\Google\Chrome\Application\chrome.exe`, 154.0.8037.97), un
solo arranque y una sola pestaña, con `setCacheEnabled(false)` por el punto 1 de
abajo.

Cuatro cosas del sitio hacen que una medición automática dé falsos negativos.
Están anotadas porque las cuatro se leen como un error del código y son fáciles
de perseguir de nuevo:

1. **Chrome revalida con caché heurística.** El sitio es estático y no manda
   `Cache-Control`, así que entre navegaciones del mismo perfil Chrome puede
   volver a usar en memoria el `galeria-videos.js` de la carga anterior — la
   versión vacía. En la prueba hay que desactivar la caché (`page.setCacheEnabled(false)`),
   o recargar con la caché desactivada. No es un fallo del sitio: `galeria-data.js`
   se comporta igual.
2. **Las portadas de las tarjetas usan `loading="lazy"`**, y Chrome aborta la
   carga de una imagen que sale de pantalla (`net::ERR_ABORTED`). Si se mide
   `naturalWidth` sin más, salen rotas. Hay que forzar `img.loading = 'eager'`
   primero y contar los abortos aparte: no son requests con error.
3. **`main.js` aplica el `src` y el `poster` del `<video>` 160 ms después del
   click** (`setTimeout(aplicar, 160)`, dentro de `pintarMedio`). El contador, en
   cambio, se actualiza en el momento. Si se lee el video apenas se hace clic, se
   mide el video anterior: hay que esperar a que `currentSrc` sea el archivo
   recién pedido y `readyState >= 1`.
4. **La lista fusionada (fotos + videos) es privada.** `main.js` la guarda en un
   objeto de módulo, así que `window.DI_GALERIA` sigue siendo sólo la entrada de
   fotos: leer `DI_GALERIA.espejo.items` da `[]` aunque la tarjeta muestre «3
   videos». Lo esperado se arma con los dos archivos de datos, y en el visor los
   videos se localizan por las miniaturas que llevan `.lightbox__thumb-play`.

### Auditoría final (sin cambios de código)

Se reverificaron las tres capas del proyecto con los scripts de medición **fuera** del
repositorio, así que el sitio quedó sin archivos de prueba. Resultado: 0 hallazgos que
requieran tocar el código y 4 imprecisiones de este README, ya corregidas arriba (los cuatro
enlaces de WhatsApp con rótulo propio, el mínimo del footer, el wording de pausa y un `-`
pegado en el punto 10).

**A · Estático (Node, sin navegador)**

| Chequeo | Resultado |
|---|---|
| Literales de color fuera de `:root` | 0 en `styles.css`, `main.js` y `galeria-data.js`; `background_color` del manifest replica `--fondo-pastel` |
| Variables | 80 distintas, todas definidas; 129 mezclas `color-mix()` con porcentaje explícito; la única que se escribe desde JS es `--reveal-delay` |
| Paleta vieja | 0 apariciones de `#fcf0ee` y `#ebf3e8`; `--marfil` y `--champagne` siguen definidas; `--crema` ya no se usa |
| WhatsApp | 0 teléfonos visibles en botones o links de `index.html` y `main.js`; de los 8 enlaces `wa.me`, 4 dicen `Escribinos`, 2 llevan el `aria-label` completo y ninguno muestra el número |
| Estructura | un solo `<meta name="theme-color">`; llaves CSS 417/417; manifest y JSON-LD válidos; `title` y `description` presentes |
| Assets | 92 rutas referenciadas, 92 en disco |
| Higiene | 0 archivos de verificación dentro del repositorio |

Dos falsos positivos conocidos, para no volver a perseguirlos: al extraer rutas de `url()`
aparece un `%23g` que **no** es un asset, es un SVG inline con `data:` en `styles.css:360`;
y los dos enlaces de WhatsApp con copy propio (política de Consultoría y modal) no son un
fallo, están documentados arriba.

**B · Navegador (Chrome/CDP, un solo arranque y una sola página, 1440 / 1024 / 390 px)**

| Chequeo | Resultado |
|---|---|
| Consola y red | 0 errores y 0 peticiones fallidas o ≥ 400 |
| Scroll horizontal | `scrollWidth` = `clientWidth` en los tres anchos, sin elemento culpable |
| Contraste sobre fondo sólido | 16 / 13 / 14 pares únicos (55 / 48 / 48 nodos), 0 fallos de AA, mínimo **4,63:1** en los tres anchos |
| Contraste sobre foto y footer | por captura recortada de cada elemento a 1440 px, con el texto oculto y muestreando el píxel predominante: galería de **5,5:1** (la tarjeta *Próximamente*, sin foto) a 15,65:1, con 7,01:1 en el contador y 7,12:1 en el título; footer de **5,31:1** (copyright) a 7,81:1 |
| Hover | 31 reglas `:hover` / `:focus-within` en el CSSOM, incluidas las de `@media` y `@supports`: 0 aplican a un elemento no clickeable |
| Header | logo, menú y botón comparten el centro vertical con 0 px de diferencia; dentro del botón, la asimetría de padding es de 0,01 px |
| Presencia y posiciones | Instagram arriba de WhatsApp, sin solape y dentro del viewport en los tres anchos; flechas del carrusel a 5 px de las tarjetas y 0 px de desvío vertical; las 12 reseñas con su línea "Reseña verificada en …"; subtítulo de galería en una línea a 1440 y 1024; los fondos de sección son solo `#F3EFF8` y `#F8F5FB` (el champagne translúcido del header no es un fondo de sección) |

El mínimo global del sitio sigue siendo el de las métricas del hero (4,55:1) que se midió por
píxeles en la sección anterior; los 4,63:1 de esta auditoría son el mínimo entre los nodos con
fondo sólido que esta pasada evaluó.

---

© 2026 Divina Inspiración · Dirección General: Deborah Núñez ·
Villa Carlos Paz, Valle de Punilla, Córdoba, Argentina.
