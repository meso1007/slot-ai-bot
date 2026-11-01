import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('.', import.meta.url).pathname;
const DIR = join(ROOT, 'concepts');
mkdirSync(DIR, { recursive: true });

const BLUE = '#1D4ED8';
const d2 = (n: number) => n.toFixed(2);
const polar = (cx: number, cy: number, r: number, deg: number): [number, number] => [
  cx + r * Math.cos((deg * Math.PI) / 180),
  cy + r * Math.sin((deg * Math.PI) / 180),
];
const cArc = (cx: number, cy: number, r: number, gap: number, color: string, sw: number) => {
  const [sx, sy] = polar(cx, cy, r, gap / 2);
  const [ex, ey] = polar(cx, cy, r, -gap / 2);
  return `<path d="M ${d2(sx)} ${d2(sy)} A ${r} ${r} 0 1 1 ${d2(ex)} ${d2(ey)}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`;
};
const svg = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">${body}</svg>`;

const write = (name: string, body: string) => writeFileSync(join(DIR, `${name}.svg`), svg(body));

// A: C ring + S-route with arrow (SC / compass / route)
const aRing = cArc(320, 320, 215, 90, BLUE, 26);
const aS = `<path d="M 210 455 C 390 455 390 345 320 330 C 250 315 250 205 445 205" fill="none" stroke="${BLUE}" stroke-width="26" stroke-linecap="round"/>`;
const aArrow = `<path d="M 445 205 L 418 194 M 445 205 L 418 216" fill="none" stroke="${BLUE}" stroke-width="26" stroke-linecap="round"/>`;
const aDot = `<circle cx="210" cy="455" r="10" fill="${BLUE}"/>`;
write('a-c-s-route', aRing + aS + aArrow + aDot);

// C: C ring + needle whose tail becomes a route (asymmetric compass)
const cRing = cArc(320, 320, 215, 72, BLUE, 26);
const cNeedle = `<path d="M 320 150 L 282 300 L 358 300 Z" fill="none" stroke="${BLUE}" stroke-width="26" stroke-linejoin="miter"/>`;
const cTail = `<path d="M 320 300 L 320 405 C 320 480 430 480 480 438" fill="none" stroke="${BLUE}" stroke-width="26" stroke-linecap="round"/>`;
const cArrow = `<path d="M 480 438 L 452 432 M 480 438 L 462 412" fill="none" stroke="${BLUE}" stroke-width="26" stroke-linecap="round"/>`;
const cDot = `<circle cx="320" cy="300" r="9" fill="${BLUE}"/>`;
write('c-needle-route', cRing + cNeedle + cTail + cArrow + cDot);

// D: Full ring + S-shaped needle with arrow
const dRing = `<circle cx="320" cy="320" r="215" fill="none" stroke="${BLUE}" stroke-width="26"/>`;
const dS = `<path d="M 320 150 C 250 190 390 250 320 320 C 250 390 390 450 320 490" fill="none" stroke="${BLUE}" stroke-width="24" stroke-linecap="round"/>`;
const dArrow = `<path d="M 320 150 L 300 180 M 320 150 L 340 180" fill="none" stroke="${BLUE}" stroke-width="24" stroke-linecap="round"/>`;
const dDot = `<circle cx="320" cy="490" r="10" fill="${BLUE}"/>`;
write('d-s-needle', dRing + dS + dArrow + dDot);

console.log('concepts generated');
