import { readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const avatar = readFileSync(new URL('./suite/avatar.svg', import.meta.url), 'utf8');
const body = avatar.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const FONT = 'Helvetica Neue, Helvetica, Arial, sans-serif';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="878" viewBox="0 0 1080 878">
<rect width="1080" height="878" fill="#F8FAFC"/>
<g transform="translate(650,210) scale(0.59375)">${body}</g>
<text x="80" y="390" font-family="${FONT}" font-size="62" font-weight="700" letter-spacing="7" fill="#0B1220">SLOT COMPASS</text>
<text x="84" y="445" font-family="${FONT}" font-size="28" letter-spacing="2" fill="#64748B">立ち回りの羅針盤</text>
<text x="84" y="492" font-family="${FONT}" font-size="22" fill="#94A3B8">台の横で、3秒で判断。</text>
<rect x="84" y="520" width="96" height="3" fill="#1D4ED8"/>
</svg>`;

writeFileSync(new URL('./suite/cover.svg', import.meta.url), svg);
const png = new Resvg(svg, {
  font: { loadSystemFonts: true, defaultFontFamily: 'Helvetica Neue' },
}).render().asPng();
writeFileSync(new URL('../assets/cover.png', import.meta.url), png);
console.log('cover rendered');
