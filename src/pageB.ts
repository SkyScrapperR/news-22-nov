// Variant B of the front page: the same stories, laid out cleaner. Evenly spaced timeline columns, heroes with
// one callout and a source badge, light tiles with the figure inside the art, a two-column "Also on Sunday".

import { Canvas, mix } from './raster.ts';
import type { RGB } from './raster.ts';
import { drawText, measure, fitLines, fitOne, warn } from './text.ts';
import { WHITE, icon } from './art.ts';
import { heroScene } from './scenes.ts';
import { F, COL, REGION, REGION_ORDER, BADGE } from './style.ts';
import type { Content, Story } from './types.ts';
import { numDot, regionBar, callout, map, dateCheck, legend } from './page.ts';

const W = 1024;
const H = 1024;
const M = 14;
const CW = W - 2 * M;

// a badge that carries its source: "OFFICIAL · IRAN STATE TV"
export function sourceBadge(s: Story): string {
  const parts = s.src.split(' · ');
  const keep = s.badge === 'C' ? parts.slice(0, 2) : parts.slice(0, 1);
  return `${BADGE[s.badge].name} · ${keep.join(' · ').toUpperCase()}`;
}

export function pill(c: Canvas, t: string, x: number, base: number, size: number, col: RGB, align: 'left' | 'right' = 'right'): number {
  const w = measure(F.black, t, size, 0.4) + size * 1.1;
  const bx = align === 'right' ? x - w : x;
  c.roundRect(bx, base - size * 1.1, w, size * 1.5, 2, col);
  drawText(c, F.black, t, bx + size * 0.55, base, size, WHITE, { tracking: 0.4 });
  return w;
}

export function kickerLine(c: Canvas, s: Story, n: number, x: number, base: number, room: number, size: number) {
  const rc = REGION[s.region].col;
  const r = size * 0.74;
  numDot(c, x + r, base - size * 0.36, r, n, rc);
  const t = `${s.place} · ${s.cat}`;
  const sz = fitOne(F.black, t, size, size - 1.4, room - 2 * r - 5, 'B kicker', 0.4);
  drawText(c, F.black, t, x + 2 * r + 5, base, sz, rc, { tracking: 0.4 });
}

export function renderPageB(ct: Content): Canvas {
  const c = new Canvas(W, H, COL.paper);
  const all = [...ct.heroes, ...ct.tiles, ...ct.briefs];
  headB(c, ct, all);

  // 3. the day in UTC: seven even columns
  timelineB(c, ct, 130, 50);

  // 4. region strip with counts
  regionBar(c, all, 186, 13);
  heroesAndRest(c, ct, all);
  return c;
}

// the top line (count, regions, fields, day), the masthead with its red date stamp, and the subtitle
export function headB(c: Canvas, ct: Content, all: Story[]) {
  // 1. top line: the count, the regions, the fields, the day
  c.rect(0, 0, W, 21, COL.ink);
  const regions = new Set(all.map((s) => s.region)).size;
  drawText(c, F.black, 'ALL TIMES UTC · RANKED BY CONSEQUENCE', M, 14.5, 9.5, COL.paper, { tracking: 1.2 });
  const right = `${all.length} STORIES · ${regions} REGIONS · ${ct.fields ?? 0} FIELDS · ALL FROM SUNDAY 22 NOV (UTC)`;
  const rs = fitOne(F.black, right, 9.5, 8.4, CW - 330, 'B top line', 1.2);
  drawText(c, F.black, right, W - M, 14.5, rs, COL.orange, { tracking: 1.2, align: 'right' });

  // 2. masthead and the red date stamp
  const sw = 80;
  const sx = W - M - sw;
  const room = sx - 12 - M;
  const mx = M + room / 2;
  const mh = fitOne(F.display, ct.masthead, 80, 56, room, 'B masthead', 0, 1.1);
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    drawText(c, F.display, ct.masthead, mx + Math.cos(a) * 3, 84 + Math.sin(a) * 3, mh, COL.paper, { align: 'center', bold: 1.1, gamma: 1 });
  }
  drawText(c, F.display, ct.masthead, mx, 84, mh, COL.ink, { align: 'center', bold: 1.1 });
  c.rect(sx, 26, sw, 70, COL.red);
  c.fill([[sx + 3, 29, sx + sw - 3, 29, sx + sw - 3, 93, sx + 3, 93], [sx + 4, 30, sx + 4, 92, sx + sw - 4, 92, sx + sw - 4, 30]], [244, 200, 190]);
  drawText(c, F.black, ct.stamp[0], sx + sw / 2, 44, 12.5, WHITE, { align: 'center', tracking: 2 });
  drawText(c, F.display, ct.stamp[1], sx + sw / 2, 76, 36, WHITE, { align: 'center', bold: 0.6 });
  drawText(c, F.black, ct.stamp[2], sx + sw / 2, 89, 10.5, WHITE, { align: 'center', tracking: 2 });
  c.hline(M, W - M, 100, 2.4, COL.ink);
  c.hline(M, W - M, 104.5, 0.8, COL.ink);
  const sub = ct.subtitle.join('  ·  ');
  const ss = fitOne(F.serif, sub, 16, 13.5, CW, 'B subtitle');
  drawText(c, F.serif, sub, W / 2, 122, ss, COL.ink, { align: 'center', slant: 0.16 });
}

