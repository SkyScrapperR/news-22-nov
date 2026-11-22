// Setting type: outlines to polygons, kerning, measuring, wrapping, auto-fit and the overflow counter.

import { Font } from './ttf.ts';
import type { Canvas, RGB, Poly } from './raster.ts';

export let overflowWarnings = 0;

export function warn(msg: string) {
  overflowWarnings++;
  process.stderr.write('OVERFLOW: ' + msg + '\n');
}

const SUBST: Record<string, string> = { '−': '-', '≈': '~', '‑': '-' };

export type TextOpts = {
  bold?: number; // synthetic bold offset in px
  tracking?: number; // extra px after each glyph
  slant?: number; // shear, x += slant * height above baseline
  align?: 'left' | 'center' | 'right';
  gamma?: number;
  alpha?: number;
};

function glyphsOf(font: Font, text: string): number[] {
  const out: number[] = [];
  for (const ch of text) {
    let cp = ch.codePointAt(0) ?? 32;
    if (!font.hasChar(cp) && SUBST[ch]) cp = SUBST[ch].codePointAt(0) ?? 32;
    out.push(font.glyphIndex(cp));
  }
  return out;
}

export function measure(font: Font, text: string, size: number, tracking = 0, bold = 0): number {
  const gs = glyphsOf(font, text);
  const sc = size / font.unitsPerEm;
  let w = 0;
  for (let i = 0; i < gs.length; i++) {
    w += font.advance(gs[i]) * sc;
    if (i + 1 < gs.length) w += font.kern(gs[i], gs[i + 1]) * sc + tracking;
  }
  return w + bold;
}

// quadratic contours -> flat polygons in pixel space
function contourPolys(font: Font, g: number, ox: number, oy: number, sc: number, slant: number, out: Poly[]) {
  const tol = 0.1;
  for (const ct of font.contours(g)) {
    const n = ct.length;
    if (n < 2) continue;
    const X = (p: { x: number; y: number }) => ox + p.x * sc + slant * p.y * sc;
    const Y = (p: { x: number; y: number }) => oy - p.y * sc;
    // pick a start point that is on the curve
    let startIdx = ct.findIndex((p) => p.on);
    let start: { x: number; y: number };
    if (startIdx < 0) {
      start = { x: (ct[0].x + ct[1].x) / 2, y: (ct[0].y + ct[1].y) / 2 };
      startIdx = 0;
    } else {
      start = ct[startIdx];
    }
    const poly: number[] = [X(start), Y(start)];
    let prev = start;
    let ctrl: { x: number; y: number } | null = null;
    const emitQuad = (p0: { x: number; y: number }, c: { x: number; y: number }, p1: { x: number; y: number }) => {
      const ax = X(p0), ay = Y(p0), bx = X(c), by = Y(c), cx = X(p1), cy = Y(p1);
      const dd = Math.hypot(ax - 2 * bx + cx, ay - 2 * by + cy);
      const steps = Math.max(1, Math.ceil(Math.sqrt(dd / (8 * tol))));
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const u = 1 - t;
        poly.push(u * u * ax + 2 * u * t * bx + t * t * cx, u * u * ay + 2 * u * t * by + t * t * cy);
      }
    };
    const firstOff = startIdx < 0;
    for (let k = 1; k <= n; k++) {
      const p = ct[(startIdx + k) % n];
      const isLast = k === n;
      const q = isLast && !firstOff ? start : p;
      if (q.on || (isLast && !firstOff)) {
        if (ctrl) emitQuad(prev, ctrl, q);
        else poly.push(X(q), Y(q));
        prev = q;
        ctrl = null;
      } else {
        if (ctrl) {
          const mid = { x: (ctrl.x + q.x) / 2, y: (ctrl.y + q.y) / 2 };
          emitQuad(prev, ctrl, mid);
          prev = mid;
        }
        ctrl = q;
      }
    }
    if (ctrl) emitQuad(prev, ctrl, start);
    out.push(poly);
  }
}

export function textPolys(font: Font, text: string, x: number, y: number, size: number, o: TextOpts = {}): Poly[] {
  const gs = glyphsOf(font, text);
  const sc = size / font.unitsPerEm;
  const tr = o.tracking ?? 0;
  const bold = o.bold ?? 0;
  const w = measure(font, text, size, tr, bold);
  let pen = x;
  if (o.align === 'center') pen = x - w / 2;
  else if (o.align === 'right') pen = x - w;
  const polys: Poly[] = [];
  const shifts = bold <= 0 ? [0] : bold <= 0.5 ? [0, bold] : [0, bold / 2, bold];
  for (let i = 0; i < gs.length; i++) {
    for (const s of shifts) contourPolys(font, gs[i], pen + s, y, sc, o.slant ?? 0, polys);
    pen += font.advance(gs[i]) * sc;
    if (i + 1 < gs.length) pen += font.kern(gs[i], gs[i + 1]) * sc + tr;
  }
  return polys;
}

export function drawText(c: Canvas, font: Font, text: string, x: number, y: number, size: number, col: RGB, o: TextOpts = {}): number {
  const polys = textPolys(font, text, x, y, size, o);
  if (polys.length) c.fill(polys, col, { gamma: o.gamma ?? 0.85, alpha: o.alpha ?? 1 });
  return measure(font, text, size, o.tracking ?? 0, o.bold ?? 0);
}

// greedy word wrap; returns lines (a single word wider than maxW stays on its own line)
export function wrap(font: Font, text: string, size: number, maxW: number, tracking = 0, bold = 0): string[] {
  const words = text.split(/ +/).filter((w) => w.length);
  const lines: string[] = [];
  let cur = '';
  for (const wd of words) {
    const t = cur ? cur + ' ' + wd : wd;
    if (!cur || measure(font, t, size, tracking, bold) <= maxW) cur = t;
    else {
      lines.push(cur);
      cur = wd;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function linesFit(font: Font, lines: string[], size: number, maxW: number, tracking: number, bold: number) {
  return lines.every((l) => measure(font, l, size, tracking, bold) <= maxW);
}

// largest size (stepping 0.25 px) at which the text wraps into at most maxLines lines of maxW
export function fitLines(font: Font, text: string, maxSize: number, minSize: number, maxW: number, maxLines: number, label: string, tracking = 0, bold = 0): { size: number; lines: string[] } {
  for (let s = maxSize; s >= minSize - 1e-9; s -= 0.25) {
    const lines = wrap(font, text, s, maxW, tracking, bold);
    if (lines.length <= maxLines && linesFit(font, lines, s, maxW, tracking, bold)) return { size: s, lines };
  }
  const lines = wrap(font, text, minSize, maxW, tracking, bold);
  warn(`${label}: "${text}" needs ${lines.length} lines at ${minSize}px (max ${maxLines})`);
  return { size: minSize, lines: lines.slice(0, maxLines) };
}

// largest size at which a single line fits
export function fitOne(font: Font, text: string, maxSize: number, minSize: number, maxW: number, label: string, tracking = 0, bold = 0): number {
  for (let s = maxSize; s >= minSize - 1e-9; s -= 0.1) {
    if (measure(font, text, s, tracking, bold) <= maxW) return s;
  }
  warn(`${label}: "${text}" is ${measure(font, text, minSize, tracking, bold).toFixed(1)}px at ${minSize}px, room ${maxW.toFixed(1)}`);
  return minSize;
}
