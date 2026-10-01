/* Divina Inspiración — datos de la galería.
   Archivo GENERADO por scripts/generar-galeria.py. No editar a mano:
   para cambiar una foto, reemplazá el original en assets/gallery/<carpeta>/
   y volvé a ejecutar el script.

   Estructura por categoría:
     portada  → foto de fondo de la tarjeta del mosaico
     items[]  → { tipo, src, thumb, alt } y, opcionalmente, w/h para reservar
                el espacio y evitar saltos de layout
   El `src` en .jpg deriva su variante .webp por nombre: ambos existen.
   Para mejorar los textos alternativos, editá `alt` acá (o ajustá el
   título de la categoría en el CATEGORIAS del script y regenerá).
   */

window.DI_GALERIA = {
  quinceanos: {
    portada: 'assets/images/galeria/quinceanos/portada.jpg',
    portadaW: 900,
    portadaH: 474,
    items: [
      { tipo: 'foto', src: 'assets/images/galeria/quinceanos/01.jpg', thumb: 'assets/images/galeria/quinceanos/01-thumb.jpg', alt: '15 Años — foto 1', w: 900, h: 890 },
      { tipo: 'foto', src: 'assets/images/galeria/quinceanos/02.jpg', thumb: 'assets/images/galeria/quinceanos/02-thumb.jpg', alt: '15 Años — foto 2', w: 900, h: 892 },
      { tipo: 'foto', src: 'assets/images/galeria/quinceanos/03.jpg', thumb: 'assets/images/galeria/quinceanos/03-thumb.jpg', alt: '15 Años — foto 3', w: 900, h: 1113 },
      { tipo: 'foto', src: 'assets/images/galeria/quinceanos/04.jpg', thumb: 'assets/images/galeria/quinceanos/04-thumb.jpg', alt: '15 Años — foto 4', w: 900, h: 1075 },
      { tipo: 'foto', src: 'assets/images/galeria/quinceanos/05.jpg', thumb: 'assets/images/galeria/quinceanos/05-thumb.jpg', alt: '15 Años — foto 5', w: 900, h: 1200 },
      { tipo: 'foto', src: 'assets/images/galeria/quinceanos/06.jpg', thumb: 'assets/images/galeria/quinceanos/06-thumb.jpg', alt: '15 Años — foto 6', w: 724, h: 1246 },
      { tipo: 'foto', src: 'assets/images/galeria/quinceanos/07.jpg', thumb: 'assets/images/galeria/quinceanos/07-thumb.jpg', alt: '15 Años — foto 7', w: 865, h: 1049 },
      { tipo: 'foto', src: 'assets/images/galeria/quinceanos/08.jpg', thumb: 'assets/images/galeria/quinceanos/08-thumb.jpg', alt: '15 Años — foto 8', w: 792, h: 1177 },
      { tipo: 'foto', src: 'assets/images/galeria/quinceanos/09.jpg', thumb: 'assets/images/galeria/quinceanos/09-thumb.jpg', alt: '15 Años — foto 9', w: 900, h: 1125 },
      { tipo: 'foto', src: 'assets/images/galeria/quinceanos/10.jpg', thumb: 'assets/images/galeria/quinceanos/10-thumb.jpg', alt: '15 Años — foto 10', w: 900, h: 1125 },
      { tipo: 'foto', src: 'assets/images/galeria/quinceanos/11.jpg', thumb: 'assets/images/galeria/quinceanos/11-thumb.jpg', alt: '15 Años — foto 11', w: 900, h: 1125 }
    ]
  },
  bodas: {
    portada: 'assets/images/galeria/bodas/portada.jpg',
    portadaW: 900,
    portadaH: 474,
    items: [
      { tipo: 'foto', src: 'assets/images/galeria/bodas/01.jpg', thumb: 'assets/images/galeria/bodas/01-thumb.jpg', alt: 'Bodas — foto 1', w: 900, h: 891 },
      { tipo: 'foto', src: 'assets/images/galeria/bodas/02.jpg', thumb: 'assets/images/galeria/bodas/02-thumb.jpg', alt: 'Bodas — foto 2', w: 819, h: 1311 },
      { tipo: 'foto', src: 'assets/images/galeria/bodas/03.jpg', thumb: 'assets/images/galeria/bodas/03-thumb.jpg', alt: 'Bodas — foto 3', w: 900, h: 1448 },
      { tipo: 'foto', src: 'assets/images/galeria/bodas/04.jpg', thumb: 'assets/images/galeria/bodas/04-thumb.jpg', alt: 'Bodas — foto 4', w: 900, h: 1106 },
      { tipo: 'foto', src: 'assets/images/galeria/bodas/05.jpg', thumb: 'assets/images/galeria/bodas/05-thumb.jpg', alt: 'Bodas — foto 5', w: 900, h: 1289 },
      { tipo: 'foto', src: 'assets/images/galeria/bodas/06.jpg', thumb: 'assets/images/galeria/bodas/06-thumb.jpg', alt: 'Bodas — foto 6', w: 900, h: 888 },
      { tipo: 'foto', src: 'assets/images/galeria/bodas/07.jpg', thumb: 'assets/images/galeria/bodas/07-thumb.jpg', alt: 'Bodas — foto 7', w: 900, h: 890 },
      { tipo: 'foto', src: 'assets/images/galeria/bodas/08.jpg', thumb: 'assets/images/galeria/bodas/08-thumb.jpg', alt: 'Bodas — foto 8', w: 900, h: 1109 }
    ]
  },
  novias: {
    portada: 'assets/images/galeria/novias/portada.jpg',
    portadaW: 828,
    portadaH: 1010,
    items: [
      { tipo: 'foto', src: 'assets/images/galeria/novias/01.jpg', thumb: 'assets/images/galeria/novias/01-thumb.jpg', alt: 'Exclusivo Novias y Asesorías — foto 1', w: 900, h: 1010 }
    ]
  },
  prensa: {
    portada: 'assets/images/galeria/prensa/portada.jpg',
    portadaW: 900,
    portadaH: 1098,
    items: [
      { tipo: 'foto', src: 'assets/images/galeria/prensa/01.jpg', thumb: 'assets/images/galeria/prensa/01-thumb.jpg', alt: 'Prensa — foto 1', w: 831, h: 1600 },
      { tipo: 'foto', src: 'assets/images/galeria/prensa/02.jpg', thumb: 'assets/images/galeria/prensa/02-thumb.jpg', alt: 'Prensa — foto 2', w: 898, h: 1347 },
      { tipo: 'foto', src: 'assets/images/galeria/prensa/03.jpg', thumb: 'assets/images/galeria/prensa/03-thumb.jpg', alt: 'Prensa — foto 3', w: 900, h: 1600 },
      { tipo: 'foto', src: 'assets/images/galeria/prensa/04.jpg', thumb: 'assets/images/galeria/prensa/04-thumb.jpg', alt: 'Prensa — foto 4', w: 900, h: 1598 },
      { tipo: 'foto', src: 'assets/images/galeria/prensa/05.jpg', thumb: 'assets/images/galeria/prensa/05-thumb.jpg', alt: 'Prensa — foto 5', w: 900, h: 1600 }
    ]
  },
  espejo: {
    portada: null,
    items: []
  },
  corporativos: {
    portada: 'assets/images/galeria/corporativos/portada.jpg',
    portadaW: 845,
    portadaH: 1030,
    items: [
      { tipo: 'foto', src: 'assets/images/galeria/corporativos/01.jpg', thumb: 'assets/images/galeria/corporativos/01-thumb.jpg', alt: 'Corporativos — foto 1', w: 845, h: 1600 },
      { tipo: 'foto', src: 'assets/images/galeria/corporativos/02.jpg', thumb: 'assets/images/galeria/corporativos/02-thumb.jpg', alt: 'Corporativos — foto 2', w: 458, h: 1600 },
      { tipo: 'foto', src: 'assets/images/galeria/corporativos/03.jpg', thumb: 'assets/images/galeria/corporativos/03-thumb.jpg', alt: 'Corporativos — foto 3', w: 900, h: 1200 },
      { tipo: 'foto', src: 'assets/images/galeria/corporativos/04.jpg', thumb: 'assets/images/galeria/corporativos/04-thumb.jpg', alt: 'Corporativos — foto 4', w: 900, h: 905 },
      { tipo: 'foto', src: 'assets/images/galeria/corporativos/05.jpg', thumb: 'assets/images/galeria/corporativos/05-thumb.jpg', alt: 'Corporativos — foto 5', w: 900, h: 894 },
      { tipo: 'foto', src: 'assets/images/galeria/corporativos/06.jpg', thumb: 'assets/images/galeria/corporativos/06-thumb.jpg', alt: 'Corporativos — foto 6', w: 900, h: 1035 }
    ]
  },
  docencia: {
    portada: 'assets/images/galeria/docencia/portada.jpg',
    portadaW: 900,
    portadaH: 375,
    items: [
      { tipo: 'foto', src: 'assets/images/galeria/docencia/01.jpg', thumb: 'assets/images/galeria/docencia/01-thumb.jpg', alt: 'Docencia y Formación — foto 1', w: 900, h: 1111 },
      { tipo: 'foto', src: 'assets/images/galeria/docencia/02.jpg', thumb: 'assets/images/galeria/docencia/02-thumb.jpg', alt: 'Docencia y Formación — foto 2', w: 900, h: 1053 },
      { tipo: 'foto', src: 'assets/images/galeria/docencia/03.jpg', thumb: 'assets/images/galeria/docencia/03-thumb.jpg', alt: 'Docencia y Formación — foto 3', w: 900, h: 1073 },
      { tipo: 'foto', src: 'assets/images/galeria/docencia/04.jpg', thumb: 'assets/images/galeria/docencia/04-thumb.jpg', alt: 'Docencia y Formación — foto 4', w: 900, h: 939 },
      { tipo: 'foto', src: 'assets/images/galeria/docencia/05.jpg', thumb: 'assets/images/galeria/docencia/05-thumb.jpg', alt: 'Docencia y Formación — foto 5', w: 900, h: 1126 }
    ]
  }
};
