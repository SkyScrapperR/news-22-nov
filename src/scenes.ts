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

function rubble(cx: number, base: number, s: number): number[] {
  return [cx - s, base, cx - s * 0.4, base - s * 0.8, cx + s * 0.5, base - s * 0.6, cx + s, base];
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
      // the rejected draft: a sheet struck through in red
      const px0 = x + 30, py0 = y + 60;
      c.fill([[px0, py0, px0 + 44, py0 - 4, px0 + 49, py0 + 50, px0 + 5, py0 + 54]], WHITE);
      for (let i = 0; i < 6; i++) c.line(px0 + 9, py0 + 8 + i * 7, px0 + 38, py0 + 5 + i * 7, 2, hex('#9aa7b5'));
      c.line(px0 - 2, py0 - 2, px0 + 52, py0 + 54, 6, acc);
      c.line(px0 + 52, py0 - 6, px0 - 2, py0 + 58, 6, acc);
      const cx = x + w - 60, cy = y + 60, r = 45;
      c.circle(cx, cy, r + 5, hex('#0b2238'));
      c.circle(cx, cy, r, WHITE);
      // overtime arc: from 12 round past the hour
      // the red half is the six hours past midnight GMT: the clock reads 06:00
      const a0 = -Math.PI / 2, a1 = Math.PI / 2;
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
      c.line(cx, cy, cx, cy + (r - 22), 5, COL.ink);
      c.line(cx, cy, cx, cy - (r - 12), 4, COL.ink);
      c.circle(cx, cy, 4.5, acc);
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
      // the focal bulb: lit on the left, dead on the right
      const cx = x + w - 64, cy = y + 50;
      const yel = hex('#ffd25a');
      c.clip(x, y, cx, y + h);
      for (let k = 0; k < 7; k++) {
        const a = Math.PI * (0.62 + k * 0.127);
        c.line(cx + Math.cos(a) * 40, cy + Math.sin(a) * 40, cx + Math.cos(a) * 52, cy + Math.sin(a) * 52, 3, yel);
      }
      c.circle(cx, cy, 33, yel);
      c.poly([cx - 17, cy + 24, cx, cy + 24, cx, cy + 40, cx - 13, cy + 40], yel);
      c.clip(cx, y, x + w, y + h);
      c.circle(cx, cy, 33, hex('#3b4156'));
      c.poly([cx, cy + 24, cx + 17, cy + 24, cx + 13, cy + 40, cx, cy + 40], hex('#3b4156'));
      c.clip(x, y, x + w, y + h);
      c.rect(cx - 13, cy + 42, 26, 5, hex('#9aa0b0'));
      c.rect(cx - 11, cy + 49, 22, 5, hex('#9aa0b0'));
      break;
    }
    case 'drones': {
      // night raid: drones streak in, one strike lights up an apartment block
      const sky = hex('#16142a');
      c.rect(x, y, w, h, sky);
      // a five-storey block with its upper corner torn away, rubble at its foot
      const by = y + h - 17;
      c.rect(x, by - 8, w, 8, hex('#0d0c18'));
      const bx = x + w - 112, bw = 84, bh = 70;
      const top = by - bh;
      c.fill([[bx, by, bx, top + 34, bx + 12, top + 24, bx + 20, top + 30, bx + 30, top + 12, bx + 40, top + 18, bx + 46, top, bx + bw, top, bx + bw, by]], hex('#2f2d44'));
      for (let r = 0; r < 5; r++) {
        for (let q = 0; q < 6; q++) {
          const wx = bx + 6 + q * 13, wy = top + 6 + r * 13;
          const inside = wx > bx + 46 || wy > top + 36 - (wx - bx) * 0.5;
          if (inside) c.rect(wx, wy, 7, 7, (r * 3 + q) % 4 === 0 ? hex('#ffd25a') : hex('#1c1b2c'));
        }
      }
      for (let i = 0; i < 9; i++) c.fill([rubble(bx - 16 + i * 8, by, 9 + (i % 3) * 3)], hex(i % 2 ? '#4a4660' : '#3a3650'));
      burst(c, bx + 24, top + 20, 12, 26, 11, acc, 0.2);
      burst(c, bx + 24, top + 20, 6, 13, 9, hex('#ffd25a'), 0.5);
      const drone = (dx: number, dy: number, sc: number) => {
        c.stroke([dx - 60 * sc, dy + 18 * sc, dx - 6 * sc, dy + 2 * sc], 1.6, mix(sky, WHITE, 0.35), 0.9);
        c.poly([dx + 10 * sc, dy, dx - 8 * sc, dy - 9 * sc, dx - 4 * sc, dy, dx - 8 * sc, dy + 9 * sc], hex('#d8d8e0'));
      };
      drone(x + 168, y + 100, 1.3);
      drone(x + 84, y + 66, 0.9);
      break;
    }
    case 'collapse': {
      // a five-storey block whose stairwell has fallen from roof to ground; a ladder truck and rescuers on the rubble
      const sky = hex('#1b2236');
      c.rect(x, y, w, h, sky);
      const gy = y + h - 19;
      const bw = 178, bx = x + w - bw - 8, fh = 16, top = gy - 5 * fh - 4;
      const gx = bx + 70, gw = 40; // the collapsed stairwell
      // floodlight beam from the truck into the gap, drawn under the block
      const lx = gx + gw + 40, ly = gy - 22;
      c.fill([[lx, ly, gx - 6, top + 8, gx + gw * 0.6, gy]], mix(sky, WHITE, 0.16));
      c.rect(x, gy, w, h - (gy - y), hex('#0e1220'));
      const wall = hex('#cfc7b4'), shade = hex('#8f8776'), win = hex('#2a3048'), lit = hex('#ffd25a');
      c.rect(bx, top, gx - bx, gy - top, wall);
      c.rect(gx + gw, top, bx + bw - gx - gw, gy - top, wall);
      c.rect(gx, top + 4, gw, gy - top - 4, hex('#0f1422'));
      for (let f = 0; f < 5; f++) {
        const wy = top + 5 + f * fh;
        for (let q = 0; q < 4; q++) c.rect(bx + 6 + q * 16, wy, 9, 9, (f + q) % 3 === 0 ? lit : win);
        for (let q = 0; q < 4; q++) c.rect(gx + gw + 6 + q * 15, wy, 9, 9, (2 * f + q) % 5 === 0 ? lit : win);
        const fy = top + (f + 1) * fh + 2;
        c.rect(bx, fy - 1, gx - bx, 1.6, shade);
        c.rect(gx + gw, fy - 1, bx + bw - gx - gw, 1.6, shade);
        // torn slabs hanging into the gap
        c.fill([[gx, fy - 2, gx + 15, fy + 7, gx + 15, fy + 10, gx, fy + 2]], shade);
        c.fill([[gx + gw, fy - 2, gx + gw - 12, fy + 8, gx + gw - 12, fy + 11, gx + gw, fy + 2]], shade);
      }
      c.rect(bx - 3, top - 4, gx - bx + 3, 5, shade);
      c.rect(gx + gw, top - 4, bx + bw - gx - gw + 3, 5, shade);
      // the rubble pile spilling out of the stairwell
      const pc = gx + gw / 2;
      c.fill([[pc - 62, gy, pc - 20, gy - 26, pc + 4, gy - 34, pc + 26, gy - 22, pc + 60, gy]], hex('#8a8272'));
      for (let i = 0; i < 9; i++) c.fill([rubble(pc - 48 + i * 12, gy, 6 + (i % 3) * 3)], hex(i % 2 ? '#a69d8a' : '#6e675a'));
      // rescuers in orange on the pile
      for (const [rx, ry] of [[pc - 30, gy - 18], [pc - 12, gy - 30], [pc + 14, gy - 24]]) {
        c.rect(rx - 3, ry - 9, 6, 10, hex('#ff8a1e'));
        c.circle(rx, ry - 12, 3, hex('#ffd9b0'));
      }
      // ladder truck with its blue lights, ladder raised into the gap
      const tx = gx + gw + 18;
      c.line(tx + 10, gy - 15, gx + 10, top + 26, 4, hex('#ffc83a'));
      c.rect(tx, gy - 15, 54, 13, hex('#d23a2c'));
      c.rect(tx + 40, gy - 22, 14, 8, hex('#d23a2c'));
      c.circle(tx + 12, gy - 1, 4, hex('#111111'));
      c.circle(tx + 44, gy - 1, 4, hex('#111111'));
      c.circle(tx + 45, gy - 24, 5, mix(sky, hex('#4aa8ff'), 0.5));
      c.circle(tx + 45, gy - 24, 2.4, hex('#7cc4ff'));
      break;
    }
    default: {
      c.circle(x + w - 78, y + h / 2 + 4, 58, mix(bg, WHITE, 0.1));
      icon(c, s.art, x + w - 78, y + h / 2 + 4, 104, WHITE, acc, bg);
    }
  }
}

