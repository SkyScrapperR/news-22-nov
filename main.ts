// Draws the front page for Sunday 22 November 2026 and writes it to /output/entry.png
// (or to the folder named by MAKEFUN_OUTPUT_DIR). Node 22, standard library only.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderPageB } from './src/pageB.ts';
import { content } from './src/content.ts';
import { encodeIndexedPNG } from './src/png.ts';
import { overflowWarnings } from './src/text.ts';

const canvas = renderPageB(content);
const png = encodeIndexedPNG(canvas.px, canvas.w, canvas.h, 112);
const out = join(process.env.MAKEFUN_OUTPUT_DIR ?? '/output', 'entry.png');
writeFileSync(out, png);
process.stderr.write(`wrote ${out}: ${png.length} bytes, overflow warnings: ${overflowWarnings}\n`);
