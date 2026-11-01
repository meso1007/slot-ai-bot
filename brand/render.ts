import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const ROOT = new URL('.', import.meta.url).pathname;
const OUT = join(ROOT, 'out');
mkdirSync(OUT, { recursive: true });

function render(src: string, dest: string, width?: number) {
  const svg = readFileSync(src, 'utf8');
  const opts: ConstructorParameters<typeof Resvg>[1] = {
    font: { loadSystemFonts: true, defaultFontFamily: 'Helvetica Neue' },
  };
  if (width) opts.fitTo = { mode: 'width', value: width };
  const png = new Resvg(svg, opts).render().asPng();
  writeFileSync(dest, png);
}

for (const f of readdirSync(join(ROOT, 'studies')).filter((f) => f.endsWith('.svg'))) {
  render(join(ROOT, 'studies', f), join(OUT, f.replace(/\.svg$/, '.png')));
}
for (const f of readdirSync(join(ROOT, 'suite')).filter((f) => f.endsWith('.svg'))) {
  render(join(ROOT, 'suite', f), join(OUT, f.replace(/\.svg$/, '.png')));
}
for (const f of readdirSync(join(ROOT, 'qa')).filter((f) => f.endsWith('.svg'))) {
  render(join(ROOT, 'qa', f), join(OUT, f.replace(/\.svg$/, '.png')));
}

render(join(ROOT, 'suite', 'symbol-dark.svg'), join(ROOT, '..', 'assets', 'icon.png'));
render(join(ROOT, 'suite', 'symbol-dark.svg'), join(OUT, 'sym240.png'), 240);
console.log('rendered');