function heroesAndRest(c: Canvas, ct: Content, all: Story[]) {
  // 5. heroes
  const hw = (CW - 2 * 12) / 3;
  ct.heroes.forEach((s, i) => heroB(c, s, i + 1, M + i * (hw + 12), 206, hw));

  // 6. tiles on light panels
  const tileTop = 446;
  c.hline(M, W - M, tileTop - 5, 1.2, COL.ink);
  const tw = (CW - 4 * 12) / 5;
  ct.tiles.forEach((s, i) => tileB(c, s, 4 + i, M + (i % 5) * (tw + 12), tileTop + Math.floor(i / 5) * 140, tw));

  // 7. map with its legend, and Also on Sunday
  const top = tileTop + 140 + 142;
  c.hline(M, W - M, top - 3, 1.6, COL.ink);
  const checkTop = 932;
  const mapW = 336;
  const mapH = checkTop - 6 - top - 2 - 34;
  map(c, all, M, top + 2, mapW, mapH);
  mapLegend(c, all, M + 2, top + 2 + mapH + 4, mapW - 4);
  alsoB(c, ct.briefs, 4 + ct.tiles.length, M + mapW + 16, top + 2, W - M, checkTop - 6);

  // 8. date check, how sure, method
  dateCheck(c, ct, checkTop, 46);
  legend(c, ct, checkTop + 46);
}

export function timelineB(c: Canvas, ct: Content, y: number, h: number) {
  c.rect(M, y, CW, h, COL.panel);
  const lw = 74;
  c.rect(M, y, lw, h, COL.ink);
  drawText(c, F.black, 'THE DAY', M + lw / 2, y + 21, 11, COL.paper, { align: 'center', tracking: 0.8 });
  drawText(c, F.black, 'IN UTC', M + lw / 2, y + 36, 11, COL.orange, { align: 'center', tracking: 0.8 });
  const n = ct.timeline.length;
  const x0 = M + lw;
  const colW = (CW - lw) / n;
  // a thin day axis under the columns, each event ticked at its true time
  const ay = y + h - 4;
  c.hline(x0 + 8, W - M - 8, ay, 1, COL.rule);
  ct.timeline.forEach((e, i) => {
    const x = x0 + i * colW;
    if (i > 0) c.rect(x - 0.4, y + 6, 0.8, h - 14, COL.rule);
    const rc = REGION[e.region].col;
    const [hh, mm] = e.t.replace('≈', '').split(':').map(Number);
    const tx = x0 + 8 + ((W - M - 16 - x0) * (hh + mm / 60)) / 24;
    c.rect(tx - 0.8, ay - 3, 1.6, 6, rc);
    if (e.story) numDot(c, x + 16, y + 15, 8, e.story, rc);
    const ts = fitOne(F.display, e.t, 23, 18, colW - 34, 'B time', 0, 0.5);
    drawText(c, F.display, e.t, x + 28, y + 23, ts, COL.red, { bold: 0.5 });
    const label = e.short ?? e.label;
    const ls = fitOne(F.black, label, 12, 10.5, colW - 14, 'B time label');
    drawText(c, F.black, label, x + 8, y + 39.5, ls, COL.ink);
  });
}

function heroB(c: Canvas, s: Story, n: number, x: number, y: number, w: number) {
  const ah = 132;
  c.clip(x, y, x + w, y + ah);
  heroScene(c, x, y, w, ah, s);
  const co = s.callouts?.[0];
  if (co) callout(c, x, y + 4, { ...co, py: co.py - 4 });
  const banner = s.banner ?? s.place;
  const bs = fitOne(F.black, banner, 19.5, 15, w - 24, 'B hero banner', 0.3);
  const bw = measure(F.black, banner, bs, 0.3) + 20;
  c.rect(x, y, bw, 33, COL.red);
  drawText(c, F.black, banner, x + 10, y + 24, bs, WHITE, { tracking: 0.3 });
  if (s.chip) {
    const cs = fitOne(F.black, s.chip, 12, 10, w - 20, 'B hero chip');
    const cw = measure(F.black, s.chip, cs) + 14;
    c.rect(x, y + 33, cw, 20, [252, 250, 244]);
    drawText(c, F.black, s.chip, x + 7, y + 47.5, cs, COL.ink);
  }
  c.noClip();
  const kb = y + ah + 16;
  const bt = sourceBadge(s);
  const bsz = fitOne(F.black, bt, 8.6, 7.6, w * 0.58, 'B hero badge', 0.4);
  const pw = pill(c, bt, x + w, kb, bsz, BADGE[s.badge].col);
  kickerLine(c, s, n, x, kb, w - pw - 6, 9.6);
  const hl = fitLines(F.serif, s.head, 26, 20, w - 1, 2, 'B hero headline', 0, 1);
  let base = kb + hl.size + 3;
  hl.lines.forEach((l, i) => drawText(c, F.serif, l, x, base + i * hl.size * 1.04, hl.size, COL.ink, { bold: 1 }));
  base += (hl.lines.length - 1) * hl.size * 1.04 + 16;
  const sm = fitLines(F.reg, s.sum ?? '', 11.2, 10.6, w, 2, 'B hero summary');
  sm.lines.forEach((l, i) => drawText(c, F.reg, l, x, base + i * 13.4, sm.size, COL.soft));
}

