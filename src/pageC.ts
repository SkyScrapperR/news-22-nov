// Variant C of the front page: B's clean columns and light tiles, with A's day in numbers, a red PLACE: TOPIC
// banner on every tile, and heroes with two callouts and a dark caption bar. Every word comes from the content file.

import { Canvas, mix } from './raster.ts';
import { drawText, measure, fitLines, fitOne, warn } from './text.ts';
import { WHITE, icon } from './art.ts';
import { heroScene } from './scenes.ts';
import { F, COL, REGION, BADGE } from './style.ts';
import type { Content, Story } from './types.ts';
import { numDot, regionBar, callout, map, dateCheck, legend } from './page.ts';
import { headB, timelineB, sourceBadge, pill, kickerLine, mapLegend, alsoB } from './pageB.ts';

const W = 1024;
const M = 14;
const CW = W - 2 * M;

export function renderPageC(ct: Content): Canvas {
  const c = new Canvas(W, W, COL.paper);
  const all = [...ct.heroes, ...ct.tiles, ...ct.briefs];
  headB(c, ct, all);
  timelineB(c, ct, 130, 50);
  regionBar(c, all, 186, 13);
  numbers(c, ct, 202, 64);

  const heroTop = 270;
  const hw = (CW - 2 * 12) / 3;
  ct.heroes.forEach((s, i) => heroC(c, s, i + 1, M + i * (hw + 12), heroTop, hw));

  const tileTop = heroTop + 222;
  c.hline(M, W - M, tileTop - 5, 1.2, COL.ink);
  const tw = (CW - 4 * 12) / 5;
  const pitch = 129;
  ct.tiles.forEach((s, i) => tileC(c, s, ct.heroes.length + 1 + i, M + (i % 5) * (tw + 12), tileTop + Math.floor(i / 5) * pitch, tw));

  const top = tileTop + 2 * pitch + 2;
  c.hline(M, W - M, top - 3, 1.6, COL.ink);
  const checkTop = 940;
  const mapW = 318;
  const mapH = checkTop - 6 - top - 2 - 34;
  map(c, all, M, top + 2, mapW, mapH);
  mapLegend(c, all, M + 2, top + 2 + mapH + 4, mapW - 4);
  alsoB(c, ct.briefs, ct.heroes.length + ct.tiles.length + 1, M + mapW + 16, top + 2, W - M, checkTop - 6);

  dateCheck(c, ct, checkTop, 46);
  legend(c, ct, checkTop + 46);
  return c;
}

// the day in numbers: big unboxed serif numerals, each with a two-line caption and the circle of its story
function numbers(c: Canvas, ct: Content, y: number, h: number) {
  const n = ct.figures.length;
  const bw = CW / n;
  c.hline(M, W - M, y + h, 0.8, COL.rule);
  ct.figures.forEach((f, i) => {
    const x = M + i * bw;
    if (i > 0) c.rect(x - 0.4, y + 5, 0.8, h - 10, COL.rule);
    const rc = REGION[f.region].col;
    const ns = fitOne(F.display, f.n, 42, 30, bw - 22, 'C figure', 0, 0.7);
    drawText(c, F.display, f.n, x + 10, y + 36, ns, COL.red, { bold: 0.7 });
    const r = 7.4;
    if (f.story) numDot(c, x + 10 + r, y + 46, r, f.story, rc);
    const tx = x + 10 + 2 * r + 6;
    const cl = fitLines(F.bold, f.cap, 12.6, 11.8, x + bw - 8 - tx, 2, 'C figure caption');
    cl.lines.forEach((l, k) => drawText(c, F.bold, l, tx, y + 49.5 + k * 13.2, cl.size, COL.ink));
  });
}

