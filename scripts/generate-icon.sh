#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

OUT="assets/icon.png"
mkdir -p assets tmp_icon

# 背景：濃紺（黒に近い青）
magick -size 640x640 "gradient:#12244A-#0B1220" "$OUT"

# 青のグロー（奥行き）
magick -size 640x640 xc:none -fill 'rgba(29,78,216,0.35)' \
  -draw "circle 320,320 320,130" -blur 0x60 tmp_icon/glow.png
magick "$OUT" tmp_icon/glow.png -composite "$OUT"

# 上部のごく弱いグロス
magick -size 640x640 xc:none -fill 'rgba(255,255,255,0.10)' \
  -draw "ellipse 320,60 300,150 0,360" -blur 0x40 tmp_icon/gloss.png
magick "$OUT" tmp_icon/gloss.png -composite "$OUT"

# 落ち影
magick -size 640x640 xc:none -fill 'rgba(0,0,0,0.45)' \
  -draw "circle 320,342 492,342" -blur 0x20 tmp_icon/shadow.png
magick "$OUT" tmp_icon/shadow.png -composite "$OUT"

# 外輪（白）＋内盤（白）
magick "$OUT" \
  -fill '#FFFFFF' -stroke none -draw "circle 320,320 490,320" \
  -fill '#F8FAFC' -draw "circle 320,320 462,320" \
  "$OUT"

# 目盛り（グレー）
magick "$OUT" -stroke '#CBD5E1' -strokewidth 6 -fill none \
  -draw "line 440,320 452,320" \
  -draw "line 405,235 414,226" \
  -draw "line 320,200 320,188" \
  -draw "line 235,235 226,226" \
  -draw "line 200,320 188,320" \
  -draw "line 235,405 226,414" \
  -draw "line 320,440 320,452" \
  -draw "line 405,405 414,414" \
  "$OUT"

# 針（北＝青、南＝黒）
magick "$OUT" \
  -stroke none -fill '#1D4ED8' -draw "polygon 320,192 297,330 343,330" \
  -fill '#0B1220' -draw "polygon 320,448 297,330 343,330" \
  -fill '#FFFFFF' -stroke '#0B1220' -strokewidth 4 -draw "circle 320,320 338,320" \
  "$OUT"

# 北針の細いハイライト（白）
magick "$OUT" -stroke none -fill 'rgba(255,255,255,0.28)' \
  -draw "polygon 318,200 306,318 316,318" "$OUT"

magick "$OUT" -depth 8 -strip "$OUT"
rm -rf tmp_icon
magick identify "$OUT"
