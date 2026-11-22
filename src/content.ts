// The day's stories. (Placeholder copy for layout testing; replaced by the researched stories.)
import type { Content, Story, Region } from './types.ts';

const ph = (i: number, region: Region, lon: number, lat: number, art: string): Story => ({
  place: ['KYIV', 'GAZA', 'LAGOS', 'DHAKA', 'TOKYO', 'JAKARTA', 'BRASÍLIA', 'SYDNEY', 'GENEVA'][i % 9],
  cat: ['CONFLICT', 'DIPLOMACY', 'DISASTER', 'MARKETS', 'SPORT', 'CLIMATE'][i % 6],
  region,
  badge: (['C', 'O', 'R'] as const)[i % 3],
  head: 'Placeholder headline of a typical length for story ' + i,
  sum: 'A summary line that says what happened, who said it and the key figure.',
  src: 'Reuters · AP',
  lon,
  lat,
  art,
  fact: ['6.2', '−4%', '3–1', '41', 'P1'][i % 5],
  cap: 'MAGNITUDE',
});

const regs: Array<[Region, number, number]> = [
  ['EU', 30.5, 50.4], ['ME', 34.4, 31.5], ['AF', 3.4, 6.5], ['SA', 90.4, 23.8], ['EA', 139.7, 35.7],
  ['SE', 106.8, -6.2], ['AM', -47.9, -15.8], ['OC', 151.2, -33.9], ['GL', 6.1, 46.2],
];
const arts = ['quake', 'missile', 'drone', 'ship', 'ballot', 'flame', 'chartdown', 'ball', 'trophy', 'storm', 'flood', 'handshake', 'gavel', 'plane', 'car', 'globe'];
const mk = (i: number) => ph(i, regs[i % 9][0], regs[i % 9][1] + (i % 4) * 2, regs[i % 9][2] - (i % 3) * 2, arts[i % arts.length]);

export const content: Content = {
  dayLine: 'SUNDAY 22 NOVEMBER 2026',
  masthead: 'Sunday 22 November 2026',
  subtitle: ['Lead story one', 'lead story two', 'lead story three'],
  timeline: [
    { t: '02:14', label: 'Quake', sub: 'M6.2, 10 km deep', region: 'SE' },
    { t: '07:30', label: 'Talks open', sub: 'Ministers meet', region: 'EU' },
    { t: '11:05', label: 'Strike', sub: 'Two killed, army says', region: 'ME' },
    { t: '15:00', label: 'Final', sub: 'Kick-off, 3–1 result', region: 'AM' },
    { t: '20:45', label: 'Vote closes', sub: 'Turnout 61%', region: 'AF' },
  ],
  figures: [
    { n: '6.2', cap: 'magnitude, placeholder', region: 'SE' },
    { n: '41', cap: 'killed, placeholder', region: 'ME' },
    { n: '−4%', cap: 'index fall, placeholder', region: 'EA' },
    { n: '3–1', cap: 'final score, placeholder', region: 'AM' },
    { n: '61%', cap: 'turnout, placeholder', region: 'AF' },
    { n: '$2bn', cap: 'pledged, placeholder', region: 'GL' },
  ],
  heroes: [0, 1, 2].map((i) => ({ ...mk(i), banner: 'PLACE: TOPIC ' + (i + 1), chip: 'Key figure · second figure' })),
  tiles: Array.from({ length: 10 }, (_, i) => mk(i + 3)),
  briefs: Array.from({ length: 22 }, (_, i) => ({ ...mk(i + 13), head: 'A short brief line about story ' + (i + 14) })),
  leftOut: 'placeholder items from the day before',
  notYet: 'placeholder items scheduled after the UTC day',
  corrections: 'Corrections: none yet',
  outlets: 'Dated from the outlets’ own reports: placeholder list of outlets',
};
