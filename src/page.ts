// The front page: 1024 x 1024, laid out top to bottom.

import { readFileSync } from 'node:fs';
import { Canvas } from './raster.ts';
import type { RGB } from './raster.ts';
import { drawText, measure, fitLines, fitOne } from './text.ts';
import { WHITE } from './art.ts';
import { heroScene, tileScene } from './scenes.ts';
import { F, COL, REGION, REGION_ORDER, BADGE } from './style.ts';
import type { Content, Story, Badge } from './types.ts';

const W = 1024;
const H = 1024;
const M = 14; // outer margin
const CW = W - 2 * M; // content width 996

function badge(c: Canvas, x: number, base: number, b: Badge, size: number, align: 'left' | 'right' = 'right'): number {
  const t = BADGE[b].name;
  const tw = measure(F.black, t, size, 0.4);
  const bw = tw + size * 0.9;
  const bh = size * 1.45;
  const bx = align === 'right' ? x - bw : x;
  c.roundRect(bx, base - size * 1.08, bw, bh, 2, BADGE[b].col);
  drawText(c, F.black, t, bx + size * 0.45, base, size, WHITE, { tracking: 0.4 });
  return bw;
}

function numDot(c: Canvas, cx: number, cy: number, r: number, n: number, col: RGB) {
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
  drawText(c, F.black, 'THE WORLD IN ONE DAY', M, 14.5, 9.5, COL.paper, { tracking: 1.2 });
  const right = `${all.length} STORIES · ${regions} REGIONS · EVERY ONE DATED ${ct.dayLine}`;
  drawText(c, F.black, right, W - M, 14.5, 9.5, COL.orange, { tracking: 1.2, align: 'right' });

  // 3. rules, then 2. masthead over a paper halo
  c.hline(M, W - M, 106, 2.4, COL.ink);
  c.hline(M, W - M, 110.5, 0.8, COL.ink);
  const mh = fitOne(F.display, ct.masthead, 92, 70, 992, 'masthead', 0, 1.1);
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    drawText(c, F.display, ct.masthead, W / 2 + Math.cos(a) * 3.2, 94 + Math.sin(a) * 3.2, mh, COL.paper, { align: 'center', bold: 1.1, gamma: 1 });
  }
  drawText(c, F.display, ct.masthead, W / 2, 94, mh, COL.ink, { align: 'center', bold: 1.1 });

  // 4. subtitle
  const sub = ct.subtitle.join('  ·  ');
  const ss = fitOne(F.serif, sub, 16.5, 14, CW, 'subtitle');
  drawText(c, F.serif, sub, W / 2, 129, ss, COL.ink, { align: 'center', slant: 0.16 });

  // 5. the day in UTC
  timeline(c, ct, 137, 40);

  // 6. numbers strip
  figures(c, ct, 182, 44);

  // 7. region bar
  regionBar(c, all, 231, 14);

  // 8. heroes
  const heroTop = 252;
  const hw = (CW - 2 * 12) / 3;
  ct.heroes.forEach((s, i) => hero(c, s, i + 1, M + i * (hw + 12), heroTop, hw));

  // 9. rule + 10. tiles
  const tileTop = heroTop + 130 + 113;
  c.hline(M, W - M, tileTop - 4, 1.2, COL.ink);
  const tw = (CW - 4 * 12) / 5;
  ct.tiles.forEach((s, i) => {
    const col = i % 5;
    const row = Math.floor(i / 5);
    tile(c, s, 4 + i, M + col * (tw + 12), tileTop + 4 + row * 148, tw);
  });
  const tilesEnd = tileTop + 4 + 2 * 148 - 4;

  // 11. rule, 12. map, 13. briefs
  c.hline(M, W - M, tilesEnd, 1.6, COL.ink);
  const checkTop = H - 74;
  const mapTop = tilesEnd + 6;
  const mapBottom = checkTop - 8;
  map(c, all, M, mapTop, 352, mapBottom - mapTop);
  briefs(c, ct.briefs, 14, M + 352 + 18, mapTop, W - M, mapBottom);

  // 14. date check, 15. legend, 16. footer
  dateCheck(c, ct, checkTop, 42);
  legend(c, ct, checkTop + 42);
  return c;
}

