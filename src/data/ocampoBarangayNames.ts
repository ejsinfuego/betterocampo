/** Official barangay names for Ocampo, Camarines Sur (25 barangays). */
export const OCAMPO_BARANGAY_NAMES = [
  'Ayugan',
  'Cabariwan',
  'Cagmanaba',
  'Del Rosario',
  'Gatbo',
  'Guinaban',
  'Hanawan',
  'Hibago',
  'La Purisima Nuevo',
  'May-Ogob',
  'New Moriones',
  'Old Moriones',
  'Pinit',
  'Poblacion Central',
  'Poblacion East',
  'Poblacion West',
  'Salvacion',
  'San Antonio',
  'San Francisco',
  'San Jose Oras',
  'San Roque Commonal',
  'San Vicente',
  'Santa Cruz',
  'Santo Niño',
  'Villaflorida',
] as const;

export type OcampoBarangayName = (typeof OCAMPO_BARANGAY_NAMES)[number];

/** Approximate municipal center for map defaults. */
export const OCAMPO_MAP_CENTER = {
  lng: 123.376,
  lat: 13.559,
} as const;
