#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

FONT="/System/Library/Fonts/$(ls /System/Library/Fonts | grep 'W6.ttc' | head -1)"
OUT="assets/richmenu.png"
mkdir -p assets tmp_richmenu

make_cell() {
  local text="$1" out="$2"
  magick -size 780x783 "gradient:#0E2A5E-#1D4ED8" \
    -font "$FONT" -fill '#FFFFFF' -pointsize 144 -gravity center \
      -annotate +0+0 "$text" \
    -fill '#93C5FD' -draw "rectangle 0,0 780,5" \
    "$out"
}

make_cell "機種選択" tmp_richmenu/1.png
make_cell "評価"     tmp_richmenu/2.png
make_cell "スペック" tmp_richmenu/3.png
make_cell "狙い目"   tmp_richmenu/4.png
make_cell "AT"       tmp_richmenu/5.png
make_cell "終了後"   tmp_richmenu/6.png

magick montage tmp_richmenu/1.png tmp_richmenu/2.png tmp_richmenu/3.png \
  tmp_richmenu/4.png tmp_richmenu/5.png tmp_richmenu/6.png \
  -tile 3x2 -geometry 780x783+30+30 -background '#0B1220' tmp_richmenu/montage.png

magick tmp_richmenu/montage.png -resize 2500x1686! -depth 8 "$OUT"

rm -rf tmp_richmenu
magick identify "$OUT"