function tileB(c: Canvas, s: Story, n: number, x: number, y: number, w: number) {
  const ah = 58;
  const rc = REGION[s.region].col;
  const bg = mix(rc, COL.paper, 0.86);
  c.rect(x, y, w, ah, bg);
  c.rect(x, y, 3, ah, rc);
  // small icon, right
  const ix = x + w - 27, iy = y + ah / 2 + 5;
  c.circle(ix, iy, 19, mix(rc, COL.paper, 0.72));
  icon(c, s.art, ix, iy, 32, mix(rc, COL.ink, 0.45), COL.red, mix(rc, COL.paper, 0.72));
  // corner badge
  pill(c, BADGE[s.badge].name, x + w - 3, y + 11, 6.8, BADGE[s.badge].col);
  // the key figure, inside the art
  const fact = s.fact ?? '';
  const unit = s.unit ?? '';
  const fs = fitOne(F.display, fact, 34, 18, w - 64 - 12, 'B tile figure', 0, 0.6);
  const fw = drawText(c, F.display, fact, x + 10, y + 42, fs, mix(rc, COL.ink, 0.25), { bold: 0.6 });
  if (unit) {
    const us = fitOne(F.black, unit, 9.5, 7.6, w - 64 - 14 - fw - 6, 'B tile unit', 0.4);
    drawText(c, F.black, unit, x + 10 + fw + 5, y + 42, us, COL.ink, { tracking: 0.4 });
  }
  // text
  const kb = y + ah + 13;
  kickerLine(c, s, n, x, kb, w, 8.4);
  const hl = fitLines(F.serif, s.head, 17, 14.5, w - 1, 2, 'B tile headline', 0, 0.7);
  hl.lines.forEach((l, i) => drawText(c, F.serif, l, x, kb + 18 + i * hl.size * 1.04, hl.size, COL.ink, { bold: 0.7 }));
  const sb = kb + 18 + 17 * 1.04 + 15;
  const sm = s.sum ?? '';
  drawText(c, F.reg, sm, x, sb, fitOne(F.reg, sm, 10, 9.4, w, 'B tile summary'), COL.soft);
  const src = `Source: ${s.src}`;
  drawText(c, F.bold, src, x, sb + 12.5, fitOne(F.bold, src, 9, 8, w, 'B tile source'), COL.ink);
}

export function mapLegend(c: Canvas, all: Story[], x: number, y: number, w: number) {
  const counts = REGION_ORDER.map((r) => ({ r, n: all.filter((s) => s.region === r).length })).filter((q) => q.n > 0);
  const per = Math.ceil(counts.length / 3);
  const cw = w / per;
    counts.forEach((q, i) => {
    const cx = x + (i % per) * cw;
    const base = y + 8 + Math.floor(i / per) * 11;
    c.circle(cx + 3.5, base - 3, 3.5, REGION[q.r].col);
    drawText(c, F.bold, `${REGION[q.r].name} ${q.n}`, cx + 10, base, 8.4, COL.ink);
  });
}

export function alsoB(c: Canvas, list: Story[], first: number, x0: number, y0: number, x1: number, y1: number) {
  drawText(c, F.black, `ALSO ON SUNDAY · ${list.length} MORE STORIES`, x0, y0 + 10, 10, COL.ink, { tracking: 1 });
  const cols = 2;
  const gap = 18;
  const colW = (x1 - x0 - gap) / cols;
  const rows = Math.ceil(list.length / cols);
  const top = y0 + 15;
  const pitch = (y1 - top) / rows;
  const size = 12.8;
  list.forEach((s, i) => {
    const col = Math.floor(i / rows);
    const row = i % rows;
    const x = x0 + col * (colW + gap);
    const base = top + row * pitch + pitch * 0.5 + 4.4;
    if (row > 0) c.hline(x, x + colW, top + row * pitch, 0.5, COL.rule);
    const rc = REGION[s.region].col;
    const r = 7.6;
    numDot(c, x + r, base - 4.4, r, first + i, rc);
    let tx = x + 2 * r + 6;
    tx += drawText(c, F.black, `${s.place}:`, tx, base, size, COL.ink) + 5;
    const bx = x + colW - 13;
    const hs = fitOne(F.reg, s.head, size, size, bx - 4 - tx, 'B also');
    drawText(c, F.reg, s.head, tx, base, hs, COL.ink);
    c.roundRect(bx, base - 10, 12.5, 12.5, 2, BADGE[s.badge].col);
    drawText(c, F.black, BADGE[s.badge].name[0], bx + 6.25, base - 0.6, 9.2, WHITE, { align: 'center' });
  });
  if (rows * 15 > y1 - top) warn('also list too tight');
}
