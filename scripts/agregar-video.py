#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Divina Inspiración — alta de videos en la galería (herramienta de desarrollo).

El sitio sigue siendo 100% estático: este script no agrega dependencias ni un paso
de build al proyecto, sólo prepara los archivos que el sitio consume.

Qué hace
--------
1. Copia el video a `assets/video/<clave>/NN-<slug>.mp4`:
     - con ffmpeg: recompila a H.264 (yuv420p, CRF 26, preset medium), audio AAC
       128 kb/s, `-movflags +faststart`, sin metadatos y lado mayor máx. 1280 px,
       para que se vea en el navegador y en el celular sin pesar demasiado;
     - con `--sin-recomprimir`, o si no hay ffmpeg en el PATH: copia el archivo
       tal cual, avisa que conviene revisar el códec y el peso, y pide un poster
       propio con `--poster` (sin ffmpeg no hay de dónde sacar un fotograma).
2. Genera las imágenes del item:
     NN-<slug>.jpg / .webp           → poster, lado mayor máx. 1200 px
     NN-<slug>-thumb.jpg / .webp     → miniatura de la tira, máx. 480 px
   El poster sale de `--poster` o de un fotograma del video (el del segundo 1, o
   el primero si el video es más corto). Ninguna imagen se agranda nunca.
3. Agrega el item a `assets/video/videos.json` y REGENERA siempre
   `assets/js/galeria-videos.js`, ordenado por `posicion` y, a igual posición, por
   orden de carga. Ese .js es el que consume main.js; el JSON es la fuente y se
   edita a mano o con este script.

Es idempotente: regenerar el .js no duplica nada, y `quitar` borra del disco los
archivos del video junto con su item.

Uso
---
    python scripts/agregar-video.py agregar "video.mp4" --categoria Bodas
    python scripts/agregar-video.py listar
    python scripts/agregar-video.py mover 01-mi-video.mp4 --posicion 2
    python scripts/agregar-video.py quitar 01-mi-video.mp4

