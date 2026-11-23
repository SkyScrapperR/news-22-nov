// The day's stories: Sunday 22 November 2026, ranked by consequence. Every item happened, or was first
// reported, on that day; times are UTC. Repeated figures (at least 7 dead, 186 drones, 1.95%, 400m, 720-9, 12 cars, 5.4) match
// wherever they appear. Timeline story numbers follow the order below (heroes 1-3, tiles 4-13, briefs 14-35).
import type { Content } from './types.ts';

export const content: Content = {
  dayLine: 'SUNDAY 22 NOVEMBER 2026',
  masthead: 'Sunday 22 November 2026',
  stamp: ['SUN', '22', 'NOV'],
  dayOfYear: 'DAY 326 OF 2026',
  fields: 10, // conflict, climate, politics, sport, markets, science & space, culture, health, crime, education
  subtitle: ['Drone strike kills at least 7 near Kyiv', 'COP31 climate talks collapse without a deal', 'Iran begins rolling blackouts'],
  timeline: [
    { t: '≈00:00', label: 'Drones hit Khartoum', short: 'Khartoum drones', story: 4, region: 'AF' },
    { t: '04:00', label: 'Vegas GP starts', short: 'Vegas GP starts', story: 7, region: 'AM' },
    { t: '12:23', label: 'Falcon 9 lifts off', short: 'Falcon 9 launch', story: 10, region: 'AM' },
    { t: '13:00', label: 'MotoGP decider', short: 'MotoGP decider', story: 6, region: 'EU' },
    { t: '≈15:50', label: 'Golden Horse top prize', short: 'Golden Horse prize', story: 11, region: 'EA' },
    { t: '16:30', label: 'Liverpool v Man Utd', short: 'Liverpool kick-off', story: 19, region: 'EU' },
    { t: '21:35', label: 'Peru M5.4 quake', short: 'Peru quake', story: 13, region: 'AM' },
  ],
  // the day in numbers: none of these is also a tile's key figure
  figures: [
    { n: '7+', cap: 'dead in Dymer strike (Kyiv Independent)', region: 'EU', story: 1 },
    { n: '186', cap: 'drones Russia fired at Ukraine overnight', region: 'EU', story: 1 },
    { n: '0', cap: 'deals adopted as COP31 talks collapse', region: 'GL', story: 2 },
    { n: '−1.95%', cap: 'Saudi stock index on Sunday', region: 'ME', story: 15 },
    { n: '400m', cap: 'captagon pills burned in Syria', region: 'ME', story: 17 },
  ],
  heroes: [
    {
      place: 'DYMER, KYIV', cat: 'WAR', region: 'EU', badge: 'C',
      banner: 'UKRAINE: BLOCK HIT', chip: 'At least 7 dead · 6 hurt · several trapped',
      caption: 'Five-storey block: a stairwell fell from top to ground',
      callouts: [
        { text: 'COLLAPSED', x: 8, y: 60, px: 226, py: 52 },
        { text: 'RESCUERS DIG', x: 8, y: 82, px: 196, py: 98 },
      ],
      head: 'Russian drone strike on flats near Kyiv kills at least 7',
      sum: 'Several still trapped; Kyiv says 161 of 186 drones downed.',
      src: 'Kyiv Independent · Reuters · Ukrinform', lon: 30.3, lat: 50.79, art: 'collapse',
    },
    {
      place: 'ANTALYA, TÜRKIYE', cat: 'CLIMATE', region: 'GL', badge: 'C',
      banner: 'COP31: NO DEAL', chip: 'Deal not adopted after two days of overtime',
      caption: 'Closing plenary: the president sees no agreement',
      callouts: [
        { text: 'EU REJECTS TEXT', x: 92, y: 70, px: 66, py: 84 },
        { text: '2 DAYS OVERTIME', x: 112, y: 92, px: 282, py: 70 },
      ],
      head: 'COP31 climate talks collapse without a deal',
      sum: 'The EU and others rejected a text that left out fossil fuels.',
      src: 'Reuters · DW · France 24', lon: 30.71, lat: 36.9, art: 'cop',
    },
    {
      place: 'TEHRAN, IRAN', cat: 'WAR · ENERGY', region: 'ME', badge: 'O',
      banner: 'IRAN: POWER CUTS', chip: 'Rolling blackouts start Sunday',
      caption: 'Cuts of about two hours at a time',
      callouts: [
        { text: 'LIGHTS OUT', x: 150, y: 64, px: 196, py: 100 },
      ],
      head: 'Iran begins rolling power cuts as war hits its energy grid',
      sum: 'Grid chief: two-hour cuts; president blames US, Israeli strikes.',
      src: 'Iran state TV · Reuters · AFP', lon: 51.39, lat: 35.69, art: 'grid',
    },
  ],
  tiles: [
    {
      place: 'KHARTOUM', cat: 'WAR', region: 'AF', badge: 'R', banner: 'SUDAN: DRONES', fact: '2.5', unit: 'HOURS',
      head: 'Witnesses say drones hit homes in Khartoum', sum: 'AFP: blasts ran 00:00–02:30 GMT.',
      src: 'AFP', lon: 32.53, lat: 15.59, art: 'drone', vals: { bg: '#3b2a1a', acc: '#ff5a3c', tag: 'AFP' },
    },
    {
      place: 'MANAMA', cat: 'WAR', region: 'ME', badge: 'O', banner: 'BAHRAIN: STRIKE', fact: '2', unit: 'INJURED',
      head: 'Bahrain says Iranian strike on a plant hurt two', sum: 'Saudi Arabia and Arab League condemn it.',
      src: 'Bahrain interior ministry · AFP', lon: 50.58, lat: 26.22, art: 'factory', vals: { bg: '#3d1f1a', acc: '#ff7a2e', tag: 'BAHRAIN GOVT' },
    },
    {
      place: 'PORTIMÃO', cat: 'MOTOGP', region: 'EU', badge: 'O', banner: 'MOTOGP: MÁRQUEZ', fact: '8th', unit: 'CROWN',
      head: 'Márquez clinches an eighth MotoGP title', sum: 'Bezzecchi wins the race in Portugal.',
      src: 'Race result · Crash.net', lon: -8.63, lat: 37.23, art: 'moto', vals: { bg: '#3a1416', acc: '#e8b62a', tag: 'RACE RESULT' },
    },
    {
      place: 'LAS VEGAS', cat: 'FORMULA 1', region: 'AM', badge: 'O', banner: 'VEGAS: VERSTAPPEN', fact: 'P1', unit: 'RED BULL',
      head: 'Verstappen wins the Las Vegas Grand Prix', sum: 'Norris 2nd; Piastri 3rd from 17th.',
      src: 'F1 result · ABC (Aus)', lon: -115.17, lat: 36.11, art: 'car', vals: { bg: '#2a1f4a', acc: '#ff5a3c', tag: 'F1 RESULT' },
    },
    {
      place: 'SEOUL', cat: 'EDUCATION', region: 'EA', badge: 'C', banner: 'SEOUL: MINISTER QUITS', fact: '111', unit: 'CASES',
      head: 'S. Korea’s education chief quits over AI cheating', sum: 'Officials logged 111 exam-day device cases.',
      src: 'Reuters · BBC · CNA', lon: 126.98, lat: 37.57, art: 'exam', vals: { bg: '#3a1f33', acc: '#ff5a3c', tag: 'REUTERS · BBC' },
    },
    {
      place: 'WEST BANK', cat: 'CONFLICT', region: 'ME', badge: 'C', banner: 'WEST BANK: ARSON', fact: '12', unit: 'CARS BURNED',
      head: 'Settlers torch cars in West Bank villages', sum: 'Eisenkot condemns it; police investigate.',
      src: 'Wafa · Al Jazeera · Arab News', lon: 35.25, lat: 31.95, art: 'flame', vals: { bg: '#3a2416', acc: '#ff7a2e', tag: 'WAFA · AJ' },
    },
    {
      place: 'VANDENBERG', cat: 'SPACE', region: 'AM', badge: 'R', banner: 'SPACE: NRO LAUNCH', fact: '12:23', unit: 'UTC',
      head: 'Falcon 9 launches a classified NRO mission', sum: 'NROL-136 lifts off from California.',
      src: 'Launch Library 2', lon: -120.6, lat: 34.74, art: 'rocket', vals: { bg: '#101c3a', acc: '#ff9a3c', tag: 'LAUNCH LOG' },
    },
    {
      place: 'TAIPEI', cat: 'FILM', region: 'EA', badge: 'O', banner: 'TAIPEI: GOLDEN HORSE', fact: '2', unit: 'OF 9 NODS WON',
      head: 'We Are Born Good wins Golden Horse best film', sum: 'CNA: Hong Kong drama also wins screenplay.',
      src: 'CNA', lon: 121.56, lat: 25.04, art: 'trophy', vals: { bg: '#3a2a10', acc: '#e8b62a', tag: 'CNA' },
    },
    {
      place: 'WELLINGTON', cat: 'CRICKET', region: 'OC', badge: 'O', banner: 'NZ v INDIA', fact: '720-9', unit: 'DEC',
      head: 'India declare on 720-9 against New Zealand', sum: 'NZ 2-119 at stumps, day 4: 233 behind.',
      src: 'Scorecard · ABC (Aus)', lon: 174.78, lat: -41.29, art: 'cricket', vals: { bg: '#1d4a2c', acc: '#d9342b', tag: 'SCORECARD' },
    },
    {
      place: 'PERU', cat: 'QUAKE', region: 'AM', badge: 'O', banner: 'PERU: QUAKE', fact: '5.4', unit: 'MAGNITUDE',
      head: 'M5.4 quake shakes Peru’s central Andes', sum: 'USGS: near Carhuamayo, 117 km deep.',
      src: 'USGS', lon: -76.02, lat: -10.83, art: 'quake', vals: { bg: '#3a2a1e', acc: '#ff7a2e', tag: 'USGS' },
    },
  ],
  briefs: [
    { place: 'Riyadh', cat: '', region: 'ME', badge: 'O', head: 'Houthi drone downed', src: 'Arab News', lon: 46.7, lat: 24.7, art: '' },
    { place: 'Riyadh', cat: '', region: 'ME', badge: 'O', head: 'Saudi stocks −1.95%', src: 'Tadawul', lon: 46.6, lat: 24.6, art: '' },
    { place: 'Sanaa', cat: '', region: 'ME', badge: 'K', head: 'Houthis claim 6 hurt', src: 'Saba via Al Jazeera', lon: 44.21, lat: 15.37, art: '' },
    { place: 'Syria', cat: '', region: 'ME', badge: 'O', head: '400m captagon pills burned', src: 'AFP', lon: 36.29, lat: 33.51, art: '' },
    { place: 'Turin', cat: '', region: 'EU', badge: 'O', head: 'Alcaraz beats Zverev in final', src: 'ATP', lon: 7.69, lat: 45.07, art: '' },
    { place: 'Liverpool', cat: '', region: 'EU', badge: 'O', head: '4-0 v 10-man Man Utd', src: 'Premier League', lon: -2.96, lat: 53.43, art: '' },
    { place: 'Geneva', cat: '', region: 'EU', badge: 'R', head: 'Chess title match opens', src: 'EFE', lon: 6.14, lat: 46.2, art: '' },
    { place: 'London', cat: '', region: 'EU', badge: 'C', head: 'May: move on from Brexit', src: 'Reuters', lon: -0.13, lat: 51.5, art: '' },
    { place: 'Krasnodar', cat: '', region: 'EU', badge: 'R', head: 'Guard HQ hit, KI says', src: 'Kyiv Independent', lon: 38.98, lat: 45.04, art: '' },
    { place: 'S. Africa', cat: '', region: 'AF', badge: 'O', head: 'Two held after shooting', src: 'SA police', lon: 19.44, lat: -33.65, art: '' },
    { place: 'Darfur', cat: '', region: 'AF', badge: 'R', head: 'AJ: aid cuts hit displaced', src: 'Al Jazeera', lon: 25.35, lat: 13.63, art: '' },
    { place: 'Lahore', cat: '', region: 'SA', badge: 'R', head: 'AQI tops 500, Dawn says', src: 'Dawn', lon: 74.35, lat: 31.55, art: '' },
    { place: 'New Delhi', cat: '', region: 'SA', badge: 'C', head: 'Nepal PM visits India', src: 'HT · EFE', lon: 77.21, lat: 28.61, art: '' },
    { place: 'Islamabad', cat: '', region: 'SA', badge: 'O', head: 'Portugal FM arrives', src: 'Pakistan FO', lon: 73.05, lat: 33.68, art: '' },
    { place: 'Hong Kong', cat: '', region: 'EA', badge: 'O', head: 'Election panel votes', src: 'gov.hk', lon: 114.17, lat: 22.3, art: '' },
    { place: 'Seoul', cat: '', region: 'EA', badge: 'O', head: 'Cyber token transfers halted', src: 'Cointelegraph', lon: 127.03, lat: 37.5, art: '' },
    { place: 'Hong Kong', cat: '', region: 'EA', badge: 'O', head: 'HK$7m of meth seized', src: 'HK Customs', lon: 114.2, lat: 22.35, art: '' },
    { place: 'Indonesia', cat: '', region: 'SE', badge: 'O', head: 'Rain alert, 8 provinces', src: 'BMKG', lon: 110.4, lat: -7.0, art: '' },
    { place: 'Canberra', cat: '', region: 'OC', badge: 'C', head: 'Marles rejects US report', src: 'ABC · ST', lon: 149.13, lat: -35.28, art: '' },
    { place: 'Australia', cat: '', region: 'OC', badge: 'O', head: 'Peptide sales inquiry', src: 'Health minister', lon: 151.2, lat: -33.87, art: '' },
    { place: 'Oaxaca', cat: '', region: 'AM', badge: 'O', head: 'M4.3 quake, SSN says', src: 'SSN via Infobae', lon: -95.09, lat: 16.04, art: '' },
    { place: 'US', cat: '', region: 'AM', badge: 'R', head: 'Anthropic IPO irked banks', src: 'Reuters', lon: -74.0, lat: 40.71, art: '' },
  ],
  leftOut: 'Baltic ship strike, Copa Sudamericana final, Banten fire, NWSL final, BepiColombo at Mercury (all Sat); Semeru eruption (18:51 UTC Sat); Kraken $17k bitcoin flash (Fri–Sat); El Chapo’s son Isidro held (Fri); Indonesia joined IARC (24 Sep)',
  notYet: 'NZ v India Test, day 5',
  corrections: 'Dymer toll rose through the day to at least 7 (Kyiv Independent, by 24:00 UTC); it rose further after midnight UTC.',
  outlets: 'Reuters, Kyiv Independent, AFP, EFE, Al Jazeera, BBC, DW, France 24, Ukrinform, CNA, Arab News, ABC, Dawn, HT, USGS, ATP.',
  method: 'Method: 35 stories, each dated 22 Nov 2026 from its outlet’s own report, ranked by consequence; times UTC.',
};
