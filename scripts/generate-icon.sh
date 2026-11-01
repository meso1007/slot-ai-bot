#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

OUT="assets/icon.png"
mkdir -p assets tmp_icon

# 濃紺グラデーション＋青のグロー
magick -size 640x640 "gradient:#0E1A33-#0B1220" "$OUT"
magick -size 640x640 xc:none -fill 'rgba(29,78,216,0.45)' \
  -draw "circle 320,320 320,140" -blur 0x55 tmp_icon/glow.png
magick "$OUT" tmp_icon/glow.png -composite "$OUT"

# コンパス（方位磁針）
magick "$OUT" \
  -stroke '#FFFFFF' -strokewidth 14 -fill none \
    -draw "circle 320,320 490,320" \
  -stroke none -fill '#3B82F6' \
    -draw "polygon 320,195 292,330 348,330" \
  -fill '#BFDBFE' \
    -draw "polygon 320,445 292,330 348,330" \
  -stroke '#FFFFFF' -strokewidth 6 -fill none \
    -draw "line 292,330 348,330" \
  -stroke none -fill '#FFFFFF' \
    -draw "circle 320,320 334,320" \
  "$OUT"

rm -rf tmp_icon
magick identify "$OUT"
