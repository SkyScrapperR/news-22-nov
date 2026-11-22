// Content model of the page.

export type Region = 'EU' | 'ME' | 'AF' | 'SA' | 'EA' | 'SE' | 'AM' | 'OC' | 'GL';
export type Badge = 'C' | 'O' | 'R'; // CONFIRMED, OFFICIAL, REPORTED

export type Story = {
  place: string; // kicker place, e.g. "UKRAINE"
  cat: string; // kicker category, e.g. "CONFLICT"
  region: Region;
  badge: Badge;
  head: string; // headline
  sum?: string; // summary (heroes: two lines; tiles: one line)
  src: string; // outlets
  lon: number;
  lat: number;
  // heroes
  banner?: string; // PLACE: TOPIC, 2-3 words
  chip?: string; // key figures, 3-5 words
  // tiles
  fact?: string; // big key fact
  cap?: string; // caption under the fact
  // illustration
  art: string;
  // optional numbers the art may show
  vals?: Record<string, number | string>;
};

export type TimeEvent = { t: string; label: string; sub: string; region: Region };
export type Figure = { n: string; cap: string; region: Region };

export type Content = {
  dayLine: string; // "SUNDAY 22 NOVEMBER 2026"
  masthead: string; // "Sunday 22 November 2026"
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
};
