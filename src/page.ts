// The front page: 1024 x 1024, laid out top to bottom. Stories run in order of consequence.

import { readFileSync } from 'node:fs';
import { Canvas, mix } from './raster.ts';
import type { RGB } from './raster.ts';
import { drawText, measure, fitLines, fitOne, warn } from './text.ts';
import { WHITE } from './art.ts';
import { heroScene, tileScene } from './scenes.ts';
import { F, COL, REGION, REGION_ORDER, BADGE } from './style.ts';
import type { Content, Story, Badge, Callout } from './types.ts';

const W = 1024;
const H = 1024;
const M = 14; // outer margin
const CW = W - 2 * M; // content width 996

export function badge(c: Canvas, x: number, base: number, b: Badge, size: number, align: 'left' | 'right' = 'right'): number {
  const t = BADGE[b].name;
  const tw = measure(F.black, t, size, 0.4);
  const bw = tw + size * 0.9;
  const bh = size * 1.45;
  const bx = align === 'right' ? x - bw : x;
  c.roundRect(bx, base - size * 1.08, bw, bh, 2, BADGE[b].col);
  drawText(c, F.black, t, bx + size * 0.45, base, size, WHITE, { tracking: 0.4 });
  return bw;
}

export function numDot(c: Canvas, cx: number, cy: number, r: number, n: number, col: RGB) {
  c.circle(cx, cy, r, col);
  const s = r * (n >= 10 ? 1.15 : 1.35);
  drawText(c, F.black, String(n), cx, cy + s * 0.36, s, WHITE, { align: 'center' });
}

function kicker(c: Canvas, s: Story, n: number, x: number, base: number, w: number, size: number, bsize: number) {
  const rc = REGION[s.region].col;
  const r = size * 0.72;
  numDot(c, x + r, base - size * 0.36, r, n, rc);
  const bw = measure(F.black, BADGE[s.badge].name, bsize, 0.4) + bsize * 0.9;
  const tx = x + 2 * r + 4;
  const room = w - (tx - x) - bw - 5;
  const text = `${s.place} · ${s.cat}`;
  const sz = fitOne(F.black, text, size, size - 1.6, room, 'kicker', 0.4);
  drawText(c, F.black, text, tx, base, sz, rc, { tracking: 0.4 });
  badge(c, x + w, base, s.badge, bsize);
}

