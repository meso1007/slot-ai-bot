#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

TOKEN=$(grep -E '^LINE_CHANNEL_ACCESS_TOKEN=' .dev.vars | cut -d= -f2-)
if [ -z "$TOKEN" ]; then
  echo "LINE_CHANNEL_ACCESS_TOKEN が .dev.vars にありません" >&2
  exit 1
fi

API=https://api.line.me/v2/bot
API_DATA=https://api-data.line.me/v2/bot
IMG=assets/richmenu.png
BODY=/tmp/richmenu-body.json

cat > "$BODY" <<'JSON'
{
  "size": { "width": 2500, "height": 1686 },
  "selected": true,
  "name": "main-menu",
  "chatBarText": "メニュー",
  "areas": [
    { "bounds": { "x": 30, "y": 30, "width": 790, "height": 790 }, "action": { "type": "postback", "data": "action=select", "displayText": "機種選択" } },
    { "bounds": { "x": 850, "y": 30, "width": 790, "height": 790 }, "action": { "type": "postback", "data": "action=review", "displayText": "評価" } },
    { "bounds": { "x": 1670, "y": 30, "width": 790, "height": 790 }, "action": { "type": "postback", "data": "action=spec", "displayText": "スペック" } },
    { "bounds": { "x": 30, "y": 855, "width": 790, "height": 790 }, "action": { "type": "postback", "data": "action=normal", "displayText": "狙い目" } },
    { "bounds": { "x": 850, "y": 855, "width": 790, "height": 790 }, "action": { "type": "postback", "data": "action=at", "displayText": "AT" } },
    { "bounds": { "x": 1670, "y": 855, "width": 790, "height": 790 }, "action": { "type": "postback", "data": "action=afterexit", "displayText": "終了後" } }
  ]
}
JSON

echo "== 既存リッチメニューを削除 =="
curl -s -H "Authorization: Bearer $TOKEN" "$API/richmenu/list" \
  | python3 -c 'import sys,json
for m in json.load(sys.stdin).get("richmenus", []):
    print(m["richMenuId"])' \
  | while read -r id; do
      [ -n "$id" ] && curl -s -o /dev/null -X DELETE "$API/richmenu/$id" -H "Authorization: Bearer $TOKEN" && echo "deleted $id"
    done

echo "== リッチメニュー作成 =="
RESP=$(curl -s -X POST "$API/richmenu" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @"$BODY")
RID=$(echo "$RESP" | python3 -c 'import sys,json; print(json.load(sys.stdin)["richMenuId"])' 2>/dev/null || true)
if [ -z "${RID:-}" ]; then
  echo "作成失敗: $RESP" >&2
  exit 1
fi
echo "richMenuId=$RID"

echo "== 画像アップロード =="
curl -s -o /dev/null -w "upload HTTP %{http_code}\n" -X POST \
  "$API_DATA/richmenu/$RID/content" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: image/png" \
  --data-binary @"$IMG"

echo "== デフォルトに設定 =="
curl -s -o /dev/null -w "setdefault HTTP %{http_code}\n" -X POST \
  "$API/user/all/richmenu/$RID" \
  -H "Authorization: Bearer $TOKEN"

echo "完了: richMenuId=$RID"
