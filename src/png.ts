// Indexed PNG output: a median-cut-style quantiser that always splits the box with the largest squared error,
// along its highest-variance axis, at the cut that minimises the two halves' summed error. Then each 5-bit
// colour bin maps to its nearest palette entry (weighted 2:4:3), and the rows go out with filter 0, zlib 9.

import { deflateSync } from 'node:zlib';

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

type Box = { lo: number[]; hi: number[]; n: number; err: number; mean: number[] };

// bins: index = r5 * 1024 + g5 * 32 + b5
class Stats {
  cnt = new Float64Array(32768);
  sr = new Float64Array(32768);
  sg = new Float64Array(32768);
  sb = new Float64Array(32768);
  sq = new Float64Array(32768);
}

function boxStats(st: Stats, lo: number[], hi: number[]) {
  let n = 0, r = 0, g = 0, b = 0, q = 0;
  for (let i = lo[0]; i <= hi[0]; i++)
    for (let j = lo[1]; j <= hi[1]; j++)
      for (let k = lo[2]; k <= hi[2]; k++) {
        const idx = i * 1024 + j * 32 + k;
        const c = st.cnt[idx];
        if (!c) continue;
        n += c; r += st.sr[idx]; g += st.sg[idx]; b += st.sb[idx]; q += st.sq[idx];
      }
  const err = n ? q - (r * r + g * g + b * b) / n : 0;
  return { n, err, mean: n ? [r / n, g / n, b / n] : [0, 0, 0] };
}

function makeBox(st: Stats, lo: number[], hi: number[]): Box {
  // shrink to the occupied extent
  const nlo = [31, 31, 31];
  const nhi = [0, 0, 0];
  for (let i = lo[0]; i <= hi[0]; i++)
    for (let j = lo[1]; j <= hi[1]; j++)
      for (let k = lo[2]; k <= hi[2]; k++) {
        if (!st.cnt[i * 1024 + j * 32 + k]) continue;
        if (i < nlo[0]) nlo[0] = i; if (i > nhi[0]) nhi[0] = i;
        if (j < nlo[1]) nlo[1] = j; if (j > nhi[1]) nhi[1] = j;
        if (k < nlo[2]) nlo[2] = k; if (k > nhi[2]) nhi[2] = k;
      }
  const s = boxStats(st, nlo, nhi);
  return { lo: nlo, hi: nhi, n: s.n, err: s.err, mean: s.mean };
}

function splitBox(st: Stats, bx: Box): [Box, Box] | null {
  // per-axis slices: count, sums and squares, to find the variance and the best cut
  let bestAxis = -1;
  let bestVar = -1;
  const slices: Array<Array<{ n: number; r: number; g: number; b: number; q: number }>> = [];
  for (let ax = 0; ax < 3; ax++) {
    const len = bx.hi[ax] - bx.lo[ax] + 1;
    const sl = Array.from({ length: len }, () => ({ n: 0, r: 0, g: 0, b: 0, q: 0 }));
    for (let i = bx.lo[0]; i <= bx.hi[0]; i++)
      for (let j = bx.lo[1]; j <= bx.hi[1]; j++)
        for (let k = bx.lo[2]; k <= bx.hi[2]; k++) {
          const idx = i * 1024 + j * 32 + k;
          const c = st.cnt[idx];
          if (!c) continue;
          const pos = (ax === 0 ? i : ax === 1 ? j : k) - bx.lo[ax];
          const s = sl[pos];
          s.n += c; s.r += st.sr[idx]; s.g += st.sg[idx]; s.b += st.sb[idx]; s.q += st.sq[idx];
        }
    slices.push(sl);
    if (len < 2) continue;
    const m = bx.mean[ax];
    let v = 0;
    for (const s of sl) {
      const chan = ax === 0 ? s.r : ax === 1 ? s.g : s.b;
      // spread of the slice means around the box mean, weighted by population
      if (s.n) v += s.n * (chan / s.n - m) * (chan / s.n - m);
    }
    if (v > bestVar) {
      bestVar = v;
      bestAxis = ax;
    }
  }
  if (bestAxis < 0) return null;
  const sl = slices[bestAxis];
  const tot = sl.reduce((a, s) => ({ n: a.n + s.n, r: a.r + s.r, g: a.g + s.g, b: a.b + s.b, q: a.q + s.q }), { n: 0, r: 0, g: 0, b: 0, q: 0 });
  let acc = { n: 0, r: 0, g: 0, b: 0, q: 0 };
  let bestCut = -1;
  let bestErr = Infinity;
  for (let c = 0; c < sl.length - 1; c++) {
    const s = sl[c];
    acc = { n: acc.n + s.n, r: acc.r + s.r, g: acc.g + s.g, b: acc.b + s.b, q: acc.q + s.q };
    const rn = tot.n - acc.n;
    if (!acc.n || !rn) continue;
    const e1 = acc.q - (acc.r * acc.r + acc.g * acc.g + acc.b * acc.b) / acc.n;
    const rr = tot.r - acc.r, rg = tot.g - acc.g, rb = tot.b - acc.b;
    const e2 = tot.q - acc.q - (rr * rr + rg * rg + rb * rb) / rn;
    if (e1 + e2 < bestErr) {
      bestErr = e1 + e2;
      bestCut = c;
    }
  }
  if (bestCut < 0) return null;
  const cut = bx.lo[bestAxis] + bestCut;
  const hiA = bx.hi.slice();
  hiA[bestAxis] = cut;
  const loB = bx.lo.slice();
  loB[bestAxis] = cut + 1;
  return [makeBox(st, bx.lo, hiA), makeBox(st, loB, bx.hi)];
}

