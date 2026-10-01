#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Divina Inspiración — generador de la galería (herramienta de desarrollo).

El sitio sigue siendo 100% estático: este script no agrega dependencias ni un paso
de build al proyecto, sólo prepara los archivos que el sitio consume.

Qué hace
--------
1. Lee las fotos originales de `assets/gallery/<carpeta>/` (nunca las borra ni las
   mueve: son la fuente).
2. Orienta según EXIF y descarta metadatos (incluida la geolocalización GPS).
3. Escribe en `assets/images/galeria/<clave>/`:
     NN.jpg / NN.webp        → foto completa, lado mayor máx. 1600 px (sin agrandar)
     NN-thumb.jpg / .webp    → miniatura de la tira, lado mayor máx. 480 px
     portada.jpg / portada.webp → fondo de la tarjeta del mosaico
4. Genera `assets/js/galeria-data.js` con `window.DI_GALERIA`.

Es idempotente: al re-ejecutarlo regenera todo y no deja archivos viejos.

Uso
---
    python scripts/generar-galeria.py

Requisitos: Python 3 con Pillow (`pip install Pillow`). Node no trae un decodificador
de imágenes, y en esta máquina no hay ImageMagick ni cwebp, así que se usa Pillow.
"""

import hashlib
import os
import re
import shutil
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

try:
    from PIL import Image, ImageOps, features
except ImportError:
    sys.exit("Falta Pillow. Instalalo con:  python -m pip install Pillow")

if not features.check("webp"):
    sys.exit("Esta build de Pillow no compila con soporte WebP: falta la variante .webp.")


# ---------------------------------------------------------------------------
# Configuración
# ---------------------------------------------------------------------------

RAIZ = Path(__file__).resolve().parent.parent
ORIGENES = RAIZ / "assets" / "gallery"
SALIDA = RAIZ / "assets" / "images" / "galeria"
DATOS = RAIZ / "assets" / "js" / "galeria-data.js"

PREFIJO_SALIDA = "assets/images/galeria/"

# Extensiones que el script sabe decodificar. El resto se ignora y se reporta.
EXTENSIONES = {".jpg", ".jpeg", ".png", ".webp"}

# Cuando un mismo nombre base existe en .jpg y en .webp, el .jpg es la fuente y
# el .webp es sólo su derivado: se procesa una sola vez para no duplicar la foto.
PREFERIDAS = [".jpg", ".jpeg", ".png", ".webp"]

# carpeta de origen → (clave de GALERIA, forma de la tarjeta, título para los alt)
#   forma "ancha"  → tarjetas de 2 columnas (quinceanos, bodas) y banda (docencia)
#   forma "vertical" → tarjetas de 1 columna (novias, prensa, espejo, corporativos)
CATEGORIAS = [
    ("15-anos",      "quinceanos",   "ancha",    "15 Años",                    1.90, 0.30),
    ("bodas",        "bodas",        "ancha",    "Bodas",                      1.90, 0.30),
    ("novias",       "novias",       "vertical", "Exclusivo Novias y Asesorías", 0.82, 0.26),
    ("artistas",     "prensa",       "vertical", "Prensa",                     0.82, 0.26),
    ("espejo",       "espejo",       "vertical", "Bendito Espejo",             0.82, 0.26),
    ("corporativos", "corporativos", "vertical", "Corporativos",               0.82, 0.26),
    ("docencia",     "docencia",     "ancha",    "Docencia y Formación",       2.40, 0.30),
]

# Categoría sin carpeta propia que se resuelve con una foto ya publicada en el sitio.
RESALTOS = {
    "novias": ["assets/images/novias-exclusivo.jpg"],
}

LADO_MAXIMO = 1600      # NN.jpg / NN.webp
LADO_THUMB = 480        # NN-thumb.jpg / NN-thumb.webp
ANCHO_PORTADA = 1200    # portada.jpg / portada.webp
CALIDAD_JPG = 82
CALIDAD_JPG_PORTADA = 84
CALIDAD_WEBP = 80
CALIDAD_WEBP_PORTADA = 82

MIN_ANCHO_PORTADA_ANCHA = 600   # resolución mínima para una portada horizontal

ARCHIVOS_GENERADOS = re.compile(r"^(\d{2}(-thumb)?\.(jpg|jpeg|webp)|portada\.(jpg|jpeg|webp))$")


# ---------------------------------------------------------------------------
# Utilidades
# ---------------------------------------------------------------------------

def orden_natural(nombre):
    """xv-2 antes que xv-10 (orden natural, no lexicográfico)."""
    partes = re.split(r"(\d+)", nombre.lower())
    return [int(p) if p.isdigit() else p for p in partes]


def hash_archivo(ruta):
    h = hashlib.sha256()
    with open(ruta, "rb") as f:
        for bloque in iter(lambda: f.read(65536), b""):
            h.update(bloque)
    return h.hexdigest()


def kb(ruta):
    return os.path.getsize(ruta) / 1024.0


def escalar(im, lado_maximo):
    """Reduce para que el lado mayor entre en `lado_maximo`. Nunca agranda."""
    ancho, alto = im.size
    if max(ancho, alto) <= lado_maximo:
        return im
    escala = lado_maximo / float(max(ancho, alto))
    destino = (max(1, int(round(ancho * escala))), max(1, int(round(alto * escala))))
    return im.resize(destino, Image.LANCZOS)


def recortar(im, proporcion, foco_y):
    """Recorta a `proporcion` (ancho/alto) usando la ventana más grande posible.

    `foco_y` posiciona la ventana verticalmente: 0.30 deja el encuadre un poco
    arriba, que es donde suelen estar las caras.
    """
    if not proporcion:
        return im
    ancho, alto = im.size
    actual = ancho / float(alto)
    if abs(actual - proporcion) < 0.01:
        return im
    if actual > proporcion:
        nuevo_ancho = int(round(alto * proporcion))
        nuevo_alto = alto
    else:
        nuevo_ancho = ancho
        nuevo_alto = int(round(ancho / proporcion))
    x = (ancho - nuevo_ancho) // 2
    y = int(round((alto - nuevo_alto) * foco_y))
    y = max(0, min(y, alto - nuevo_alto))
    return im.crop((x, y, x + nuevo_ancho, y + nuevo_alto))


def guardar_jpg(im, ruta, calidad):
    # Sin `exif` ni `iccprofile`: la re-codificación ya descarta los metadatos.
    im.save(ruta, "JPEG", quality=calidad, optimize=True, progressive=True)


def guardar_webp(im, ruta, calidad):
    im.save(ruta, "WEBP", quality=calidad, method=6)


def limpiar_destino(destino):
    """Idempotencia: borra lo generado en corridas anteriores."""
    if not destino.is_dir():
        return 0
    borrados = 0
    for entrada in destino.iterdir():
        if entrada.is_file() and ARCHIVOS_GENERADOS.match(entrada.name):
            entrada.unlink()
            borrados += 1
    return borrados


# ---------------------------------------------------------------------------
# Lectura de originales
# ---------------------------------------------------------------------------

def elegir_fuentes(carpeta):
    """Devuelve (rutas, ignorados).

    Descarta los .webp que ya tienen su .jpg hermano y cualquier archivo cuyo hash
    (sha256) ya apareció antes en la misma categoría.
    """
    ignorados = []
    if not carpeta.is_dir():
        return [], ignorados

    por_base = {}
    for entrada in sorted(carpeta.iterdir(), key=lambda p: orden_natural(p.name)):
        if not entrada.is_file():
            continue
        ext = entrada.suffix.lower()
        if ext not in EXTENSIONES:
            ignorados.append(entrada.name)
            continue
        por_base.setdefault(entrada.stem.lower(), []).append((ext, entrada))

    rutas = []
    vistos = set()
    duplicados = []
    for base in sorted(por_base, key=orden_natural):
        candidatos = por_base[base]
        elegida = None
        for ext in PREFERIDAS:
            for e, ruta in candidatos:
                if e == ext:
                    elegida = ruta
                    break
            if elegida:
                break
        if elegida is None:
            continue
        huella = hash_archivo(elegida)
        if huella in vistos:
            duplicados.append(elegida.name)
            continue
        vistos.add(huella)
        rutas.append(elegida)

    if duplicados:
        ignorados.extend(duplicados)
    return rutas, ignorados


def abrir(ruta):
    """Abre, corrige la orientación EXIF y aplana a RGB (descarta metadatos)."""
    with Image.open(ruta) as bruto:
        im = ImageOps.exif_transpose(bruto)
        if im.mode in ("RGBA", "LA", "P"):
            fondo = Image.new("RGB", im.size, (255, 255, 255))
            alfa = im.convert("RGBA")
            fondo.paste(alfa, mask=alfa.split()[-1])
            return fondo
        return im.convert("RGB")


# ---------------------------------------------------------------------------
# Portada
# ---------------------------------------------------------------------------

def elegir_portada(candidatos, forma):
    """`(nombre, ancho, alto)` de la foto que sirve de portada de la tarjeta."""
    if not candidatos:
        return None
    if forma == "ancha":
        aptos = [c for c in candidatos
                 if c[1] / float(c[2]) >= 1.3 and min(c[1], c[2]) >= MIN_ANCHO_PORTADA_ANCHA]
    else:
        aptos = [c for c in candidatos if c[1] / float(c[2]) <= 1.15]
    if aptos:
        return max(aptos, key=lambda c: c[1] * c[2])
    return candidatos[0]


# ---------------------------------------------------------------------------
# Generación
# ---------------------------------------------------------------------------

def procesar_categoria(carpeta_nombre, clave, forma, titulo, proporcion, foco_y):
    """Devuelve (items, portada_rel, portada_w, portada_h, peso_kb, mensajes)."""
    mensajes = []
    destino = SALIDA / clave

    rutas, ignorados = elegir_fuentes(ORIGENES / carpeta_nombre)
    if ignorados:
        mensajes.append("ignorados: " + ", ".join(sorted(ignorados)))

    resaltos = RESALTOS.get(clave, []) if not rutas else []
    if not rutas and resaltos:
        rutas = [RAIZ / r for r in resaltos if (RAIZ / r).is_file()]
        if rutas:
            mensajes.append("sin carpeta propia: se usa " + resaltos[0])

    limpios = limpiar_destino(destino)
    if limpios:
        mensajes.append("%d archivo(s) regenerados" % limpios)

    if not rutas:
        if destino.is_dir():
            shutil.rmtree(destino, ignore_errors=True)
        return [], None, 0, 0, 0.0, mensajes

    destino.mkdir(parents=True, exist_ok=True)

    items = []
    candidatos = []
    peso = 0.0

    for indice, ruta in enumerate(rutas, start=1):
        nombre = "%02d" % indice
        im = abrir(ruta)
        ancho_ori, alto_ori = im.size
        candidatos.append((nombre, ancho_ori, alto_ori))

        completa = escalar(im, LADO_MAXIMO)
        base = destino / nombre
        guardar_jpg(completa, base.with_suffix(".jpg"), CALIDAD_JPG)
        guardar_webp(completa, base.with_suffix(".webp"), CALIDAD_WEBP)
        peso += kb(base.with_suffix(".jpg")) + kb(base.with_suffix(".webp"))

        thumb = escalar(completa, LADO_THUMB)
        base_thumb = destino / (nombre + "-thumb")
        guardar_jpg(thumb, base_thumb.with_suffix(".jpg"), CALIDAD_JPG)
        guardar_webp(thumb, base_thumb.with_suffix(".webp"), CALIDAD_WEBP)
        peso += kb(base_thumb.with_suffix(".jpg")) + kb(base_thumb.with_suffix(".webp"))

        items.append({
            "tipo": "foto",
            "src": "%s%s/%s.jpg" % (PREFIJO_SALIDA, clave, nombre),
            "thumb": "%s%s/%s-thumb.jpg" % (PREFIJO_SALIDA, clave, nombre),
            "alt": "%s — foto %d" % (titulo, indice),
            "w": completa.size[0],
            "h": completa.size[1],
        })
        im.close()
        completa.close()
        thumb.close()

    elegida = elegir_portada(candidatos, forma)
    portada_rel = None
    portada_w = portada_h = 0

    if elegida:
        nombre_elegida = elegida[0]
        origen = next(r for i, r in enumerate(rutas, start=1) if "%02d" % i == nombre_elegida)
        im = abrir(origen)
        im = recortar(im, proporcion, foco_y)
        im = escalar_anchura(im, ANCHO_PORTADA)
        portada_w, portada_h = im.size
        guardar_jpg(im, destino / "portada.jpg", CALIDAD_JPG_PORTADA)
        guardar_webp(im, destino / "portada.webp", CALIDAD_WEBP_PORTADA)
        peso += kb(destino / "portada.jpg") + kb(destino / "portada.webp")
        portada_rel = "%s%s/portada.jpg" % (PREFIJO_SALIDA, clave)
        mensajes.append("portada: %s (%dx%d)" % (Path(origen).name, elegida[1], elegida[2]))
        im.close()

    return items, portada_rel, portada_w, portada_h, peso, mensajes


def escalar_anchura(im, ancho_maximo):
    if im.size[0] <= ancho_maximo:
        return im
    escala = ancho_maximo / float(im.size[0])
    return im.resize((ancho_maximo, max(1, int(round(im.size[1] * escala)))), Image.LANCZOS)


def escribir_datos(resultados):
    """Escribe assets/js/galeria-data.js (CRLF, igual que main.js)."""
    lineas = [
        "/* Divina Inspiración — datos de la galería.",
        "   Archivo GENERADO por scripts/generar-galeria.py. No editar a mano:",
        "   para cambiar una foto, reemplazá el original en assets/gallery/<carpeta>/",
        "   y volvé a ejecutar el script.",
        "",
        "   Estructura por categoría:",
        "     portada  → foto de fondo de la tarjeta del mosaico",
        "     items[]  → { tipo, src, thumb, alt } y, opcionalmente, w/h para reservar",
        "                el espacio y evitar saltos de layout",
        "   El `src` en .jpg deriva su variante .webp por nombre: ambos existen.",
        "   Para mejorar los textos alternativos, editá `alt` acá (o ajustá el",
        "   título de la categoría en el CATEGORIAS del script y regenerá).",
        "   */",
        "",
        "window.DI_GALERIA = {",
    ]

    for carpeta, clave, forma, titulo, proporcion, foco_y in CATEGORIAS:
        items, portada, pw, ph, peso, _ = resultados[clave]
        lineas.append("  %s: {" % clave)
        lineas.append("    portada: %s," % ("'%s'" % portada if portada else "null"))
        if portada:
            lineas.append("    portadaW: %d," % pw)
            lineas.append("    portadaH: %d," % ph)
        if not items:
            lineas.append("    items: []")
        else:
            lineas.append("    items: [")
            for i, item in enumerate(items):
                coma = "," if i < len(items) - 1 else ""
                lineas.append(
                    "      { tipo: 'foto', src: '%s', thumb: '%s', alt: '%s', w: %d, h: %d }%s"
                    % (item["src"], item["thumb"], item["alt"].replace("'", "\\'"), item["w"], item["h"], coma)
                )
            lineas.append("    ]")
        lineas.append("  }%s" % ("," if clave != CATEGORIAS[-1][1] else ""))
    lineas.append("};")
    lineas.append("")

    DATOS.parent.mkdir(parents=True, exist_ok=True)
    with open(DATOS, "w", encoding="utf-8", newline="\r\n") as f:
        f.write("\n".join(lineas))


def main():
    if not ORIGENES.is_dir():
        sys.exit("No existe la carpeta de origen: %s" % ORIGENES)

    resultados = {}
    for carpeta, clave, forma, titulo, proporcion, foco_y in CATEGORIAS:
        resultados[clave] = procesar_categoria(
            carpeta, clave, forma, titulo, proporcion, foco_y
        )

    escribir_datos(resultados)

    # ---- Tabla resumen ----
    print("")
    print("Galería generada")
    print("-" * 78)
    print("%-14s %6s  %-46s %10s" % ("CATEGORÍA", "FOTOS", "PORTADA", "PESO"))
    print("-" * 78)
    total_peso = 0.0
    total_fotos = 0
    for carpeta, clave, forma, titulo, proporcion, foco_y in CATEGORIAS:
        items, portada, pw, ph, peso, mensajes = resultados[clave]
        etiqueta = "%s (%d)" % (Path(portada).name if portada else "— Próximamente", pw) if portada else "— (vacía)"
        print("%-14s %6d  %-46s %9.1f KB" % (clave, len(items), etiqueta, peso))
        total_peso += peso
        total_fotos += len(items)
        for m in mensajes:
            print("%-14s   · %s" % ("", m))
    print("-" * 78)
    print("%-14s %6d  %-46s %9.1f KB" % ("TOTAL", total_fotos, "", total_peso))

    solo_portadas = 0.0
    for carpeta, clave, forma, titulo, proporcion, foco_y in CATEGORIAS:
        destino = SALIDA / clave
        if (destino / "portada.webp").is_file():
            solo_portadas += kb(destino / "portada.webp")

    print("")
    print("Carga inicial de la sección (solo portadas .webp): %.1f KB" % solo_portadas)
    print("Datos: %s" % DATOS.relative_to(RAIZ))
    print("")


if __name__ == "__main__":
    main()
