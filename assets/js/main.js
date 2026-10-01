/* =========================================================================
   DIVINA INSPIRACIÓN — Lógica del sitio
   -------------------------------------------------------------------------
   Índice
   01. Configuración editable (galería, equipo, testimonios)
   02. Utilidades
   03. Header, barra de lectura y parallax
   04. Menú móvil
   05. Scroll spy
   06. Revelado progresivo (reveal / stagger)
   07. Contadores estadísticos
   08. Galería por categorías
   09. Lightbox
   10. Testimonios (carrusel)
   11. Modales
   12. Formulario de contacto
   13. Inicialización
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     01. CONFIGURACIÓN EDITABLE
     -----------------------------------------------------------------------
     GALERIA: títulos e iconos de cada categoría; el contenido multimedia
     (portada + items) llega desde assets/js/galeria-data.js, un archivo
     GENERADO por scripts/generar-galeria.py a partir de las fotos originales
     de assets/gallery/<carpeta>/.

       - Flujo normal: copiar la foto a assets/gallery/<carpeta>/ y ejecutar
         `python scripts/generar-galeria.py`. Ni el HTML ni el CSS se tocan.
       - Para sumar un video a mano, agregar el objeto { tipo: 'video', src,
         thumb, poster, alt } directamente en el `items` de abajo: el visor ya
         lo soporta y le dibuja la insignia de reproducción.
       - Si assets/js/galeria-data.js falta, está vacío o le faltan claves, la
         fusión se omite sin error: la categoría cae en el estado "Próximamente".

     EQUIPO: se usa para mostrar miembros adicionales en la ficha del equipo.
       Dejalo vacío si sólo se usan las fotografías ya incluidas en el HTML.

     TESTIMONIOS: las 12 reseñas reales, renderizadas en una grilla estática.
     ===================================================================== */

  /* GALERÍA
     ---------------------------------------------------------------------------
     Objeto único de configuración. Las tarjetas, los contadores, el visor y los
     estados vacíos se renderizan 100% desde acá: para agregar fotos o videos
     alcanza con sumar objetos a `items`, sin tocar HTML ni CSS.

     Estructura de cada categoría:
       titulo  → texto visible en la tarjeta, en el visor y en el aria-label.
       icono   → clave del sprite (#i-*) que se dibuja en la tarjeta.
       portada → imagen de fondo de la tarjeta (opcional; si falta, la tarjeta
                 cae en el estado "sin medios").
       items   → lista de medios. Cada item acepta:
                   { tipo: 'foto',  src, thumb, alt }
                   { tipo: 'video', src, thumb, poster, alt }

     `items: []` es el estado por defecto: la tarjeta muestra la píldora
     PRÓXIMAMENTE y el visor muestra el aviso "Muy pronto sumamos fotos y
     videos reales de esta área.". Las rutas .jpg generan automáticamente su
     variante .webp para <picture>: ambos archivos existen siempre.
     --------------------------------------------------------------------------- */

  const GALERIA = {
    quinceanos: {
      titulo: '15 Años',
      icono: 'corona',
      portada: null,
      items: []
    },
    bodas: {
      titulo: 'Bodas',
      icono: 'anillo',
      portada: null,
      items: []
    },
    novias: {
      titulo: 'Exclusivo Novias y Asesorías',
      icono: 'diamante',
      portada: null,
      items: []
    },
    prensa: {
      titulo: 'Prensa',
      icono: 'camara',
      portada: null,
      items: []
    },
    espejo: {
      titulo: 'Bendito Espejo',
      icono: 'espejo',
      portada: null,
      items: []
    },
    corporativos: {
      titulo: 'Corporativos',
      icono: 'maletin',
      portada: null,
      items: []
    },
    docencia: {
      titulo: 'Docencia y Formación',
      icono: 'gorra',
      portada: null,
      items: []
    }
  };

  /* Fusión con assets/js/galeria-data.js.
     Es totalmente opcional: si el archivo no se cargó, es un objeto inválido o
     le falta la clave, la categoría se deja tal como está (vacía) y el sitio
     sigue funcionando con el aviso "Próximamente". Sólo entran los items con
     `src` utilizable, así que ningún medio roto llega al DOM. */
  (function fusionarDatosGaleria() {
    const datos = window.DI_GALERIA;
    if (!datos || typeof datos !== 'object') return;

    Object.keys(GALERIA).forEach(function (clave) {
      const cat = GALERIA[clave];
      const entrada = datos[clave];
      if (!cat || !entrada || typeof entrada !== 'object') return;

      const items = Array.isArray(entrada.items)
        ? entrada.items.filter(function (item) {
            return item && typeof item.src === 'string' && item.src;
          })
        : [];

      if (!items.length) return;

      cat.items = items;
      /* La portada sólo se acepta si además hay contenido: si no, la tarjeta
         quedaría con una foto suelta y sin contador ni visor con piezas. */
      cat.portada = typeof entrada.portada === 'string' && entrada.portada ? entrada.portada : null;
      cat.portadaW = entrada.portadaW;
      cat.portadaH = entrada.portadaH;
    });
  })();

  /* Clave de icono → id del sprite SVG. */
  const ICONOS_GALERIA = {
    corona: 'i-crown',
    anillo: 'i-ring',
    diamante: 'i-diamond',
    camara: 'i-camera',
    espejo: 'i-mirror',
    maletin: 'i-briefcase',
    gorra: 'i-cap'
  };

  const EQUIPO = [
    {
      nombre: 'Deborah Núñez',
      rol: 'Dirección Ejecutiva',
      foto: 'assets/images/deborah-perfil.jpg',
      webp: 'assets/images/deborah-perfil.webp'
    },
    {
      nombre: 'Nuestro equipo',
      rol: 'Producción y Consultoría',
      foto: 'assets/images/equipo-2026.jpg',
      webp: 'assets/images/equipo-2026.webp'
    }
  ];

  /* TESTIMONIOS
     ---------------------------------------------------------------------------
     Las 12 reseñas reales, en el orden de la web original. Se renderizan en el
     carrusel de reseñas (#reviewsTrack): puntos, flechas, swipe y autoplay de
     6 s. El autoplay se pausa con el hover, el foco, la pestaña oculta y
     prefers-reduced-motion, y se apaga para siempre en la primera interacción.

     Campos por reseña:
       texto   → la reseña, SIN comillas (la comilla de apertura dorada la pone
                 el CSS de .review-text).
       autor   → nombre del cliente; el avatar toma su primer carácter.
       detalle → relación con el evento. Se muestra tal cual figura acá, con o
                 sin paréntesis: es parte del dato, no algo a normalizar.
       fuente  → 'Instagram' | 'Casamientos.com.ar'. La línea de la tarjeta se
                 arma como 'Reseña verificada en ' + fuente.
     --------------------------------------------------------------------------- */

  const TESTIMONIOS = [
    {
      texto: 'Todo salió fantástico, recibí muchos halagos de todos y es gracias a Débora que trabaja con el alma. Los amigos de mi hija hicieron un ranking de fiestas de 15... ¡y la nuestra fue la número uno! El proceso también fue hermoso para nosotros como familia.',
      autor: 'Pablo Ceballos',
      detalle: 'Papá de Cami (15 años)',
      fuente: 'Instagram'
    },
    {
      texto: 'Nuestra experiencia con Deborah de Divina Inspiración fue fabulosa! Desde la primera reunión nos sentimos muy a gusto, y ni hablar de la fiesta: ella nos supo guiar en todo. No podríamos haber tenido mejor organizadora, Deborah hizo de ese momento uno de los mejores de nuestra vida, la súper recomiendo. Excelente profesional y hermosa persona. Todo salió excelente, y todo su equipo es fantástico.',
      autor: 'Marina Brizuela',
      detalle: 'Mamá de Cami (15 años)',
      fuente: 'Instagram'
    },
    {
      texto: 'Débora, desde el inicio, estuvo muy atenta a nuestros deseos y nos transmitió mucha seguridad para poder realizar todo lo que deseábamos. La fiesta salió espectacular, estuvo en todos los detalles que deseábamos, ante dificultades muy resolutiva al instante, súper empática y alegre en todo momento, nos hizo sentir en paz. Además, todo su trabajo fue hermoso, súper recomendable.',
      autor: 'Alanís Mora',
      detalle: '(Boda Franco y Ali)',
      fuente: 'Casamientos.com.ar'
    },
    {
      texto: 'Muchas gracias a Débora por todo el servicio, estuvo espectacular todo. Desde el primer contacto hasta el último momento se ocupó de que todo saliera perfecto ese día. Supo entendernos y acompañarnos en nuestras decisiones.',
      autor: 'Fernanda',
      detalle: 'Boda Dami & Fer',
      fuente: 'Casamientos.com.ar'
    },
    {
      texto: 'Débora le pone mucha dedicación y pasión a su trabajo, se nota y se plasma en lo que hace. Increíble la noche que pasamos, impecable todo. Débora y su equipo estuvieron en todo, súper profesionales. Los comentarios de los invitados no hacen más que hablar maravillas de la organización.',
      autor: 'Robert Dahir',
      detalle: 'Boda Vane y Robert',
      fuente: 'Casamientos.com.ar'
    },
    {
      texto: 'Una experiencia fantástica, inmejorable. Todo salió impecable como lo soñamos juntas y como lo soñó Anat. Débora y su equipo estuvieron en todos los detalles, captaron nuestras coordenadas de último momento y lo entendieron a la perfección. Débora organizó todo a la distancia: nosotros, la familia, viviendo en Israel, y ella y su equipo en Córdoba, y nos conocimos cuatro días antes. ¡Superó todas nuestras expectativas!',
      autor: 'Jessica Baremberg',
      detalle: 'Mamá de Anat (Bar Mitzvah)',
      fuente: 'Instagram'
    },
    {
      texto: 'Agradecidos de corazón con Débora y su equipo por acompañarlos con tanta dedicación y cariño. Cada detalle y cada palabra de calma hicieron que vivieran su noche con una felicidad inmensa. Siempre atentas en todo. No hubiera sido lo mismo sin ellas.',
      autor: 'Kari Idiarte',
      detalle: '(Boda Kari y Lucas)',
      fuente: 'Instagram'
    },
    {
      texto: 'Unos genios totales, con un corazón de oro. Se nota que aman lo que hacen: se notó todo el amor, la dedicación y el esfuerzo.',
      autor: 'Ayelén G.',
      detalle: 'Mamá de Martina (Marti)',
      fuente: 'Instagram'
    },
    {
      texto: 'Sin dudas, la mejor decisión de nuestra boda fue contratar a Divina Inspiración. Estuvieron de principio a fin en cada detalle. Excelentes en todo.',
      autor: 'Matías Luchini',
      detalle: '(Boda Mati y Melody)',
      fuente: 'Casamientos.com.ar'
    },
    {
      texto: 'Queríamos sí o sí a Deborah para los 15 de nuestra hija, y la verdad fue más que acertada la decisión. No hubiera sido lo mismo sin ella y su equipo. Totalmente agradecidos por hacer una fiesta tan inolvidable. ¡Súper emocionados!',
      autor: 'Roxana Disca',
      detalle: 'Mamá de Maru (15 años)',
      fuente: 'Instagram'
    },
    {
      texto: 'Agradecidos por toda la organización de nuestro casamiento, Deborah y el equipo estuvieron en todo. Excelente, altamente recomendada.',
      autor: 'Hugo Salvador',
      detalle: '(Boda Hugo y Cari)',
      fuente: 'Casamientos.com.ar'
    },
    {
      texto: 'Felices, muy contentos con toda la organización. Débora estuvo siempre pendiente de todo desde la primera reunión. La súper recomendamos, excelente profesional y persona.',
      autor: 'Melina Landa',
      detalle: 'Boda Meli & Gastón',
      fuente: 'Casamientos.com.ar'
    }
  ];

  /* =======================================================================
     02. UTILIDADES
     ===================================================================== */

  const WHATSAPP_NUMBER = '549351225946';
  const apiEndpoint = null; // Reemplazar por una URL real para activar el envío por HTTP.

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.prototype.slice.call((ctx || document).querySelectorAll(sel));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const focusables = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])';

  function toWebp(src) {
    return /\.(jpe?g|png)$/i.test(src) ? src.replace(/\.(jpe?g|png)$/i, '.webp') : null;
  }

  /* <picture> con la variante .webp derivada del nombre del .jpg/.png.
     `dims` acepta { w, h } para fijar width/height y reservar el espacio antes
     de que la imagen decodifique (evita saltos de layout). */
  function crearPicture(src, alt, className, dims) {
    const picture = document.createElement('picture');
    const webp = toWebp(src);
    if (webp) {
      const source = document.createElement('source');
      source.srcset = webp;
      source.type = 'image/webp';
      picture.appendChild(source);
    }
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';
    img.loading = 'lazy';
    img.decoding = 'async';
    if (dims && dims.w > 0 && dims.h > 0) {
      img.width = dims.w;
      img.height = dims.h;
    }
    if (className) img.className = className;
    picture.appendChild(img);
    return picture;
  }

  function html(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function sanear(valor) {
    return String(valor || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  function getMaxParallax() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--parallax');
    const valor = parseFloat(raw);
    return isNaN(valor) ? 0 : Math.min(Math.abs(valor), 12);
  }

  /* Trampa de foco compartida por menú, modales y lightbox */
  let lastFocused = null;

  function recordarFoco(origen) {
    if (origen && typeof origen.focus === 'function') {
      lastFocused = origen;
    } else if (document.activeElement && document.activeElement !== document.body) {
      lastFocused = document.activeElement;
    }
  }

  /* Enfoca recién cuando la capa ya es visible: un setTimeout fijo puede fallar
     si el hilo se retrasa, dejando el foco en <body>. Doble rAF garantiza el flush. */
  function enfocarEl(el) {
    if (!el || typeof el.focus !== 'function') return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (el.isConnected) el.focus();
      });
    });
  }

  function trap(container, event) {    const items = $$(focusables, container).filter(function (el) {
      return el.offsetParent !== null || el === document.activeElement;
    });
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* abrirCapa(capa, disparador): el foco vuelve siempre al disparador */
  function openLayer(layer, trigger) {
    recordarFoco(trigger);
    layer.classList.add('is-open');
    layer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    const target = $(focusables, layer);
    if (target) enfocarEl(target);
  }

  function closeLayer(layer) {
    if (!layer.classList.contains('is-open')) return;
    layer.classList.remove('is-open');
    layer.setAttribute('aria-hidden', 'true');
    if (!$('.is-open')) document.body.classList.remove('is-locked');
    if (lastFocused && lastFocused.isConnected && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  /* =======================================================================
     03. HEADER, BARRA DE LECTURA Y PARALLAX
     ======================================================================= */

  function initHeader() {
    const header = $('#siteHeader');
    const barra = $('#readingProgress');
    if (!header || !barra) return;

    let ticking = false;

    function actualizar() {
      const y = window.scrollY || window.pageYOffset;
      header.classList.toggle('is-scrolled', y > 12);

      const alto = document.documentElement.scrollHeight - window.innerHeight;
      const avance = alto > 0 ? Math.min(100, Math.max(0, (y / alto) * 100)) : 0;
      barra.style.width = avance + '%';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(actualizar);
        ticking = true;
      }
    }, { passive: true });

    actualizar();
  }

  function initParallax() {
    const elementos = $$('[data-parallax]');
    if (!elementos.length) return;

    let maximo = getMaxParallax();

    function pintar() {
      if (reduceMotion.matches) {
        elementos.forEach(function (el) { el.style.transform = ''; });
        return;
      }
      const centro = window.innerHeight / 2;
      elementos.forEach(function (el) {
        const factor = parseFloat(el.dataset.parallax) || 0;
        const caja = el.getBoundingClientRect();
        const delta = (caja.top + caja.height / 2 - centro) / window.innerHeight;
        el.style.transform = 'translate3d(0,' + (-delta * factor * maximo).toFixed(2) + 'px,0)';
      });
    }

    let ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(pintar);
        ticking = true;
      }
    }, { passive: true });
    window.addEventListener('resize', function () {
      maximo = getMaxParallax();
      pintar();
    }, { passive: true });

    reduceMotion.addEventListener('change', pintar);
    pintar();
  }

  /* =====================================================================
     04. MENÚ MÓVIL
     ===================================================================== */

  function initMenuMovil() {
    const menu = $('#mobileMenu');
    const overlay = $('#overlay');
    const abrir = $('#openMenu');
    const cerrar = $('#closeMenu');
    if (!menu || !overlay || !abrir) return;

    function setAbierto(estado) {
      menu.classList.toggle('is-open', estado);
      overlay.classList.toggle('is-open', estado);
      menu.setAttribute('aria-hidden', estado ? 'false' : 'true');
      abrir.setAttribute('aria-expanded', estado ? 'true' : 'false');
      document.body.classList.toggle('is-locked', estado);
      if (estado) {
        recordarFoco(abrir);
        setTimeout(function () { const f = $(focusables, menu); if (f) f.focus(); }, 120);
      } else if (lastFocused && lastFocused.isConnected && lastFocused.focus) {
        lastFocused.focus();
      }
    }

    abrir.addEventListener('click', function () { setAbierto(true); });
    if (cerrar) cerrar.addEventListener('click', function () { setAbierto(false); });
    overlay.addEventListener('click', function () { setAbierto(false); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setAbierto(false); }); });

    document.addEventListener('keydown', function (e) {
      if (!menu.classList.contains('is-open')) return;
      if (e.key === 'Escape') setAbierto(false);
      if (e.key === 'Tab') trap(menu, e);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 980) setAbierto(false);
    });
  }

  /* =====================================================================
     05. SCROLL SPY
     ===================================================================== */

  function initScrollSpy() {
    const enlaces = $$('.nav-links a, .mobile-menu__list a');
    if (!enlaces.length || !('IntersectionObserver' in window)) return;

    const porId = {};
    enlaces.forEach(function (a) {
      const id = a.getAttribute('href').replace('#', '');
      if (!id) return;
      (porId[id] = porId[id] || []).push(a);
    });

    const secciones = Object.keys(porId)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    if (!secciones.length) return;

    const visibles = {};

    const observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) { visibles[entrada.target.id] = entrada.intersectionRatio; });
      let mejor = null;
      let mejorRatio = 0;
      Object.keys(visibles).forEach(function (id) {
        if (visibles[id] > mejorRatio) { mejorRatio = visibles[id]; mejor = id; }
      });
      enlaces.forEach(function (a) { a.removeAttribute('aria-current'); });
      if (mejor && mejorRatio > 0 && porId[mejor]) {
        porId[mejor].forEach(function (a) { a.setAttribute('aria-current', 'true'); });
      }
    }, { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] });

    secciones.forEach(function (s) { observador.observe(s); });
  }

  /* =====================================================================
     06. REVELADO PROGRESIVO
     ===================================================================== */

  function initReveal() {
    const objetivos = $$('.reveal, .reveal-scale');
    if (!objetivos.length) return;

    if (!('IntersectionObserver' in window) || reduceMotion.matches) {
      objetivos.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    /* Stagger: distribute delays in groups of six */
    const paso = 90;
    objetivos.forEach(function (el, i) {
      if (!el.style.getPropertyValue('--reveal-delay')) {
        const grupo = Math.floor(i / 6);
        el.style.setProperty('--reveal-delay', (grupo * paso) + 'ms');
      }
    });

    const observador = new IntersectionObserver(function (entradas, obs) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('is-visible');
          obs.unobserve(entrada.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    objetivos.forEach(function (el) { observador.observe(el); });
  }

  /* =====================================================================
     07. CONTADORES ESTADÍSTICOS
     ===================================================================== */

  function initContadores() {
    const stats = $$('.stat b');
    if (!stats.length || !('IntersectionObserver' in window) || reduceMotion.matches) return;

    const observador = new IntersectionObserver(function (entradas, obs) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        const el = entrada.target;
        obs.unobserve(el);
        const final = el.textContent.trim();
        const numero = parseInt(final.replace(/[^\d]/g, ''), 10);
        if (isNaN(numero)) return;
        const prefijo = final.charAt(0) === '+' ? '+' : '';
        const duracion = 900;
        const inicio = performance.now();

        function paso(t) {
          const p = Math.min(1, (t - inicio) / duracion);
          const valor = Math.round(numero * (1 - Math.pow(1 - p, 3)));
          el.textContent = prefijo + valor + (final.indexOf('+') > -1 && final.charAt(0) !== '+' ? '+' : '');
          if (p < 1) requestAnimationFrame(paso);
          else el.textContent = final;
        }
        requestAnimationFrame(paso);
      });
    }, { threshold: 0.6 });

    stats.forEach(function (el) { observador.observe(el); });
  }

  /* =======================================================================
     08. GALERÍA POR CATEGORÍAS
     ======================================================================= */

  const galeriaEstado = { clave: '', items: [], indice: 0, titulo: '' };

  function mediosDe(categoria) {
    return categoria && Array.isArray(categoria.items) ? categoria.items : [];
  }

  /* Normaliza un medio: todo item expone tipo, src, thumb, poster y alt.
     `w`/`h` son opcionales (los agrega el generador) y sólo sirven para
     reservar el espacio de la imagen. */
  function normalizarMedio(item, titulo, indice) {
    const src = (item && item.src) || '';
    return {
      tipo: item && item.tipo === 'video' ? 'video' : 'foto',
      src: src,
      thumb: (item && item.thumb) || (item && item.poster) || src,
      poster: (item && item.poster) || '',
      alt: (item && item.alt) || (titulo + ' — ' + (indice + 1)),
      w: parseInt(item && item.w, 10) || 0,
      h: parseInt(item && item.h, 10) || 0
    };
  }

  function listaMedios(clave) {
    const cat = GALERIA[clave];
    if (!cat) return [];
    return mediosDe(cat).map(function (item, i) {
      return normalizarMedio(item, cat.titulo, i);
    });
  }

  /* "3 fotos · 1 video" / "5 fotos" / "1 foto" — siempre concordante. */
  function resumenMedios(items) {
    const videos = items.filter(function (m) { return m.tipo === 'video'; }).length;
    const fotos = items.length - videos;
    const plural = function (n, singular, pluralMayus) {
      return n + ' ' + (n === 1 ? singular : pluralMayus);
    };
    if (fotos && videos) return plural(fotos, 'foto', 'fotos') + ' · ' + plural(videos, 'video', 'videos');
    if (videos) return plural(videos, 'video', 'videos');
    return plural(fotos, 'foto', 'fotos');
  }

  /* Imagen de fondo de la tarjeta: `portada` de la categoría y, si faltara, la
     foto completa del primer medio. Nunca la miniatura de la tira: a ese tamaño
     se ve pixelada como fondo. */
  function portadaDe(cat, items) {
    if (cat.portada) return cat.portada;
    if (!items.length) return '';
    return items[0].src || items[0].thumb || '';
  }

  function initGaleria() {
    const grid = $('#galleryGrid');
    if (!grid) return;

    grid.innerHTML = Object.keys(GALERIA).map(function (clave) {
      const cat = GALERIA[clave];
      const items = listaMedios(clave);
      const conMedios = items.length > 0;
      const iconoId = ICONOS_GALERIA[cat.icono] || 'i-camera';
      const portada = portadaDe(cat, items);
      const estado = conMedios ? 'gallery-cat-card--con-medios' : 'gallery-cat-card--vacia';

      return '' +
        '<button type="button" class="gallery-cat-card reveal ' + estado + '"' +
        ' data-cat="' + clave + '"' +
        ' aria-label="Abrir galería de ' + html(cat.titulo) + '">' +
          (conMedios && portada
            ? '<span class="gallery-cat-card__media">' +
              crearPicture(portada, '', null, { w: cat.portadaW, h: cat.portadaH }).outerHTML +
              '</span>'
            : '') +
          '<svg class="cat-icon" aria-hidden="true"><use href="#' + iconoId + '"></use></svg>' +
          '<span class="cat-line" aria-hidden="true"></span>' +
          '<span class="gallery-caption">' + html(cat.titulo) + '</span>' +
          (conMedios
            ? '<span class="cat-count">' + resumenMedios(items) + '</span>'
            : '<span class="cat-pill">Próximamente</span>') +
        '</button>';
    }).join('');

    $$('.gallery-cat-card', grid).forEach(function (card) {
      card.addEventListener('click', function () {
        abrirCategoria(card.dataset.cat, card);
      });
    });
  }

  /* Abre el visor directo por categoría. Sin medios muestra el aviso funcional
     dentro del propio visor; con medios, la primera pieza. */
  function abrirCategoria(clave, disparador) {
    const cat = GALERIA[clave];
    if (!cat) return;

    galeriaEstado.clave = clave;
    galeriaEstado.titulo = cat.titulo;
    galeriaEstado.items = listaMedios(clave);
    galeriaEstado.indice = 0;

    $$('.gallery-cat-card').forEach(function (c) { c.classList.remove('is-active'); });
    if (disparador) disparador.classList.add('is-active');

    const hay = galeriaEstado.items.length > 0;
    const vacio = $('#lightboxEmpty');
    const escenario = $('#lightboxStage');
    const tira = $('#lightboxThumbs');
    const titulo = $('#lightboxTitle');

    if (vacio) vacio.hidden = hay;
    if (escenario) escenario.hidden = !hay;
    if (tira) tira.hidden = !hay;
    if (titulo) titulo.textContent = cat.titulo;

    if (hay) {
      pintarTira();
      pintarMedio(0, false);
    } else {
      const contador = $('#lightboxCounter');
      if (contador) contador.textContent = '0 / 0';
      vaciarTira();
    }

    abrirVisor(disparador);
  }

  /* =======================================================================
     09. VISOR DE GALERÍA
     ======================================================================= */

  function abrirVisor(disparador) {
    const visor = $('#lightbox');
    if (!visor) return;

    visor.classList.add('is-open');
    visor.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    recordarFoco(disparador);

    const primero = galeriaEstado.items.length
      ? $('#lightboxClose')
      : $('#lightboxEmptyClose');
    enfocarEl(primero);
  }

  /* Escribe el medio actual en el escenario (foto o video). */
  function pintarMedio(indice, animar) {
    const item = galeriaEstado.items[indice];
    if (!item) return;

    const figura = $('#lightboxFigure');
    const img = $('#lightboxImg');
    const video = $('#lightboxVideo');
    const contador = $('#lightboxCounter');
    const titulo = $('#lightboxTitle');
    const total = galeriaEstado.items.length;

    if (contador) contador.textContent = (indice + 1) + ' / ' + total;
    if (titulo) titulo.textContent = galeriaEstado.titulo;

    const aplicar = function () {
      if (item.tipo === 'video') {
        if (img) {
          img.hidden = true;
          img.removeAttribute('src');
          img.removeAttribute('width');
          img.removeAttribute('height');
        }
        if (video) {
          video.hidden = false;
          if (item.poster) video.poster = item.poster;
          if (video.getAttribute('src') !== item.src) video.setAttribute('src', item.src);
          video.setAttribute('aria-label', item.alt);
        }
      } else {
        if (video) {
          video.pause();
          video.hidden = true;
          video.removeAttribute('src');
          video.load();
        }
        if (img) {
          img.hidden = false;
          img.src = item.src;
          img.alt = item.alt;
          /* width/height reales: el navegador reserva la caja con la proporción
             correcta y la figura no salta al decodificar. */
          if (item.w > 0 && item.h > 0) {
            img.width = item.w;
            img.height = item.h;
          } else {
            img.removeAttribute('width');
            img.removeAttribute('height');
          }
        }
      }
      if (figura) figura.classList.remove('is-cambiando');
    };

    if (animar && figura && !reduceMotion.matches) {
      figura.classList.add('is-cambiando');
      setTimeout(aplicar, 160);
    } else {
      aplicar();
    }

    marcarMiniatura(indice);
    precargar(vecinos(indice));
  }

  function moverVisor(delta) {
    const total = galeriaEstado.items.length;
    if (!total) return;
    galeriaEstado.indice = (galeriaEstado.indice + delta + total) % total;
    pintarMedio(galeriaEstado.indice, true);
  }

  function irA(indice) {
    if (!galeriaEstado.items[indice]) return;
    galeriaEstado.indice = indice;
    pintarMedio(indice, true);
  }

  /* Precarga los vecinos para que el avance sea instantáneo. */
  function vecinos(indice) {
    const total = galeriaEstado.items.length;
    if (total < 2) return [];
    return [(indice + 1) % total, (indice - 1 + total) % total];
  }

  /* Precarga los vecinos para que el avance sea instantáneo.
     Los objetos se retienen en una caché acotada: si quedaran sin referencia el
     navegador puede recolectarlos a mitad de la descarga y cortar la petición
     (ERR_ABORTED) justo cuando el usuario ya avanzó a esa foto. */
  const precargaCache = [];

  function precargar(lista) {
    lista.forEach(function (i) {
      const item = galeriaEstado.items[i];
      if (!item) return;
      if (item.tipo === 'video') {
        const v = document.createElement('video');
        v.preload = 'metadata';
        v.muted = true;
        v.setAttribute('src', item.src);
        v.load();
        precargaCache.push(v);
      } else {
        const p = new Image();
        p.decoding = 'async';
        p.src = item.src;
        precargaCache.push(p);
      }
    });
    while (precargaCache.length > 12) precargaCache.shift();
  }

  /* ---------- Tira de miniaturas ---------- */

  function pintarTira() {
    const tira = $('#lightboxThumbs');
    if (!tira) return;

    tira.innerHTML = galeriaEstado.items.map(function (item, i) {
      return '' +
        '<button type="button" class="lightbox__thumb" data-indice="' + i + '"' +
        ' aria-label="' + html(item.alt) + '">' +
          '<img src="' + html(item.thumb || item.src) + '" alt="" loading="lazy" decoding="async">' +
          (item.tipo === 'video'
            ? '<span class="lightbox__thumb-play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg></span>'
            : '') +
        '</button>';
    }).join('');

    $$('.lightbox__thumb', tira).forEach(function (btn) {
      btn.addEventListener('click', function () {
        irA(Number(btn.dataset.indice));
      });
    });
  }

  function vaciarTira() {
    const tira = $('#lightboxThumbs');
    if (tira) tira.innerHTML = '';
  }

  function marcarMiniatura(indice) {
    $$('.lightbox__thumb').forEach(function (btn, i) {
      const activo = i === indice;
      btn.classList.toggle('is-active', activo);
      btn.setAttribute('aria-current', activo ? 'true' : 'false');
    });
    const activa = $('.lightbox__thumb.is-active');
    if (activa && activa.scrollIntoView) {
      activa.scrollIntoView({ block: 'nearest', inline: 'center' });
    }
  }

  function cerrarVisor() {
    const visor = $('#lightbox');
    if (!visor) return;

    const video = $('#lightboxVideo');
    if (video) { video.pause(); video.removeAttribute('src'); video.load(); }

    visor.classList.remove('is-open');
    visor.setAttribute('aria-hidden', 'true');
    /* La tarjeta activa se limpia siempre, sin importar cómo se cierre el visor. */
    $$('.gallery-cat-card').forEach(function (c) { c.classList.remove('is-active'); });
    if (!$('.modal-overlay.is-open, .mobile-menu.is-open')) document.body.classList.remove('is-locked');
    if (lastFocused && lastFocused.isConnected && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function initVisor() {
    const visor = $('#lightbox');
    if (!visor) return;

    const anterior = $('#lightboxPrev');
    const siguiente = $('#lightboxNext');
    const cerrar = $('#lightboxClose');
    const cerrarVacio = $('#lightboxEmptyClose');

    if (anterior) anterior.addEventListener('click', function () { moverVisor(-1); });
    if (siguiente) siguiente.addEventListener('click', function () { moverVisor(1); });
    if (cerrar) cerrar.addEventListener('click', cerrarVisor);
    if (cerrarVacio) cerrarVacio.addEventListener('click', cerrarVisor);

    visor.addEventListener('click', function (e) {
      if (e.target === visor) cerrarVisor();
    });

    /* Swipe horizontal en táctil. */
    let x0 = 0;
    let y0 = 0;
    let deslizando = false;

    visor.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
      deslizando = true;
    }, { passive: true });

    visor.addEventListener('touchend', function (e) {
      if (!deslizando) return;
      deslizando = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - x0;
      const dy = t.clientY - y0;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
      moverVisor(dx < 0 ? 1 : -1);
    }, { passive: true });

    document.addEventListener('keydown', function (e) {
      if (!visor.classList.contains('is-open')) return;
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        e.preventDefault();
        cerrarVisor();
        return;
      }
      if (e.key === 'ArrowLeft') { e.preventDefault(); moverVisor(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); moverVisor(1); }
      if (e.key === 'Tab') trap(visor, e);
    });
  }

  /* =====================================================================
     10. TESTIMONIOS (CARRUSEL)
     ===================================================================== */

  /* Reseñas que se ven a la vez. El cálculo real deriva del ancho de tarjeta
     (como en el carrusel anterior), pero queda acotado entre estas dos
     constantes para poder ajustarlas sin tocar el resto del código. */
  const POR_PANTALLA_DESKTOP = 3;
  const POR_PANTALLA_MOVIL = 1;
  const REPRODUCCION_AUTO_MS = 6000;

  /* Espacio de trabajo: los svg de estrellas y controles son estáticos.
     Todo el texto de las reseñas entra por textContent: nunca innerHTML
     con datos. */
  const NS_SVG = 'http://www.w3.org/2000/svg';

  function crearIcono(useHref) {
    const svg = document.createElementNS(NS_SVG, 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(NS_SVG, 'use');
    use.setAttribute('href', useHref);
    svg.appendChild(use);
    return svg;
  }

  function initTestimonios() {
    const track = $('#reviewsTrack');
    const dots = $('#reviewDots');
    const prev = $('#reviewPrev');
    const next = $('#reviewNext');
    const viewport = $('#reviewsViewport');
    const seccion = $('#testimonios');
    if (!track || !TESTIMONIOS.length) return;

    /* ----- Render de las 12 tarjetas ----- */
    const fragmento = document.createDocumentFragment();
    TESTIMONIOS.forEach(function (t) {
      const li = document.createElement('li');
      li.className = 'review-card';

      const estrellas = document.createElement('div');
      estrellas.className = 'review-stars';
      estrellas.setAttribute('role', 'img');
      estrellas.setAttribute('aria-label', 'Valoración: 5 de 5 estrellas');
      for (let i = 0; i < 5; i++) estrellas.appendChild(crearIcono('#i-star'));

      const texto = document.createElement('p');
      texto.className = 'review-text';
      texto.textContent = t.texto;

      const fuente = document.createElement('p');
      fuente.className = 'review-source';
      fuente.textContent = 'Reseña verificada en ' + t.fuente;

      const autor = document.createElement('div');
      autor.className = 'review-author';
      const inicial = document.createElement('span');
      inicial.className = 'review-author__initials';
      inicial.setAttribute('aria-hidden', 'true');
      inicial.textContent = (t.autor || '').trim().charAt(0).toUpperCase();
      const bloque = document.createElement('span');
      const nombre = document.createElement('b');
      nombre.textContent = t.autor;
      const detalle = document.createElement('span');
      detalle.textContent = t.detalle;
      bloque.appendChild(nombre);
      bloque.appendChild(detalle);
      autor.appendChild(inicial);
      autor.appendChild(bloque);

      li.appendChild(estrellas);
      li.appendChild(texto);
      li.appendChild(fuente);
      li.appendChild(autor);
      fragmento.appendChild(li);
    });
    track.appendChild(fragmento);

    /* ----- Estado y transitado ----- */
    let indice = 0;
    let porPagina = POR_PANTALLA_MOVIL;
    let auto = null;
    /* El autoplay se pausa mientras el mouse está encima o hay un control
       enfocado, pero en cuanto el usuario toma el control (flecha, punto,
       teclado o swipe) no vuelve a arrancar. */
    let takeover = false;

    function maxIndice() {
      return Math.max(0, TESTIMONIOS.length - porPagina);
    }

    function medir() {
      const tarjeta = track.firstElementChild;
      if (!tarjeta) return;
      const ancho = tarjeta.getBoundingClientRect().width;
      const separacion = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 20;
      const calculado = Math.round((viewport.clientWidth + separacion) / (ancho + separacion));
      porPagina = Math.max(POR_PANTALLA_MOVIL, Math.min(calculado, POR_PANTALLA_DESKTOP));
      if (indice > maxIndice()) indice = maxIndice();
      pintar();
    }

    function pintar() {
      const tarjeta = track.firstElementChild;
      if (!tarjeta) return;
      const ancho = tarjeta.getBoundingClientRect().width;
      const separacion = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 20;
      const paso = ancho + separacion;
      track.style.transform = 'translate3d(' + -(indice * paso) + 'px,0,0)';

      if (prev) prev.disabled = indice <= 0;
      if (next) next.disabled = indice >= maxIndice();

      /* Puntos con aria-current; uno por grupo de reseñas. */
      const total = maxIndice() + 1;
      if (dots && dots.childElementCount !== total) {
        dots.innerHTML = '';
        for (let i = 0; i < total; i++) {
          const d = document.createElement('button');
          d.type = 'button';
          d.className = 'carousel-dot';
          d.setAttribute('aria-label', 'Ir al grupo de reseñas ' + (i + 1));
          d.addEventListener('click', function () { indice = i; pintar(); tomarControl(); });
          dots.appendChild(d);
        }
      }
      if (dots) {
        Array.prototype.forEach.call(dots.children, function (d, i) {
          if (i === indice) d.setAttribute('aria-current', 'true');
          else d.removeAttribute('aria-current');
        });
      }

      /* Las tarjetas fuera de pantalla quedan fuera del orden de tabulación y
         del lector de pantalla. */
      Array.prototype.forEach.call(track.children, function (li, i) {
        const visible = i >= indice && i < indice + porPagina;
        li.toggleAttribute('aria-hidden', !visible);
        if (typeof li.inert === 'boolean') li.inert = !visible;
        else if (!visible) li.setAttribute('inert', '');
        else li.removeAttribute('inert');
      });
    }

    function avanzar(delta) {
      indice = Math.min(maxIndice(), Math.max(0, indice + delta));
      pintar();
    }

    function detener() {
      if (auto) clearInterval(auto);
      auto = null;
    }

    function reiniciar() {
      detener();
      if (takeover || reduceMotion.matches) return;
      auto = setInterval(function () { avanzar(1); }, REPRODUCCION_AUTO_MS);
    }

    /* Definitivo: desde acá el carrusel lo maneja la persona y el autoplay no
       vuelve a arrancar, aunque saque el mouse o cambie la visibilidad. */
    function tomarControl() {
      takeover = true;
      detener();
    }

    /* ----- Controles ----- */
    if (prev) prev.addEventListener('click', function () { tomarControl(); avanzar(-1); });
    if (next) next.addEventListener('click', function () { tomarControl(); avanzar(1); });

    /* Pausa al pasar el mouse o al enfocar, se reanuda al salir. El foco se
       escucha en la sección para que cuente también entrar a los controles, que
       están fuera del viewport; el focusout solo reanuda si el foco salió de
       verdad (relatedTarget fuera de la sección). */
    if (viewport) {
      viewport.addEventListener('mouseenter', detener);
      viewport.addEventListener('mouseleave', reiniciar);
    }
    if (seccion) {
      seccion.addEventListener('focusin', detener);
      seccion.addEventListener('focusout', function (e) {
        if (!seccion.contains(e.relatedTarget)) reiniciar();
      });
    }

    /* Navegación con flechas del teclado. Se escucha en la sección completa y no
       solo en el viewport: los puntos y los botones viven en .carousel-controls,
       afuera del viewport, así que el foco del teclado nunca pasa por él. */
    if (seccion) {
      seccion.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); tomarControl(); avanzar(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); tomarControl(); avanzar(1); }
        if (e.key === 'Home') { e.preventDefault(); tomarControl(); indice = 0; pintar(); }
        if (e.key === 'End') { e.preventDefault(); tomarControl(); indice = maxIndice(); pintar(); }
      });
    }

    /* Swipe en táctiles: deslizar a la izquierda avanza, a la derecha atrás. */
    if (viewport) {
      let xInicio = null;
      viewport.addEventListener('touchstart', function (e) {
        xInicio = e.touches[0].clientX;
      }, { passive: true });
      viewport.addEventListener('touchend', function (e) {
        if (xInicio === null) return;
        const delta = e.changedTouches[0].clientX - xInicio;
        xInicio = null;
        if (Math.abs(delta) < 40) return;
        tomarControl();
        avanzar(delta < 0 ? 1 : -1);
      }, { passive: true });
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) detener();
      else reiniciar();
    });

    window.addEventListener('resize', medir);
    reduceMotion.addEventListener('change', reiniciar);

    medir();
    reiniciar();
  }

  /* =====================================================================
     11. MODALES
     ===================================================================== */

  function initModales() {
    const bendito = $('#benditoModal');
    const disparador = $('[data-open-bendito]');
    if (bendito && disparador) {
      disparador.addEventListener('click', function () { openLayer(bendito, disparador); });
    }

    function cerrarModal(modal) {
      closeLayer(modal);
    }

    $$('.modal-overlay').forEach(function (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) cerrarModal(modal);
      });
      $$('[data-close-modal]', modal).forEach(function (btn) {
        btn.addEventListener('click', function () { cerrarModal(modal); });
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      /* Si el lightbox está abierto es la capa superior: su manejador ya lo cerró. */
      const lightboxAbierto = $('#lightbox') && $('#lightbox').classList.contains('is-open');
      if (lightboxAbierto) return;
      const abierto = $('.modal-overlay.is-open');
      if (abierto) {
        cerrarModal(abierto);
        return;
      }
      const menu = $('#mobileMenu');
      if (menu && menu.classList.contains('is-open')) {
        menu.classList.remove('is-open');
        $('#overlay').classList.remove('is-open');
        menu.setAttribute('aria-hidden', 'true');
        $('#openMenu').setAttribute('aria-expanded', 'false');
        document.body.classList.remove('is-locked');
        $('#openMenu').focus();
      }
    });

    $$('.modal-overlay').forEach(function (modal) {
      modal.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') trap(modal, e);
      });
    });
  }

  /* =====================================================================
     12. FORMULARIO DE CONTACTO
     ===================================================================== */

  function initFormulario() {
    const form = $('#eventForm');
    if (!form) return;

    const campos = [
      { id: 'f-name', error: 'err-f-name', vacio: 'Ingresá tu nombre o empresa.', corto: 'El nombre debe tener al menos 2 caracteres.' },
      { id: 'f-phone', error: 'err-f-phone', vacio: 'Ingresá un teléfono de contacto.', corto: 'Ingresá un teléfono válido (mínimo 8 dígitos).' },
      { id: 'f-service', error: 'err-f-service', vacio: 'Elegí un tipo de evento.' }
    ];

    const estado = $('#formStatus');
    const boton = $('#submitBtn');
    const etiqueta = $('#submitLabel');
    const detalles = $('#f-details');
    const contador = $('#detailsCount');

    function marcar(campo, mensaje) {
      const input = $('#' + campo.id);
      const destino = $('#' + campo.error);
      const grupo = input.closest('.form-group');
      if (mensaje) {
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', campo.error);
        destino.textContent = mensaje;
        grupo.classList.add('has-error');
      } else {
        input.removeAttribute('aria-invalid');
        destino.textContent = '';
        grupo.classList.remove('has-error');
      }
    }

    function validar(campo) {
      const input = $('#' + campo.id);
      const valor = sanear(input.value);
      if (campo.id === 'f-service') {
        marcar(campo, valor ? '' : campo.vacio);
        return valor;
      }
      if (!valor) {
        marcar(campo, campo.vacio);
        return '';
      }
      if (campo.id === 'f-name' && valor.length < 2) {
        marcar(campo, campo.corto);
        return '';
      }
      if (campo.id === 'f-phone' && valor.replace(/\D/g, '').length < 8) {
        marcar(campo, campo.corto);
        return '';
      }
      marcar(campo, '');
      return valor;
    }

    campos.forEach(function (campo) {
      const input = $('#' + campo.id);
      input.addEventListener('blur', function () { validar(campo); });
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid') === 'true') validar(campo);
      });
      input.addEventListener('change', function () { validar(campo); });
    });

    if (detalles && contador) {
      detalles.addEventListener('input', function () {
        contador.textContent = String(detalles.value.length);
      });
    }

    function anunciar(texto, tipo) {
      if (!estado) return;
      estado.textContent = texto;
      estado.className = 'form-status' + (tipo ? ' is-' + tipo : '');
    }

    function construirMensaje(datos) {
      return [
        '¡Hola! Soy ' + datos.nombre + '.',
        'Tipo de evento: ' + (datos.tipo || 'a definir'),
        'Mi teléfono: ' + datos.telefono,
        datos.detalles ? 'Detalles: ' + datos.detalles : null
      ].filter(Boolean).join('\n');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      let primerError = null;
      const valores = {};
      campos.forEach(function (campo) {
        const valor = validar(campo);
        valores[campo.id] = valor;
        if (!valor && !primerError) primerError = campo.id;
      });

      if (primerError) {
        anunciar('Revisá los campos marcados para continuar.', 'error');
        const input = $('#' + primerError);
        if (input) input.focus();
        return;
      }

      const datos = {
        nombre: valores['f-name'],
        telefono: valores['f-phone'],
        tipo: $('#f-service').value,
        detalles: sanear(detalles ? detalles.value : '')
      };

      const mensaje = construirMensaje(datos);

      boton.disabled = true;
      etiqueta.textContent = 'Enviando…';

      function finalizar() {
        etiqueta.textContent = '¡Gracias! Te contactaremos pronto';
        anunciar('Listo. Abrimos WhatsApp con tu consulta. Si no se abrió, escribinos al +54 9 351 225-946.', 'ok');
        form.reset();
        if (contador) contador.textContent = '0';
        setTimeout(function () {
          etiqueta.textContent = 'Enviar Solicitud';
          boton.disabled = false;
        }, 4000);
      }

      if (apiEndpoint) {
        fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: datos.nombre,
            telefono: datos.telefono,
            tipo: datos.tipo,
            detalles: datos.detalles,
            origen: 'web'
          })
        })
          .then(function (r) {
            if (!r.ok) throw new Error('Error ' + r.status);
            window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(mensaje), '_blank', 'noopener');
            finalizar();
          })
          .catch(function () {
            boton.disabled = false;
            etiqueta.textContent = 'Enviar Solicitud';
            anunciar('No pudimos registrar tu consulta en línea. Escribinos por WhatsApp y lo resolvemos enseguida.', 'error');
          });
      } else {
        window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(mensaje), '_blank', 'noopener');
        finalizar();
      }
    });
  }

  /* =====================================================================
     13. INICIALIZACIÓN
     ===================================================================== */

  function init() {
    initHeader();
    initParallax();
    initMenuMovil();
    initScrollSpy();
    initGaleria();
    initVisor();
    initContadores();
    // La grilla de testimonios se renderiza antes que initReveal: las tarjetas
    // se crean acá y necesitan quedar observadas para el revelado escalonado.
    initTestimonios();
    initReveal();
    initModales();
    initFormulario();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.DivinaInspiracion = { GALERIA: GALERIA, EQUIPO: EQUIPO, TESTIMONIOS: TESTIMONIOS };
})();
