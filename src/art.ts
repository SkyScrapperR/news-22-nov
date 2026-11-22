// Original drawings: bold single-silhouette icons for tiles, simple focal scenes for heroes.
// Everything is flat colour (it compresses well and reads at 300 px).

import { Canvas, hex, mix, ellipsePoly, reversePoly, roundRectPoly } from './raster.ts';
import type { RGB, Poly } from './raster.ts';

export const WHITE: RGB = [255, 255, 255];

export function burst(c: Canvas, cx: number, cy: number, r0: number, r1: number, spikes: number, col: RGB, rot = 0) {
  const pts: number[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = rot + (Math.PI * i) / spikes;
    const r = i % 2 === 0 ? r1 : r0;
    pts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  c.poly(pts, col);
}

function star(cx: number, cy: number, r: number, n = 5): number[] {
  const pts: number[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / n;
    const rr = i % 2 === 0 ? r : r * 0.42;
    pts.push(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  return pts;
}

// Icons are drawn centred on (cx, cy) inside a square of side s.
export function icon(c: Canvas, name: string, cx: number, cy: number, s: number, fg: RGB, acc: RGB, bg: RGB) {
  const u = s / 100; // design grid: 100 x 100, origin at the centre
  const X = (v: number) => cx + v * u;
  const Y = (v: number) => cy + v * u;
  const P = (...v: number[]) => v.map((q, i) => (i % 2 === 0 ? X(q) : Y(q)));
  switch (name) {
    case 'quake': {
      // a house cracked by a seismograph trace
      c.poly(P(-34, 2, 0, -28, 34, 2, 26, 2, 26, 34, -26, 34, -26, 2), fg);
      c.rect(X(-8), Y(12), 16 * u, 22 * u, bg);
      c.stroke(P(-50, -36, -30, -36, -22, -48, -12, -18, -2, -50, 6, -24, 14, -40, 22, -36, 50, -36), 5 * u, acc);
      c.stroke(P(4, -22, -4, -6, 6, 4, -2, 18), 4 * u, bg);
      break;
    }
    case 'missile': {
      for (const [ox, oy] of [[-30, 10], [0, -6], [28, 14]]) {
        c.stroke(P(ox - 22, oy + 40, ox + 6, oy - 10), 5 * u, mix(fg, bg, 0.45));
        c.poly(P(ox + 6, oy - 26, ox + 14, oy - 8, ox + 8, oy + 2, ox, oy - 2, ox - 2, oy - 12), fg);
      }
      burst(c, X(0), Y(-34), 9 * u, 20 * u, 9, acc);
      break;
    }
    case 'drone': {
      c.stroke(P(-36, -22, 36, 22), 6 * u, fg);
      c.stroke(P(-36, 22, 36, -22), 6 * u, fg);
      for (const [ox, oy] of [[-36, -22], [36, 22], [-36, 22], [36, -22]]) c.fill([ellipsePoly(X(ox), Y(oy), 16 * u, 5 * u)], fg);
      c.roundRect(X(-13), Y(-11), 26 * u, 22 * u, 5 * u, fg);
      c.circle(X(0), Y(0), 5 * u, acc);
      break;
    }
    case 'ship': {
      c.poly(P(-46, 6, 46, 6, 34, 28, -38, 28), fg);
      c.rect(X(-30), Y(-14), 26 * u, 20 * u, fg);
      c.rect(X(0), Y(-6), 30 * u, 12 * u, fg);
      c.rect(X(-24), Y(-30), 8 * u, 16 * u, fg);
      c.stroke(P(-50, 36, -36, 32, -22, 36, -8, 32, 6, 36, 20, 32, 34, 36, 50, 32), 4 * u, acc);
      break;
    }
    case 'ballot': {
      c.poly(P(-12, -44, 22, -44, 22, -6, -12, -6), WHITE);
      c.stroke(P(-4, -26, 3, -18, 15, -36), 4.5 * u, acc);
      c.rect(X(-36), Y(-8), 72 * u, 46 * u, fg);
      c.rect(X(-22), Y(-10), 44 * u, 5 * u, bg);
      break;
    }
    case 'flame': {
      c.poly(P(0, -48, 16, -24, 26, -4, 24, 18, 12, 34, -12, 34, -24, 18, -26, -4, -16, -18, -8, -6, -6, -26), acc);
      c.poly(P(0, -10, 10, 6, 10, 22, 0, 32, -10, 22, -8, 8), [255, 210, 80]);
      break;
    }
    case 'chartdown':
    case 'chartup': {
      const up = name === 'chartup';
      c.stroke(P(-44, -40, -44, 38, 46, 38), 4 * u, fg);
      const pts = up ? P(-36, 24, -12, 12, 8, 16, 36, -26) : P(-36, -26, -12, -14, 8, -18, 36, 24);
      c.stroke(pts, 6 * u, acc);
      const ex = X(36), ey = Y(up ? -26 : 24);
      const dir = up ? -1 : 1;
      c.poly([ex + 9 * u, ey + dir * 4 * u, ex - 7 * u, ey - dir * 7 * u, ex + 4 * u, ey - dir * 14 * u], acc);
      break;
    }
    case 'ball': {
      c.circle(X(0), Y(0), 40 * u, WHITE);
      c.poly(P(0, -14, 13, -4, 8, 12, -8, 12, -13, -4), bg);
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        c.line(X(Math.cos(a) * 14), Y(Math.sin(a) * 14), X(Math.cos(a) * 34), Y(Math.sin(a) * 34), 3 * u, bg);
      }
      break;
    }
    case 'trophy': {
      c.poly(P(-26, -40, 26, -40, 22, -6, 10, 6, -10, 6, -22, -6), acc);
      c.ring(X(-26), Y(-24), 12 * u, 5 * u, acc);
      c.ring(X(26), Y(-24), 12 * u, 5 * u, acc);
      c.rect(X(-5), Y(4), 10 * u, 18 * u, acc);
      c.rect(X(-20), Y(22), 40 * u, 12 * u, fg);
      break;
    }
    case 'storm': {
      for (let k = 0; k < 2; k++) {
        const pts: number[] = [];
        for (let t = 0; t <= 1.0001; t += 0.04) {
          const a = k * Math.PI + t * Math.PI * 1.6;
          const r = 10 + 34 * t;
          pts.push(X(Math.cos(a) * r), Y(Math.sin(a) * r));
        }
        c.stroke(pts, 9 * u, fg);
      }
      c.circle(X(0), Y(0), 10 * u, acc);
      break;
    }
    case 'flood': {
      c.poly(P(-26, -10, 0, -34, 26, -10, 20, -10, 20, 16, -20, 16, -20, -10), fg);
      for (const oy of [14, 28]) c.stroke(P(-48, oy, -36, oy - 6, -24, oy, -12, oy - 6, 0, oy, 12, oy - 6, 24, oy, 36, oy - 6, 48, oy), 6 * u, acc);
      break;
    }
    case 'handshake': {
      c.poly(P(-48, -6, -22, -18, -6, -10, 10, -18, 48, -6, 48, 10, 22, 22, 6, 28, -10, 22, -48, 10), fg);
      c.stroke(P(-10, -2, 4, 8, 14, 2), 4 * u, bg);
      c.stroke(P(-2, 10, 10, 18), 4 * u, bg);
      break;
    }
    case 'gavel': {
      c.fill([rotRect(X(-6), Y(-14), 50 * u, 22 * u, -0.6)], fg);
      c.fill([rotRect(X(14), Y(12), 54 * u, 8 * u, -0.6 + Math.PI / 2)], fg);
      c.rect(X(-44), Y(30), 50 * u, 10 * u, acc);
      break;
    }
    case 'plane': {
      c.poly(P(-46, 4, 40, -8, 48, -2, 40, 6, -46, 8), fg);
      c.poly(P(-4, 0, 14, -40, 22, -40, 14, 2), fg);
      c.poly(P(-4, 4, 14, 40, 22, 40, 14, 4), fg);
      c.poly(P(-40, 2, -34, -18, -28, -18, -30, 4), fg);
      break;
    }
    case 'car': {
      c.poly(P(-48, 8, -40, -6, -14, -10, 0, -22, 22, -22, 30, -8, 48, -4, 48, 14, -48, 14), fg);
      c.circle(X(-26), Y(16), 11 * u, bg);
      c.circle(X(28), Y(16), 11 * u, bg);
      c.circle(X(-26), Y(16), 8 * u, fg);
      c.circle(X(28), Y(16), 8 * u, fg);
      c.rect(X(-46), Y(-14), 6 * u, 8 * u, acc);
      break;
    }
    case 'globe': {
      c.circle(X(0), Y(0), 40 * u, fg);
      c.fill([ellipsePoly(X(-8), Y(-10), 14 * u, 18 * u)], acc);
      c.fill([ellipsePoly(X(16), Y(14), 12 * u, 10 * u)], acc);
      c.ring(X(0), Y(0), 40 * u, 3 * u, WHITE);
      break;
    }
    case 'thermo': {
      c.roundRect(X(-9), Y(-44), 18 * u, 70 * u, 9 * u, WHITE);
      c.circle(X(0), Y(30), 16 * u, acc);
      c.rect(X(-4), Y(-26), 8 * u, 50 * u, acc);
      for (let i = 0; i < 4; i++) c.rect(X(12), Y(-36 + i * 14), 10 * u, 3 * u, fg);
      break;
    }
    case 'medical': {
      c.rect(X(-12), Y(-40), 24 * u, 80 * u, acc);
      c.rect(X(-40), Y(-12), 80 * u, 24 * u, acc);
      break;
    }
    case 'virus': {
      for (let i = 0; i < 10; i++) {
        const a = (i * Math.PI) / 5;
        c.line(X(Math.cos(a) * 24), Y(Math.sin(a) * 24), X(Math.cos(a) * 42), Y(Math.sin(a) * 42), 4 * u, acc);
        c.circle(X(Math.cos(a) * 42), Y(Math.sin(a) * 42), 6 * u, acc);
      }
      c.circle(X(0), Y(0), 28 * u, acc);
      c.circle(X(-8), Y(-6), 6 * u, bg);
      c.circle(X(10), Y(8), 5 * u, bg);
      break;
    }
    case 'rocket': {
      c.poly(P(0, -48, 14, -24, 14, 22, -14, 22, -14, -24), fg);
      c.poly(P(-14, 4, -28, 28, -14, 22), fg);
      c.poly(P(14, 4, 28, 28, 14, 22), fg);
      c.circle(X(0), Y(-14), 6 * u, bg);
      c.poly(P(-10, 24, 10, 24, 0, 48), acc);
      break;
    }
    case 'barrel': {
      c.roundRect(X(-26), Y(-38), 52 * u, 76 * u, 8 * u, fg);
      c.rect(X(-26), Y(-18), 52 * u, 4 * u, bg);
      c.rect(X(-26), Y(14), 52 * u, 4 * u, bg);
      c.poly(P(0, -10, 9, 2, 9, 8, 0, 14, -9, 8, -9, 2), acc);
      break;
    }
    case 'protest': {
      c.rect(X(-30), Y(-44), 34 * u, 24 * u, WHITE);
      c.rect(X(-15), Y(-20), 4 * u, 30 * u, fg);
      c.rect(X(8), Y(-34), 34 * u, 24 * u, acc);
      c.rect(X(23), Y(-10), 4 * u, 30 * u, fg);
      for (const ox of [-30, -6, 18]) {
        c.circle(X(ox), Y(18), 8 * u, fg);
        c.poly(P(ox - 12, 46, ox - 10, 30, ox + 10, 30, ox + 12, 46), fg);
      }
      break;
    }
    case 'shield': {
      c.poly(P(0, -44, 36, -30, 32, 10, 0, 42, -32, 10, -36, -30), fg);
      c.poly(star(X(0), Y(-2), 18 * u), acc);
      break;
    }
    case 'volcano': {
      c.poly(P(-50, 40, -14, -18, 14, -18, 50, 40), hex('#8a5a3c'));
      c.poly(P(-14, -18, -8, 4, -2, -6, 2, 10, 8, -4, 14, -18), acc);
      c.poly(P(2, -10, 10, 22, 4, 26, -2, 0), acc);
      for (const [ox, oy, r] of [[-4, -30, 10], [8, -38, 12], [-6, -46, 11]] as const) c.circle(X(ox), Y(oy), r * u, hex('#9a9a9a'));
      break;
    }
    case 'factory': {
      c.poly(P(-46, 38, -46, -6, -24, 8, -24, -6, -2, 8, -2, -6, 20, 8, 20, -40, 34, -40, 34, 38), fg);
      c.circle(X(27), Y(-48), 7 * u, mix(fg, WHITE, 0.5));
      for (const ox of [-38, -16, 6]) c.rect(X(ox), Y(16), 8 * u, 8 * u, acc);
      break;
    }
    case 'coin': {
      c.circle(X(0), Y(0), 38 * u, acc);
      c.ring(X(0), Y(0), 30 * u, 3 * u, fg);
      c.rect(X(-4), Y(-20), 8 * u, 40 * u, fg);
      break;
    }
    case 'mic': {
      c.roundRect(X(-12), Y(-44), 24 * u, 46 * u, 12 * u, fg);
      c.stroke(P(-22, -8, -22, 6, -14, 16, 0, 20, 14, 16, 22, 6, 22, -8), 5 * u, fg);
      c.rect(X(-3), Y(20), 6 * u, 16 * u, fg);
      c.rect(X(-18), Y(36), 36 * u, 6 * u, acc);
      break;
    }
    case 'snow': {
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI) / 3;
        c.line(X(Math.cos(a) * -40), Y(Math.sin(a) * -40), X(Math.cos(a) * 40), Y(Math.sin(a) * 40), 6 * u, fg);
      }
      c.circle(X(0), Y(0), 9 * u, acc);
      break;
    }
    case 'building': {
      c.rect(X(-30), Y(-38), 60 * u, 76 * u, fg);
      for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) c.rect(X(-22 + k * 17), Y(-30 + r * 16), 10 * u, 9 * u, acc);
      break;
    }
    case 'cricket': {
      // bat and ball
      c.fill([rotRect(X(-6), Y(-4), 20 * u, 70 * u, 0.55)], fg);
      c.fill([rotRect(X(-30), Y(-40), 7 * u, 26 * u, 0.55)], mix(fg, bg, 0.3));
      c.circle(X(26), Y(26), 14 * u, acc);
      c.stroke(P(16, 20, 26, 26, 36, 32), 2.4 * u, WHITE);
      break;
    }
    case 'sub': {
      c.fill([ellipsePoly(X(0), Y(10), 48 * u, 13 * u)], fg);
      c.roundRect(X(-12), Y(-14), 22 * u, 20 * u, 4 * u, fg);
      c.rect(X(-2), Y(-26), 3 * u, 14 * u, fg);
      c.poly(P(40, 10, 50, -2, 50, 22), fg);
      c.stroke(P(-50, 32, -36, 28, -22, 32, -8, 28, 6, 32, 20, 28, 34, 32, 50, 28), 3.5 * u, acc);
      break;
    }
    case 'exam': {
      c.fill([rotRect(X(-10), Y(0), 52 * u, 70 * u, -0.12)], WHITE);
      for (let i = 0; i < 5; i++) c.fill([rotRect(X(-12 + i * 1.6), Y(-22 + i * 11), 34 * u, 3.5 * u, -0.12)], mix(WHITE, fg, 0.35));
      c.roundRect(X(14), Y(-8), 26 * u, 46 * u, 5 * u, acc);
      c.rect(X(18), Y(-2), 18 * u, 30 * u, bg);
      c.circle(X(27), Y(33), 2.5 * u, bg);
      break;
    }
    case 'bulb': {
      c.circle(X(0), Y(-10), 30 * u, acc);
      c.poly(P(-16, 12, 16, 12, 12, 26, -12, 26), acc);
      c.rect(X(-12), Y(28), 24 * u, 5 * u, fg);
      c.rect(X(-10), Y(35), 20 * u, 5 * u, fg);
      c.stroke(P(-8, 10, -8, -10, 0, -2, 8, -10, 8, 10), 3 * u, mix(acc, bg, 0.5));
      break;
    }
    case 'cedar': {
      c.rect(X(-46), Y(-32), 92 * u, 16 * u, acc);
      c.rect(X(-46), Y(16), 92 * u, 16 * u, acc);
      c.rect(X(-46), Y(-16), 92 * u, 32 * u, WHITE);
      c.poly(P(0, -16, 14, -2, 6, -2, 18, 10, -18, 10, -6, -2, -14, -2), hex('#1e7a3c'));
      c.rect(X(-2), Y(10), 4 * u, 6 * u, hex('#1e7a3c'));
      break;
    }
    case 'torch': {
      c.poly(P(-10, -6, 10, -6, 4, 44, -4, 44), fg);
      c.rect(X(-14), Y(-12), 28 * u, 7 * u, fg);
      c.poly(P(0, -50, 12, -32, 10, -18, 0, -12, -10, -18, -12, -30), acc);
      c.poly(P(0, -36, 5, -26, 0, -16, -5, -26), [255, 214, 90]);
      break;
    }
    case 'vial': {
      c.roundRect(X(-14), Y(-30), 28 * u, 68 * u, 6 * u, WHITE);
      c.rect(X(-14), Y(4), 28 * u, 34 * u, acc);
      c.rect(X(-18), Y(-42), 36 * u, 12 * u, fg);
      c.stroke(P(26, -30, 44, -48), 4 * u, fg);
      c.stroke(P(22, -10, 44, -10), 4 * u, fg);
      break;
    }
    case 'house': {
      c.poly(P(-30, -6, 0, -32, 30, -6, 24, -6, 24, 30, -24, 30, -24, -6), fg);
      c.rect(X(-6), Y(10), 12 * u, 20 * u, bg);
      c.stroke(P(-40, 38, 40, 38), 4 * u, acc);
      break;
    }
    case 'eye': {
      c.fill([ellipsePoly(X(0), Y(0), 46 * u, 26 * u)], WHITE);
      c.circle(X(0), Y(0), 18 * u, acc);
      c.circle(X(0), Y(0), 8 * u, fg);
      break;
    }
    case 'pistol': {
      c.poly(P(-40, -16, 34, -16, 34, -2, -6, -2, -12, 30, -30, 30, -24, -2, -40, -2), fg);
      c.rect(X(30), Y(-22), 6 * u, 6 * u, fg);
      c.ring(X(-6), Y(6), 7 * u, 3 * u, fg);
      break;
    }
    default: {
      c.circle(X(0), Y(0), 36 * u, fg);
      c.circle(X(0), Y(0), 14 * u, acc);
    }
  }
}

function rotRect(cx: number, cy: number, w: number, h: number, a: number): Poly {
  const ca = Math.cos(a), sa = Math.sin(a);
  const pts: number[] = [];
  for (const [dx, dy] of [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]) {
    pts.push(cx + dx * ca - dy * sa, cy + dx * sa + dy * ca);
  }
  return pts;
}

export { roundRectPoly, reversePoly, hex };