// ---------------------------------------------------------------------------------------------------------
function timeline(c: Canvas, ct: Content, y: number, h: number) {
  c.rect(M, y, CW, h, COL.panel);
  c.rect(M, y, 78, h, COL.ink);
  drawText(c, F.black, 'THE DAY', M + 39, y + 17, 11, COL.paper, { align: 'center', tracking: 0.8 });
  drawText(c, F.black, 'IN UTC', M + 39, y + 31, 11, COL.orange, { align: 'center', tracking: 0.8 });
  const ax0 = 106, ax1 = 998, ay = y + 9;
  c.hline(ax0, ax1, ay, 1.2, COL.soft);
  for (let hr = 0; hr <= 24; hr += 6) {
    const tx = ax0 + ((ax1 - ax0) * hr) / 24;
    c.rect(tx - 0.6, ay - 3.5, 1.2, 7, COL.soft);
    const lab = String(hr).padStart(2, '0');
    const lw = measure(F.bold, lab, 7);
    const lx = hr === 0 ? tx + 3 : hr === 24 ? tx - lw - 3 : tx + 3;
    drawText(c, F.bold, lab, lx, ay - 2.5, 7, COL.muted);
  }
  const n = ct.timeline.length;
  const slot = (ax1 - ax0 + 8) / n;
  ct.timeline.forEach((e, i) => {
    const [hh, mm] = e.t.replace('≈', '').split(':').map(Number);
    const tx = ax0 + ((ax1 - ax0) * (hh + mm / 60)) / 24;
    const sx = ax0 + i * slot;
    const rc = REGION[e.region].col;
    c.stroke([tx, ay, tx, ay + 4, sx + 3, ay + 7], 0.9, rc);
    c.circle(tx, ay, 3.4, rc);
    const tw = drawText(c, F.black, e.t, sx, y + 24.5, 11.5, rc);
    const room = slot - tw - 12;
    const ls = fitOne(F.black, e.label, 11, 9.5, room, 'timeline label');
    drawText(c, F.black, e.label, sx + tw + 4, y + 24.5, ls, COL.ink);
    const ss = fitOne(F.bold, e.sub, 9.6, 8.4, slot - 8, 'timeline sub');
    drawText(c, F.bold, e.sub, sx, y + 36, ss, COL.soft);
  });
}

function figures(c: Canvas, ct: Content, y: number, h: number) {
  const n = ct.figures.length;
  const bw = (CW - (n - 1) * 6) / n;
  ct.figures.forEach((f, i) => {
    const x = M + i * (bw + 6);
    c.rect(x, y, bw, h, COL.box);
    c.rect(x, y, 4, h, REGION[f.region].col);
    const ns = fitOne(F.display, f.n, 30, 22, bw - 16, 'figure', 0, 0.5);
    drawText(c, F.display, f.n, x + 11, y + 27, ns, COL.red, { bold: 0.5 });
    const cs = fitOne(F.bold, f.cap, 8.8, 7.2, bw - 16, 'figure caption');
    drawText(c, F.bold, f.cap, x + 11, y + 39, cs, COL.ink);
  });
}

