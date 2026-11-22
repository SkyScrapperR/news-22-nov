// Fonts and colours shared by the page and the drawings.

import { readFileSync } from 'node:fs';
import { Font } from './ttf.ts';
import { hex } from './raster.ts';
import type { RGB } from './raster.ts';
import type { Region, Badge } from './types.ts';

const font = (n: string) => new Font(readFileSync(new URL('../fonts/' + n, import.meta.url)));
export const F = {
  display: font('DMSerifDisplay-Regular.ttf'),
  serif: font('DMSerifText-Regular.ttf'),
  reg: font('Lato-Regular.ttf'),
  bold: font('Lato-Bold.ttf'),
  black: font('Lato-Black.ttf'),
};

export const COL = {
  paper: hex('#f7f2e6'),
  ink: hex('#151411'),
  soft: hex('#45423b'),
  muted: hex('#625d53'),
  rule: hex('#cfc7b2'),
  red: hex('#b4231b'),
  panel: hex('#ece4cf'),
  box: hex('#fffaf0'),
  orange: hex('#f2a65a'),
  water: hex('#d3e0e3'),
  land: hex('#c2ab7c'),
  coast: hex('#7a6340'),
};

export const REGION: Record<Region, { name: string; col: RGB }> = {
  EU: { name: 'Europe', col: hex('#1f5fa8') },
  ME: { name: 'Middle East', col: hex('#b04414') },
  AF: { name: 'Africa', col: hex('#1d7f52') },
  SA: { name: 'South Asia', col: hex('#8a5f00') },
  EA: { name: 'East Asia', col: hex('#a8457f') },
  SE: { name: 'SE Asia', col: hex('#1f6f9a') },
  AM: { name: 'Americas', col: hex('#6a3d9a') },
  OC: { name: 'Oceania', col: hex('#23705f') },
  GL: { name: 'Global', col: hex('#57534a') },
};
export const REGION_ORDER: Region[] = ['EU', 'ME', 'AF', 'SA', 'EA', 'SE', 'AM', 'OC', 'GL'];

export const BADGE: Record<Badge, { name: string; col: RGB; means: string }> = {
  C: { name: 'CONFIRMED', col: hex('#1f6f43'), means: '2+ independent outlets' },
  O: { name: 'OFFICIAL', col: hex('#22508f'), means: 'on the record: officials, agencies, results' },
  R: { name: 'REPORTED', col: hex('#7a5a12'), means: 'one major outlet' },
  K: { name: 'CLAIM', col: hex('#c2410c'), means: 'one side, unverified' },
};
