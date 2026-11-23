// Variant E of the front page: the art tells each story. A slim day-in-UTC row, three large hero scenes with one
// red label each, ten tile scenes with the key figure drawn on the art, then the map, the list and the date check.
// Every word and number comes from the content file.

import { Canvas } from './raster.ts';
import { drawText, measure, fitLines, fitOne, warn } from './text.ts';
import { WHITE } from './art.ts';
import { heroScene } from './scenes.ts';
import { tileArtE } from './scenesE.ts';
import { F, COL, REGION, BADGE } from './style.ts';
import type { Content, Story, Badge } from './types.ts';
import { numDot, map, dateCheck } from './page.ts';
import { mapLegend } from './pageB.ts';

const W = 1024;
const M = 14;
const CW = W - 2 * M;
const SHORT: Record<Badge, string> = { C: 'C', O: 'O', R: 'R', K: 'CL' };
const MEANS: Record<Badge, string> = { C: '2+ outlets', O: 'on the record', R: 'one major outlet', K: 'one side, unverified' };

export function renderPageE(ct: Content): Canvas {
  const c = new Canvas(W, W, COL.paper);
  const all = [...ct.heroes, ...ct.tiles, ...ct.briefs];
  const regions = new Set(all.map((s) => s.region)).size;
  const fields = new Set(all.map((s) => s.field ?? '')).size;
  if (all.some((s) => !s.field)) warn('a story has no field');

  // 1. thin top line
  drawText(c, F.black, 'SUNDAY’S WORLD NEWS AT A GLANCE · TIMES IN UTC', M, 15, 10, COL.red, { tracking: 1.1 });
  const right = `${all.length} STORIES · ${regions} REGIONS · ${fields} FIELDS · ALL FROM SUNDAY 22 NOV (UTC)`;
  drawText(c, F.black, right, W - M, 15, fitOne(F.black, right, 10, 9, CW - 360, 'E top line', 1.1), COL.ink, { tracking: 1.1, align: 'right' });

  // 2. masthead and a thin double rule
  const mh = fitOne(F.display, ct.masthead, 70, 54, CW - 20, 'E masthead', 0, 1);
  drawText(c, F.display, ct.masthead, W / 2, 80, mh, COL.ink, { align: 'center', bold: 1 });
  c.hline(M, W - M, 92, 2.4, COL.ink);
  c.hline(M, W - M, 96.5, 0.8, COL.ink);

  // 3. the day in UTC, one slim row
  dayRow(c, ct, 102, 36);

  // 4. heroes
  const heroTop = 148;
  const hw = (CW - 2 * 14) / 3;
  ct.heroes.forEach((s, i) => heroE(c, s, i + 1, M + i * (hw + 14), heroTop, hw));

  // 5. tiles, two rows of five
  const tileTop = 390;
  c.hline(M, W - M, tileTop - 7, 1, COL.ink);
  const tw = (CW - 4 * 12) / 5;
  const pitch = 166;
  ct.tiles.forEach((s, i) => tileE(c, s, ct.heroes.length + 1 + i, M + (i % 5) * (tw + 12), tileTop + Math.floor(i / 5) * pitch, tw));

  // 6. map with legend, and the list
  const top = tileTop + 2 * pitch;
  c.hline(M, W - M, top - 4, 1, COL.ink);
  const checkTop = 956;
  const mapW = 300;
  const mapH = checkTop - 8 - (top + 2) - 36;
  map(c, all, M, top + 2, mapW, mapH);
  mapLegend(c, all, M + 2, top + 2 + mapH + 5, mapW - 4);
  listE(c, ct.briefs, ct.heroes.length + ct.tiles.length + 1, M + mapW + 18, top, W - M, checkTop - 8);

  // 7. date check, then one footer line
  dateCheck(c, ct, checkTop, 46);
  footer(c, ct, checkTop + 46 + 15);
  return c;
}

function dayRow(c: Canvas, ct: Content, y: number, h: number) {
  const lw = 66;
  c.rect(M, y, lw, h, COL.red);
  drawText(c, F.black, 'THE DAY', M + lw / 2, y + 15, 9.6, WHITE, { align: 'center', tracking: 0.6 });
  drawText(c, F.black, 'IN UTC', M + lw / 2, y + 28, 9.6, WHITE, { align: 'center', tracking: 0.6 });
  const n = ct.timeline.length;
  const x0 = M + lw;
  const colW = (CW - lw) / n;
  c.hline(x0, W - M, y + h, 0.8, COL.rule);
  ct.timeline.forEach((e, i) => {
    const cx = x0 + i * colW + colW / 2;
    if (i > 0) c.rect(x0 + i * colW - 0.4, y + 5, 0.8, h - 10, COL.rule);
    drawText(c, F.display, e.t, cx, y + 16, fitOne(F.display, e.t, 17, 14, colW - 10, 'E time', 0, 0.5), COL.red, { align: 'center', bold: 0.5 });
    const label = e.short ?? e.label;
    drawText(c, F.bold, label, cx, y + 31, fitOne(F.bold, label, 11.5, 11, colW - 8, 'E time label'), COL.ink, { align: 'center' });
  });
}