function heroC(c: Canvas, s: Story, n: number, x: number, y: number, w: number) {
  const ah = 126;
  c.clip(x, y, x + w, y + ah);
  heroScene(c, x, y, w, ah, s);
  for (const co of (s.callouts ?? []).slice(0, 2)) callout(c, x, y, co);
  const banner = s.banner ?? s.place;
  const bs = fitOne(F.black, banner, 19.5, 15, w - 24, 'C hero banner', 0.3);
  const bw = measure(F.black, banner, bs, 0.3) + 20;
  c.rect(x, y, bw, 33, COL.red);
  drawText(c, F.black, banner, x + 10, y + 24, bs, WHITE, { tracking: 0.3 });
  if (s.chip) {
    const cs = fitOne(F.black, s.chip, 12, 10, w - 20, 'C hero chip');
    const cw = measure(F.black, s.chip, cs) + 14;
    c.rect(x, y + 33, cw, 20, [252, 250, 244]);
    drawText(c, F.black, s.chip, x + 7, y + 47.5, cs, COL.ink);
  }
  const barH = 17;
  c.rect(x, y + ah - barH, w, barH, [18, 17, 15]);
  const cap = s.caption ?? '';
  drawText(c, F.bold, cap, x + 7, y + ah - 5, fitOne(F.bold, cap, 10, 8.6, w - 14, 'C hero caption'), WHITE);
  c.noClip();
  const kb = y + ah + 15;
  const bt = sourceBadge(s);
  const bsz = fitOne(F.black, bt, 8.6, 7.6, w * 0.58, 'C hero badge', 0.4);
  const pw = pill(c, bt, x + w, kb, bsz, BADGE[s.badge].col);
  kickerLine(c, s, n, x, kb, w - pw - 6, 9.6);
  const hl = fitLines(F.serif, s.head, 26, 21, w - 1, 2, 'C hero headline', 0, 1);
  let base = kb + hl.size + 3;
  hl.lines.forEach((l, i) => drawText(c, F.serif, l, x, base + i * hl.size * 1.03, hl.size, COL.ink, { bold: 1 }));
  base += (hl.lines.length - 1) * hl.size * 1.03 + 14;
  const sm = fitLines(F.reg, s.sum ?? '', 11.4, 10.6, w, 1, 'C hero summary');
  sm.lines.forEach((l) => drawText(c, F.reg, l, x, base, sm.size, COL.soft));
}

function tileC(c: Canvas, s: Story, n: number, x: number, y: number, w: number) {
  const rc = REGION[s.region].col;
  // red PLACE: TOPIC banner, with the story's circle
  const bh = 18;
  c.rect(x, y, w, bh, COL.red);
  c.circle(x + 10, y + bh / 2, 7.6, WHITE);
  numDot(c, x + 10, y + bh / 2, 6.6, n, rc);
  const banner = s.banner ?? s.place;
  const bs = fitOne(F.black, banner, 11.5, 9, w - 28, 'C tile banner', 0.4);
  drawText(c, F.black, banner, x + 22, y + 13.2, bs, WHITE, { tracking: 0.4 });
  // light art with the key figure and a corner badge
  const ay = y + bh, ah = 46;
  c.rect(x, ay, w, ah, mix(rc, COL.paper, 0.86));
  c.rect(x, ay, 3, ah, rc);
  const ix = x + w - 25, iy = ay + ah / 2 + 6;
  c.circle(ix, iy, 15.5, mix(rc, COL.paper, 0.72));
  icon(c, s.art, ix, iy, 26, mix(rc, COL.ink, 0.45), COL.red, mix(rc, COL.paper, 0.72));
  pill(c, BADGE[s.badge].name, x + w - 3, ay + 11, 6.8, BADGE[s.badge].col);
  const fact = s.fact ?? '';
  const unit = s.unit ?? '';
  const fs = fitOne(F.display, fact, 33, 18, w - 58 - 12, 'C tile figure', 0, 0.6);
  const fw = drawText(c, F.display, fact, x + 10, ay + 37, fs, mix(rc, COL.ink, 0.25), { bold: 0.6 });
  if (unit) {
    const us = fitOne(F.black, unit, 9.5, 7.4, w - 58 - 14 - fw - 6, 'C tile unit', 0.4);
    drawText(c, F.black, unit, x + 10 + fw + 5, ay + 37, us, COL.ink, { tracking: 0.4 });
  }
  // headline, summary, source
  const kb = ay + ah;
  const hl = fitLines(F.serif, s.head, 16, 14, w - 1, 2, 'C tile headline', 0, 0.7);
  hl.lines.forEach((l, i) => drawText(c, F.serif, l, x, kb + 16 + i * hl.size * 1.04, hl.size, COL.ink, { bold: 0.7 }));
  const sb = kb + 16 + 16 * 1.04 + 14.5;
  const sm = s.sum ?? '';
  drawText(c, F.reg, sm, x, sb, fitOne(F.reg, sm, 10, 9.4, w, 'C tile summary'), COL.soft);
  const src = `Source: ${s.src}`;
  drawText(c, F.bold, src, x, sb + 12.5, fitOne(F.bold, src, 9, 8, w, 'C tile source'), COL.ink);
  if (sb + 15 > y + 128) warn('C tile too tall');
}
