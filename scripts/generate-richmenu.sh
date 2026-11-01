#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

FONT="/System/Library/Fonts/$(ls /System/Library/Fonts | grep 'W6.ttc' | head -1)"
OUT="assets/richmenu.png"
mkdir -p assets tmp_richmenu

make_cell() {
  local num="$1" en="$2" main="$3" sub="$4" out="$5"
  magick -size 780x783 "xc:#FFFFFF" \
    -fill '#D92D20' -draw "rectangle 0,0 780,10" \
    -fill '#D92D20' -draw "rectangle 40,250 46,420" \
    -font "$FONT" -fill '#B42318' -pointsize 34 -gravity northwest \
      -annotate +40+52 "$num  ·  $en" \
    -font "$FONT" -fill '#0A0A0A' -pointsize 108 -gravity northwest \
      -annotate +70+286 "$main" \
    -font "$FONT" -fill '#78716C' -pointsize 40 -gravity northwest \
      -annotate +72+432 "$sub" \
    -font "$FONT" -fill '#FEE2E2' -pointsize 250 -gravity southeast \
      -annotate +40+10 "$num" \
    -font "$FONT" -fill '#A8A29E' -pointsize 28 -gravity southwest \
      -annotate +40+40 "SLOT AI" \
    "$out"
}

make_cell "01" "SELECT" "機種選択" "台を切り替える"       tmp_richmenu/1.png
make_cell "02" "REVIEW" "評価"     "評判と概要"           tmp_richmenu/2.png
make_cell "03" "SPEC"   "スペック" "天井・機械割"         tmp_richmenu/3.png
make_cell "04" "STANCE" "狙い目"   "打ち始めの目安"       tmp_richmenu/4.png
make_cell "05" "AT"     "AT"       "AT中・上位AT"         tmp_richmenu/5.png
make_cell "06" "EXIT"   "終了後"   "AT後・ヤメ時"         tmp_richmenu/6.png

magick montage tmp_richmenu/1.png tmp_richmenu/2.png tmp_richmenu/3.png \
  tmp_richmenu/4.png tmp_richmenu/5.png tmp_richmenu/6.png \
  -tile 3x2 -geometry 780x783+30+30 -background '#FFFBF9' tmp_richmenu/montage.png

magick tmp_richmenu/montage.png -resize 2500x1686! -depth 8 "$OUT"

rm -rf tmp_richmenu
magick identify "$OUT"