// a badge pill that carries its source; two outlets when they fit, else one
function badgePill(c: Canvas, s: Story, right: number, base: number, room: number): number {
  const parts = s.src.split(' · ');
  let size = 8.6;
  let t = `${BADGE[s.badge].name} · ${parts.slice(0, s.badge === 'C' ? 2 : 1).join(' · ').toUpperCase()}`;
  if (measure(F.black, t, size, 0.4) + size * 1.1 > room) t = `${BADGE[s.badge].name} · ${parts[0].toUpperCase()}`;
  if (measure(F.black, t, size, 0.4) + size * 1.1 > room) size = 7.8;
  const w = measure(F.black, t, size, 0.4) + size * 1.1;
  if (w > room) warn(`E badge: ${t}`);
  c.roundRect(right - w, base - size * 1.1, w, size * 1.5, 2, BADGE[s.badge].col);
  drawText(c, F.black, t, right - w + size * 0.55, base, size, WHITE, { tracking: 0.4 });
  return w;
}

function redLabel(c: Canvas, t: string, x: number, y: number, size: number) {
  const w = measure(F.black, t, size, 0.4) + size * 1.1;
  c.rect(x, y, w, size * 1.7, COL.red);
  drawText(c, F.black, t, x + size * 0.55, y + size * 1.25, size, WHITE, { tracking: 0.4 });
}

function heroE(c: Canvas, s: Story, n: number, x: number, y: number, w: number) {
  const ah = 124;
  c.clip(x, y, x + w, y + ah);
  heroScene(c, x, y, w, ah, s);
  c.clip(x, y, x + w, y + ah);
  if (s.label) redLabel(c, s.label, x + 8, y + 8, 15);
  const place = s.place.split(',')[0];
  const ps = 9.6;
  const pw = measure(F.black, place, ps, 0.6) + 12;
  c.rect(x + 8, y + ah - 22, pw, 15, [18, 17, 15], 0.82);
  drawText(c, F.black, place, x + 14, y + ah - 11, ps, WHITE, { tracking: 0.6 });
  c.noClip();
  const rc = REGION[s.region].col;
  const kb = y + ah + 17;
  const r = 7.4;
  const kick = `${s.place} · ${(s.field ?? s.cat).toUpperCase()}`;
  const bw = badgePill(c, s, x + w, kb, w - measure(F.black, kick, 10, 0.4) - 2 * r - 14);
  numDot(c, x + r, kb - 3.6, r, n, rc);
  drawText(c, F.black, kick, x + 2 * r + 5, kb, fitOne(F.black, kick, 10, 9.4, w - bw - 2 * r - 10, 'E hero kicker', 0.4), rc, { tracking: 0.4 });
  const hl = fitLines(F.serif, s.head, 25, 22, w - 1, 2, 'E hero headline', 0, 1);
  let base = kb + hl.size + 4;
  hl.lines.forEach((l, i) => drawText(c, F.serif, l, x, base + i * hl.size * 1.04, hl.size, COL.ink, { bold: 1 }));
  base += (hl.lines.length - 1) * hl.size * 1.04 + 17;
  const sm = fitLines(F.reg, s.lede ?? s.sum ?? '', 12, 12, w, 2, 'E hero summary');
  sm.lines.forEach((l, i) => drawText(c, F.reg, l, x, base + i * 14.6, 12, COL.soft));
}

