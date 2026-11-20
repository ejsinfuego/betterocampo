import type { FeatureCollection, Geometry } from 'geojson';

const BOUNDARY_URL = '/geo/ocampo-barangays.geojson';

let boundaries: Promise<FeatureCollection<Geometry>> | null = null;

/** One shared request. The homepage map and the flood map both need this file. */
export function loadBarangayBoundaries() {
  if (boundaries) return boundaries;

  boundaries = fetch(BOUNDARY_URL)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Barangay boundaries ${response.status}`);
      }
      return response.json() as Promise<FeatureCollection<Geometry>>;
    })
    .catch(error => {
      boundaries = null;
      throw error;
    });

  return boundaries;
}
