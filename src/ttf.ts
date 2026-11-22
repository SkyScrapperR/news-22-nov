// A small TrueType reader: just what the page needs to set type.
// Tables: head, maxp, hhea, hmtx, OS/2, cmap (formats 4 and 12), loca, glyf (simple and composite) and
// the pair-adjustment lookups of the GPOS "kern" feature (formats 1 and 2, extension lookups too).

export type Pt = { x: number; y: number; on: boolean };
export type Contour = Pt[];

export class Font {
  private b: Buffer;
  private tables = new Map<string, { off: number; len: number }>();
  unitsPerEm = 1000;
  ascender = 0;
  descender = 0;
  capHeight = 0;
  xHeight = 0;
  numGlyphs = 0;
  private longLoca = false;
  private nHMetrics = 0;
  private cmapLookup: (cp: number) => number = () => 0;
  private glyphCache = new Map<number, Contour[]>();
  private kernSubtables: Array<(a: number, b: number) => number | null> = [];
  private kernLookups: Array<Array<(a: number, b: number) => number | null>> = [];
  private kernCache = new Map<number, number>();

  constructor(data: Buffer) {
    this.b = data;
    const n = data.readUInt16BE(4);
    for (let i = 0; i < n; i++) {
      const r = 12 + i * 16;
      const tag = data.toString('latin1', r, r + 4);
      this.tables.set(tag, { off: data.readUInt32BE(r + 8), len: data.readUInt32BE(r + 12) });
    }
    const head = this.tab('head');
    this.unitsPerEm = data.readUInt16BE(head + 18);
    this.longLoca = data.readInt16BE(head + 50) === 1;
    this.numGlyphs = data.readUInt16BE(this.tab('maxp') + 4);
    const hhea = this.tab('hhea');
    this.ascender = data.readInt16BE(hhea + 4);
    this.descender = data.readInt16BE(hhea + 6);
    this.nHMetrics = data.readUInt16BE(hhea + 34);
    if (this.tables.has('OS/2')) {
      const os2 = this.tab('OS/2');
      const ver = data.readUInt16BE(os2);
      if (ver >= 2) {
        this.xHeight = data.readInt16BE(os2 + 86);
        this.capHeight = data.readInt16BE(os2 + 88);
      }
    }
    if (!this.capHeight) this.capHeight = Math.round(this.ascender * 0.7);
    if (!this.xHeight) this.xHeight = Math.round(this.capHeight * 0.7);
    this.readCmap();
    if (this.tables.has('GPOS')) this.readGpos();
  }

  private tab(tag: string): number {
    const t = this.tables.get(tag);
    if (!t) throw new Error('missing table ' + tag);
    return t.off;
  }

