// The day's stories: Sunday 22 November 2026. Every item happened, or was first reported, on that day
// (UTC, or the local date where it happened). Times are UTC.
import type { Content } from './types.ts';

export const content: Content = {
  dayLine: 'SUNDAY 22 NOVEMBER 2026',
  masthead: 'Sunday 22 November 2026',
  subtitle: ['COP31 runs into a second day of overtime', 'Iran starts rationing power', 'Verstappen wins in Las Vegas'],
  timeline: [
    { t: '01:00', label: 'Hong Kong votes', sub: 'Polls open, 9am local', region: 'EA' },
    { t: '03:00', label: 'COP31 deadline', sub: 'Last call for objections', region: 'GL' },
    { t: '04:00', label: 'Vegas GP starts', sub: '50 laps on the Strip', region: 'AM' },
    { t: '06:00', label: 'COP31 plenary', sub: 'Session to approve the text', region: 'GL' },
  ],
  figures: [
    { n: '2nd', cap: 'day of COP31 overtime', region: 'GL' },
    { n: '2 h', cap: 'power cuts at a time in Iran', region: 'ME' },
    { n: 'P3', cap: 'Piastri, from 17th on the grid', region: 'AM' },
    { n: '720-9', cap: 'India declare in Wellington', region: 'OC' },
    { n: '723', cap: 'seats in Hong Kong’s EC vote', region: 'EA' },
    { n: '97 s', cap: 'Semeru eruption, East Java', region: 'SE' },
  ],
  heroes: [
    {
      place: 'ANTALYA, TÜRKIYE', cat: 'CLIMATE', region: 'GL', badge: 'C',
      banner: 'COP31: OVERTIME', chip: 'Day 2 past the deadline · ~200 nations',
      head: 'COP31 runs into a second day of overtime over fossil fuels',
      sum: 'Hosts table a last-minute text: objections were due by 03:00 GMT, with a session at 06:00 GMT to approve it.',
      src: 'Al Jazeera · Reuters · DW · Sky News', lon: 30.71, lat: 36.9, art: 'cop', vals: { tag: 'APPROVAL SESSION 06:00 GMT' },
    },
    {
      place: 'TEHRAN, IRAN', cat: 'WAR · ENERGY', region: 'ME', badge: 'O',
      banner: 'IRAN: POWER CUTS', chip: 'Rationing starts Sunday',
      head: 'Iran begins rationing electricity as war damage bites',
      sum: 'The grid operator said cuts of about two hours a day or every two days start Sunday, blaming strikes on energy sites.',
      src: 'Iranian state TV via Reuters · Straits Times', lon: 51.39, lat: 35.69, art: 'grid', vals: { tag: 'ABOUT 2 HOURS AT A TIME' },
    },
    {
      place: 'KYIV REGION, UKRAINE', cat: 'WAR', region: 'EU', badge: 'O',
      banner: 'UKRAINE: DRONE NIGHT', chip: 'Apartment block hit in Vyshhorod',
      head: 'Russian drones hit a block of flats near Kyiv overnight',
      sum: 'The Kyiv region’s governor said a five-storey building in Vyshhorod was damaged; monitors report a Ukrainian strike on Krasnodar.',
      src: 'Kyiv region administration · Kyiv Independent', lon: 30.48, lat: 50.58, art: 'drones', vals: { tag: 'OVERNIGHT 21–22 NOV' },
    },
  ],
  tiles: [
    {
      place: 'LAS VEGAS', cat: 'FORMULA 1', region: 'AM', badge: 'O', banner: 'VEGAS GP', fact: 'P1 VER', cap: 'NORRIS 2ND · PIASTRI 3RD',
      head: 'Verstappen wins a thriller in Las Vegas', sum: 'Piastri climbs from 17th on the grid to third.',
      src: 'Race result · ABC (Aus)', lon: -115.17, lat: 36.11, art: 'car', vals: { bg: '#2a1f4a', acc: '#ff5a3c' },
    },
    {
      place: 'SEOUL', cat: 'EDUCATION', region: 'EA', badge: 'C', banner: 'MINISTER QUITS', fact: 'RESIGNS', cap: 'AI EXAM CHEATING',
      head: 'S. Korea’s education chief quits over AI cheating', sum: 'President Lee accepts Choi Kyo-jin’s resignation.',
      src: 'Reuters via CNA · Guardian', lon: 126.98, lat: 37.57, art: 'exam', vals: { bg: '#3a1f33', acc: '#ff5a3c' },
    },
    {
      place: 'HONG KONG', cat: 'POLITICS', region: 'EA', badge: 'O', banner: 'HK VOTES', fact: '723', cap: 'SEATS · 856 CANDIDATES',
      head: 'Hong Kong votes for its Election Committee', sum: 'Polls 9am–6pm in 31 contested subsectors.',
      src: 'HKSAR government', lon: 114.17, lat: 22.3, art: 'ballot', vals: { bg: '#4a1f38', acc: '#2e9e5b' },
    },
    {
      place: 'WELLINGTON', cat: 'CRICKET', region: 'OC', badge: 'O', banner: 'NZ v INDIA', fact: '720-9d', cap: 'NZ 33-1 AT TEA, DAY 4',
      head: 'India pile up 720 and declare in Wellington', sum: 'Bumrah strikes second ball; NZ trail by 319.',
      src: 'Reuters via CNA', lon: 174.78, lat: -41.29, art: 'cricket', vals: { bg: '#1d4a2c', acc: '#d9342b' },
    },
    {
      place: 'EAST JAVA', cat: 'VOLCANO', region: 'SE', badge: 'O', banner: 'ERUPTIONS', fact: '97 s', cap: 'SEMERU, 01:51 LOCAL',
      head: 'Semeru and Ibu volcanoes erupt hours apart', sum: 'Indonesia’s geology agency logs both blasts.',
      src: 'Geological Agency via Antara', lon: 112.92, lat: -8.11, art: 'volcano', vals: { bg: '#33241c', acc: '#ff7a2e' },
    },
    {
      place: 'CANBERRA', cat: 'DEFENCE', region: 'OC', badge: 'C', banner: 'AUKUS ROW', fact: 'REJECTS', cap: 'MARLES ON US CBO REPORT',
      head: 'Marles rejects US budget office on AUKUS subs', sum: 'He says the pact will not weaken the US Navy.',
      src: 'ABC (Aus) · Straits Times', lon: 149.13, lat: -35.28, art: 'sub', vals: { bg: '#14304a', acc: '#4fb3d9' },
    },
    {
      place: 'ISRAEL', cat: 'POLITICS', region: 'ME', badge: 'R', banner: 'COALITION', fact: 'TALKS', cap: 'YASHAR MEETS LIKUD',
      head: 'Eisenkot’s party sets coalition talks with Likud', sum: 'Teams due to meet on Sunday, the party says.',
      src: 'Yashar party via NDTV', lon: 35.21, lat: 31.77, art: 'handshake', vals: { bg: '#3d2a14', acc: '#ffb347' },
    },
    {
      place: 'BEIRUT', cat: 'DIPLOMACY', region: 'ME', badge: 'O', banner: 'LEBANON DAY', fact: '83 YEARS', cap: 'INDEPENDENCE DAY',
      head: 'Lebanon marks 83 years of independence', sum: 'Aoun’s eve speech demands an Israeli pullout.',
      src: 'Lebanese presidency · Al Jazeera', lon: 35.5, lat: 33.89, art: 'cedar', vals: { bg: '#2a2a2a', acc: '#d9342b' },
    },
    {
      place: 'KRASNODAR', cat: 'WAR', region: 'EU', badge: 'R', banner: 'STRIKE CLAIM', fact: 'CLAIMED', cap: 'ROSGVARDIA REGIONAL HQ',
      head: 'Ukraine drones reportedly hit Russian guard HQ', sum: 'Airport closed briefly; Kyiv has not commented.',
      src: 'Monitoring channels · Kyiv Independent', lon: 38.98, lat: 45.04, art: 'drone', vals: { bg: '#1f2a44', acc: '#ff5a3c' },
    },
    {
      place: 'AUSTRALIA', cat: 'HEALTH', region: 'OC', badge: 'O', banner: 'PEPTIDES', fact: 'INQUIRY', cap: 'AFTER HOSPITAL SURGE',
      head: 'Australia orders an inquiry into peptide sales', sum: 'Butler acts on unsafe online prescribing.',
      src: 'Health minister · ABC (Aus)', lon: 151.2, lat: -33.87, art: 'vial', vals: { bg: '#123c3a', acc: '#e0a030' },
    },
  ],
  briefs: [
    { place: 'Melbourne', cat: 'SPORT', region: 'OC', badge: 'O', head: '1956 Games turn 70; Olympians meet', src: 'ABC', lon: 144.96, lat: -37.81, art: '' },
    { place: 'Canberra', cat: 'SECURITY', region: 'OC', badge: 'R', head: 'Spy chief warns of AI data-centre risk', src: 'The Age', lon: 149.1, lat: -35.3, art: '' },
    { place: 'Gisborne', cat: 'ACCIDENT', region: 'OC', badge: 'O', head: 'One dead as a house slips off piles', src: 'NZ Police via RNZ', lon: 178.0, lat: -38.66, art: '' },
    { place: 'Halmahera', cat: 'VOLCANO', region: 'SE', badge: 'O', head: 'Mount Ibu erupts, ash plume rises', src: 'Antara', lon: 127.64, lat: 1.49, art: '' },
    { place: 'Padang', cat: 'QUAKE', region: 'SE', badge: 'O', head: 'M4.2 offshore quake, no tsunami risk', src: 'BMKG via Antara', lon: 100.4, lat: -1.3, art: '' },
    { place: 'Indonesia', cat: 'WEATHER', region: 'SE', badge: 'O', head: 'Heavy-rain alert for 8 provinces', src: 'BMKG via Antara', lon: 106.8, lat: -6.2, art: '' },
    { place: 'Kuala Lumpur', cat: 'POLITICS', region: 'SE', badge: 'R', head: 'Najib pardon papers declassified', src: 'Straits Times', lon: 101.69, lat: 3.14, art: '' },
    { place: 'New Delhi', cat: 'DIPLOMACY', region: 'SA', badge: 'R', head: 'Nepal PM Balen Shah begins India visit', src: 'HT', lon: 77.21, lat: 28.61, art: '' },
    { place: 'Dhaka', cat: 'WATER', region: 'SA', badge: 'R', head: 'India, Bangladesh meet on Ganges treaty', src: 'TOI', lon: 90.41, lat: 23.81, art: '' },
    { place: 'Hong Kong', cat: 'CRIME', region: 'EA', badge: 'O', head: 'Customs seize meth worth HK$7m', src: 'HK Customs', lon: 114.2, lat: 22.35, art: '' },
    { place: 'Darfur', cat: 'AID', region: 'AF', badge: 'R', head: 'Aid cuts leave displaced facing winter', src: 'Al Jazeera', lon: 25.35, lat: 13.63, art: '' },
    { place: 'Islamabad', cat: 'DIPLOMACY', region: 'SA', badge: 'R', head: 'Portugal’s foreign minister visits', src: 'Dawn', lon: 73.05, lat: 33.68, art: '' },
    { place: 'Antalya', cat: 'CLIMATE', region: 'GL', badge: 'C', head: 'Draft drops $120bn adaptation goal', src: 'Reuters', lon: 30.7, lat: 36.9, art: '' },
    { place: 'Parma, Ohio', cat: 'CRIME', region: 'AM', badge: 'R', head: '3 killed in event-venue shooting', src: 'TOI', lon: -81.72, lat: 41.4, art: '' },
  ],
  leftOut: 'El Chapo Isidro’s capture (Fri), Brazil supercell (Fri), Bahrain plant strike, Nigeria funeral-boat capsizing, Banten factory fire, NWSL final, Wallabies 29–26 Wales, BepiColombo at Mercury (all Sat)',
  notYet: 'COP31’s final vote, the Hong Kong count and Sunday’s late European sport, including the ATP Finals final in Turin',
  corrections: 'Corrections: none · COP31 text not public at press time',
  outlets: 'Each story dated from its outlet’s own report: Al Jazeera, Reuters, DW, Sky, ABC (Aus), CNA, Straits Times, Antara, Kyiv Independent, RNZ, Dawn, gov.hk',
};