// ---- tiles: red PLACE: TOPIC banner, source tag, one huge figure with its unit, one clean icon ----
export function tileScene(c: Canvas, x: number, y: number, w: number, h: number, s: Story) {
  const bg = bgOf(s);
  const acc = accOf(s);
  c.rect(x, y, w, h, bg);
  const ix = x + w - 32, iy = y + h / 2 + 7;
  c.circle(ix, iy, 24, mix(bg, WHITE, 0.09));
  icon(c, s.art, ix, iy, 42, WHITE, acc, bg);
  // source tag, top right
  const src = String(s.vals?.tag ?? s.src);
  const ss = fitOne(F.bold, src, 7, 6.4, 74, 'tile source tag');
  const sw = measure(F.bold, src, ss) + 8;
  c.rect(x + w - sw, y, sw, 12, mix(bg, [0, 0, 0], 0.55));
  drawText(c, F.bold, src, x + w - 4, y + 8.8, ss, [215, 210, 198], { align: 'right' });
  // banner, top left
  const tag = s.banner ?? s.place;
  const ts = fitOne(F.black, tag, 10.5, 8.6, w - sw - 18, 'tile banner', 0.4);
  const tw = measure(F.black, tag, ts, 0.4) + 12;
  c.rect(x, y, tw, 17, COL.red);
  drawText(c, F.black, tag, x + 6, y + 12.4, ts, WHITE, { tracking: 0.4 });
  // the huge figure and its unit
  const fact = s.fact ?? '';
  const unit = s.unit ?? '';
  const room = w - 68 - 8;
  const uw = unit ? measure(F.black, unit, 10.5, 0.4) + 5 : 0;
  const fs = fitOne(F.display, fact, 36, 18, room - uw, 'tile figure', 0, 0.6);
  const fw = drawText(c, F.display, fact, x + 7, y + 55, fs, WHITE, { bold: 0.6 });
  if (unit) drawText(c, F.black, unit, x + 7 + fw + 5, y + 55, 10.5, hex('#ffd25a'), { tracking: 0.4 });
}