// ---------------------------------------------------------------------------------------------------------
export function renderPage(ct: Content): Canvas {
  const c = new Canvas(W, H, COL.paper);
  const all = [...ct.heroes, ...ct.tiles, ...ct.briefs];

  // 1. top line
  c.rect(0, 0, W, 21, COL.ink);
  const regions = new Set(all.map((s) => s.region)).size;
  drawText(c, F.black, 'ALL TIMES UTC · RANKED BY CONSEQUENCE', M, 14.5, 9.5, COL.paper, { tracking: 1.2 });
  const right = `${all.length} STORIES · ${regions} REGIONS · ${ct.dayOfYear} · EVERY ONE DATED ${ct.dayLine}`;
  const rs = fitOne(F.black, right, 9.5, 8.2, CW - 330, 'top line', 1.2);
  drawText(c, F.black, right, W - M, 14.5, rs, COL.orange, { tracking: 1.2, align: 'right' });

  // 2. masthead with the red date stamp on its right
  const sw = 84;
  const sx = W - M - sw;
  c.hline(M, W - M, 104, 2.4, COL.ink);
  c.hline(M, W - M, 108.5, 0.8, COL.ink);
  const room = sx - 12 - M;
  const mx = M + room / 2;
  const mh = fitOne(F.display, ct.masthead, 92, 60, room, 'masthead', 0, 1.1);
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    drawText(c, F.display, ct.masthead, mx + Math.cos(a) * 3.2, 92 + Math.sin(a) * 3.2, mh, COL.paper, { align: 'center', bold: 1.1, gamma: 1 });
  }
  drawText(c, F.display, ct.masthead, mx, 92, mh, COL.ink, { align: 'center', bold: 1.1 });
  c.rect(sx, 27, sw, 74, COL.red);
  c.fill([[sx + 3, 30, sx + sw - 3, 30, sx + sw - 3, 98, sx + 3, 98], [sx + 4, 31, sx + 4, 97, sx + sw - 4, 97, sx + sw - 4, 31]], [244, 200, 190]);
  drawText(c, F.black, ct.stamp[0], sx + sw / 2, 46, 13, WHITE, { align: 'center', tracking: 2 });
  drawText(c, F.display, ct.stamp[1], sx + sw / 2, 80, 38, WHITE, { align: 'center', bold: 0.6 });
  drawText(c, F.black, ct.stamp[2], sx + sw / 2, 94, 11, WHITE, { align: 'center', tracking: 2 });

  // 4. subtitle
  const sub = ct.subtitle.join('  ·  ');
  const ss = fitOne(F.serif, sub, 16.5, 14, CW, 'subtitle');
  drawText(c, F.serif, sub, W / 2, 126, ss, COL.ink, { align: 'center', slant: 0.16 });

  // 5. the day in UTC
  timeline(c, ct, 132, 56);

  // 6. numbers strip
  figures(c, ct, 192, 66);

  // 7. region bar
  regionBar(c, all, 262, 12);

  // 8. heroes
  const heroTop = 280;
  const hw = (CW - 2 * 12) / 3;
  ct.heroes.forEach((s, i) => hero(c, s, i + 1, M + i * (hw + 12), heroTop, hw));

  // 9. rule + 10. tiles
  const tileTop = 524;
  c.hline(M, W - M, tileTop - 4, 1.2, COL.ink);
  const tw = (CW - 4 * 12) / 5;
  ct.tiles.forEach((s, i) => {
    const col = i % 5;
    const row = Math.floor(i / 5);
    tile(c, s, 4 + i, M + col * (tw + 12), tileTop + row * 141, tw);
  });
  const tilesEnd = tileTop + 141 + 136;

  // 11. rule, 12. map, 13. briefs
  c.hline(M, W - M, tilesEnd + 2, 1.6, COL.ink);
  const checkTop = 940;
  const top = tilesEnd + 7;
  const bottom = checkTop - 5;
  const mapW = 300;
  map(c, all, M, top, mapW, bottom - top);
  briefs(c, ct.briefs, 4 + ct.tiles.length, M + mapW + 14, top, W - M, bottom);

  // 14. date check, 15. how sure, 16. footer
  dateCheck(c, ct, checkTop, 46);
  legend(c, ct, checkTop + 46);
  return c;
}

// ---------------------------------------------------------------------------------------------------------
function timeline(c: Canvas, ct: Content, y: number, h: number) {
  c.rect(M, y, CW, h, COL.panel);
  c.rect(M, y, 78, h, COL.ink);
  drawText(c, F.black, 'THE DAY', M + 39, y + 21, 11, COL.paper, { align: 'center', tracking: 0.8 });
  drawText(c, F.black, 'IN UTC', M + 39, y + 35, 11, COL.orange, { align: 'center', tracking: 0.8 });
  const ax0 = 112, ax1 = 992, ay = y + h / 2;
  c.hline(ax0, ax1, ay, 1.4, COL.soft);
  for (let hr = 0; hr <= 24; hr += 3) {
    const tx = ax0 + ((ax1 - ax0) * hr) / 24;
    const big = hr % 6 === 0;
    c.rect(tx - 0.6, ay - (big ? 4 : 2.5), 1.2, big ? 8 : 5, COL.soft);
  }
  drawText(c, F.bold, '00', ax0 - 4, ay + 2.6, 7.2, COL.muted, { align: 'right' });
  drawText(c, F.bold, '24', ax1 + 4, ay + 2.6, 7.2, COL.muted);
  const ev = ct.timeline.map((e) => {
    const [hh, mm] = e.t.replace('≈', '').split(':').map(Number);
    return { e, x: ax0 + ((ax1 - ax0) * (hh + mm / 60)) / 24 };
  });
  const size = 12.5;
  // labels alternate above and below the axis; same-side labels are pushed apart, never overlapped
  for (const side of [0, 1]) {
    const items = ev.filter((_, i) => i % 2 === side).map((q) => {
      const tw = measure(F.black, q.e.t, size);
      const lw = measure(F.black, q.e.label, size);
      return { q, tw, w: tw + 4 + lw, lx: 0 };
    });
    let prev = ax0 - 6;
    for (const it of items) {
      it.lx = Math.max(prev, it.q.x - it.w / 2);
      prev = it.lx + it.w + 10;
    }
    let lim = ax1 + 6;
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      if (it.lx + it.w > lim) it.lx = lim - it.w;
      lim = it.lx - 10;
    }
    if (items.length && items[0].lx < ax0 - 30) warn('timeline labels do not fit on one side');
    const base = side === 0 ? y + 15 : y + h - 5;
    for (const it of items) {
      const rc = REGION[it.q.e.region].col;
      const ly = side === 0 ? base + 3 : base - 13;
      const cx = Math.max(it.lx + 4, Math.min(it.lx + it.w - 4, it.q.x));
      c.line(it.q.x, ay, cx, ly, 0.9, rc);
      drawText(c, F.black, it.q.e.t, it.lx, base, size, rc);
      drawText(c, F.black, it.q.e.label, it.lx + it.tw + 4, base, size, COL.ink);
    }
  }
  // markers sit at their true times; ones that would touch are nudged apart, with a tick at the true time
  const mx = ev.map((q) => q.x);
  for (let i = 1; i < mx.length; i++) if (mx[i] < mx[i - 1] + 15) mx[i] = mx[i - 1] + 15;
  ev.forEach((q, i) => {
    const rc = REGION[q.e.region].col;
    if (mx[i] !== q.x) c.rect(q.x - 0.8, ay - 9, 1.6, 18, rc);
    if (q.e.story) {
      c.circle(mx[i], ay, 7.6, COL.panel);
      numDot(c, mx[i], ay, 6.6, q.e.story, rc);
    } else c.circle(mx[i], ay, 3.6, rc);
  });
}

