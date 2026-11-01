#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

OUT="assets/icon.png"
mkdir -p assets tmp_icon

# 背景：濃紺
magick -size 640x640 "gradient:#12244A-#0B1220" "$OUT"

# ごく弱い青のグロー（線画を引き立てる）
magick -size 640x640 xc:none -fill 'rgba(29,78,216,0.28)' \
  -draw "circle 320,320 320,140" -blur 0x60 tmp_icon/glow.png
magick "$OUT" tmp_icon/glow.png -composite "$OUT"

# 外輪（白・線のみ）
magick "$OUT" -stroke '#FFFFFF' -strokewidth 14 -fill none \
  -draw "circle 320,320 490,320" "$OUT"

# 目盛り（ライトブルー）
magick "$OUT" -stroke '#93C5FD' -strokewidth 6 -fill none \
  -draw "line 455,320 470,320" \
  -draw "line 416,225 426,214" \
  -draw "line 320,185 320,170" \
  -draw "line 224,225 214,214" \
  -draw "line 185,320 170,320" \
  -draw "line 224,415 214,426" \
  -draw "line 320,455 320,470" \
  -draw "line 416,415 426,426" \
  "$OUT"

# 針（北＝青、南＝白、すべて線のみ）
magick "$OUT" -fill none \
  -stroke '#3B82F6' -strokewidth 10 -draw "polygon 320,190 298,330 342,330" \
  -stroke '#FFFFFF' -draw "polygon 320,450 298,330 342,330" \
  "$OUT"

magick "$OUT" -depth 8 -strip "$OUT"
rm -rf tmp_icon
magick identify "$OUT"
