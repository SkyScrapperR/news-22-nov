// Canvas and polygon rasteriser.
// Coverage is accumulated as exact signed areas per pixel, then summed along each row; the absolute value,
// clamped to 1, is the pixel's coverage. Holes cancel by their opposite winding, and overlapping copies of the
// same outline (synthetic bold) clamp cleanly to full coverage.

export type RGB = [number, number, number];
export type Poly = number[]; // flat x0,y0,x1,y1,... closed implicitly

export function hex(h: string): RGB {
  const s = h.replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}

export function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export type FillOpts = { alpha?: number; gamma?: number; union?: boolean };

export class Canvas {
  w: number;
  h: number;
  px: Float32Array;
  // clip rectangle (pixels); fills never touch outside it
  cx0 = 0;
  cy0 = 0;
  cx1: number;
  cy1: number;
  private acc = new Float32Array(0);

  constructor(w: number, h: number, bg: RGB) {
    this.w = w;
    this.h = h;
    this.cx1 = w;
    this.cy1 = h;
    this.px = new Float32Array(w * h * 3);
    for (let i = 0; i < w * h; i++) {
      this.px[i * 3] = bg[0];
      this.px[i * 3 + 1] = bg[1];
      this.px[i * 3 + 2] = bg[2];
    }
  }

  clip(x0: number, y0: number, x1: number, y1: number) {
    this.cx0 = Math.max(0, Math.floor(x0));
    this.cy0 = Math.max(0, Math.floor(y0));
    this.cx1 = Math.min(this.w, Math.ceil(x1));
    this.cy1 = Math.min(this.h, Math.ceil(y1));
  }

  noClip() {
    this.cx0 = 0;
    this.cy0 = 0;
    this.cx1 = this.w;
    this.cy1 = this.h;
  }

  // Fill a set of closed polygons with one colour.
  fill(polys: Poly[], col: RGB, opts: FillOpts = {}) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of polys) {
      for (let i = 0; i < p.length; i += 2) {
        if (p[i] < minX) minX = p[i];
        if (p[i] > maxX) maxX = p[i];
        if (p[i + 1] < minY) minY = p[i + 1];
        if (p[i + 1] > maxY) maxY = p[i + 1];
      }
    }
    const bx0 = Math.max(this.cx0, Math.floor(minX));
    const bx1 = Math.min(this.cx1, Math.ceil(maxX));
    const by0 = Math.max(this.cy0, Math.floor(minY));
    const by1 = Math.min(this.cy1, Math.ceil(maxY));
    if (bx1 <= bx0 || by1 <= by0) return;
    const bw = bx1 - bx0 + 2;
    const bh = by1 - by0;
    const need = bw * bh;
    if (this.acc.length < need) this.acc = new Float32Array(need);
    const a = this.acc;
    a.fill(0, 0, need);
    for (let p of polys) {
      if (opts.union && signedArea(p) < 0) p = reversePoly(p);
      const n = p.length;
      for (let i = 0; i < n; i += 2) {
        const j = (i + 2) % n;
        line(a, bw, bh, p[i] - bx0, p[i + 1] - by0, p[j] - bx0, p[j + 1] - by0, bx1 - bx0);
      }
    }
    const alpha = opts.alpha ?? 1;
    const gamma = opts.gamma ?? 1;
    const [r, g, b] = col;
    const px = this.px;
    for (let y = 0; y < bh; y++) {
      let s = 0;
      const row = y * bw;
      const prow = ((by0 + y) * this.w + bx0) * 3;
      for (let x = 0; x < bx1 - bx0; x++) {
        s += a[row + x];
        let c = Math.abs(s);
        if (c < 0.002) continue;
        if (c > 1) c = 1;
        if (gamma !== 1) c = Math.pow(c, gamma);
        c *= alpha;
        const o = prow + x * 3;
        px[o] += (r - px[o]) * c;
        px[o + 1] += (g - px[o + 1]) * c;
        px[o + 2] += (b - px[o + 2]) * c;
      }
    }
  }

  // ---- convenience shapes ----
  rect(x: number, y: number, w: number, h: number, col: RGB, alpha = 1) {
    this.fill([[x, y, x + w, y, x + w, y + h, x, y + h]], col, { alpha });
  }

  roundRect(x: number, y: number, w: number, h: number, r: number, col: RGB, alpha = 1) {
    this.fill([roundRectPoly(x, y, w, h, r)], col, { alpha });
  }

  circle(cx: number, cy: number, r: number, col: RGB, alpha = 1) {
    this.fill([ellipsePoly(cx, cy, r, r)], col, { alpha });
  }

  ring(cx: number, cy: number, r: number, width: number, col: RGB, alpha = 1) {
    this.fill([ellipsePoly(cx, cy, r + width / 2, r + width / 2), reversePoly(ellipsePoly(cx, cy, r - width / 2, r - width / 2))], col, { alpha });
  }

  poly(pts: number[], col: RGB, alpha = 1) {
    this.fill([pts], col, { alpha, union: true });
  }

  // stroke an open polyline with round joins
  stroke(pts: number[], width: number, col: RGB, alpha = 1, closed = false) {
    this.fill(strokePolys(pts, width, closed), col, { alpha, union: true });
  }

  line(x0: number, y0: number, x1: number, y1: number, width: number, col: RGB, alpha = 1) {
    this.stroke([x0, y0, x1, y1], width, col, alpha);
  }

  hline(x0: number, x1: number, y: number, t: number, col: RGB) {
    this.rect(x0, y - t / 2, x1 - x0, t, col);
  }
}