export function figures(c: Canvas, ct: Content, y: number, h: number) {
  const n = ct.figures.length;
  const bw = CW / n;
  c.hline(M, W - M, y + h, 0.8, COL.rule);
  ct.figures.forEach((f, i) => {
    const x = M + i * bw;
    if (i > 0) c.rect(x - 0.4, y + 4, 0.8, h - 8, COL.rule);
    const ns = fitOne(F.display, f.n, 40, 28, bw - 16, 'figure', 0, 0.6);
    drawText(c, F.display, f.n, x + 9, y + 33, ns, COL.red, { bold: 0.6 });
    c.rect(x + 9, y + 38, 3, 26, REGION[f.region].col);
    const cl = fitLines(F.bold, f.cap, 13, 13, bw - 22, 2, 'figure caption');
    cl.lines.forEach((l, k) => drawText(c, F.bold, l, x + 16, y + 49 + k * 13.6, 13, COL.ink));
  });
}

export function regionBar(c: Canvas, all: Story[], y: number, h: number) {
  const counts = REGION_ORDER.map((r) => ({ r, n: all.filter((s) => s.region === r).length })).filter((q) => q.n > 0);
  const gaps = (counts.length - 1) * 2;
  const minW = 76;
  const total = all.length;
  let widths = counts.map((q) => (CW - gaps) * (q.n / total));
  const short = widths.reduce((a, w) => a + Math.max(0, minW - w), 0);
  const spare = widths.reduce((a, w) => a + Math.max(0, w - minW), 0);
  widths = widths.map((w) => (w < minW ? minW : w - (short * (w - minW)) / spare));
  let x = M;
  counts.forEach((q, i) => {
    const w = widths[i];
    c.rect(x, y, w, h, REGION[q.r].col);
    const t = `${REGION[q.r].name.toUpperCase()} ${q.n}`;
    const s = fitOne(F.black, t, 8.2, 7, w - 6, 'region bar', 0.5);
    drawText(c, F.black, t, x + w / 2, y + 9.2, s, WHITE, { align: 'center', tracking: 0.5 });
    x += w + 2;
  });
}

// ---------------------------------------------------------------------------------------------------------
export function callout(c: Canvas, x: number, y: number, co: Callout) {
  const size = 10.5;
  const bw = measure(F.black, co.text, size, 0.3) + 10;
  const bh = 16;
  const bx = x + co.x, by = y + co.y;
  const px = x + co.px, py = y + co.py;
  let lx: number, ly: number;
  if (py < by) [lx, ly] = [Math.max(bx + 3, Math.min(bx + bw - 3, px)), by];
  else if (py > by + bh) [lx, ly] = [Math.max(bx + 3, Math.min(bx + bw - 3, px)), by + bh];
  else [lx, ly] = [px < bx ? bx : bx + bw, by + bh / 2];
  c.line(lx, ly, px, py, 1.6, WHITE);
  c.line(lx, ly, px, py, 0.9, COL.red);
  c.circle(px, py, 3.4, WHITE);
  c.circle(px, py, 2.2, COL.red);
  c.rect(bx, by, bw, bh, COL.red);
  drawText(c, F.black, co.text, bx + 5, by + 12, size, WHITE, { tracking: 0.3 });
}

