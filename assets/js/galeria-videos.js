/* Divina Inspiración — datos de VÍDEOS de la galería.
   Archivo GENERADO por scripts/agregar-video.py desde assets/video/videos.json.
   No editar a mano: para sumar, quitar o reordenar un video se usa el script.

     python scripts/agregar-video.py agregar "C:\ruta\video.mp4" --categoria Bodas

   Estructura por categoría (array de items):
     src       → .mp4 dentro de assets/video/<clave>/
     poster    → imagen de presentación (obligatoria: sin ella el video no entra)
     thumb     → miniatura de la tira; si falta, se usa el poster
     alt       → texto alternativo
     posicion  → lugar final entre fotos y videos; si falta, va al final
     w / h     → dimensiones del poster, para reservar el espacio

   Las fotos no están acá: siguen en assets/js/galeria-data.js, que genera
   scripts/generar-galeria.py. Las dos herramientas nunca tocan los archivos de la otra.
   */

window.DI_GALERIA_VIDEOS = {
  quinceanos: [
    { tipo: 'video', src: 'assets/video/quinceanos/01-xv-01.mp4', thumb: 'assets/video/quinceanos/01-xv-01-thumb.jpg', poster: 'assets/video/quinceanos/01-xv-01.jpg', alt: '15 Años — video 1', w: 512, h: 910, posicion: 12 },
    { tipo: 'video', src: 'assets/video/quinceanos/02-xv-02.mp4', thumb: 'assets/video/quinceanos/02-xv-02-thumb.jpg', poster: 'assets/video/quinceanos/02-xv-02.jpg', alt: '15 Años — video 2', w: 512, h: 910, posicion: 13 }
  ],
  bodas: [
    { tipo: 'video', src: 'assets/video/bodas/01-boda-01.mp4', thumb: 'assets/video/bodas/01-boda-01-thumb.jpg', poster: 'assets/video/bodas/01-boda-01.jpg', alt: 'Bodas — video 1', w: 512, h: 910, posicion: 9 },
    { tipo: 'video', src: 'assets/video/bodas/02-boda-02.mp4', thumb: 'assets/video/bodas/02-boda-02-thumb.jpg', poster: 'assets/video/bodas/02-boda-02.jpg', alt: 'Bodas — video 2', w: 512, h: 910, posicion: 10 },
    { tipo: 'video', src: 'assets/video/bodas/03-boda-03.mp4', thumb: 'assets/video/bodas/03-boda-03-thumb.jpg', poster: 'assets/video/bodas/03-boda-03.jpg', alt: 'Bodas — video 3', w: 512, h: 910, posicion: 11 },
    { tipo: 'video', src: 'assets/video/bodas/04-boda-suiza.mp4', thumb: 'assets/video/bodas/04-boda-suiza-thumb.jpg', poster: 'assets/video/bodas/04-boda-suiza.jpg', alt: 'Bodas — video 4', w: 512, h: 910, posicion: 12 }
  ],
  novias: [
    { tipo: 'video', src: 'assets/video/novias/01-novias-asesoria.mp4', thumb: 'assets/video/novias/01-novias-asesoria-thumb.jpg', poster: 'assets/video/novias/01-novias-asesoria.jpg', alt: 'Exclusivo Novias y Asesorías — video 1', w: 576, h: 1024, posicion: 2 }
  ],
  prensa: [
    { tipo: 'video', src: 'assets/video/prensa/01-prensa-01.mp4', thumb: 'assets/video/prensa/01-prensa-01-thumb.jpg', poster: 'assets/video/prensa/01-prensa-01.jpg', alt: 'Prensa — video 1', w: 512, h: 910, posicion: 6 }
  ],
  espejo: [
    { tipo: 'video', src: 'assets/video/espejo/01-espejo-01.mp4', thumb: 'assets/video/espejo/01-espejo-01-thumb.jpg', poster: 'assets/video/espejo/01-espejo-01.jpg', alt: 'Bendito Espejo — video 1', w: 512, h: 910 },
    { tipo: 'video', src: 'assets/video/espejo/02-espejo-02.mp4', thumb: 'assets/video/espejo/02-espejo-02-thumb.jpg', poster: 'assets/video/espejo/02-espejo-02.jpg', alt: 'Bendito Espejo — video 2', w: 512, h: 910 },
    { tipo: 'video', src: 'assets/video/espejo/03-espejo-03.mp4', thumb: 'assets/video/espejo/03-espejo-03-thumb.jpg', poster: 'assets/video/espejo/03-espejo-03.jpg', alt: 'Bendito Espejo — video 3', w: 512, h: 910 }
  ],
  corporativos: [],
  docencia: []
};
