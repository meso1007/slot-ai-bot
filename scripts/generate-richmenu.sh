#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

FONT="/System/Library/Fonts/$(ls /System/Library/Fonts | grep 'W6.ttc' | head -1)"
OUT="assets/richmenu.png"
mkdir -p assets tmp_richmenu

make_cell() {
  local text="$1" color="$2" out="$3"
  magick -size 780x783 "xc:$color" \
    -font "$FONT" -fill white -pointsize 120 -gravity center \
    -annotate +0+0 "$text" "$out"
}

make_cell "機種選択" "#3b5bdb" tmp_richmenu/1.png
make_cell "スペック" "#2f9e44" tmp_richmenu/2.png
make_cell "通常時"   "#e8590c" tmp_richmenu/3.png
make_cell "AT解説"   "#9c36b5" tmp_richmenu/4.png
make_cell "AT後"     "#0ca678" tmp_richmenu/5.png
make_cell "ヤメ時"   "#c92a2a" tmp_richmenu/6.png

magick montage tmp_richmenu/1.png tmp_richmenu/2.png tmp_richmenu/3.png \
  tmp_richmenu/4.png tmp_richmenu/5.png tmp_richmenu/6.png \
  -tile 3x2 -geometry 780x783+30+30 -background '#12121c' tmp_richmenu/montage.png

magick tmp_richmenu/montage.png -resize 2500x1686! -depth 8 "$OUT"

rm -rf tmp_richmenu
magick identify "$OUT"