function hero(c: Canvas, s: Story, n: number, x: number, y: number, w: number) {
  const ah = 128;
  c.clip(x, y, x + w, y + ah);
  heroScene(c, x, y, w, ah, s);
  for (const co of s.callouts ?? []) callout(c, x, y, co);
  // red banner flush top-left, fact chip under it
  const banner = s.banner ?? s.place;
  const bs = fitOne(F.black, banner, 19.5, 15, w - 24, 'hero banner', 0.3);
  const bw = measure(F.black, banner, bs, 0.3) + 20;
  c.rect(x, y, bw, 33, COL.red);
  drawText(c, F.black, banner, x + 10, y + 24, bs, WHITE, { tracking: 0.3 });
  if (s.chip) {
    const cs = fitOne(F.black, s.chip, 11.5, 9.5, w - 20, 'hero chip');
    const cw = measure(F.black, s.chip, cs) + 14;
    c.rect(x, y + 33, cw, 19, [252, 250, 244]);
    drawText(c, F.black, s.chip, x + 7, y + 46.5, cs, COL.ink);
  }
  // black caption bar: what the drawing shows, and the source
  const barH = 17;
  c.rect(x, y + ah - barH, w, barH, [18, 17, 15]);
  const srcS = fitOne(F.bold, s.src, 7.6, 6.8, w * 0.45, 'hero source');
  const srcW = measure(F.bold, s.src, srcS);
  drawText(c, F.bold, s.src, x + w - 6, y + ah - 5.5, srcS, [190, 184, 170], { align: 'right' });
  const cap = s.caption ?? '';
  const capS = fitOne(F.bold, cap, 9.6, 8.2, w - srcW - 20, 'hero caption');
  drawText(c, F.bold, cap, x + 6, y + ah - 5.2, capS, WHITE);
  c.noClip();
  // text block
  const kb = y + ah + 15;
  kicker(c, s, n, x, kb, w, 9.2, 7.4);
  const hl = fitLines(F.serif, s.head, 30, 21, w - 1, 2, 'hero headline', 0, 1);
  let base = kb + hl.size + 2;
  hl.lines.forEach((l, i) => drawText(c, F.serif, l, x, base + i * hl.size * 1.02, hl.size, COL.ink, { bold: 1 }));
  base += (hl.lines.length - 1) * hl.size * 1.02 + 15.5;
  const sm = fitLines(F.reg, s.sum ?? '', 10.8, 10.8, w, 2, 'hero summary');
  sm.lines.forEach((l, i) => drawText(c, F.reg, l, x, base + i * 12.6, 10.8, COL.soft));
}

function tile(c: Canvas, s: Story, n: number, x: number, y: number, w: number) {
  const ah = 64;
  c.clip(x, y, x + w, y + ah);
  tileScene(c, x, y, w, ah, s);
  c.noClip();
  const kb = y + ah + 12;
  kicker(c, s, n, x, kb, w, 7.8, 6.4);
  const hl = fitLines(F.serif, s.head, 20, 15, w - 1, 2, 'tile headline', 0, 0.8);
  const base = kb + hl.size + 3;
  hl.lines.forEach((l, i) => drawText(c, F.serif, l, x, base + i * hl.size * 1.02, hl.size, COL.ink, { bold: 0.8 }));
  const sb = kb + 20 + 3 + 20 * 1.02 + 13.5;
  const sm = s.sum ?? '';
  const ss = fitOne(F.reg, sm, 9.6, 9, w, 'tile summary');
  drawText(c, F.reg, sm, x, sb, ss, COL.soft);
}

// ---------------------------------------------------------------------------------------------------------
let LAND: number[][] | null = null;
function land(): number[][] {
  if (LAND) return LAND;
  const b = readFileSync(new URL('../assets/land110.bin', import.meta.url));
  const n = b.readUInt16LE(0);
  let o = 2;
  const rings: number[][] = [];
  for (let i = 0; i < n; i++) {
    const k = b.readUInt16LE(o);
    o += 2;
    const r: number[] = [];
    for (let j = 0; j < k; j++) {
      r.push(b.readInt16LE(o) / 100, b.readInt16LE(o + 2) / 100);
      o += 4;
    }
    rings.push(r);
  }
  LAND = rings;
  return rings;
}

type Proj = (lon: number, lat: number) => [number, number];

