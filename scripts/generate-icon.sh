#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

OUT="assets/icon.png"
mkdir -p assets tmp_icon

# 背景：明るいブルー→深いブルー
magick -size 640x640 "gradient:#5B9BFF-#1D4ED8" "$OUT"

# 上部のグロス（ガラス感）
magick -size 640x640 xc:none -fill 'rgba(255,255,255,0.28)' \
  -draw "ellipse 320,70 280,150 0,360" -blur 0x38 tmp_icon/gloss.png
magick "$OUT" tmp_icon/gloss.png -composite "$OUT"

# 下部の内側シャドウ（奥行き）
magick -size 640x640 xc:none -fill 'rgba(8,20,50,0.38)' \
  -draw "ellipse 320,650 330,160 0,360" -blur 0x42 tmp_icon/bottom.png
magick "$OUT" tmp_icon/bottom.png -composite "$OUT"

# コンパスの落ち影
magick -size 640x640 xc:none -fill 'rgba(5,15,40,0.38)' \
  -draw "circle 320,342 492,342" -blur 0x20 tmp_icon/shadow.png
magick "$OUT" tmp_icon/shadow.png -composite "$OUT"

# 外輪（白）＋内盤（淡ブルー）
magick "$OUT" \
  -fill '#FFFFFF' -stroke none -draw "circle 320,320 490,320" \
  -fill '#EAF2FF' -draw "circle 320,320 462,320" \
  "$OUT"

# 目盛り（8方向）
magick "$OUT" -stroke '#93C5FD' -strokewidth 6 -fill none \
  -draw "line 440,320 452,320" \
  -draw "line 405,235 414,226" \
  -draw "line 320,200 320,188" \
  -draw "line 235,235 226,226" \
  -draw "line 200,320 188,320" \
  -draw "line 235,405 226,414" \
  -draw "line 320,440 320,452" \
  -draw "line 405,405 414,414" \
  "$OUT"

# 針（北＝コーラル、南＝ブルー）
magick "$OUT" \
  -stroke none -fill '#F04438' -draw "polygon 320,192 297,330 343,330" \
  -fill '#60A5FA' -draw "polygon 320,448 297,330 343,330" \
  -fill '#FFFFFF' -stroke '#D92D20' -strokewidth 4 -draw "circle 320,320 338,320" \
  "$OUT"

# 北針のハイライト
magick "$OUT" -stroke none -fill 'rgba(255,255,255,0.35)' \
  -draw "polygon 318,200 306,318 316,318" "$OUT"

# キラッと感（4点の星＋小粒）
magick "$OUT" -stroke none -fill 'rgba(255,255,255,0.92)' \
  -draw "polygon 512,118 522,146 550,156 522,166 512,194 502,166 474,156 502,146" \
  -fill 'rgba(255,255,255,0.75)' -draw "circle 560,112 564,112" \
  "$OUT"

magick "$OUT" -depth 8 -strip "$OUT"
rm -rf tmp_icon
magick identify "$OUT"
