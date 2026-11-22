// Hero scenes (324 x 130) and tile art (190 x 60). Each has one focal point that survives at 300 px.

import { Canvas, hex, mix, ellipsePoly } from './raster.ts';
import type { RGB } from './raster.ts';
import { icon, burst, WHITE } from './art.ts';
import { drawText, measure, fitOne } from './text.ts';
import { F, REGION, COL } from './style.ts';
import type { Story } from './types.ts';

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

// a label on a solid box, so it never collides with the drawing
function label(c: Canvas, t: string, x: number, base: number, size: number, fg: RGB, bg: RGB, align: 'left' | 'right' = 'left') {
  const w = measure(F.black, t, size, 0.3) + size * 0.9;
  const bx = align === 'right' ? x - w : x;
  c.rect(bx, base - size * 1.05, w, size * 1.45, bg);
  drawText(c, F.black, t, bx + size * 0.45, base, size, fg, { tracking: 0.3 });
}

// ---- heroes ----
export function heroScene(c: Canvas, x: number, y: number, w: number, h: number, s: Story) {
  const bg = bgOf(s);
  const acc = accOf(s);
  c.rect(x, y, w, h, bg);
  switch (s.art) {
    case 'cop': {
      // a summit clock run past its deadline: the red arc is the overtime
      const sky = hex('#123a5c');
      c.rect(x, y, w, h, sky);
      // the globe low on the left, the table of delegations across the bottom
      c.circle(x + 70, y + h + 30, 78, hex('#2f7fb5'));
      c.fill([ellipsePoly(x + 52, y + h - 10, 26, 18)], hex('#5aa469'));
      c.fill([ellipsePoly(x + 104, y + h - 26, 18, 12)], hex('#5aa469'));
      const cx = x + w - 70, cy = y + 64, r = 50;
      c.circle(cx, cy, r + 5, hex('#0b2238'));
      c.circle(cx, cy, r, WHITE);
      // overtime arc: from 12 round past the hour
      const a0 = -Math.PI / 2, a1 = -Math.PI / 2 + Math.PI * 2 * 0.3;
      const pts = [cx, cy];
      for (let i = 0; i <= 24; i++) {
        const a = a0 + ((a1 - a0) * i) / 24;
        pts.push(cx + Math.cos(a) * (r - 3), cy + Math.sin(a) * (r - 3));
      }
      c.poly(pts, mix(acc, WHITE, 0.25));
      for (let k = 0; k < 12; k++) {
        const a = (k * Math.PI) / 6;
        c.line(cx + Math.cos(a) * (r - 9), cy + Math.sin(a) * (r - 9), cx + Math.cos(a) * (r - 3), cy + Math.sin(a) * (r - 3), 2.4, COL.ink);
      }
      c.line(cx, cy, cx + Math.cos(a1) * (r - 12), cy + Math.sin(a1) * (r - 12), 4, COL.ink);
      c.line(cx, cy, cx, cy - (r - 22), 5, COL.ink);
      c.circle(cx, cy, 4.5, acc);
      label(c, String(s.vals?.tag ?? ''), x + w - 8, y + h - 8, 10.5, COL.ink, hex('#ffd25a'), 'right');
      break;
    }
    case 'grid': {
      // a city at night with half of its lights cut
      const sky = hex('#0f1730');
      c.rect(x, y, w, h, sky);
      for (let i = 0; i < 26; i++) {
        const sx = x + ((i * 97) % w), sy = y + 60 + ((i * 37) % 24);
        c.circle(sx, sy - 50, 0.9, mix(sky, WHITE, 0.6));
      }
      const ground = y + h;
      let bx = x;
      let k = 0;
      while (bx < x + w) {
        const bw = 18 + ((k * 13) % 17);
        const bh = 34 + ((k * 29) % 46);
        const lit = bx < x + w * 0.42;
        c.rect(bx, ground - bh, bw - 2, bh, lit ? hex('#26324f') : hex('#141a2b'));
        for (let wy = ground - bh + 6; wy < ground - 8; wy += 9) {
          for (let wx = bx + 4; wx < bx + bw - 6; wx += 7) {
            if (lit && ((wx * 7 + wy * 3) % 5) !== 0) c.rect(wx, wy, 3, 4, hex('#ffd25a'));
          }
        }
        bx += bw;
        k++;
      }
      // the focal bulb, half lit
      const cx = x + w - 66, cy = y + 52;
      c.circle(cx, cy, 44, mix(sky, hex('#ffd25a'), 0.12));
      icon(c, 'bulb', cx, cy, 86, hex('#c9c9c9'), hex('#ffd25a'), sky);
      c.clip(cx, y, cx + 60, y + h);
      icon(c, 'bulb', cx, cy, 86, hex('#3a3f4f'), hex('#4a4f60'), sky);
      c.clip(x, y, x + w, y + h);
      c.line(cx, cy - 52, cx, cy + 36, 2.2, sky);
      label(c, String(s.vals?.tag ?? ''), x + w - 8, y + h - 8, 10.5, COL.ink, hex('#ffd25a'), 'right');
      break;
    }
    case 'drones': {
      // night raid: drones streak in, one strike lights up an apartment block
      const sky = hex('#16142a');
      c.rect(x, y, w, h, sky);
      c.rect(x, y + h - 18, w, 18, hex('#0d0c18'));
      const by = y + h - 18;
      const bx = x + w - 110;
      c.rect(bx, by - 62, 74, 62, hex('#2c2a40'));
      for (let r = 0; r < 5; r++) for (let q = 0; q < 6; q++) c.rect(bx + 6 + q * 11, by - 56 + r * 11, 6, 6, (r + q) % 3 === 0 ? hex('#ffd25a') : hex('#1c1b2c'));
      burst(c, bx + 52, by - 58, 14, 30, 11, acc, 0.2);
      burst(c, bx + 52, by - 58, 7, 15, 9, hex('#ffd25a'), 0.5);
      const drone = (dx: number, dy: number, sc: number) => {
        c.stroke([dx - 60 * sc, dy + 18 * sc, dx - 6 * sc, dy + 2 * sc], 1.6, mix(sky, WHITE, 0.35), 0.9);
        c.poly([dx + 10 * sc, dy, dx - 8 * sc, dy - 9 * sc, dx - 4 * sc, dy, dx - 8 * sc, dy + 9 * sc], hex('#d8d8e0'));
      };
      drone(x + 150, y + 62, 1.6);
      drone(x + 112, y + 88, 1.2);
      drone(x + 196, y + 36, 1.1);
      drone(x + 70, y + 74, 0.9);
      label(c, String(s.vals?.tag ?? ''), x + w - 8, y + h - 4, 10, COL.ink, hex('#ffd25a'), 'right');
      break;
    }
    default: {
      c.circle(x + w - 78, y + h / 2 + 4, 58, mix(bg, WHITE, 0.1));
      icon(c, s.art, x + w - 78, y + h / 2 + 4, 104, WHITE, acc, bg);
    }
  }
}