function tileE(c: Canvas, s: Story, n: number, x: number, y: number, w: number) {
  const ah = 80;
  tileArtE(c, x, y, w, ah, s);
  // the key figure, drawn on the art, lower right
  const label = s.label ?? s.fact ?? '';
  const sp = label.indexOf(' ');
  const big = sp > 0 ? label.slice(0, sp) : label;
  const small = sp > 0 ? label.slice(sp + 1) : '';
  const bs = 25;
  const ss = 11;
  const bwid = measure(F.display, big, bs) + (small ? measure(F.black, small, ss, 0.5) + 6 : 0) + 14;
  const lx = x + w - bwid - 5, ly = y + ah - 33;
  c.roundRect(lx, ly, bwid, 28, 3, [250, 246, 236], 0.94);
  const fw = drawText(c, F.display, big, lx + 7, ly + 22, bs, COL.ink, { bold: 0.7 });
  if (small) drawText(c, F.black, small, lx + 7 + fw + 6, ly + 21, ss, COL.red, { tracking: 0.5 });
  if (bwid > w - 10) warn(`E tile label: ${label}`);
  // corner badge
  const bn = BADGE[s.badge].name;
  const bsz = 7;
  const bpw = measure(F.black, bn, bsz, 0.4) + bsz * 1.1;
  c.roundRect(x + w - bpw - 4, y + 4, bpw, bsz * 1.6, 2, BADGE[s.badge].col);
  drawText(c, F.black, bn, x + w - bpw - 4 + bsz * 0.55, y + 4 + bsz * 1.2, bsz, WHITE, { tracking: 0.4 });
  // text
  const rc = REGION[s.region].col;
  const kb = y + ah + 15;
  const r = 6.8;
  numDot(c, x + r, kb - 3.4, r, n, rc);
  drawText(c, F.black, s.place, x + 2 * r + 5, kb, fitOne(F.black, s.place, 10, 9.4, w - 2 * r - 6, 'E tile place', 0.4), rc, { tracking: 0.4 });
  const hl = fitLines(F.serif, s.head, 16.5, 15, w - 1, 2, 'E tile headline', 0, 0.7);
  hl.lines.forEach((l, i) => drawText(c, F.serif, l, x, kb + 19 + i * 17.4, hl.size, COL.ink, { bold: 0.7 }));
  const sb = kb + 19 + 17.4 + 16;
  const sm = s.sum ?? '';
  drawText(c, F.reg, sm, x, sb, fitOne(F.reg, sm, 12, 12, w, 'E tile summary'), COL.soft);
  drawText(c, F.bold, s.src, x, sb + 13, fitOne(F.bold, s.src, 9, 8.2, w, 'E tile source'), COL.muted);
}

function listE(c: Canvas, list: Story[], first: number, x0: number, y0: number, x1: number, y1: number) {
  drawText(c, F.black, 'ALSO ON SUNDAY 22 NOVEMBER', x0, y0 + 11, 10, COL.ink, { tracking: 1 });
  const cols = 2;
  const gap = 20;
  const colW = (x1 - x0 - gap) / cols;
  const rows = Math.ceil(list.length / cols);
  const top = y0 + 17;
  const pitch = (y1 - top) / rows;
  const size = 13;
  if (pitch < 17) warn('E list too tight');
  list.forEach((s, i) => {
    const col = Math.floor(i / rows);
    const row = i % rows;
    const x = x0 + col * (colW + gap);
    const base = top + row * pitch + pitch * 0.5 + 4.6;
    const rc = REGION[s.region].col;
    const r = 7.8;
    numDot(c, x + r, base - 4.6, r, first + i, rc);
    let tx = x + 2 * r + 6;
    tx += drawText(c, F.black, `${s.place}:`, tx, base, size, COL.ink) + 5;
    const bt = SHORT[s.badge];
    const bwid = measure(F.black, bt, 8.4) + 7;
    const bx = x + colW - bwid;
    drawText(c, F.reg, s.head, tx, base, fitOne(F.reg, s.head, size, size, bx - 6 - tx, 'E list'), COL.ink);
    c.roundRect(bx, base - 10, bwid, 12.5, 2, BADGE[s.badge].col);
    drawText(c, F.black, bt, bx + bwid / 2, base - 0.8, 8.4, WHITE, { align: 'center' });
  });
}

function footer(c: Canvas, ct: Content, base: number) {
  let x = M;
  const size = 9;
  for (const k of ['C', 'O', 'R', 'K'] as Badge[]) {
    const t = BADGE[k].name;
    const w = measure(F.black, t, 7.6, 0.4) + 8;
    c.roundRect(x, base - 8.6, w, 11.4, 2, BADGE[k].col);
    drawText(c, F.black, t, x + 4, base, 7.6, WHITE, { tracking: 0.4 });
    x += w + 4;
    x += drawText(c, F.reg, MEANS[k], x, base, size, COL.soft) + 9;
  }
  const rest = `${ct.method} Sources: under each story.`;
  const room = W - M - x;
  const fs = fitOne(F.reg, rest, size, 8.4, room, 'E footer');
  drawText(c, F.reg, rest, W - M, base, fs, COL.muted, { align: 'right' });
}