function regionBar(c: Canvas, all: Story[], y: number, h: number) {
  const counts = REGION_ORDER.map((r) => ({ r, n: all.filter((s) => s.region === r).length })).filter((q) => q.n > 0);
  const gaps = (counts.length - 1) * 2;
  const minW = 76;
  const total = all.length;
  // proportional widths with a floor
  let widths = counts.map((q) => (CW - gaps) * (q.n / total));
  const short = widths.reduce((a, w) => a + Math.max(0, minW - w), 0);
  const spare = widths.reduce((a, w) => a + Math.max(0, w - minW), 0);
  widths = widths.map((w) => (w < minW ? minW : w - (short * (w - minW)) / spare));
  let x = M;
  counts.forEach((q, i) => {
    const w = widths[i];
    c.rect(x, y, w, h, REGION[q.r].col);
    const t = `${REGION[q.r].name.toUpperCase()} ${q.n}`;
    const s = fitOne(F.black, t, 8.4, 7, w - 6, 'region bar', 0.5);
    drawText(c, F.black, t, x + w / 2, y + 10.2, s, WHITE, { align: 'center', tracking: 0.5 });
    x += w + 2;
  });
}

// ---------------------------------------------------------------------------------------------------------
function hero(c: Canvas, s: Story, n: number, x: number, y: number, w: number) {
  const ah = 130;
  c.clip(x, y, x + w, y + ah);
  heroScene(c, x, y, w, ah, s);
  // red banner flush top-left
  const banner = s.banner ?? s.place;
  const bs = fitOne(F.black, banner, 19.5, 15, w - 24, 'hero banner', 0.3);
  const bw = measure(F.black, banner, bs, 0.3) + 20;
  c.rect(x, y, bw, 34, COL.red);
  drawText(c, F.black, banner, x + 10, y + 24.5, bs, WHITE, { tracking: 0.3 });
  // fact chip
  if (s.chip) {
    const cs = fitOne(F.black, s.chip, 11.5, 9.5, w - 20, 'hero chip');
    const cw = measure(F.black, s.chip, cs) + 14;
    c.rect(x, y + 34, cw, 20, [252, 250, 244]);
    drawText(c, F.black, s.chip, x + 7, y + 48, cs, COL.ink);
  }
  // source chip
  const ss = fitOne(F.bold, s.src, 7.8, 6.8, w - 16, 'hero source');
  const sw = measure(F.bold, s.src, ss) + 10;
  c.rect(x, y + ah - 15, sw, 15, COL.ink);
  drawText(c, F.bold, s.src, x + 5, y + ah - 4.5, ss, COL.paper);
  c.noClip();
  // text block
  const kb = y + ah + 16;
  kicker(c, s, n, x, kb, w, 9.2, 7.4);
  const hl = fitLines(F.serif, s.head, 25.5, 19, w - 1, 2, 'hero headline', 0, 0.95);
  let base = kb + hl.size + 4;
  hl.lines.forEach((l, i) => {
    drawText(c, F.serif, l, x, base + i * hl.size * 1.03, hl.size, COL.ink, { bold: 0.95 });
  });
  base += (hl.lines.length - 1) * hl.size * 1.03 + 16.5;
  const sm = fitLines(F.reg, s.sum ?? '', 10.8, 10.8, w, 2, 'hero summary');
  sm.lines.forEach((l, i) => drawText(c, F.reg, l, x, base + i * 12.6, 10.8, COL.soft));
}

