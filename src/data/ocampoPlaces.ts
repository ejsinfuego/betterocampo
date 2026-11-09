/** Public places in / near Ocampo with map coordinates from OSM / PhilAtlas. */

export type OcampoPlace = {
  id: string;
  name: string;
  barangay: string;
  note: string;
  lat: number;
  lng: number;
  kind: 'center' | 'spot';
  emoji: string;
  accent: string;
  blurb: string;
  /** Coordinate quality for honesty labeling. */
  precision: 'exact' | 'approximate';
};

/** Ocampo Municipal Hall (OSM amenity=townhall). */
export const OCAMPO_CENTER = {
  lat: 13.5573008,
  lng: 123.372209,
} as const;

export const ocampoPlaces: OcampoPlace[] = [
  {
    id: 'municipal-center',
    name: 'Ocampo Municipal Hall',
    barangay: 'Poblacion',
    note: 'Municipal Hall on OpenStreetMap — map focus and weather point.',
    lat: OCAMPO_CENTER.lat,
    lng: OCAMPO_CENTER.lng,
    kind: 'center',
    emoji: '🏛️',
    accent: '#005df5',
    blurb: 'Start here — the Municipal Hall in poblacion.',
    precision: 'exact',
  },
  {
    id: 'deer-farm',
    name: 'Ocampo Deer Farm',
    barangay: 'Villaflorida',
    note: 'OSM tourism pin on Hanawan–Consocep Road (often listed under Sta. Cruz).',
    lat: 13.603207,
    lng: 123.4228502,
    kind: 'spot',
    emoji: '🦌',
    accent: '#0B7F42',
    blurb: 'Meet the deer up the highland road toward Isarog.',
    precision: 'exact',
  },
  {
    id: 'bamboo-farm',
    name: 'Bamboo Farm',
    barangay: 'Hanawan',
    note: 'Approximate — no OSM pin yet; placed near Hanawan barangay hall.',
    lat: 13.575226,
    lng: 123.422925,
    kind: 'spot',
    emoji: '🎋',
    accent: '#15803d',
    blurb: 'A quiet grove of bamboo varieties in Hanawan.',
    precision: 'approximate',
  },
  {
    id: 'murokburok',
    name: 'Murokburok Spring',
    barangay: 'Gatbo',
    note: 'From public plus code H9PW+F3V (Gatbo, Ocampo).',
    lat: 13.5861875,
    lng: 123.3951875,
    kind: 'spot',
    emoji: '💧',
    accent: '#0284c7',
    blurb: 'Cool spring water in Gatbo — a local favorite dip.',
    precision: 'exact',
  },
  {
    id: 'strawberry-farm',
    name: 'Bicol Strawberry Farm',
    barangay: 'Pinit',
    note: 'Approximate — PhilAtlas Pinit barangay centroid (no OSM farm pin).',
    lat: 13.5665,
    lng: 123.4112,
    kind: 'spot',
    emoji: '🍓',
    accent: '#e11d48',
    blurb: 'Sweet highland berries when the season is right.',
    precision: 'approximate',
  },
  {
    id: 'consocep-gateway',
    name: 'Consocep Nature Park',
    barangay: 'Consocep, Tigaon',
    note: 'OSM pin in neighboring Tigaon — reached via Ocampo’s Hanawan–Consocep Road.',
    lat: 13.6155576,
    lng: 123.4240646,
    kind: 'spot',
    emoji: '⛰️',
    accent: '#b45309',
    blurb: 'Mountain park just past Ocampo — gateway is through Hanawan.',
    precision: 'exact',
  },
];

export const touristSpots = ocampoPlaces.filter(place => place.kind === 'spot');
