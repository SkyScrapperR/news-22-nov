// Variant E tile scenes: each tile is one small flat scene of what happened, drawn in a w x h panel.
// The key figure is drawn on the scene by the page; scenes keep the lower right calm for it.

import { Canvas, hex, mix } from './raster.ts';
import type { RGB } from './raster.ts';
import { burst, WHITE } from './art.ts';
import type { Story } from './types.ts';

// rotate a flat list of points about (cx, cy)
function rot(pts: number[], a: number, cx: number, cy: number): number[] {
  const out: number[] = [];
  const ca = Math.cos(a), sa = Math.sin(a);
  for (let i = 0; i < pts.length; i += 2) {
    const dx = pts[i] - cx, dy = pts[i + 1] - cy;
    out.push(cx + dx * ca - dy * sa, cy + dx * sa + dy * ca);
  }
  return out;
}

function smoke(c: Canvas, x: number, y: number, s: number, col: RGB) {
  c.circle(x, y, 7 * s, col);
  c.circle(x + 6 * s, y - 9 * s, 9 * s, col);
  c.circle(x + 15 * s, y - 20 * s, 11 * s, col);
  c.circle(x + 26 * s, y - 30 * s, 12 * s, col);
}

function flames(c: Canvas, x: number, base: number, s: number) {
  c.poly([x - 12 * s, base, x - 9 * s, base - 14 * s, x - 4 * s, base - 9 * s, x, base - 24 * s, x + 5 * s, base - 11 * s, x + 9 * s, base - 17 * s, x + 12 * s, base], hex('#f2652b'));
  c.poly([x - 7 * s, base, x - 3 * s, base - 9 * s, x, base - 15 * s, x + 4 * s, base - 8 * s, x + 7 * s, base], hex('#ffc93c'));
}

