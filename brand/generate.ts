import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('.', import.meta.url).pathname;
for (const d of ['studies', 'suite', 'qa']) mkdirSync(join(ROOT, d), { recursive: true });

const INK = '#0B1220';
const BLUE = '#1D4ED8';
const LIGHT = '#60A5FA';
const MUTED = '#94A3B8';
const PAPER = '#FFFFFF';
const FONT = 'Helvetica Neue, Helvetica, Arial, sans-serif';

const d2 = (n: number) => n.toFixed(2);
const polar = (cx: number, cy: number, r: number, deg: number): [number, number] => [
  cx + r * Math.cos((deg * Math.PI) / 180),
  cy + r * Math.sin((deg * Math.PI) / 180),
];

const cArc = (cx: number, cy: number, r: number, gap: number, color: string, sw: number, cap = 'round') => {
  const [sx, sy] = polar(cx, cy, r, gap / 2);
  const [ex, ey] = polar(cx, cy, r, -gap / 2);
  return `<path d="M ${d2(sx)} ${d2(sy)} A ${r} ${r} 0 1 1 ${d2(ex)} ${d2(ey)}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="${cap}"/>`;
};

const needle = (cx: number, cy: number, len: number, w: number, color: string, sw: number) => {
  const t = cy - len;
  const b = cy + len;
  return `<path d="M ${cx} ${t} L ${cx - w} ${cy} L ${cx + w} ${cy} Z M ${cx} ${b} L ${cx - w} ${cy} L ${cx + w} ${cy} Z" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linejoin="miter"/>`;
};

const needle2 = (cx: number, cy: number, len: number, w: number, north: string, south: string, sw: number) => {
  const t = cy - len;
  const b = cy + len;
  return `<path d="M ${cx} ${t} L ${cx - w} ${cy} L ${cx + w} ${cy} Z" fill="none" stroke="${north}" stroke-width="${sw}" stroke-linejoin="miter"/><path d="M ${cx} ${b} L ${cx - w} ${cy} L ${cx + w} ${cy} Z" fill="none" stroke="${south}" stroke-width="${sw}" stroke-linejoin="miter"/>`;
};

const diamond = (cx: number, cy: number, len: number, w: number, color: string, sw: number) =>
  `<path d="M ${cx} ${cy - len} L ${cx - w} ${cy} L ${cx} ${cy + len} L ${cx + w} ${cy} Z" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linejoin="miter"/>`;

const ticks = (cx: number, cy: number, r1: number, r2: number, sw: number, color: string) => {
  let s = '';
  for (let i = 0; i < 8; i++) {
    const a = i * 45;
    const [x1, y1] = polar(cx, cy, r1, a);
    const [x2, y2] = polar(cx, cy, r2, a);
    s += `<line x1="${d2(x1)}" y1="${d2(y1)}" x2="${d2(x2)}" y2="${d2(y2)}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`;
  }
  return s;
};