export function encodeIndexedPNG(px: Float32Array, w: number, h: number, colours: number): Buffer {
  const st = new Stats();
  const n = w * h;
  const bin = new Uint16Array(n);
  for (let i = 0; i < n; i++) {
    const r = clamp8(px[i * 3]), g = clamp8(px[i * 3 + 1]), b = clamp8(px[i * 3 + 2]);
    const idx = (r >> 3) * 1024 + (g >> 3) * 32 + (b >> 3);
    bin[i] = idx;
    st.cnt[idx]++;
    st.sr[idx] += r; st.sg[idx] += g; st.sb[idx] += b;
    st.sq[idx] += r * r + g * g + b * b;
  }
  const boxes: Box[] = [makeBox(st, [0, 0, 0], [31, 31, 31])];
  while (boxes.length < colours) {
    let bi = -1;
    let be = 0;
    for (let i = 0; i < boxes.length; i++) {
      if (boxes[i].err > be) {
        be = boxes[i].err;
        bi = i;
      }
    }
    if (bi < 0) break;
    const parts = splitBox(st, boxes[bi]);
    if (!parts) {
      boxes[bi].err = 0;
      continue;
    }
    boxes.splice(bi, 1, parts[0], parts[1]);
  }
  const pal = boxes.map((b) => b.mean.map((v) => Math.round(v)));
  // nearest palette entry per occupied bin, from the bin's own mean colour
  const map = new Int16Array(32768).fill(-1);
  for (let idx = 0; idx < 32768; idx++) {
    const c = st.cnt[idx];
    if (!c) continue;
    const r = st.sr[idx] / c, g = st.sg[idx] / c, b = st.sb[idx] / c;
    let best = 0;
    let bd = Infinity;
    for (let p = 0; p < pal.length; p++) {
      const dr = r - pal[p][0], dg = g - pal[p][1], db = b - pal[p][2];
      const d = 2 * dr * dr + 4 * dg * dg + 3 * db * db;
      if (d < bd) {
        bd = d;
        best = p;
      }
    }
    map[idx] = best;
  }
  const raw = Buffer.alloc((w + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w + 1)] = 0;
    for (let x = 0; x < w; x++) raw[y * (w + 1) + 1 + x] = map[bin[y * w + x]];
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 3; // indexed colour
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const plte = Buffer.alloc(pal.length * 3);
  pal.forEach((c, i) => {
    plte[i * 3] = c[0];
    plte[i * 3 + 1] = c[1];
    plte[i * 3 + 2] = c[2];
  });
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('PLTE', plte),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function clamp8(v: number): number {
  const r = Math.round(v);
  return r < 0 ? 0 : r > 255 ? 255 : r;
}