function drawLand(c: Canvas, P: Proj, coast: number) {
  const polys = land().map((r) => {
    const out: number[] = [];
    for (let i = 0; i < r.length; i += 2) {
      const [px, py] = P(r[i], r[i + 1]);
      out.push(px, py);
    }
    return out;
  });
  c.fill(polys, COL.land, { union: true });
  for (const p of polys) c.stroke(p, coast, COL.coast, 0.8, true);
}

function frame(c: Canvas, x: number, y: number, w: number, h: number, t: number, col: RGB) {
  c.fill([[x, y, x + w, y, x + w, y + h, x, y + h], [x + t, y + t, x + t, y + h - t, x + w - t, y + h - t, x + w - t, y + t]], col);
}

export function map(c: Canvas, all: Story[], x: number, y: number, w: number, h: number) {
  drawText(c, F.black, 'WHERE IT HAPPENED', x, y + 9, 9.2, COL.ink, { tracking: 1 });
  const top = y + 13;
  const mh = h - 13 - 11;
  const lon0 = -20, lon1 = 180, lat0 = 64, lat1 = -47;
  const P: Proj = (lon, lat) => [x + ((lon - lon0) * w) / (lon1 - lon0), top + ((lat0 - lat) * mh) / (lat0 - lat1)];
  c.rect(x, top, w, mh, COL.water);
  c.clip(x, top, x + w, top + mh);
  drawLand(c, P, 0.7);
  const pins = all.map((s, i) => ({ s, n: i + 1, r: i < 3 ? 7.4 : i < 13 ? 6.2 : 5.2 }));
  const off = (s: Story) => s.lon < lon0 || s.lon > lon1;
  const isEu = (s: Story) => s.lon >= -12 && s.lon <= 32 && s.lat >= 43 && s.lat <= 62;
  const eu = pins.filter((p) => isEu(p.s)).sort((a, b) => a.s.lon - b.s.lon);
  const away = pins.filter((p) => off(p.s));
  const rest = pins.filter((p) => !isEu(p.s) && !off(p.s));
  if (eu.length) {
    const gap = 13;
    const [cx] = P(10, 0);
    const rowY = top + 9;
    let start = cx - ((eu.length - 1) * gap) / 2;
    start = Math.max(x + 9, Math.min(start, x + w - 9 - (eu.length - 1) * gap));
    eu.forEach((p, i) => {
      const [tx, ty] = P(p.s.lon, p.s.lat);
      c.line(start + i * gap, rowY, tx, ty, 0.8, COL.ink);
      c.circle(tx, ty, 1.8, COL.ink);
    });
    eu.forEach((p, i) => {
      c.circle(start + i * gap, rowY, p.r * 0.86 + 1, WHITE);
      numDot(c, start + i * gap, rowY, p.r * 0.86, p.n, REGION[p.s.region].col);
    });
  }
  for (const p of [...rest].reverse()) {
    const [px, py] = P(p.s.lon, p.s.lat);
    c.circle(px, py, p.r + 1, WHITE);
    numDot(c, px, py, p.r, p.n, REGION[p.s.region].col);
  }
  // inset for the stories off the main map (the Americas)
  if (away.length) {
    const iw = 78, ih = 74;
    const ix = x + 3, iy = top + mh - ih - 3;
    c.rect(ix - 1.5, iy - 1.5, iw + 3, ih + 3, WHITE);
    c.rect(ix, iy, iw, ih, COL.water);
    const ilon0 = -170, ilon1 = -30, ilat0 = 72, ilat1 = -56;
    const Q: Proj = (lon, lat) => [ix + ((lon - ilon0) * iw) / (ilon1 - ilon0), iy + ((ilat0 - lat) * ih) / (ilat0 - ilat1)];
    c.clip(ix, iy, ix + iw, iy + ih);
    drawLand(c, Q, 0.5);
    for (const p of [...away].reverse()) {
      const [px, py] = Q(p.s.lon, p.s.lat);
      c.circle(px, py, p.r * 0.86 + 1, WHITE);
      numDot(c, px, py, p.r * 0.86, p.n, REGION[p.s.region].col);
    }
    c.clip(x, top, x + w, top + mh);
    frame(c, ix, iy, iw, ih, 0.8, COL.soft);
    c.rect(ix, iy, 46, 10, COL.ink);
    drawText(c, F.black, 'AMERICAS', ix + 3, iy + 7.6, 6.6, WHITE, { tracking: 0.4 });
  }
  c.noClip();
  frame(c, x, top, w, mh, 0.8, COL.soft);
  drawText(c, F.reg, 'Pin numbers match the stories · Europe in the top row · Americas in the inset', x, top + mh + 9.5, 7.6, COL.muted);
}