// ---- tiles: red tag top-left, big fact, one bold icon on the right ----
export function tileScene(c: Canvas, x: number, y: number, w: number, h: number, s: Story) {
  const bg = bgOf(s);
  const acc = accOf(s);
  c.rect(x, y, w, h, bg);
  c.circle(x + w - 34, y + h / 2 + 2, 27, mix(bg, WHITE, 0.09));
  icon(c, s.art, x + w - 34, y + h / 2 + 2, 50, WHITE, acc, bg);
  const tag = s.banner ?? s.place;
  const ts = fitOne(F.black, tag, 10.5, 8.5, w - 76, 'tile tag', 0.4);
  const tw = measure(F.black, tag, ts, 0.4) + 12;
  c.rect(x, y, tw, 17, COL.red);
  drawText(c, F.black, tag, x + 6, y + 12.4, ts, WHITE, { tracking: 0.4 });
  const fact = s.fact ?? '';
  const room = w - 74;
  const fs = fitOne(F.display, fact, 28, 17, room, 'tile fact', 0, 0.4);
  drawText(c, F.display, fact, x + 7, y + 47, fs, WHITE, { bold: 0.4 });
  if (s.cap) {
    const cs = fitOne(F.black, s.cap, 7.6, 6.6, room, 'tile caption', 0.3);
    drawText(c, F.black, s.cap, x + 7, y + 57, cs, mix(WHITE, bg, 0.2), { tracking: 0.3 });
  }
}
