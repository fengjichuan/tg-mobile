/** GeoJSON geometry (subset of world.json) */
type Ring = number[][];
type GeoJsonGeom =
  | { type: 'Polygon'; coordinates: Ring[] }
  | { type: 'MultiPolygon'; coordinates: Ring[][] };

export type TrafficMapRow = {
  source_country?: string;
  destination_country?: string;
  total_bytes?: number;
  total_packets?: number;
  total_sessions?: number;
};

function ringCentroid(ring: Ring): [number, number] {
  let sx = 0;
  let sy = 0;
  const n = ring.length;
  if (n === 0) return [0, 0];
  for (const pt of ring) {
    sx += pt[0];
    sy += pt[1];
  }
  return [sx / n, sy / n];
}

function geometryCentroid(geom: GeoJsonGeom): [number, number] | null {
  if (geom.type === 'Polygon') {
    const outer = geom.coordinates[0];
    return outer ? ringCentroid(outer) : null;
  }
  if (geom.type === 'MultiPolygon') {
    let best: Ring | null = null;
    let bestLen = 0;
    for (const poly of geom.coordinates) {
      const outer = poly[0];
      if (outer && outer.length > bestLen) {
        bestLen = outer.length;
        best = outer;
      }
    }
    return best ? ringCentroid(best) : null;
  }
  return null;
}

/** Common country/region aliases → properties.name in world.json */
const COUNTRY_NAME_ALIASES: Record<string, string> = {
  US: 'United States',
  USA: 'United States',
  'United States of America': 'United States',
  UK: 'United Kingdom',
  GB: 'United Kingdom',
  CN: 'China',
  JP: 'Japan',
  KR: 'South Korea',
  KP: 'Dem. Rep. Korea',
  RU: 'Russia',
  VN: 'Vietnam',
  LA: "Lao People's Democratic Republic",
  IR: 'Iran',
  SY: 'Syria',
  PS: 'Palestine',
  CD: 'Democratic Republic of the Congo',
  TZ: 'Tanzania',
  BO: 'Bolivia',
  VE: 'Venezuela',
  TW: 'Taiwan',
  HK: 'China',
  MO: 'China',
};

function normalizePrivate(name: string): boolean {
  const n = name.trim().toLowerCase();
  return n === 'private network' || n === '' || n === 'unknown';
}

/**
 * Build map English name → capital/centroid [lng, lat] from ECharts world.json
 */
export function buildCountryCenters(worldGeo: {
  features: Array<{ properties?: { name?: string }; geometry: GeoJsonGeom }>;
}): Map<string, [number, number]> {
  const m = new Map<string, [number, number]>();
  for (const f of worldGeo.features || []) {
    const name = f.properties?.name;
    if (!name) continue;
    const c = geometryCentroid(f.geometry as GeoJsonGeom);
    if (c) m.set(name, c);
  }
  return m;
}

/** Map API country/region string to properties.name in world.json */
export function resolveGeoName(
  country: string,
  centers: Map<string, [number, number]>,
): string | null {
  if (!country || normalizePrivate(country)) return null;
  const raw = country.trim();
  if (centers.has(raw)) return raw;
  const alias = COUNTRY_NAME_ALIASES[raw.toUpperCase()] || COUNTRY_NAME_ALIASES[raw];
  if (alias && centers.has(alias)) return alias;
  const lower = raw.toLowerCase();
  for (const name of centers.keys()) {
    if (name.toLowerCase() === lower) return name;
  }
  for (const name of centers.keys()) {
    if (name.startsWith(raw) || raw.startsWith(name)) return name;
  }
  return null;
}

export function resolveCenter(
  country: string,
  centers: Map<string, [number, number]>,
): [number, number] | null {
  const name = resolveGeoName(country, centers);
  return name ? centers.get(name)! : null;
}

/** Sum traffic by source country for map coloring (same groupBy-fromName idea as PC formatData) */
export function aggregateSourceCountryBytes(
  list: TrafficMapRow[],
  centers: Map<string, [number, number]>,
): { name: string; value: number }[] {
  const byKey = new Map<string, number>();
  for (const item of list || []) {
    const src = item.source_country;
    const dst = item.destination_country;
    if (!src || !dst) continue;
    if (normalizePrivate(src) || normalizePrivate(dst)) continue;
    const geoName = resolveGeoName(src, centers);
    if (!geoName) continue;
    const add = Number(item.total_bytes) || 0;
    byKey.set(geoName, (byKey.get(geoName) || 0) + add);
  }
  return [...byKey.entries()]
    .map(([name, value]) => ({ name, value }))
    .filter((x) => x.value > 0);
}

export type LineDatum = {
  coords: [[number, number], [number, number]];
  total_bytes: number;
  fromName: string;
  toName: string;
};

export function buildFlowLines(
  list: TrafficMapRow[],
  centers: Map<string, [number, number]>,
  maxLines = 80,
): LineDatum[] {
  const out: LineDatum[] = [];
  for (const item of list || []) {
    if (out.length >= maxLines) break;
    const src = item.source_country;
    const dst = item.destination_country;
    if (!src || !dst) continue;
    if (normalizePrivate(src) || normalizePrivate(dst)) continue;
    const a = resolveCenter(src, centers);
    const b = resolveCenter(dst, centers);
    if (!a || !b) continue;
    const bytes = Number(item.total_bytes) || 0;
    const fromName = resolveGeoName(src, centers) || src;
    const toName = resolveGeoName(dst, centers) || dst;
    out.push({
      coords: [a, b],
      total_bytes: bytes,
      fromName,
      toName,
    });
  }
  return out;
}