const grid = (w: number, h: number, step = 50) => {
  let s = '';
  for (let x = 0; x <= w; x += step) s += `<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="#E5E7EB" stroke-width="1"/>`;
  for (let y = 0; y <= h; y += step) s += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="#E5E7EB" stroke-width="1"/>`;
  return s;
};

const study = (num: string, title: string, note: string, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="700" viewBox="0 0 600 700"><rect width="600" height="700" fill="${PAPER}"/><g transform="translate(0,60)">${grid(600, 600)}</g><line x1="0" y1="60" x2="600" y2="60" stroke="#D1D5DB"/><text x="24" y="34" font-family="${FONT}" font-size="18" font-weight="700" fill="${INK}">${num} / ${title}</text><text x="24" y="54" font-family="${FONT}" font-size="12" fill="#6B7280">${note}</text><g transform="translate(0,60)">${body}</g><text x="576" y="686" text-anchor="end" font-family="${FONT}" font-size="11" fill="#9CA3AF">mono-as-data · 600×600</text></svg>`;

const C = { cx: 300, cy: 300, r: 170 };

const s1 = `${ticks(C.cx, C.cy, 120, 140, 8, INK)}${cArc(C.cx, C.cy, C.r, 64, INK, 24)}${needle(C.cx, C.cy, 150, 34, INK, 18)}`;
const s2 = `${cArc(C.cx, C.cy, C.r, 64, INK, 24)}<path d="M 380 180 C 240 180 240 280 300 300 C 360 320 360 420 220 420" fill="none" stroke="${INK}" stroke-width="24" stroke-linecap="round"/>`;
const s3 = `<circle cx="${C.cx}" cy="${C.cy}" r="${C.r}" fill="none" stroke="${INK}" stroke-width="24"/><g stroke="${INK}" stroke-width="18" stroke-linecap="round" fill="none"><line x1="300" y1="300" x2="420" y2="180"/><line x1="420" y1="180" x2="398" y2="184"/><line x1="420" y1="180" x2="416" y2="202"/><line x1="300" y1="300" x2="180" y2="180"/><line x1="180" y1="180" x2="202" y2="184"/><line x1="180" y1="180" x2="184" y2="202"/></g><circle cx="300" cy="300" r="12" fill="none" stroke="${INK}" stroke-width="12"/>`;
const s4 = `<circle cx="${C.cx}" cy="${C.cy}" r="${C.r}" fill="none" stroke="${INK}" stroke-width="24"/>${[
  [300, 150, 288, 300, 312, 300],
  [450, 300, 300, 288, 300, 312],
  [300, 450, 288, 300, 312, 300],
  [150, 300, 300, 288, 300, 312],
]
  .map((p) => `<path d="M ${p[0]} ${p[1]} L ${p[2]} ${p[3]} L ${p[4]} ${p[5]} Z" fill="none" stroke="${INK}" stroke-width="14" stroke-linejoin="miter"/>`)
  .join('')}`;
const s5 = `<circle cx="${C.cx}" cy="${C.cy}" r="${C.r}" fill="${INK}"/><polygon points="300,300 470,220 470,380" fill="${PAPER}"/><polygon points="300,160 268,300 332,300 300,440" fill="${PAPER}"/>`;
const mini = (cx: number, gap: number) => `${cArc(cx, 300, 90, gap, INK, 14)}${needle(cx, 300, 78, 20, INK, 12)}`;
const s6 = `${mini(180, 14)}${mini(420, 72)}<text x="180" y="430" text-anchor="middle" font-family="${FONT}" font-size="12" fill="#6B7280">CLOSED 14°</text><text x="420" y="430" text-anchor="middle" font-family="${FONT}" font-size="12" fill="#6B7280">OPEN 72°</text>`;
const s7 = `${cArc(300, 300, 190, 50, INK, 28)}${needle(300, 255, 95, 24, INK, 14)}`;
const s8 = `<path d="M 180 440 C 180 300 420 360 420 240" fill="none" stroke="${INK}" stroke-width="24" stroke-linecap="round"/><g stroke="${INK}" stroke-width="18" stroke-linecap="round" fill="none"><line x1="420" y1="240" x2="396" y2="252"/><line x1="420" y1="240" x2="438" y2="262"/></g><circle cx="180" cy="440" r="14" fill="${INK}"/>`;

const write = (p: string, s: string) => writeFileSync(join(ROOT, p), s);

write('studies/01-c-aperture.svg', study('01', 'APERTURE C', 'C ring with 64° right aperture + vertical needle. Round terminals.', s1));
write('studies/02-sc-interlock.svg', study('02', 'S–C INTERLOCK', 'S-path shares the C aperture; two letters read as one stroke system.', s2));
write('studies/03-mirrored-needle.svg', study('03', 'MIRRORED NEEDLE', 'Two needles mirrored on the vertical axis inside a full ring.', s3));
write('studies/04-rotational.svg', study('04', 'ROTATIONAL 90°', 'Four-point needle reads identically at 90° rotations.', s4));
write('studies/05-negative-space.svg', study('05', 'NEGATIVE SPACE', 'Solid C with needle cut from negative space; high contrast, low ink.', s5));
write('studies/06-aperture-dial.svg', study('06', 'APERTURE DIAL', 'Closed aperture = technical; open aperture = editorial/warm.', s6));
write('studies/07-scale-play.svg', study('07', 'SCALE PLAY', 'Large C with a smaller needle; hierarchy inside one mark.', s7));
write('studies/08-route-s.svg', study('08', 'ROUTE S', 'S-route with a north arrow; guidance without a compass ring.', s8));

// ---------- suite ----------
const symbolColor = `${ticks(C.cx, C.cy, 120, 140, 8, MUTED)}${cArc(C.cx, C.cy, C.r, 64, INK, 24)}${needle2(C.cx, C.cy, 150, 34, BLUE, INK, 18)}`;
const symbolMono = `${ticks(C.cx, C.cy, 120, 140, 8, INK)}${cArc(C.cx, C.cy, C.r, 64, INK, 24)}${needle(C.cx, C.cy, 150, 34, INK, 18)}`;
const symbolDark = `${ticks(C.cx, C.cy, 120, 140, 8, '#93C5FD')}${cArc(C.cx, C.cy, C.r, 64, '#FFFFFF', 24)}${needle2(C.cx, C.cy, 150, 34, LIGHT, '#FFFFFF', 18)}`;
const darkBg = `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#12244A"/><stop offset="1" stop-color="#0B1220"/></linearGradient></defs><rect width="600" height="600" fill="url(#bg)"/>`;

const doc = (w: number, h: number, body: string, bg = PAPER) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${bg}"/>${body}</svg>`;

write('suite/symbol.svg', doc(600, 600, symbolColor));
write('suite/symbol-mono.svg', doc(600, 600, symbolMono));
write('suite/symbol-dark.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 600 600">${darkBg}${symbolDark}</svg>`);

const microBody = (cx: number, cy: number, color: string, north: string, south: string) =>
  `${cArc(cx, cy, 54, 90, color, 24)}${needle2(cx, cy, 42, 14, north, south, 12)}`;
write('suite/micro-mark.svg', doc(160, 160, microBody(80, 80, INK, INK, INK)));

write(
  'suite/lockup.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="400" viewBox="0 0 1400 400"><rect width="1400" height="400" fill="${PAPER}"/><g transform="translate(60,50) scale(0.5)">${symbolColor}</g><text x="420" y="225" font-family="${FONT}" font-size="92" font-weight="700" letter-spacing="10" fill="${INK}">SLOT COMPASS</text><text x="424" y="272" font-family="${FONT}" font-size="26" letter-spacing="4" fill="#6B7280">立ち回りの羅針盤</text></svg>`,
);

const cs = 800;
const constructionBody = `<text x="40" y="44" font-family="${FONT}" font-size="18" font-weight="700" fill="${INK}">CONSTRUCTION / APERTURE C</text><text x="40" y="66" font-family="${FONT}" font-size="12" fill="#6B7280">SLOT COMPASS · geometry proof</text><g transform="translate(100,100)">${grid(600, 600)}<circle cx="300" cy="300" r="170" fill="none" stroke="#CBD5E1" stroke-dasharray="4 6"/><line x1="300" y1="300" x2="470" y2="300" stroke="${BLUE}" stroke-width="2" stroke-dasharray="6 4"/><circle cx="300" cy="300" r="4" fill="${BLUE}"/><text x="382" y="292" font-family="${FONT}" font-size="14" fill="${BLUE}">R 170</text><text x="20" y="40" font-family="${FONT}" font-size="14" fill="${BLUE}">NEEDLE 150 × 34</text><text x="470" y="205" font-family="${FONT}" font-size="14" fill="${BLUE}">GAP 64°</text>${symbolColor}</g><text x="40" y="760" font-family="${FONT}" font-size="13" fill="#6B7280">SW 24 · 2% optical overshoot on apertures · one terminal language (round) · 55 / 34 / 21 nest reference</text>`;
write('suite/construction.svg', doc(cs, cs, constructionBody));

// Transparent, single-blue, no-fill account icon (640)
const T = { cx: 320, cy: 320, r: 205 };
const transparentMark = `${cArc(T.cx, T.cy, T.r, 64, BLUE, 30)}${needle(T.cx, T.cy, 168, 42, BLUE, 22)}`;
write(
  'suite/symbol-transparent.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">${transparentMark}</svg>`,
);

// ---------- QA ----------
const sizes = [16, 24, 32, 48, 64, 96];
let lx = 30;
const ladderParts: string[] = [];
const labels: string[] = [];
for (const size of sizes) {
  const s = size / 160;
  ladderParts.push(`<g transform="translate(${lx},40) scale(${s})">${microBody(80, 80, INK, INK, INK)}</g>`);
  labels.push(`<text x="${lx + size / 2}" y="160" text-anchor="middle" font-family="${FONT}" font-size="12" fill="#6B7280">${size}</text>`);
  lx += size + 36;
}
write('qa/favicon-ladder.svg', doc(lx + 10, 200, ladderParts.join('') + labels.join('') + `<text x="30" y="24" font-family="${FONT}" font-size="12" fill="#6B7280">MICRO-MARK / 16 → 96px</text>`));

console.log('generated');
