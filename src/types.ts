// Content model of the page. Stories are listed in order of consequence: heroes, then tiles, then briefs.

export type Region = 'EU' | 'ME' | 'AF' | 'SA' | 'EA' | 'SE' | 'AM' | 'OC' | 'GL';
// CONFIRMED, OFFICIAL, REPORTED, CLAIM (one side's unverified claim)
export type Badge = 'C' | 'O' | 'R' | 'K';

// a red label inside a hero drawing, with a leader to the point it names (coordinates relative to the art)
export type Callout = { text: string; x: number; y: number; px: number; py: number };

export type Story = {
  place: string; // kicker place, e.g. "UKRAINE"
  cat: string; // kicker category, e.g. "CONFLICT"
  region: Region;
  badge: Badge;
  head: string; // headline (briefs: 4-7 words)
  sum?: string; // summary (heroes: two lines; tiles: one line)
  src: string; // outlets
  lon: number;
  lat: number;
  banner?: string; // PLACE: TOPIC, 2-3 words (heroes and tiles)
  chip?: string; // hero: key figures, 3-5 words
  caption?: string; // hero: what the drawing shows (black bar)
  callouts?: Callout[]; // hero: red labels pointing into the drawing
  fact?: string; // tile: the huge figure
  unit?: string; // tile: its unit label, e.g. "DEAD"
  art: string;
  field?: string; // the field of news, one word, e.g. "War"; the top line counts the distinct ones
  label?: string; // E: the one label inside the art (heroes) or the key figure on the art (tiles)
  lede?: string; // E: a fuller two-line hero summary with figures
  vals?: Record<string, number | string>;
};

export type TimeEvent = { t: string; label: string; short?: string; story?: number; region: Region };
export type Figure = { n: string; cap: string; region: Region; story?: number };

export type Content = {
  dayLine: string; // "SUNDAY 22 NOVEMBER 2026"
  masthead: string; // "Sunday 22 November 2026"
  stamp: [string, string, string]; // ["SUN", "22", "NOV"]
  dayOfYear: string; // "DAY 326 OF 2026"
  fields?: number; // how many fields of news the stories cover
  subtitle: string[];
  timeline: TimeEvent[];
  figures: Figure[];
  heroes: Story[];
  tiles: Story[];
  briefs: Story[];
  leftOut: string;
  notYet: string;
  corrections: string;
  outlets: string;
  method: string;
};
