#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=brand/out
mkdir -p "$OUT"

bun brand/render.ts

magick montage "$OUT"/01-*.png "$OUT"/02-*.png "$OUT"/03-*.png "$OUT"/04-*.png \
  "$OUT"/05-*.png "$OUT"/06-*.png "$OUT"/07-*.png "$OUT"/08-*.png \
  -tile 4x2 -geometry 600x700+12+12 -background '#FFFFFF' "$OUT/studies.png"
magick "$OUT/studies.png" -resize 1800x "$OUT/studies.png"

magick "$OUT/sym240.png" -blur 0x1.2 "$OUT/blur12.png"
magick "$OUT/sym240.png" -blur 0x2.6 "$OUT/blur26.png"
magick "$OUT/blur12.png" "$OUT/blur26.png" +append "$OUT/blur.png"

magick identify assets/icon.png "$OUT/studies.png" "$OUT/lockup.png"