// One edge into the accumulation buffer (coordinates relative to the buffer; w is the buffer stride).
function line(a: Float32Array, w: number, h: number, x0: number, y0: number, x1: number, y1: number, maxX: number) {
  if (y0 === y1) return;
  // clamp x into the buffer: area left of the buffer folds onto column 0, which keeps the running sums right
  const cl = (v: number) => (v < 0 ? 0 : v > maxX ? maxX : v);
  let dir = 1;
  if (y0 > y1) {
    dir = -1;
    let t = x0; x0 = x1; x1 = t;
    t = y0; y0 = y1; y1 = t;
  }
  if (y1 <= 0 || y0 >= h) return;
  const dxdy = (x1 - x0) / (y1 - y0);
  let yStart = y0;
  let x = x0;
  if (yStart < 0) {
    x -= yStart * dxdy;
    yStart = 0;
  }
  const yEnd = Math.min(h, y1);
  for (let y = Math.floor(yStart); y < Math.ceil(yEnd); y++) {
    const top = Math.max(y, yStart);
    const bot = Math.min(y + 1, yEnd);
    const dy = bot - top;
    if (dy <= 0) continue;
    const xn = x + dxdy * dy;
    const d = dy * dir;
    const xa = cl(Math.min(x, xn));
    const xb = cl(Math.max(x, xn));
    const row = y * w;
    const ia = Math.floor(xa);
    const ib = Math.ceil(xb);
    if (ib <= ia + 1) {
      // the edge stays within one pixel column in this row
      const mid = 0.5 * (xa + xb) - ia;
      a[row + ia] += d * (1 - mid);
      a[row + ia + 1] += d * mid;
    } else {
      const inv = 1 / (xb - xa);
      const fa = xa - ia;
      const a0 = 0.5 * inv * (1 - fa) * (1 - fa);
      const fb = xb - ib + 1;
      const am = 0.5 * inv * fb * fb;
      a[row + ia] += d * a0;
      if (ib === ia + 2) {
        a[row + ia + 1] += d * (1 - a0 - am);
      } else {
        const a1 = inv * (1.5 - fa);
        a[row + ia + 1] += d * (a1 - a0);
        for (let k = ia + 2; k < ib - 1; k++) a[row + k] += d * inv;
        const a2 = a1 + (ib - ia - 3) * inv;
        a[row + ib - 1] += d * (1 - a2 - am);
      }
      a[row + ib] += d * am;
    }
    x = xn;
  }
}

export function signedArea(p: Poly): number {
  let s = 0;
  const n = p.length;
  for (let i = 0; i < n; i += 2) {
    const j = (i + 2) % n;
    s += p[i] * p[j + 1] - p[j] * p[i + 1];
  }
  return s / 2;
}

export function reversePoly(p: Poly): Poly {
  const out: number[] = [];
  for (let i = p.length - 2; i >= 0; i -= 2) out.push(p[i], p[i + 1]);
  return out;
}

export function ellipsePoly(cx: number, cy: number, rx: number, ry: number, a0 = 0, a1 = Math.PI * 2): Poly {
  const r = Math.max(rx, ry);
  const steps = Math.max(12, Math.ceil(Math.sqrt(r) * 10 * (Math.abs(a1 - a0) / (Math.PI * 2))));
  const out: number[] = [];
  const full = Math.abs(a1 - a0) >= Math.PI * 2 - 1e-9;
  const n = full ? steps : steps + 1;
  for (let i = 0; i < n; i++) {
    const t = a0 + ((a1 - a0) * i) / steps;
    out.push(cx + Math.cos(t) * rx, cy + Math.sin(t) * ry);
  }
  return out;
}

export function roundRectPoly(x: number, y: number, w: number, h: number, r: number): Poly {
  r = Math.min(r, w / 2, h / 2);
  if (r <= 0.01) return [x, y, x + w, y, x + w, y + h, x, y + h];
  const out: number[] = [];
  const corner = (cx: number, cy: number, s: number) => {
    for (let i = 0; i <= 6; i++) {
      const t = s + (Math.PI / 2) * (i / 6);
      out.push(cx + Math.cos(t) * r, cy + Math.sin(t) * r);
    }
  };
  corner(x + w - r, y + r, -Math.PI / 2);
  corner(x + w - r, y + h - r, 0);
  corner(x + r, y + h - r, Math.PI / 2);
  corner(x + r, y + r, Math.PI);
  return out;
}

export function strokePolys(pts: number[], width: number, closed = false): Poly[] {
  const out: Poly[] = [];
  const hw = width / 2;
  const n = pts.length / 2;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const x0 = pts[i * 2], y0 = pts[i * 2 + 1];
    const j = (i + 1) % n;
    const x1 = pts[j * 2], y1 = pts[j * 2 + 1];
    const dx = x1 - x0, dy = y1 - y0;
    const len = Math.hypot(dx, dy);
    if (len < 1e-6) continue;
    const nx = (-dy / len) * hw, ny = (dx / len) * hw;
    out.push([x0 + nx, y0 + ny, x1 + nx, y1 + ny, x1 - nx, y1 - ny, x0 - nx, y0 - ny]);
  }
  if (width > 1.2) {
    for (let i = 0; i < n; i++) {
      if (!closed && (i === 0 || i === n - 1) && n > 1) {
        out.push(ellipsePoly(pts[i * 2], pts[i * 2 + 1], hw, hw));
      } else if (i > 0 || closed) {
        out.push(ellipsePoly(pts[i * 2], pts[i * 2 + 1], hw, hw));
      }
    }
  }
  return out;
}