  // ---- character map ----
  private readCmap() {
    const b = this.b;
    const base = this.tab('cmap');
    const n = b.readUInt16BE(base + 2);
    let best = -1;
    let bestScore = -1;
    for (let i = 0; i < n; i++) {
      const r = base + 4 + i * 8;
      const pid = b.readUInt16BE(r);
      const eid = b.readUInt16BE(r + 2);
      const sub = base + b.readUInt32BE(r + 4);
      const fmt = b.readUInt16BE(sub);
      let score = -1;
      if (pid === 3 && eid === 10 && fmt === 12) score = 4;
      else if (pid === 3 && eid === 1 && fmt === 4) score = 3;
      else if (pid === 0 && fmt === 12) score = 2;
      else if (pid === 0 && fmt === 4) score = 1;
      if (score > bestScore) {
        bestScore = score;
        best = sub;
      }
    }
    if (best < 0) return;
    const fmt = b.readUInt16BE(best);
    if (fmt === 4) {
      const segX2 = b.readUInt16BE(best + 6);
      const ends = best + 14;
      const starts = ends + segX2 + 2;
      const deltas = starts + segX2;
      const ranges = deltas + segX2;
      this.cmapLookup = (cp: number) => {
        if (cp > 0xffff) return 0;
        for (let s = 0; s < segX2; s += 2) {
          const end = b.readUInt16BE(ends + s);
          if (cp > end) continue;
          const start = b.readUInt16BE(starts + s);
          if (cp < start) return 0;
          const delta = b.readUInt16BE(deltas + s);
          const ro = b.readUInt16BE(ranges + s);
          if (ro === 0) return (cp + delta) & 0xffff;
          const at = ranges + s + ro + (cp - start) * 2;
          const g = b.readUInt16BE(at);
          return g === 0 ? 0 : (g + delta) & 0xffff;
        }
        return 0;
      };
    } else if (fmt === 12) {
      const groups = b.readUInt32BE(best + 12);
      this.cmapLookup = (cp: number) => {
        let lo = 0;
        let hi = groups - 1;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          const g = best + 16 + mid * 12;
          const s = b.readUInt32BE(g);
          const e = b.readUInt32BE(g + 4);
          if (cp < s) hi = mid - 1;
          else if (cp > e) lo = mid + 1;
          else return b.readUInt32BE(g + 8) + (cp - s);
        }
        return 0;
      };
    }
  }

  glyphIndex(cp: number): number {
    return this.cmapLookup(cp);
  }

  hasChar(cp: number): boolean {
    return this.cmapLookup(cp) !== 0;
  }

  advance(g: number): number {
    const hm = this.tab('hmtx');
    const i = g < this.nHMetrics ? g : this.nHMetrics - 1;
    return this.b.readUInt16BE(hm + i * 4);
  }

  // ---- outlines ----
  private glyphOffset(g: number): [number, number] {
    const loca = this.tab('loca');
    const glyf = this.tab('glyf');
    if (this.longLoca) {
      return [glyf + this.b.readUInt32BE(loca + g * 4), glyf + this.b.readUInt32BE(loca + g * 4 + 4)];
    }
    return [glyf + this.b.readUInt16BE(loca + g * 2) * 2, glyf + this.b.readUInt16BE(loca + g * 2 + 2) * 2];
  }

  contours(g: number): Contour[] {
    const hit = this.glyphCache.get(g);
    if (hit) return hit;
    const out = this.readGlyph(g, 0);
    this.glyphCache.set(g, out);
    return out;
  }

  private readGlyph(g: number, depth: number): Contour[] {
    if (depth > 8 || g >= this.numGlyphs) return [];
    const b = this.b;
    const [start, end] = this.glyphOffset(g);
    if (end <= start) return [];
    const nc = b.readInt16BE(start);
    if (nc >= 0) return this.readSimple(start, nc);
    // composite glyph
    const out: Contour[] = [];
    let p = start + 10;
    for (;;) {
      const flags = b.readUInt16BE(p);
      const sub = b.readUInt16BE(p + 2);
      p += 4;
      let dx = 0;
      let dy = 0;
      if (flags & 1) {
        dx = b.readInt16BE(p);
        dy = b.readInt16BE(p + 2);
        p += 4;
      } else {
        dx = b.readInt8(p);
        dy = b.readInt8(p + 1);
        p += 2;
      }
      if (!(flags & 2)) {
        dx = 0; // point matching: not used by these fonts' accents
        dy = 0;
      }
      let a = 1, bb = 0, c = 0, d = 1;
      if (flags & 8) {
        a = d = b.readInt16BE(p) / 16384;
        p += 2;
      } else if (flags & 0x40) {
        a = b.readInt16BE(p) / 16384;
        d = b.readInt16BE(p + 2) / 16384;
        p += 4;
      } else if (flags & 0x80) {
        a = b.readInt16BE(p) / 16384;
        bb = b.readInt16BE(p + 2) / 16384;
        c = b.readInt16BE(p + 4) / 16384;
        d = b.readInt16BE(p + 6) / 16384;
        p += 8;
      }
      for (const ct of this.readGlyph(sub, depth + 1)) {
        out.push(ct.map((q) => ({ x: q.x * a + q.y * c + dx, y: q.x * bb + q.y * d + dy, on: q.on })));
      }
      if (!(flags & 0x20)) break;
    }
    return out;
  }

  private readSimple(start: number, nc: number): Contour[] {
    const b = this.b;
    const endPts: number[] = [];
    let p = start + 10;
    for (let i = 0; i < nc; i++) {
      endPts.push(b.readUInt16BE(p));
      p += 2;
    }
    const nPts = nc ? endPts[nc - 1] + 1 : 0;
    const insLen = b.readUInt16BE(p);
    p += 2 + insLen;
    const flags: number[] = [];
    while (flags.length < nPts) {
      const f = b.readUInt8(p++);
      flags.push(f);
      if (f & 8) {
        let rep = b.readUInt8(p++);
        while (rep-- > 0) flags.push(f);
      }
    }
    const xs: number[] = [];
    let v = 0;
    for (let i = 0; i < nPts; i++) {
      const f = flags[i];
      if (f & 2) {
        const d = b.readUInt8(p++);
        v += f & 16 ? d : -d;
      } else if (!(f & 16)) {
        v += b.readInt16BE(p);
        p += 2;
      }
      xs.push(v);
    }
    const ys: number[] = [];
    v = 0;
    for (let i = 0; i < nPts; i++) {
      const f = flags[i];
      if (f & 4) {
        const d = b.readUInt8(p++);
        v += f & 32 ? d : -d;
      } else if (!(f & 32)) {
        v += b.readInt16BE(p);
        p += 2;
      }
      ys.push(v);
    }
    const out: Contour[] = [];
    let s = 0;
    for (const e of endPts) {
      const ct: Contour = [];
      for (let i = s; i <= e; i++) ct.push({ x: xs[i], y: ys[i], on: (flags[i] & 1) === 1 });
      out.push(ct);
      s = e + 1;
    }
    return out;
  }

  // ---- kerning from GPOS ----
  private coverage(off: number): Map<number, number> {
    const b = this.b;
    const m = new Map<number, number>();
    const fmt = b.readUInt16BE(off);
    const n = b.readUInt16BE(off + 2);
    if (fmt === 1) {
      for (let i = 0; i < n; i++) m.set(b.readUInt16BE(off + 4 + i * 2), i);
    } else if (fmt === 2) {
      for (let i = 0; i < n; i++) {
        const r = off + 4 + i * 6;
        const s = b.readUInt16BE(r);
        const e = b.readUInt16BE(r + 2);
        const k = b.readUInt16BE(r + 4);
        for (let g = s; g <= e; g++) m.set(g, k + g - s);
      }
    }
    return m;
  }

  private classDef(off: number): (g: number) => number {
    const b = this.b;
    const fmt = b.readUInt16BE(off);
    if (fmt === 1) {
      const s = b.readUInt16BE(off + 2);
      const n = b.readUInt16BE(off + 4);
      return (g) => (g >= s && g < s + n ? b.readUInt16BE(off + 6 + (g - s) * 2) : 0);
    }
    const n = b.readUInt16BE(off + 2);
    const m = new Map<number, number>();
    for (let i = 0; i < n; i++) {
      const r = off + 4 + i * 6;
      const s = b.readUInt16BE(r);
      const e = b.readUInt16BE(r + 2);
      const c = b.readUInt16BE(r + 4);
      for (let g = s; g <= e; g++) m.set(g, c);
    }
    return (g) => m.get(g) ?? 0;
  }

  private static vrSize(fmt: number): number {
    let n = 0;
    for (let f = fmt; f; f >>= 1) n += f & 1;
    return n * 2;
  }

  // byte offset of XAdvance inside a value record, or -1 when the record has none
  private static xAdvAt(fmt: number): number {
    if (!(fmt & 4)) return -1;
    return ((fmt & 1) ? 2 : 0) + ((fmt & 2) ? 2 : 0);
  }

  private pairSubtable(off: number): ((a: number, b: number) => number | null) | null {
    const b = this.b;
    const fmt = b.readUInt16BE(off);
    const cov = this.coverage(off + b.readUInt16BE(off + 2));
    const vf1 = b.readUInt16BE(off + 4);
    const vf2 = b.readUInt16BE(off + 6);
    const s1 = Font.vrSize(vf1);
    const s2 = Font.vrSize(vf2);
    const xa = Font.xAdvAt(vf1);
    if (fmt === 1) {
      const nSets = b.readUInt16BE(off + 8);
      return (g1, g2) => {
        const ci = cov.get(g1);
        if (ci === undefined || ci >= nSets) return null;
        const ps = off + b.readUInt16BE(off + 10 + ci * 2);
        const n = b.readUInt16BE(ps);
        const rec = 2 + s1 + s2;
        let lo = 0;
        let hi = n - 1;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          const r = ps + 2 + mid * rec;
          const sg = b.readUInt16BE(r);
          if (sg < g2) lo = mid + 1;
          else if (sg > g2) hi = mid - 1;
          else return xa >= 0 ? b.readInt16BE(r + 2 + xa) : 0;
        }
        return null;
      };
    }
    if (fmt === 2) {
      const cd1 = this.classDef(off + b.readUInt16BE(off + 8));
      const cd2 = this.classDef(off + b.readUInt16BE(off + 10));
      const n2 = b.readUInt16BE(off + 14);
      const rec = s1 + s2;
      return (g1, g2) => {
        if (!cov.has(g1)) return null;
        const c1 = cd1(g1);
        const c2 = cd2(g2);
        const r = off + 16 + (c1 * n2 + c2) * rec;
        return xa >= 0 ? b.readInt16BE(r + xa) : 0;
      };
    }
    return null;
  }

  private readGpos() {
    const b = this.b;
    const g = this.tab('GPOS');
    const featList = g + b.readUInt16BE(g + 6);
    const lookList = g + b.readUInt16BE(g + 8);
    const nf = b.readUInt16BE(featList);
    const wanted = new Set<number>();
    for (let i = 0; i < nf; i++) {
      const r = featList + 2 + i * 6;
      if (b.toString('latin1', r, r + 4) !== 'kern') continue;
      const ft = featList + b.readUInt16BE(r + 4);
      const n = b.readUInt16BE(ft + 2);
      for (let k = 0; k < n; k++) wanted.add(b.readUInt16BE(ft + 4 + k * 2));
    }
    const indices = [...wanted].sort((x, y) => x - y);
    for (const li of indices) {
      const lk = lookList + b.readUInt16BE(lookList + 2 + li * 2);
      const type = b.readUInt16BE(lk);
      const ns = b.readUInt16BE(lk + 4);
      const subs: Array<(a: number, b: number) => number | null> = [];
      for (let s = 0; s < ns; s++) {
        let st = lk + b.readUInt16BE(lk + 6 + s * 2);
        let t = type;
        if (t === 9) {
          t = b.readUInt16BE(st + 2);
          st = st + b.readUInt32BE(st + 4);
        }
        if (t !== 2) continue;
        const f = this.pairSubtable(st);
        if (f) subs.push(f);
      }
      if (subs.length) this.kernLookups.push(subs);
    }
  }

  kern(g1: number, g2: number): number {
    if (!this.kernLookups.length) return 0;
    const key = g1 * 65536 + g2;
    const hit = this.kernCache.get(key);
    if (hit !== undefined) return hit;
    let total = 0;
    for (const subs of this.kernLookups) {
      for (const f of subs) {
        const v = f(g1, g2);
        if (v !== null) {
          total += v;
          break;
        }
      }
    }
    this.kernCache.set(key, total);
    return total;
  }
}
