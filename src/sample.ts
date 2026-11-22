// Typography test sheet: masthead, headlines and the sans sizes the page uses.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { Font } from './ttf.ts';
import { Canvas, hex } from './raster.ts';
import { drawText, measure } from './text.ts';
import { encodeIndexedPNG } from './png.ts';

const f = (n: string) => new Font(readFileSync(new URL('../fonts/' + n, import.meta.url)));
const display = f('DMSerifDisplay-Regular.ttf');
const serif = f('DMSerifText-Regular.ttf');
const lato = f('Lato-Regular.ttf');
const latoB = f('Lato-Bold.ttf');
const latoK = f('Lato-Black.ttf');

const W = 1024, H = 640;
const c = new Canvas(W, H, hex('#f7f2e6'));
const ink = hex('#151411');
const red = hex('#b4231b');
drawText(c, display, 'Sunday 22 November 2026', W / 2, 92, 90, ink, { align: 'center', bold: 1.1 });
c.hline(14, W - 14, 106, 2.4, ink);
drawText(c, serif, 'Héadline AVATAR Wavy Tokyo: ñandú, Zürich, São Paulo', 14, 150, 25.5, ink, { bold: 0.95 });
drawText(c, serif, 'Tile headline at twenty px — Kyiv, Gaza, Lagos', 14, 180, 20, ink, { bold: 0.75 });
drawText(c, serif, 'Subtitle in text serif with a slight slant · second · third', 14, 205, 16.5, ink, { slant: 0.16 });
let y = 235;
for (const s of [16, 13, 12, 11, 10, 9, 8, 7]) {
  drawText(c, lato, `Lato ${s}px: The quick brown fox jumps over the lazy dog 0123456789 (AV To)`, 14, y, s, ink);
  drawText(c, latoK, `BLACK ${s}: KYIV · GAZA`, 640, y, s, hex('#1f5fa8'), { tracking: 0.4 });
  y += s + 9;
}
c.rect(14, y, 300, 34, red);
drawText(c, latoK, 'GULF: IRAN STRIKES', 24, y + 24, 19.5, hex('#ffffff'), { tracking: 0.3 });
drawText(c, display, '6.7', 340, y + 30, 32, red, { bold: 0.5 });
drawText(c, display, '−18%', 420, y + 30, 32, red, { bold: 0.5 });
drawText(c, latoB, 'Lato Bold 9.6 sub-line', 540, y + 20, 9.6, ink);
y += 60;
drawText(c, lato, `measure "AVAVAV" kerned: ${measure(lato, 'AVAVAV', 20).toFixed(2)} px`, 14, y, 12, ink);
mkdirSync(new URL('../out-sample/', import.meta.url), { recursive: true });
writeFileSync(new URL('../out-sample/sample.png', import.meta.url), encodeIndexedPNG(c.px, W, H, 112));
console.log('ok');
