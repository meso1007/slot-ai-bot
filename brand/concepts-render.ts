import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
const ROOT = new URL('.', import.meta.url).pathname;
const DIR = join(ROOT, 'concepts');
for (const f of readdirSync(DIR).filter((f) => f.endsWith('.svg'))) {
  const png = new Resvg(readFileSync(join(DIR, f), 'utf8'), {
    font: { loadSystemFonts: true },
  }).render().asPng();
  writeFileSync(join(DIR, f.replace(/\.svg$/, '.png')), png);
}
console.log('rendered');
