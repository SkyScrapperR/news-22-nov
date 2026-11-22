// Hero scenes (324 x 130) and tile art (190 x 60). Each has one focal point that survives at 300 px.

import { Canvas, hex, mix } from './raster.ts';
import type { RGB } from './raster.ts';
import { icon, burst, WHITE } from './art.ts';
import { drawText, measure, fitOne } from './text.ts';
import { F, REGION } from './style.ts';
import type { Story } from './types.ts';

const NAVY = hex('#14284a');
const CHAR = hex('#24221f');

function bgOf(s: Story): RGB {
  const v = s.vals?.bg;
  if (typeof v === 'string') return hex(v);
  return mix(REGION[s.region].col, [16, 16, 22], 0.55);
}

function accOf(s: Story): RGB {
  const v = s.vals?.acc;
  if (typeof v === 'string') return hex(v);
  return hex('#ff5a3c');
}

// ---- heroes ----
export function heroScene(c: Canvas, x: number, y: number, w: number, h: number, s: Story) {
  const bg = bgOf(s);
  const acc = accOf(s);
  c.rect(x, y, w, h, bg);
  switch (s.art) {
    default: {
      // generic: one big icon on the right over a soft disc
      c.circle(x + w - 78, y + h / 2 + 4, 58, mix(bg, WHITE, 0.1));
      icon(c, s.art, x + w - 78, y + h / 2 + 4, 104, WHITE, acc, bg);
    }
  }
}

// ---- tiles ----
export function tileScene(c: Canvas, x: number, y: number, w: number, h: number, s: Story) {
  const bg = bgOf(s);
  const acc = accOf(s);
  c.rect(x, y, w, h, bg);
  icon(c, s.art, x + 31, y + h / 2, 50, WHITE, acc, bg);
  const fx = x + 62;
  const room = x + w - 6 - fx;
  const fact = s.fact ?? '';
  const fs = fitOne(F.display, fact, 30, 18, room, 'tile fact', 0, 0.4);
  drawText(c, F.display, fact, fx, y + 32, fs, WHITE, { bold: 0.4 });
  if (s.cap) {
    const cs = fitOne(F.black, s.cap, 8.8, 7.4, room - 8, 'tile caption', 0.3);
    const cw = measure(F.black, s.cap, cs, 0.3) + 8;
    c.rect(fx - 1, y + 40, cw, 13, [250, 247, 238]);
    drawText(c, F.black, s.cap, fx + 3, y + 50, cs, CHAR, { tracking: 0.3 });
  }
}

export { NAVY, burst };