Requisitos: Python 3. Para recomprimir y sacar fotogramas hace falta ffmpeg en el
PATH (`winget install Gyan.FFmpeg`); para las imágenes, Pillow
(`python -m pip install Pillow`).
"""

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unicodedata
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


# ---------------------------------------------------------------------------
# Configuración
# ---------------------------------------------------------------------------

RAIZ = Path(__file__).resolve().parent.parent
BASE_VIDEO = RAIZ / "assets" / "video"
JSON_FUENTE = BASE_VIDEO / "videos.json"
DATOS = RAIZ / "assets" / "js" / "galeria-videos.js"

# Extensiones que acepta el sitio para reproducir.
EXTENSIONES = {".mp4", ".mov", ".m4v", ".webm"}

# clave → título, para el alt por defecto (los mismos que usa generar-galeria.py).
CATEGORIAS = [
    ("quinceanos",   "15 Años"),
    ("bodas",        "Bodas"),
    ("novias",       "Exclusivo Novias y Asesorías"),
    ("prensa",       "Prensa"),
    ("espejo",       "Bendito Espejo"),
    ("corporativos", "Corporativos"),
    ("docencia",     "Docencia y Formación"),
]
CLAVES = [clave for clave, _ in CATEGORIAS]
TITULOS = dict(CATEGORIAS)

# Alias de categoría: se comparan ya normalizados (minúsculas, sin acentos y sin
# guiones), así que "15 Años", "15-anos" y "QUINCEANOS" caen en la misma clave.
ALIAS = {
    "quinceanos": "quinceanos",
    "15 anos": "quinceanos",
    "bodas": "bodas",
    "novias": "novias",
    "exclusivo novias": "novias",
    "exclusivo novias y asesorias": "novias",
    "prensa": "prensa",
    "artistas": "prensa",
    "espejo": "espejo",
    "bendito espejo": "espejo",
    "corporativos": "corporativos",
    "docencia": "docencia",
    "docencia y formacion": "docencia",
}

LADO_MAXIMO = 1280       # lado mayor del video recomprimido
LADO_POSTER = 1200       # NN-<slug>.jpg / .webp
LADO_THUMB = 480         # NN-<slug>-thumb.jpg / .webp
CALIDAD_JPG = 82
CALIDAD_WEBP = 80
CRF = 26
PRESET = "medium"
AUDIO = "128k"

PESO_ADVERTIDO_MB = 15   # a partir de acá se avisa que el video es pesado

INSTRUCCION_FFMPEG = "winget install Gyan.FFmpeg"

# Escala que respeta el aspecto, tope en `lado` y dimensiones pares (yuv420p
# las exige). El -2 del lado libre le dice a ffmpeg "el otro lado, redondeado".
def escala_filtro(lado):
    return ("scale='if(gt(iw,ih),min(iw,%d),-2)':'if(gt(iw,ih),-2,min(ih,%d))'"
            % (lado, lado))


# Encabezado de assets/js/galeria-videos.js. Se escribe siempre igual, para que el
# archivo generado se lea igual de claro que el que está versionado.
CABECERA_JS = [
    "/* Divina Inspiración — datos de VÍDEOS de la galería.",
    "   Archivo GENERADO por scripts/agregar-video.py desde assets/video/videos.json.",
    "   No editar a mano: para sumar, quitar o reordenar un video se usa el script.",
    "",
    "     python scripts/agregar-video.py agregar \"C:\\ruta\\video.mp4\" --categoria Bodas",
    "",
    "   Estructura por categoría (array de items):",
    "     src       → .mp4 dentro de assets/video/<clave>/",
    "     poster    → imagen de presentación (obligatoria: sin ella el video no entra)",
    "     thumb     → miniatura de la tira; si falta, se usa el poster",
    "     alt       → texto alternativo",
    "     posicion  → lugar final entre fotos y videos; si falta, va al final",
    "     w / h     → dimensiones del poster, para reservar el espacio",
    "",
    "   Las fotos no están acá: siguen en assets/js/galeria-data.js, que genera",
    "   scripts/generar-galeria.py. Las dos herramientas nunca tocan los archivos de la otra.",
    "   */",
    "",
]


# ---------------------------------------------------------------------------
# Utilidades
# ---------------------------------------------------------------------------

def kb(ruta):
    return os.path.getsize(ruta) / 1024.0


def hash_archivo(ruta):
    h = hashlib.sha256()
    with open(ruta, "rb") as f:
        for bloque in iter(lambda: f.read(65536), b""):
            h.update(bloque)
    return h.hexdigest()


def sin_acentos(texto):
    """'Bendito Espejo' → 'bendito espejo': minúsculas, sin acentos ni guiones."""
    plano = unicodedata.normalize("NFD", texto)
    plano = "".join(c for c in plano if unicodedata.category(c) != "Mn")
    plano = plano.lower().replace("_", " ").replace("-", " ")
    return " ".join(plano.split())


def slug(texto, largo=48):
    """'Mi Video FINAL (2024).mp4' → 'mi-video-final-2024'."""
    plano = unicodedata.normalize("NFKD", Path(texto).stem)
    plano = "".join(c for c in plano if not unicodedata.combining(c))
    plano = re.sub(r"[^a-zA-Z0-9]+", "-", plano).strip("-").lower()
    if len(plano) > largo:
        plano = plano[:largo].rstrip("-")
    return plano or "video"


def con_extension(nombre):
    return Path(str(nombre) + ".jpg")


def con_extension_webp(nombre):
    return Path(str(nombre) + ".webp")


def ruta_de_json(src):
    """Convierte la ruta relativa del JSON (assets/video/...) en Path absoluto."""
    return RAIZ / src.replace("/", os.sep)


def a_rel(ruta):
    return ruta.relative_to(RAIZ).as_posix()


def resolver_categoria(texto):
    clave = ALIAS.get(sin_acentos(texto))
    if not clave:
        sys.exit("Categoría desconocida: %s\nValidas: %s"
                 % (texto, ", ".join(CLAVES)))
    return clave


def correr(cmd):
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    salida = proc.stdout.decode("utf-8", errors="replace").strip()
    return proc.returncode == 0, salida


def sin_ffmpeg():
    sys.exit(
        "No se encontró ffmpeg, que hace falta para recomprimir el video y para\n"
        "sacarle el fotograma del poster.\n\n"
        "  Instalalo con:  %s\n"
        "  cerrá la terminal, volvé a abrirla y corré el comando de nuevo.\n\n"
        "Si no querés instalar nada, copiá el video tal cual y pasá una imagen:\n"
        "  python scripts/agregar-video.py agregar \"video.mp4\" --categoria Bodas "
        "--poster \"poster.jpg\" --sin-recomprimir" % INSTRUCCION_FFMPEG
    )


def probe(origen):
    """(duración en segundos, códec del video). Sin ffprobe: (0.0, '')."""
    if not shutil.which("ffprobe"):
        return 0.0, ""
    codigo, salida = correr([
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration:stream=codec_type,codec_name",
        "-of", "default=noprint_wrappers=1", str(origen)])
    if not codigo:
        return 0.0, ""
    duracion, video = 0.0, ""
    ultimo_codec = ""
    for linea in salida.splitlines():
        clave, _, valor = (p.strip() for p in linea.partition("="))
        if clave == "duration":
            try:
                duracion = float(valor)
            except ValueError:
                duracion = 0.0
        elif clave == "codec_name":
            # ffprobe imprime los campos de cada stream en orden alfabético, así que
            # codec_name va antes que codec_type: se guarda el último visto y se usa
            # cuando el stream se declara de video. Sin esto se leía el códec del
            # audio (aac) y el aviso de HEVC nunca saltaba.
            ultimo_codec = valor
        elif clave == "codec_type" and valor == "video":
            video = ultimo_codec
    return duracion, video


def segundos_del_fotograma(duracion):
    """El del segundo 1; si el video es más corto, el primer fotograma."""
    return 1.0 if duracion >= 1.05 else 0.0


# ---------------------------------------------------------------------------
# Imágenes (Pillow)
# ---------------------------------------------------------------------------

def importar_pillow():
    try:
        from PIL import Image, ImageOps, features
    except ImportError:
        sys.exit("Falta Pillow. Instalalo con:  python -m pip install Pillow")
    if not features.check("webp"):
        sys.exit("Esta build de Pillow no compila con soporte WebP: falta la variante .webp.")
    return Image, ImageOps


def escalar(im, lado_maximo, Image):
    """Reduce para que el lado mayor entre en `lado_maximo`. Nunca agranda."""
    ancho, alto = im.size
    if max(ancho, alto) <= lado_maximo:
        return im
    escala = lado_maximo / float(max(ancho, alto))
    destino = (max(1, int(round(ancho * escala))), max(1, int(round(alto * escala))))
    return im.resize(destino, Image.LANCZOS)


def guardar_jpg_webp(im, nombre):
    """Escribe <nombre>.jpg y <nombre>.webp. Devuelve (ruta_jpg, (ancho, alto))."""
    jpg, webp = con_extension(nombre), con_extension_webp(nombre)
    im.convert("RGB").save(jpg, "JPEG", quality=CALIDAD_JPG, optimize=True, progressive=True)
    im.convert("RGB").save(webp, "WEBP", quality=CALIDAD_WEBP, method=5)
    return jpg, im.size


def fotograma(origen, destino_jpg, segundo):
    """Saca un fotograma del video a JPEG (para usarlo de poster)."""
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        return False
    for intento, ss in enumerate((segundo, 0.0)):
        codigo, _ = correr([
            ffmpeg, "-y", "-hide_banner", "-loglevel", "error",
            "-ss", "%.2f" % ss, "-i", str(origen),
            "-frames:v", "1", "-vf", escala_filtro(LADO_POSTER),
            "-q:v", "2", str(destino_jpg)])
        if codigo and destino_jpg.is_file() and destino_jpg.stat().st_size > 0:
            return True
        if segundo <= 0:
            break
    return False


def imagenes_del_item(nombre_base, imagen_origen):
    """(poster_jpg, thumb_jpg, (ancho, alto)) derivados de una imagen."""
    Image, ImageOps = importar_pillow()
    with Image.open(imagen_origen) as abierta:
        # La orientación EXIF se aplica antes de escalar, y guardar sin pasarle
        # `exif` descarta los metadatos (incluida la geolocalización GPS).
        imagen = ImageOps.exif_transpose(abierta)
        poster_jpg, (ancho, alto) = guardar_jpg_webp(
            escalar(imagen, LADO_POSTER, Image), nombre_base)
        thumb_jpg, _ = guardar_jpg_webp(
            escalar(imagen, LADO_THUMB, Image), Path(str(nombre_base) + "-thumb"))
    return poster_jpg, thumb_jpg, (ancho, alto)


# ---------------------------------------------------------------------------
# Datos: el JSON es la fuente, el .js se regenera siempre
# ---------------------------------------------------------------------------

def leer_json():
    if not JSON_FUENTE.is_file():
        sys.exit("No existe la fuente de videos: %s\n"
                 "Creala con las 7 claves y listas vacías, y volvé a correr."
                 % JSON_FUENTE.relative_to(RAIZ))
    with open(JSON_FUENTE, encoding="utf-8") as f:
        try:
            datos = json.load(f)
        except ValueError as error:
            sys.exit("%s no es un JSON válido:\n  %s\n"
                     "El archivo se puede editar a mano; revisá las comas."
                     % (JSON_FUENTE.name, error))
    faltantes = [c for c in CLAVES if not isinstance(datos.get(c), list)]
    if faltantes:
        sys.exit("En %s faltan (o no son listas) estas categorías: %s"
                 % (JSON_FUENTE.name, ", ".join(faltantes)))
    return datos


def hashes(datos):
    """Registro {src: sha256 del ORIGEN} para detectar duplicados.

    Hace falta porque el archivo que queda en assets/video/ es una versión
    recomprimida: su hash nunca coincide con el del original que subió el
    usuario, así que el registro es lo que permite reconocer el clip aunque
    se lo haya reencodado.
    """
    registro = datos.get("_hashes")
    return registro if isinstance(registro, dict) else {}


def escribir_json(datos):
    BASE_VIDEO.mkdir(parents=True, exist_ok=True)
    if isinstance(datos.get("_hashes"), dict) and not datos["_hashes"]:
        datos.pop("_hashes")
    with open(JSON_FUENTE, "w", encoding="utf-8", newline="\n") as f:
        json.dump(datos, f, indent=2, ensure_ascii=False)
        f.write("\n")


def ordenar_para_js(items):
    """Primero los que pidieron posición (de menor a mayor); después los demás,
    en el orden en que se fueron cargando."""
    return [item for _, item in sorted(
        enumerate(items),
        key=lambda par: (par[1].get("posicion") or 10 ** 9, par[0]))]


def escribir_js(datos):
    """Regenera assets/js/galeria-videos.js (con finales de línea LF)."""
    lineas = list(CABECERA_JS)
    lineas.append("window.DI_GALERIA_VIDEOS = {")
    for i, clave in enumerate(CLAVES):
        items = ordenar_para_js(datos.get(clave) or [])
        if not items:
            lineas.append("  %s: []%s" % (clave, "," if i < len(CLAVES) - 1 else ""))
            continue
        lineas.append("  %s: [" % clave)
        for j, item in enumerate(items):
            campos = [
                "tipo: 'video'",
                "src: '%s'" % item.get("src", ""),
                "thumb: '%s'" % (item.get("thumb") or item.get("poster") or ""),
                "poster: '%s'" % (item.get("poster") or item.get("thumb") or ""),
                "alt: '%s'" % (item.get("alt") or "").replace("'", "\\'"),
            ]
            if item.get("w"):
                campos.append("w: %d" % int(item["w"]))
            if item.get("h"):
                campos.append("h: %d" % int(item["h"]))
            if item.get("posicion"):
                campos.append("posicion: %d" % int(item["posicion"]))
            coma = "," if j < len(items) - 1 else ""
            lineas.append("    { %s }%s" % (", ".join(campos), coma))
        lineas.append("  ]%s" % ("," if i < len(CLAVES) - 1 else ""))
    lineas.append("};")
    lineas.append("")

    texto = "\n".join(lineas)
    # Sólo se toca el archivo si el contenido cambia: así el .js nunca queda
    # viejo frente al JSON y una edición a mano no provoca escrituras inútiles.
    if DATOS.exists() and DATOS.read_text(encoding="utf-8") == texto:
        return False
    DATOS.parent.mkdir(parents=True, exist_ok=True)
    with open(DATOS, "w", encoding="utf-8", newline="\n") as f:
        f.write(texto)
    return True


def regenerar(datos):
    escribir_json(datos)
    escribir_js(datos)


def todos_los_items(datos):
    """(clave, índice, item) de todos los videos."""
    return [(clave, i, item)
            for clave in CLAVES
            for i, item in enumerate(datos.get(clave) or [])]


EXTENSIONES_VIDEO = (".mp4", ".mov", ".m4v", ".webm")


def sin_extension_video(nombre):
    """'01-boda.mov' -> '01-boda' (no toca otra extensión)."""
    bajo = nombre.lower()
    for extension in EXTENSIONES_VIDEO:
        if bajo.endswith(extension):
            return bajo[: -len(extension)]
    return bajo


def forma(nombre):
    """Forma canónica para comparar: sin acentos, minúsculas y sin extensión.

    Ojo: sin_acentos() convierte los guiones en espacios, así que hay que pasar
    por acá tanto la referencia como los nombres guardados; si sólo se normaliza
    uno de los dos, "02-b.mp4" nunca encuentra a "02-b".
    """
    return sin_extension_video(sin_acentos(nombre.replace("\\", "/")))


def buscar(datos, referencia):
    """Encuentra items por ruta, por nombre de archivo o por número (01, 02...).

    Acepta el nombre tal como se instaló (01-boda.mp4), el del archivo original
    (boda.mov) y el número con o sin relleno (1, 01), porque así es como lo
    escribió el usuario.
    """
    ref = forma(referencia)
    ref_numero = ref.lstrip("0")
    encontrados = []
    for clave, indice, item in todos_los_items(datos):
        nombre = forma(Path(item.get("src", "")).name)
        completo = forma(item.get("src", ""))
        numero = nombre.split(" ")[0].split("-")[0]
        # "01 boda" -> "boda": el slug sin el número de orden.
        cola = nombre.split(" ", 1)[1] if " " in nombre else nombre
        if (ref in {numero, numero.lstrip("0"), nombre, cola, completo}
                or (ref_numero and ref_numero == numero.lstrip("0"))):
            encontrados.append((clave, indice, item))
    return encontrados


def un_item(datos, referencia):
    encontrados = buscar(datos, referencia)
    if not encontrados:
        sys.exit("No encontré ningún video que coincida con %r.\n"
                 "Corré `listar` para ver los nombres." % referencia)
    if len(encontrados) > 1:
        sys.exit("Ese nombre se repite en %d categorías. Indicá cuál:\n  %s"
                 % (len(encontrados), ", ".join(sorted(set(c for c, _, _ in encontrados)))))
    return encontrados[0]


def nombre_siguiente(carpeta):
    """Siguiente número libre con formato NN (01, 02...)."""
    mayor = 0
    if carpeta.is_dir():
        for ruta in carpeta.iterdir():
            coincidencia = re.match(r"^(\d+)-", ruta.name)
            if coincidencia:
                mayor = max(mayor, int(coincidencia.group(1)))
    return "%02d" % (mayor + 1)


def archivos_de_item(clave, item):
    """Los archivos que puede haber generado un item: video, poster y miniatura."""
    carpeta = BASE_VIDEO / clave
    nombre = Path(item.get("src", "")).name
    base = nombre[:-4] if nombre.lower().endswith(".mp4") else nombre
    return [(carpeta / n) for n in
            (base + ".mp4", base + ".jpg", base + ".webp",
             base + "-thumb.jpg", base + "-thumb.webp")]


def tabla(datos, titulo):
    items = todos_los_items(datos)
    print("")
    print(titulo)
    print("-" * 78)
    if not items:
        print("No hay videos cargados todavía.")
        print("-" * 78)
        return
    print("%-14s %-4s %-44s %9s" % ("CATEGORÍA", "POS", "ARCHIVO", "PESO"))
    print("-" * 78)
    total = 0.0
    for clave, _, item in sorted(items, key=lambda t: (t[0], t[2].get("posicion") or 10 ** 9)):
        peso = 0.0
        ruta = ruta_de_json(item.get("src", ""))
        if ruta.is_file():
            peso = kb(ruta)
        total += peso
        print("%-14s %-4s %-44s %8.1f KB"
              % (clave, item.get("posicion") or "—", Path(item.get("src", "")).name, peso))
    print("-" * 78)
    print("%-14s %-4s %-44s %8.1f KB" % ("TOTAL", len(items), "", total))


# ---------------------------------------------------------------------------
# Comandos
# ---------------------------------------------------------------------------

def cmd_agregar(args):
    origen = Path(args.archivo)
    if not origen.is_file():
        sys.exit("No existe el archivo: %s" % origen)
    if origen.suffix.lower() not in EXTENSIONES:
        sys.exit("Extensión no admitida: %s\nValidas: %s"
                 % (origen.suffix, ", ".join(sorted(EXTENSIONES))))
    if origen.stat().st_size == 0:
        sys.exit("El archivo está vacío: %s" % origen)

    clave = resolver_categoria(args.categoria)
    datos = leer_json()

    # Duplicados: mismo contenido que un video ya cargado. Se comparan dos
    # cosas: el hash del origen contra el registro de lo que se fue subiendo y
    # contra los archivos instalados (que cubre las entradas agregadas a mano),
    # porque un archivo recomprimido nunca tiene el hash del original.
    hash_nuevo = hash_archivo(origen)
    registro = hashes(datos)
    for _, _, item in todos_los_items(datos):
        src = item.get("src", "")
        ruta = ruta_de_json(src)
        ya_esta = registro.get(src) == hash_nuevo
        if not ya_esta and ruta.is_file():
            ya_esta = hash_archivo(ruta) == hash_nuevo
        if ya_esta:
            sys.exit("Ese video ya está cargado como %s.\n"
                     "Si sólo querés cambiarle el lugar:  mover %s --posicion N"
                     % (src, Path(src).name))

    carpeta = BASE_VIDEO / clave
    carpeta.mkdir(parents=True, exist_ok=True)
    nombre = "%s-%s" % (nombre_siguiente(carpeta), slug(origen.name))
    destino = carpeta / (nombre + ".mp4")
    base = destino.with_suffix("")

    print("")
    print("Agregando video")
    print("-" * 78)
    print("  origen     %s (%.1f KB)" % (origen, kb(origen)))
    print("  categoría  %s (%s)" % (clave, TITULOS[clave]))
    print("  destino    %s" % a_rel(destino))
    print("-" * 78)

    hay_ffmpeg = bool(shutil.which("ffmpeg"))
    duracion, codec = probe(origen)

    # Si algo falla después de empezar a escribir, no queda ningún archivo a medias
    # en assets/video/: se borra lo que se llegó a copiar.
    escritos = []
    try:
        if args.sin_recomprimir or not hay_ffmpeg:
            if not args.sin_recomprimir:
                print("  · no hay ffmpeg en el PATH: se copia el archivo tal cual")
                sin_ffmpeg()
            shutil.copy2(origen, destino)
            escritos.append(destino)
            if args.sin_recomprimir:
                print("  copia tal cual (--sin-recomprimir)")
            if codec == "hevc" or origen.suffix.lower() in (".mov", ".m4v"):
                print("  · el origen puede venir en HEVC (suele pasar con .mov y .m4v del "
                      "celular): Chrome y Firefox lo ven, Safari a veces no.")
                print("    Si se ve negro, reexportalo o pasalo por ffmpeg sin --sin-recomprimir.")
            if codec:
                print("  · códec de origen: %s" % codec)
        else:
            escala = escala_filtro(LADO_MAXIMO)
            codigo, salida = correr([
                shutil.which("ffmpeg"), "-y", "-hide_banner", "-loglevel", "error",
                "-i", str(origen),
                "-map_metadata", "-1",
                "-vf", escala,
                "-c:v", "libx264", "-preset", PRESET, "-crf", str(CRF),
                "-pix_fmt", "yuv420p", "-profile:v", "high",
                "-c:a", "aac", "-b:a", AUDIO, "-ac", "2",
                "-movflags", "+faststart",
                str(destino)])
            if not codigo or not destino.is_file():
                sys.exit("ffmpeg no pudo convertir el video:\n%s\n"
                         "Probá con --sin-recomprimir --poster \"poster.jpg\"." % salida)
            escritos.append(destino)
            print("  recomprimido: H.264 yuv420p · máx. %d px · CRF %d · %s · AAC %s"
                  % (LADO_MAXIMO, CRF, PRESET, AUDIO))

        peso_mb = kb(destino) / 1024.0
        if peso_mb > PESO_ADVERTIDO_MB:
            print("  · pesa %.1f MB: para que entre rápido en el celular conviene "
                  "recomprimirlo (sin --sin-recomprimir)." % peso_mb)

        # ---- Poster y miniatura ----
        if args.poster:
            poster_origen = Path(args.poster)
            if not poster_origen.is_file():
                sys.exit("No existe el poster: %s" % poster_origen)
            poster_jpg, thumb_jpg, (ancho, alto) = imagenes_del_item(base, poster_origen)
        else:
            if not hay_ffmpeg:
                sin_ffmpeg()
            temporal = Path(tempfile.mkdtemp(prefix="divina-video-"))
            try:
                captura = temporal / "fotograma.jpg"
                if not fotograma(origen, captura, segundos_del_fotograma(duracion)):
                    sys.exit("No pude sacar un fotograma del video.\n"
                             "Pasá una imagen a mano:  --poster \"poster.jpg\"")
                poster_jpg, thumb_jpg, (ancho, alto) = imagenes_del_item(base, captura)
            finally:
                # Los temporales viven fuera del repo y no quedan si algo falla.
                shutil.rmtree(temporal, ignore_errors=True)
        escritos += [poster_jpg, con_extension_webp(poster_jpg),
                     thumb_jpg, con_extension_webp(thumb_jpg)]
    except SystemExit:
        for ruta in escritos:
            if ruta.is_file():
                ruta.unlink()
        if carpeta.is_dir() and not any(carpeta.iterdir()):
            carpeta.rmdir()
        raise

    item = {
        "src": a_rel(destino),
        "poster": a_rel(poster_jpg),
        "thumb": a_rel(thumb_jpg),
        "alt": args.alt or "%s — video %d" % (TITULOS[clave], len(datos[clave]) + 1),
    }
    if args.posicion:
        item["posicion"] = int(args.posicion)
    item["w"] = int(ancho)
    item["h"] = int(alto)

    datos[clave].append(item)
    # El registro se reescribe entero: si la clave "_hashes" venía con otro
    # contenido (por una edición a mano), queda un dict limpio.
    registro = hashes(datos)
    registro[item["src"]] = hash_nuevo
    datos["_hashes"] = registro
    regenerar(datos)

    print("  poster     %s (%dx%d)" % (item["poster"], ancho, alto))
    print("  thumb      %s" % item["thumb"])
    print("  posición   %s" % (str(args.posicion) if args.posicion else "al final"))
    print("  peso       %.1f KB" % kb(destino))
    print("")
    print("Listo: se regeneró %s." % DATOS.relative_to(RAIZ))
    print("El video entra como un item más de %s, entre las fotos." % clave)
    print("")


def cmd_listar(args):
    datos = leer_json()
    # El JSON también se puede editar a mano: al listar se pone al día el .js
    # que usa el sitio, para que nunca queden desincronizados.
    # Se regenera desde los datos SIN filtrar (con --categoria la copia es
    # parcial y vaciaría las demás categorías del archivo).
    desactualizado = escribir_js(datos)
    if args.categoria:
        clave = resolver_categoria(args.categoria)
        datos = dict(datos, **{c: ([] if c != clave else datos[c]) for c in CLAVES})
    tabla(datos, "Videos en la galería")
    if desactualizado:
        print("")
        print("galeria-videos.js estaba viejo: se regeneró desde videos.json.")


def cmd_quitar(args):
    datos = leer_json()
    clave, indice, item = un_item(datos, args.referencia)
    if args.categoria:
        pedida = resolver_categoria(args.categoria)
        if pedida != clave:
            sys.exit("Ese video no está en %s (está en %s)." % (pedida, clave))

    print("")
    print("Quitando video")
    print("-" * 78)
    print("  categoría  %s" % clave)
    print("  archivo    %s" % item.get("src"))
    print("-" * 78)

    for ruta in archivos_de_item(clave, item):
        if ruta.is_file():
            print("  · borrado %s (%.1f KB)" % (ruta.name, kb(ruta)))
            ruta.unlink()

    datos[clave].pop(indice)
    registro = hashes(datos)
    registro.pop(item.get("src"), None)
    regenerar(datos)

    carpeta = BASE_VIDEO / clave
    if carpeta.is_dir() and not any(carpeta.iterdir()):
        carpeta.rmdir()

    print("")
    print("Listo: se regeneró %s." % DATOS.relative_to(RAIZ))
    print("")


def cmd_mover(args):
    datos = leer_json()
    clave, indice, item = un_item(datos, args.referencia)
    nueva = resolver_categoria(args.categoria) if args.categoria else clave
    if args.posicion is None and nueva == clave:
        sys.exit("Indicá --posicion N (0 = al final) y/o --categoria <clave>.")

    print("")
    print("Moviendo video")
    print("-" * 78)
    print("  archivo    %s" % item.get("src"))
    print("-" * 78)

    if args.posicion is not None:
        if args.posicion > 0:
            item["posicion"] = int(args.posicion)
            print("  · posición %d" % args.posicion)
        else:
            item.pop("posicion", None)
            print("  · posición: al final (sin posición fija)")

    src_viejo = item.get("src")

    if nueva != clave:
        destino_carpeta = BASE_VIDEO / nueva
        destino_carpeta.mkdir(parents=True, exist_ok=True)
        movidos = [ruta for ruta in archivos_de_item(clave, item) if ruta.is_file()]
        for ruta in movidos:
            shutil.move(str(ruta), str(destino_carpeta / ruta.name))
        print("  · %d archivo(s) movidos a %s/" % (len(movidos), a_rel(destino_carpeta)))
        # Las rutas se recalculan desde la carpeta destino: así no puede quedar
        # una ruta relativa mal armada (y sin el prefijo assets/video/).
        for campo in ("src", "poster", "thumb"):
            if item.get(campo):
                item[campo] = a_rel(destino_carpeta / Path(item[campo]).name)
        registro = hashes(datos)
        if src_viejo in registro:
            registro[item["src"]] = registro.pop(src_viejo)
        datos[clave].pop(indice)
        datos[nueva].append(item)
        origen_carpeta = BASE_VIDEO / clave
        if origen_carpeta.is_dir() and not any(origen_carpeta.iterdir()):
            origen_carpeta.rmdir()
        print("  · categoría %s → %s" % (clave, nueva))

    regenerar(datos)
    print("")
    print("Listo: se regeneró %s." % DATOS.relative_to(RAIZ))
    print("")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

USO = """\
Uso:
  python scripts/agregar-video.py agregar ARCHIVO --categoria CLAVE [--alt TEXTO]
                                      [--posicion N] [--poster IMAGEN]
                                      [--sin-recomprimir]
  python scripts/agregar-video.py listar [--categoria CLAVE]
  python scripts/agregar-video.py mover  REF --posicion N [--categoria CLAVE]
  python scripts/agregar-video.py quitar REF [--categoria CLAVE]

  ARCHIVO = mp4, mov, m4v o webm
  REF     = la ruta del video, su nombre de archivo o su número (01, 02...)

