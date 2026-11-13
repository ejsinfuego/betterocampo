/** PSA census counts per barangay, as tabulated by PhilAtlas. Keyed by PSGC. */

export type BarangayPopulation = {
  pop2020: number;
  pop2015: number;
};

export const BARANGAY_POPULATION_SOURCE = {
  label: 'PSA 2015 and 2020 census via PhilAtlas',
  href: 'https://www.philatlas.com/luzon/r05/camarines-sur/ocampo.html',
};

export const OCAMPO_POP_2020 = 51073;

/** Residents represented by each dot in the hover overlay. */
export const PEOPLE_PER_DOT = 20;

/** People per km² and the fill color at that density. */
export const DENSITY_STOPS: [number, string][] = [
  [0, '#dbeafe'],
  [250, '#93c5fd'],
  [500, '#60a5fa'],
  [1000, '#2563eb'],
  [3000, '#1e3a8a'],
];

export const barangayPopulation: Record<string, BarangayPopulation> = {
  '0501725001': { pop2020: 2614, pop2015: 2939 }, // Ayugan
  '0501725002': { pop2020: 1558, pop2015: 1403 }, // Cabariwan
  '0501725003': { pop2020: 1952, pop2015: 1729 }, // Cagmanaba
  '0501725004': { pop2020: 1942, pop2015: 1781 }, // Del Rosario
  '0501725005': { pop2020: 3097, pop2015: 2659 }, // Gatbo
  '0501725006': { pop2020: 1761, pop2015: 1445 }, // Guinaban
  '0501725007': { pop2020: 3032, pop2015: 2407 }, // Hanawan
  '0501725008': { pop2020: 3355, pop2015: 2764 }, // Hibago
  '0501725009': { pop2020: 1866, pop2015: 1871 }, // La Purisima Nuevo
  '0501725010': { pop2020: 1946, pop2015: 1716 }, // May-Ogob
  '0501725011': { pop2020: 1706, pop2015: 1707 }, // New Moriones
  '0501725012': { pop2020: 2418, pop2015: 1992 }, // Old Moriones
  '0501725013': { pop2020: 4269, pop2015: 3920 }, // Pinit
  '0501725014': { pop2020: 1087, pop2015: 1131 }, // Poblacion Central
  '0501725015': { pop2020: 794, pop2015: 972 }, // Poblacion East
  '0501725016': { pop2020: 896, pop2015: 1088 }, // Poblacion West
  '0501725017': { pop2020: 2457, pop2015: 2462 }, // Salvacion
  '0501725018': { pop2020: 2759, pop2015: 2203 }, // San Antonio
  '0501725019': { pop2020: 3190, pop2015: 2478 }, // San Francisco
  '0501725020': { pop2020: 1835, pop2015: 1330 }, // San Jose Oras
  '0501725022': { pop2020: 1253, pop2015: 1124 }, // San Roque Commonal
  '0501725023': { pop2020: 2135, pop2015: 2193 }, // San Vicente
  '0501725024': { pop2020: 1202, pop2015: 879 }, // Santa Cruz
  '0501725025': { pop2020: 993, pop2015: 613 }, // Santo Niño
  '0501725026': { pop2020: 956, pop2015: 1128 }, // Villaflorida
};

const ranked = Object.entries(barangayPopulation).sort(
  ([, a], [, b]) => b.pop2020 - a.pop2020
);

export const BARANGAY_COUNT = ranked.length;
export const LARGEST_BARANGAY_POP = ranked[0][1].pop2020;

/** 1 = most populous barangay in 2020. */
export function populationRank(psgc: string): number {
  return ranked.findIndex(([code]) => code === psgc) + 1;
}