export function tileArtE(c: Canvas, x: number, y: number, w: number, h: number, s: Story) {
  c.clip(x, y, x + w, y + h);
  const g = y + h; // the bottom edge
  switch (s.art) {
    case 'drone': {
      // night over flat-roofed houses: a drone dives, one roof bursts
      const sky = hex('#1d2342');
      c.rect(x, y, w, h, sky);
      for (let i = 0; i < 14; i++) c.circle(x + ((i * 53) % w), y + 6 + ((i * 29) % 30), 0.8, mix(sky, WHITE, 0.55));
      c.rect(x, g - 14, w, 14, hex('#b8925a'));
      const houses = [[6, 26, 22], [34, 22, 30], [60, 30, 20], [94, 24, 26], [122, 20, 18]];
      for (const [hx, hw, hh] of houses) {
        c.rect(x + hx, g - 14 - hh, hw, hh, hex('#e2cfa6'));
        c.rect(x + hx - 1, g - 14 - hh - 3, hw + 2, 3, hex('#c7b088'));
        c.rect(x + hx + 5, g - 14 - hh + 7, 5, 6, hex('#3a3326'));
        if (hw > 24) c.rect(x + hx + hw - 10, g - 14 - hh + 7, 5, 6, hex('#3a3326'));
      }
      burst(c, x + 76, g - 46, 9, 18, 9, hex('#f2652b'), 0.3);
      burst(c, x + 76, g - 46, 5, 9, 7, hex('#ffd25a'), 0.6);
      // the drone: a delta wing with a trail
      c.line(x + 18, y + 12, x + 54, y + 22, 1.5, mix(sky, WHITE, 0.35));
      c.poly(rot([x + 70, y + 22, x + 52, y + 14, x + 56, y + 22, x + 52, y + 30], 0.5, x + 60, y + 22), hex('#d9dbe4'));
      break;
    }
    case 'factory': {
      // a plant with a fire plume on its roof
      c.rect(x, y, w, h, hex('#e9dcc6'));
      c.rect(x, g - 10, w, 10, hex('#b9ab92'));
      const fx = x + 10, top = g - 10 - 30;
      c.fill([[fx, g - 10, fx, top, fx + 20, top - 10, fx + 20, top, fx + 40, top - 10, fx + 40, top, fx + 60, top - 10, fx + 60, top, fx + 92, top, fx + 92, g - 10]], hex('#7d8794'));
      c.rect(fx + 70, top - 26, 9, 26, hex('#6a7380'));
      for (let i = 0; i < 4; i++) c.rect(fx + 8 + i * 20, top + 10, 10, 8, hex('#4b525c'));
      smoke(c, fx + 40, top - 26, 1.2, hex('#5d5853'));
      smoke(c, fx + 54, top - 22, 0.9, hex('#77716a'));
      flames(c, fx + 38, top - 6, 1.1);
      break;
    }
    case 'moto': {
      // a rider leaning hard into a corner, kerbs on the apex
      c.rect(x, y, w, h, hex('#5f9a55'));
      c.fill([[x, g, x, g - 26, x + 60, g - 46, x + 140, g - 54, x + w, g - 50, x + w, g]], hex('#5b5f66'));
      for (let i = 0; i < 9; i++) c.fill([rot([x + 6 + i * 14, g - 30 - i * 2.4, x + 18 + i * 14, g - 32.5 - i * 2.4, x + 18 + i * 14, g - 28.5 - i * 2.4, x + 6 + i * 14, g - 26 - i * 2.4], 0, 0, 0)], i % 2 ? WHITE : hex('#d23a2c'));
      const cx = x + 46, cy = g - 30, a = -0.62;
      c.circle(...(rot([cx - 18, cy + 6], a, cx, cy) as [number, number]), 8, hex('#16181c'));
      c.circle(...(rot([cx + 18, cy + 6], a, cx, cy) as [number, number]), 8, hex('#16181c'));
      c.poly(rot([cx - 20, cy, cx - 6, cy - 12, cx + 14, cy - 12, cx + 22, cy - 2, cx + 6, cy + 4, cx - 14, cy + 4], a, cx, cy), hex('#d23a2c'));
      c.poly(rot([cx - 8, cy - 12, cx - 2, cy - 30, cx + 8, cy - 30, cx + 10, cy - 12], a, cx, cy), hex('#f4f1ea'));
      c.circle(...(rot([cx + 4, cy - 35], a, cx, cy) as [number, number]), 6.5, hex('#e8b62a'));
      c.poly(rot([cx + 8, cy - 26, cx + 22, cy - 16, cx + 18, cy - 12, cx + 6, cy - 20], a, cx, cy), hex('#f4f1ea'));
      break;
    }
    case 'car': {
      // an F1 car on the night strip, neon towers behind
      const sky = hex('#1c1638');
      c.rect(x, y, w, h, sky);
      const towers = [[4, 30, 50], [38, 22, 64], [64, 30, 42], [98, 18, 70], [120, 26, 52], [150, 30, 60]];
      for (const [tx, tw, th] of towers) {
        c.rect(x + tx, g - 16 - th, tw, th, hex('#2a2350'));
        c.stroke([x + tx, g - 16, x + tx, g - 16 - th, x + tx + tw, g - 16 - th, x + tx + tw, g - 16], 1.4, tx % 2 ? hex('#ff4fa3') : hex('#3fd6ff'));
      }
      c.rect(x, g - 16, w, 16, hex('#2b2b33'));
      c.rect(x, g - 9, w, 1.4, hex('#e8e2cf'), 0.6);
      const cx = x + 18, cy = g - 12;
      c.poly([cx, cy, cx + 8, cy - 8, cx + 30, cy - 10, cx + 40, cy - 16, cx + 52, cy - 10, cx + 84, cy - 6, cx + 90, cy], hex('#1f3fbf'));
      c.rect(cx - 2, cy - 15, 5, 12, hex('#1f3fbf'));
      c.rect(cx - 5, cy - 16, 13, 3, hex('#d23a2c'));
      c.rect(cx + 84, cy - 4, 10, 3, hex('#d23a2c'));
      c.circle(cx + 14, cy, 7, hex('#0e0e12'));
      c.circle(cx + 72, cy, 7, hex('#0e0e12'));
      c.circle(cx + 14, cy, 2.5, hex('#ffd25a'));
      c.circle(cx + 72, cy, 2.5, hex('#ffd25a'));
      break;
    }
    case 'exam': {
      // an answer sheet, and a phone struck out in red
      c.rect(x, y, w, h, hex('#e8e4f2'));
      const px = x + 14, py = y + 10;
      c.poly(rot([px, py, px + 52, py, px + 52, py + 64, px, py + 64], -0.08, px + 26, py + 32), WHITE);
      for (let i = 0; i < 6; i++) {
        c.circle(px + 9, py + 10 + i * 9, 2.6, i === 2 ? hex('#22283a') : hex('#9aa0b5'));
        c.line(px + 16, py + 10 + i * 9, px + 44, py + 10 + i * 9, 1.6, hex('#b8bccb'));
      }
      const fx = x + 84, fy = y + 12;
      c.roundRect(fx, fy, 30, 54, 5, hex('#22283a'));
      c.rect(fx + 3, fy + 6, 24, 38, hex('#5b7bd6'));
      c.line(fx - 6, fy - 2, fx + 36, fy + 56, 5, hex('#d23a2c'));
      c.line(fx + 36, fy - 2, fx - 6, fy + 56, 5, hex('#d23a2c'));
      break;
    }
    case 'flame': {
      // a burning car on a village lane
      c.rect(x, y, w, h, hex('#f0d9b8'));
      c.fill([[x, g - 18, x + 40, g - 34, x + 90, g - 26, x + 140, g - 40, x + w, g - 30, x + w, g, x, g]], hex('#c9b089'));
      for (const [hx, hw, hh] of [[110, 20, 18], [132, 16, 24], [150, 22, 16]]) c.rect(x + hx, g - 26 - hh, hw, hh, hex('#efe6d2'));
      c.rect(x, g - 14, w, 14, hex('#8d8170'));
      const cx = x + 16, cy = g - 12;
      c.poly([cx, cy, cx + 4, cy - 10, cx + 16, cy - 12, cx + 24, cy - 22, cx + 46, cy - 22, cx + 54, cy - 12, cx + 66, cy - 10, cx + 68, cy], hex('#2c2a2a'));
      c.circle(cx + 14, cy, 6, hex('#151313'));
      c.circle(cx + 54, cy, 6, hex('#151313'));
      smoke(c, cx + 34, cy - 40, 1.1, hex('#6f6862'));
      flames(c, cx + 34, cy - 18, 1.25);
      break;
    }
    case 'rocket': {
      // lift-off: a rocket on its plume beside the tower
      c.rect(x, y, w, h, hex('#9cc4e8'));
      c.rect(x, y, w, h * 0.4, hex('#7fb0dc'));
      c.rect(x, g - 8, w, 8, hex('#8b8b80'));
      c.rect(x + 34, y + 18, 5, h - 26, hex('#5a5f66'));
      for (let i = 0; i < 5; i++) c.line(x + 34, y + 22 + i * 10, x + 39, y + 28 + i * 10, 1.2, hex('#3f444a'));
      const rx = x + 60, top = y + 6;
      c.poly([rx, top, rx + 6, top + 10, rx - 6, top + 10], hex('#2b2f36'));
      c.rect(rx - 6, top + 10, 12, 40, WHITE);
      c.rect(rx - 6, top + 30, 12, 3, hex('#2b2f36'));
      c.poly([rx - 6, top + 42, rx - 12, top + 52, rx - 6, top + 50], hex('#2b2f36'));
      c.poly([rx + 6, top + 42, rx + 12, top + 52, rx + 6, top + 50], hex('#2b2f36'));
      c.poly([rx - 5, top + 50, rx + 5, top + 50, rx, top + 66], hex('#ff9a3c'));
      c.poly([rx - 2.5, top + 50, rx + 2.5, top + 50, rx, top + 59], hex('#ffe08a'));
      for (const [sx, sr] of [[-26, 8], [-14, 10], [0, 11], [14, 10], [28, 8]]) c.circle(rx + sx, g - 8, sr, hex('#f3f1ec'));
      break;
    }
    case 'trophy': {
      // a golden horse on a plinth under a spotlight
      const bg = hex('#231b2e');
      c.rect(x, y, w, h, bg);
      c.fill([[x + 40, y, x + 62, y, x + 96, g, x + 6, g]], mix(bg, hex('#fff2c4'), 0.2));
      const cx = x + 46, base = g - 6;
      c.rect(cx - 20, base - 8, 40, 8, hex('#3b3240'));
      c.rect(cx - 14, base - 14, 28, 6, hex('#c99a1e'));
      const gold = hex('#e8b62a');
      // the horse stands in profile, head up: body, four legs, neck, head, ear and tail
      const k = 1.35, hx = cx - 2, hy = base - 14;
      const P = (pts: number[]) => pts.map((v, i) => (i % 2 ? hy + v * k : hx + v * k));
      c.poly(P([-15, -18, 9, -19, 13, -14, 11, -9, -13, -9, -16, -13]), gold);
      for (const lx of [-12, -7, 5, 10]) c.line(...(P([lx, -10]) as [number, number]), ...(P([lx + (lx > 0 ? 1 : -1), 0]) as [number, number]), 2.6, gold);
      c.poly(P([6, -18, 12, -31, 17, -33, 15, -16]), gold);
      c.poly(P([12, -31, 16, -35, 24, -29, 23, -26, 16, -27]), gold);
      c.poly(P([14, -34, 15, -38, 17, -34]), gold);
      c.line(...(P([-15, -17]) as [number, number]), ...(P([-21, -5]) as [number, number]), 3, gold);
      for (let i = 0; i < 9; i++) c.circle(x + 120 + ((i * 41) % 60), y + 8 + ((i * 23) % 30), 1.1, hex('#ffe9a8'));
      break;
    }
    case 'cricket': {
      // a bat, a ball and the stumps on a green
      c.rect(x, y, w, h, hex('#4f9a5a'));
      c.fill([[x + 30, g, x + 60, y + 18, x + 100, y + 18, x + 120, g]], hex('#d8c79a'));
      const sx = x + 80, sb = y + 50;
      for (let i = 0; i < 3; i++) c.rect(sx - 8 + i * 7, sb - 30, 3, 30, hex('#f6f1e2'));
      c.rect(sx - 9, sb - 32, 20, 2.4, hex('#f6f1e2'));
      c.poly(rot([x + 20, y + 30, x + 30, y + 30, x + 30, y + 64, x + 20, y + 64], -0.5, x + 25, y + 47), hex('#e6c98a'));
      c.line(...(rot([x + 25, y + 30], -0.5, x + 25, y + 47) as [number, number]), ...(rot([x + 25, y + 14], -0.5, x + 25, y + 47) as [number, number]), 3.5, hex('#3a2a1c'));
      c.circle(x + 56, y + 30, 5, hex('#c8202c'));
      c.line(x + 52, y + 30, x + 60, y + 30, 0.8, hex('#f6d5d5'));
      break;
    }
    case 'quake': {
      // a seismograph trace over the Andes, a cracked house below
      c.rect(x, y, w, h, hex('#dfe6ea'));
      c.poly([x - 10, g - 14, x + 40, y + 14, x + 90, g - 14], hex('#8f7f6c'));
      c.poly([x + 50, g - 14, x + 110, y + 8, x + 170, g - 14], hex('#7a6b5b'));
      c.poly([x + 30, y + 26, x + 40, y + 14, x + 50, y + 26], WHITE);
      c.poly([x + 98, y + 20, x + 110, y + 8, x + 122, y + 20], WHITE);
      c.rect(x, g - 14, w, 14, hex('#a39276'));
      const trace = [x, y + 40];
      const amp = [0, 2, -3, 4, -10, 18, -22, 26, -16, 12, -6, 4, -2, 1, 0];
      amp.forEach((a, i) => trace.push(x + 10 + i * 8, y + 40 + a));
      trace.push(x + w, y + 40);
      c.stroke(trace, 2, hex('#d23a2c'));
      const hx = x + 14, hb = g - 6;
      c.rect(hx, hb - 20, 28, 20, hex('#f2ead8'));
      c.poly([hx - 3, hb - 20, hx + 14, hb - 32, hx + 31, hb - 20], hex('#b5482f'));
      c.stroke([hx + 14, hb - 20, hx + 10, hb - 13, hx + 16, hb - 8, hx + 12, hb], 1.6, hex('#2a2420'));
      break;
    }
    default:
      c.rect(x, y, w, h, hex('#ddd5c3'));
  }
  c.noClip();
}