function tile(c: Canvas, s: Story, n: number, x: number, y: number, w: number) {
  const ah = 60;
  c.clip(x, y, x + w, y + ah);
  tileScene(c, x, y, w, ah, s);
  c.noClip();
  const kb = y + ah + 13;
  kicker(c, s, n, x, kb, w, 7.8, 6.4);
  const hl = fitLines(F.serif, s.head, 20, 14, w - 1, 2, 'tile headline', 0, 0.75);
  let base = kb + hl.size + 3;
  hl.lines.forEach((l, i) => drawText(c, F.serif, l, x, base + i * hl.size * 1.03, hl.size, COL.ink, { bold: 0.75 }));
  base = kb + 20 + 3 + 20 * 1.03 + 13;
  const sm = s.sum ?? '';
  const ss = fitOne(F.reg, sm, 9.3, 8.6, w, 'tile summary');
  drawText(c, F.reg, sm, x, base, ss, COL.soft);
  const sr = fitOne(F.bold, s.src, 7.6, 6.6, w, 'tile source');
  drawText(c, F.bold, s.src, x, base + 11, sr, COL.muted);
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

function map(c: Canvas, all: Story[], x: number, y: number, w: number, h: number) {
  drawText(c, F.black, 'WHERE IT HAPPENED', x, y + 10, 9.2, COL.ink, { tracking: 1 });
  const top = y + 15;
  const mh = h - 15 - 13;
  const lon0 = -128, lon1 = 180, lat0 = 72, lat1 = -46;
  const sx = w / (lon1 - lon0);
  const sy = mh / (lat0 - lat1);
  const P = (lon: number, lat: number): [number, number] => [x + (lon - lon0) * sx, top + (lat0 - lat) * sy];
  c.rect(x, top, w, mh, COL.water);
  c.clip(x, top, x + w, top + mh);
  const polys = land().map((r) => {
    const out: number[] = [];
    for (let i = 0; i < r.length; i += 2) {
      const [px, py] = P(r[i], r[i + 1]);
      out.push(px, py);
    }
    return out;
  });
  c.fill(polys, COL.land, { union: true });
  for (const p of polys) c.stroke(p, 0.6, COL.coast, 0.8, true);
  // pins: Europe's crowd goes into a callout row along the top
  const pins = all.map((s, i) => ({ s, n: i + 1, r: i < 3 ? 7.2 : i < 13 ? 6 : 5 }));
  const isEu = (s: Story) => s.lon >= -12 && s.lon <= 36 && s.lat >= 43 && s.lat <= 64;
  const eu = pins.filter((p) => isEu(p.s)).sort((a, b) => a.s.lon - b.s.lon);
  const rest = pins.filter((p) => !isEu(p.s));
  if (eu.length) {
    const gap = 12.5;
    const [cx] = P(12, 0);
    const rowY = top + 9;
    let start = cx - ((eu.length - 1) * gap) / 2;
    start = Math.max(x + 9, Math.min(start, x + w - 9 - (eu.length - 1) * gap));
    eu.forEach((p, i) => {
      const [tx, ty] = P(p.s.lon, p.s.lat);
      const bx = start + i * gap;
      c.line(bx, rowY, tx, ty, 0.8, COL.ink);
      c.circle(tx, ty, 1.8, COL.ink);
    });
    eu.forEach((p, i) => {
      const bx = start + i * gap;
      c.circle(bx, rowY, p.r * 0.86 + 1, WHITE);
      numDot(c, bx, rowY, p.r * 0.86, p.n, REGION[p.s.region].col);
    });
  }
  // draw small pins first so heroes sit on top
  for (const p of [...rest].reverse()) {
    const [px, py] = P(p.s.lon, p.s.lat);
    c.circle(px, py, p.r + 1, WHITE);
    numDot(c, px, py, p.r, p.n, REGION[p.s.region].col);
  }
  c.noClip();
  c.fill([[x, top, x + w, top, x + w, top + mh, x, top + mh], [x + 0.8, top + 0.8, x + 0.8, top + mh - 0.8, x + w - 0.8, top + mh - 0.8, x + w - 0.8, top + 0.8]], COL.soft);
  drawText(c, F.reg, 'Numbered pins match the stories · Europe shown in the callout row', x, top + mh + 10, 7.8, COL.muted);
}

function briefs(c: Canvas, list: Story[], first: number, x0: number, y0: number, x1: number, y1: number) {
  drawText(c, F.black, 'ALSO TODAY', x0, y0 + 10, 9.2, COL.ink, { tracking: 1 });
  const colW = (x1 - x0 - 16) / 2;
  const rows = Math.ceil(list.length / 2);
  const top = y0 + 15;
  const pitch = (y1 - top) / rows;
  list.forEach((s, i) => {
    const col = Math.floor(i / rows);
    const row = i % rows;
    const x = x0 + col * (colW + 16);
    const base = top + row * pitch + pitch * 0.5 + 3.2;
    if (row > 0) c.hline(x, x + colW, top + row * pitch, 0.5, COL.rule);
    const rc = REGION[s.region].col;
    const num = String(first + i);
    drawText(c, F.black, num, x + 13, base, 9.2, rc, { align: 'right' });
    let tx = x + 17;
    tx += drawText(c, F.black, s.place, tx, base, 9.2, COL.ink) + 4;
    const src = `(${s.src})`;
    const sw = measure(F.reg, src, 8);
    const bx = x + colW - 9.5;
    const room = bx - 4 - tx - sw - 4;
    const hs = fitOne(F.reg, s.head, 9.2, 7.4, room, 'brief');
    const hw = drawText(c, F.reg, s.head, tx, base, hs, COL.ink);
    drawText(c, F.reg, src, tx + hw + 4, base, 8, COL.muted);
    c.roundRect(bx, base - 8, 9.5, 9.5, 1.5, BADGE[s.badge].col);
    drawText(c, F.black, BADGE[s.badge].name[0], bx + 4.75, base - 0.6, 7.2, WHITE, { align: 'center' });
  });
}

function dateCheck(c: Canvas, ct: Content, y: number, h: number) {
  const x = M;
  c.fill([[x, y, x + CW, y, x + CW, y + h, x, y + h], [x + 1.8, y + 1.8, x + 1.8, y + h - 1.8, x + CW - 1.8, y + h - 1.8, x + CW - 1.8, y + 1.8]], COL.red);
  drawText(c, F.black, 'DATE CHECK', x + 10, y + 18, 9.8, COL.red, { tracking: 0.8 });
  drawText(c, F.bold, 'all times UTC', x + 10, y + 31, 8, COL.muted);
  const kx = x + 112;
  const room = x + CW - 10;
  const rowsOf = (key: string, val: string) => {
    const kw = measure(F.black, key, 8.6) + 5;
    const lines = fitLines(F.reg, val, 8.6, 7.8, room - kx - kw, 2, 'date check');
    return { key, kw, lines };
  };
  const a = rowsOf('Left out (other day):', ct.leftOut);
  const b = rowsOf('Not yet (future):', ct.notYet);
  const total = a.lines.lines.length + b.lines.lines.length;
  const lh = total <= 2 ? 15 : total === 3 ? 11 : 9.4;
  let base = y + (h - (total - 1) * lh) / 2 + 3;
  for (const r of [a, b]) {
    drawText(c, F.black, r.key, kx, base, 8.6, COL.ink);
    r.lines.lines.forEach((l, i) => drawText(c, F.reg, l, kx + r.kw, base + i * lh, r.lines.size, COL.ink));
    base += r.lines.lines.length * lh;
  }
}

function legend(c: Canvas, ct: Content, y: number) {
  const base = y + 13;
  let x = M;
  x += drawText(c, F.black, 'HOW WE CHECKED', x, base, 8, COL.ink, { tracking: 0.6 }) + 8;
  for (const k of ['C', 'O', 'R'] as Badge[]) {
    x += badge(c, x, base, k, 6.6, 'left') + 4;
    x += drawText(c, F.reg, BADGE[k].means, x, base, 8, COL.soft) + 10;
  }
  const cs = fitOne(F.reg, ct.corrections, 8, 7, W - M - x - 4, 'corrections');
  drawText(c, F.reg, ct.corrections, W - M, base, cs, COL.soft, { align: 'right' });
  c.hline(M, W - M, base + 5, 0.6, COL.rule);
  const fb = base + 14.5;
  const note = 'Original drawings · DM Serif & Lato (OFL) · map: Natural Earth';
  const nw = measure(F.reg, note, 7.6);
  drawText(c, F.reg, note, W - M, fb, 7.6, COL.muted, { align: 'right' });
  const fs = fitOne(F.reg, ct.outlets, 7.8, 6.6, CW - nw - 12, 'footer');
  drawText(c, F.reg, ct.outlets, M, fb, fs, COL.muted);
}