Categorías: quinceanos (15-anos), bodas, novias (exclusivo-novias), prensa,
            espejo (bendito-espejo), corporativos, docencia

Ejemplos:
  python scripts/agregar-video.py agregar "C:\\Videos\\boda.mp4" --categoria Bodas
  python scripts/agregar-video.py agregar "boda.mov" --categoria Bodas --posicion 2
  python scripts/agregar-video.py listar
  python scripts/agregar-video.py mover 01-boda.mp4 --posicion 3
  python scripts/agregar-video.py quitar 01-boda.mp4
"""


def construir_parser():
    parser = argparse.ArgumentParser(
        prog="agregar-video.py",
        description="Alta, baja, listado y orden de los videos de la galería.",
        epilog=USO,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="comando")

    agregar = sub.add_parser("agregar", help="suma un video a una categoría")
    agregar.add_argument("archivo", help="ruta del video (mp4, mov, m4v o webm)")
    agregar.add_argument("--categoria", "-c", required=True,
                         help="categoría: %s" % ", ".join(CLAVES))
    agregar.add_argument("--alt", help="texto alternativo (por defecto, '<Categoría> — video N')")
    agregar.add_argument("--posicion", type=int,
                         help="lugar final entre fotos y videos (1 = primero, 0 = al final)")
    agregar.add_argument("--poster", help="imagen de presentación (por defecto, un fotograma)")
    agregar.add_argument("--sin-recomprimir", action="store_true",
                         help="copia el archivo tal cual, sin pasar por ffmpeg")
    agregar.set_defaults(func=cmd_agregar)

    listar = sub.add_parser("listar", help="muestra los videos cargados")
    listar.add_argument("--categoria", "-c", help="filtra por categoría")
    listar.set_defaults(func=cmd_listar)

    mover = sub.add_parser("mover", help="cambia la posición y/o la categoría")
    mover.add_argument("referencia", help="ruta, nombre o número del video")
    mover.add_argument("--posicion", type=int, help="nueva posición (1 = primero, 0 = al final)")
    mover.add_argument("--categoria", "-c", help="lo pasa de categoría")
    mover.set_defaults(func=cmd_mover)

    quitar = sub.add_parser("quitar", help="borra el video, sus imágenes y su item")
    quitar.add_argument("referencia", help="ruta, nombre o número del video")
    quitar.add_argument("--categoria", "-c", help="sólo si el nombre se repite")
    quitar.set_defaults(func=cmd_quitar)

    return parser


def main():
    args = construir_parser().parse_args()
    if not getattr(args, "comando", None):
        sys.stdout.write(USO)
        sys.exit(1)
    if getattr(args, "posicion", None) is not None and args.posicion < 0:
        sys.exit("--posicion tiene que ser 0 (al final) o un número desde 1.")
    args.func(args)


if __name__ == "__main__":
    main()