function briefs(c: Canvas, list: Story[], first: number, x0: number, y0: number, x1: number, y1: number) {
  drawText(c, F.black, `ALSO TODAY · ${list.length} MORE STORIES`, x0, y0 + 9, 9.2, COL.ink, { tracking: 1 });
  const cols = 3;
  const gap = 12;
  const colW = (x1 - x0 - gap * (cols - 1)) / cols;
  const rows = Math.ceil(list.length / cols);
  const top = y0 + 13;
  const pitch = (y1 - top) / rows;
  const size = 12;
  list.forEach((s, i) => {
    const col = Math.floor(i / rows);
    const row = i % rows;
    const x = x0 + col * (colW + gap);
    const base = top + row * pitch + pitch * 0.5 + 4.2;
    if (row > 0) c.hline(x, x + colW, top + row * pitch, 0.5, COL.rule);
    const rc = REGION[s.region].col;
    drawText(c, F.black, String(first + i), x + 16, base, size, rc, { align: 'right' });
    let tx = x + 20;
    tx += drawText(c, F.black, s.place, tx, base, size, COL.ink) + 4;
    const bx = x + colW - 11;
    const room = bx - 3 - tx;
    const hs = fitOne(F.reg, s.head, size, size, room, 'brief');
    drawText(c, F.reg, s.head, tx, base, hs, COL.ink);
    c.roundRect(bx, base - 9.4, 11, 11, 1.5, BADGE[s.badge].col);
    drawText(c, F.black, BADGE[s.badge].name[0], bx + 5.5, base - 0.6, 8.4, WHITE, { align: 'center' });
  });
}

export function dateCheck(c: Canvas, ct: Content, y: number, h: number) {
  const x = M;
  frame(c, x, y, CW, h, 1.8, COL.red);
  drawText(c, F.black, 'DATE CHECK', x + 10, y + 19, 11.5, COL.red, { tracking: 0.8 });
  drawText(c, F.bold, 'times in UTC', x + 10, y + 34, 11, COL.muted);
  const size = 11;
  const lh = 13;
  const kx = x + 112;
  const right = x + CW - 10;
  const lk = 'Left out (other day):';
  const lkw = measure(F.black, lk, size) + 5;
  const lines = fitLines(F.reg, ct.leftOut, size, size, right - kx - lkw, 2, 'date check');
  let base = y + 15;
  drawText(c, F.black, lk, kx, base, size, COL.ink);
  lines.lines.forEach((l, i) => drawText(c, F.reg, l, kx + lkw, base + i * lh, size, COL.ink));
  base += lines.lines.length * lh;
  let tx = kx;
  for (const [k, v] of [['Not yet (future):', ct.notYet], ['Updated:', ct.corrections]]) {
    tx += drawText(c, F.black, k, tx, base, size, COL.ink) + 5;
    tx += drawText(c, F.reg, v, tx, base, size, COL.ink) + 18;
  }
  if (tx - 18 > right) warn('date check last line overflows');
}

export function legend(c: Canvas, ct: Content, y: number) {
  const base = y + 15;
  let x = M;
  x += drawText(c, F.black, 'HOW SURE', x, base, 11, COL.ink, { tracking: 0.8 }) + 10;
  for (const k of ['C', 'O', 'R', 'K'] as Badge[]) {
    x += badge(c, x, base, k, 8.6, 'left') + 5;
    x += drawText(c, F.reg, BADGE[k].means, x, base, 11, COL.soft) + 14;
  }
  if (x - 14 > W - M) warn('legend overflows');
  c.hline(M, W - M, base + 5, 0.6, COL.rule);
  const fb = base + 16;
  const note = 'Original drawings · DM Serif & Lato (OFL) · map: Natural Earth';
  const nw = measure(F.reg, note, 7.6);
  drawText(c, F.reg, note, W - M, fb, 7.6, COL.muted, { align: 'right' });
  const line = `${ct.method} Sources: ${ct.outlets}`;
  const fs = fitOne(F.reg, line, 8, 7, CW - nw - 12, 'footer');
  drawText(c, F.reg, line, M, fb, fs, COL.muted);
}

export { mix };
