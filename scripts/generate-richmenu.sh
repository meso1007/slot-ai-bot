#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

FONT="/System/Library/Fonts/$(ls /System/Library/Fonts | grep 'W6.ttc' | head -1)"
OUT="assets/richmenu.png"
mkdir -p assets tmp_richmenu
BASE="tmp_richmenu/base.png"

magick -size 2500x1686 "gradient:#0E1A33-#0B1220" "$BASE"

make_cell() {
  local text="$1" icon="$2" primary="$3" x="$4" y="$5"
  local bg fg accent
  if [ "$primary" = "1" ]; then
    bg='#1D4ED8'; fg='#FFFFFF'; accent='#FFFFFF'
  else
    bg='#FFFFFF'; fg='#0B1220'; accent='#1D4ED8'
  fi

  magick -size 780x783 xc:none -fill 'rgba(0,0,0,0.55)' \
    -draw "roundrectangle 0,14 780,797 30,30" -blur 0x16 tmp_richmenu/shadow.png
  magick -size 780x783 xc:none -fill "$bg" \
    -draw "roundrectangle 0,0 780,783 30,30" tmp_richmenu/cell.png

  case "$icon" in
    grid)
      magick tmp_richmenu/cell.png -stroke "$accent" -strokewidth 10 -fill none \
        -draw "roundrectangle 325,205 378,258 10,10" \
        -draw "roundrectangle 402,205 455,258 10,10" \
        -draw "roundrectangle 325,282 378,335 10,10" \
        -draw "roundrectangle 402,282 455,335 10,10" tmp_richmenu/cell.png
      ;;
    star)
      magick tmp_richmenu/cell.png -stroke none -fill "$accent" \
        -draw "polygon 390,185 410,238 466,240 422,276 437,330 390,299 343,330 358,276 314,240 370,238" \
        tmp_richmenu/cell.png
      ;;
    chart)
      magick tmp_richmenu/cell.png -stroke none -fill "$accent" \
        -draw "rectangle 325,295 358,355" \
        -draw "rectangle 373,245 406,355" \
        -draw "rectangle 421,195 454,355" tmp_richmenu/cell.png
      ;;
    target)
      magick tmp_richmenu/cell.png -stroke "$accent" -strokewidth 10 -fill none \
        -draw "circle 390,268 462,268" \
        -draw "circle 390,268 432,268" tmp_richmenu/cell.png
      magick tmp_richmenu/cell.png -stroke none -fill "$accent" \
        -draw "circle 390,268 406,268" tmp_richmenu/cell.png
      ;;
    play)
      magick tmp_richmenu/cell.png -stroke none -fill "$accent" \
        -draw "polygon 352,198 352,338 460,268" tmp_richmenu/cell.png
      ;;
    exit)
      magick tmp_richmenu/cell.png -stroke "$accent" -strokewidth 10 -fill none \
        -draw "circle 372,268 440,268" tmp_richmenu/cell.png
      magick tmp_richmenu/cell.png -stroke "$accent" -strokewidth 10 -fill none \
        -draw "line 344,268 410,268" \
        -draw "polyline 388,246 410,268 388,290" tmp_richmenu/cell.png
      ;;
  esac

  magick tmp_richmenu/cell.png -font "$FONT" -fill "$fg" -pointsize 108 \
    -gravity center -annotate +0+132 "$text" tmp_richmenu/cell_text.png

  magick "$BASE" tmp_richmenu/shadow.png -geometry "+$x+$y" -composite tmp_richmenu/out.png
  magick tmp_richmenu/out.png tmp_richmenu/cell_text.png -geometry "+$x+$y" -composite "$BASE"
}

make_cell "機種選択" grid   1   30   30
make_cell "評価"     star   0  850   30
make_cell "スペック" chart  0 1670   30
make_cell "狙い目"   target 0   30  855
make_cell "AT"       play   0  850  855
make_cell "終了後"   exit   0 1670  855

magick "$BASE" -depth 8 "$OUT"
rm -rf tmp_richmenu
magick identify "$OUT"
