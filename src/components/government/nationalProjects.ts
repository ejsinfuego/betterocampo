/** Barangay names in the NAMRIA boundary file, longest first. */
const BARANGAY_NAMES = [
  'San Roque Commonal',
  'La Purisima Nuevo',
  'Poblacion Central',
  'San Jose Oras',
  'Poblacion West',
  'Poblacion East',
  'Old Moriones',
  'New Moriones',
  'San Francisco',
  'San Antonio',
  'Santa Cruz',
  'San Vicente',
  'Del Rosario',
  'Villaflorida',
  'Cagmanaba',
  'Cabariwan',
  'Guinaban',
  'Hanawan',
  'Hibago',
  'Ayugan',
  'Gatbo',
  'Pinit',
  'Salvacion',
  'Santo Niño',
  'May-Ogob',
];

function alias(spelling: string, name = spelling): [string, string] {
  return [spelling, name];
}

/** GAA spellings that are not the PSGC name. Longest spelling wins. */
const ALIASES: [string, string][] = [
  ...BARANGAY_NAMES.map(name => alias(name)),
  alias('Man-Ogob', 'May-Ogob'),
];
ALIASES.sort((a, b) => b[0].length - a[0].length);

export type NationalProject = {
  id: string;
  year: number;
  status: 'enacted' | 'proposal';
  agency: string;
  amount: number | null;
  detail?: string;
  line: string;
  href?: string;
  barangays: string[];
};

function cellsOf(line: string): string[] | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|')) return null;
  return trimmed
    .split('|')
    .slice(1, -1)
    .map(cell => cell.trim());
}

function isDivider(cells: string[]): boolean {
  return cells.every(cell => /^:?-+:?$/.test(cell));
}

function parseAmount(cell: string): number | null {
  if (!cell || cell === '—' || cell === '-') return null;
  const amount = Number(cell.replace(/,/g, ''));
  return Number.isFinite(amount) ? amount : null;
}

function unlink(cell: string): { text: string; href?: string } {
  const match = cell.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  if (!match) return { text: cell };
  return { text: match[1], href: match[2] };
}

/**
 * Barangays a budget line actually places work in.
 * A "Barangay …" mention wins, so "Hibago River … Barangay Pinit" stays in
 * Pinit. Santo Niño followed by Pili is the neighboring town, not Ocampo.
 */
export function barangaysNamedIn(line: string): string[] {
  const lower = line.toLowerCase();
  const hits: { name: string; index: number; explicit: boolean }[] = [];

  for (const [alias, name] of ALIASES) {
    const needle = alias.toLowerCase();
    let from = 0;
    while (from < lower.length) {
      const index = lower.indexOf(needle, from);
      if (index < 0) break;
      const after = lower.slice(index + needle.length);
      if (name === 'Santo Niño' && /^,\s*pili\b/.test(after)) {
        from = index + needle.length;
        continue;
      }
      const before = lower.slice(0, index);
      hits.push({
        name,
        index,
        explicit: /barangay\s+$/.test(before),
      });
      from = index + needle.length;
    }
  }

  const explicit = hits.filter(hit => hit.explicit);
  const chosen = explicit.length > 0 ? explicit : hits;
  const seen = new Set<string>();
  return chosen
    .sort((a, b) => a.index - b.index)
    .flatMap(hit => {
      if (seen.has(hit.name)) return [];
      seen.add(hit.name);
      return [hit.name];
    });
}

/** Drop the title and opening paragraph. The page header shows those. */
export function projectsBody(markdown: string): string {
  const withoutTitle = markdown.replace(/^#\s+[^\n]+\n+/, '');
  const [, ...rest] = withoutTitle.split(/\n\n/);
  return rest.join('\n\n').trim();
}

export function parseNationalProjects(markdown: string): NationalProject[] {
  const projects: NationalProject[] = [];
  let mode: 'enacted' | 'proposal' | null = null;

  for (const raw of markdown.split('\n')) {
    const cells = cellsOf(raw);
    if (!cells || isDivider(cells)) continue;

    if (cells[0] === 'Year') {
      mode = 'enacted';
      continue;
    }
    if (cells[0] === 'Program') {
      mode = 'proposal';
      continue;
    }
    if (!mode) continue;

    if (mode === 'enacted' && cells.length >= 4) {
      const year = Number(cells[0]);
      if (!Number.isFinite(year)) continue;
      const linked = unlink(cells[3]);
      projects.push({
        id: `enacted-${year}-${projects.length}`,
        year,
        status: 'enacted',
        agency: cells[1],
        amount: parseAmount(cells[2]),
        line: linked.text,
        href: linked.href,
        barangays: barangaysNamedIn(linked.text),
      });
      continue;
    }

    if (mode === 'proposal' && cells.length >= 5) {
      const linked = unlink(cells[4]);
      projects.push({
        id: `proposal-${projects.length}`,
        year: 2027,
        status: 'proposal',
        agency: cells[0],
        amount: parseAmount(cells[3]),
        detail: cells[1],
        line: linked.text,
        href: linked.href,
        barangays: barangaysNamedIn(linked.text),
      });
    }
  }

  return projects;
}

export function projectsByBarangay(
  projects: NationalProject[]
): [string, NationalProject[]][] {
  const grouped = new Map<string, NationalProject[]>();
  for (const project of projects) {
    for (const name of project.barangays) {
      const list = grouped.get(name) ?? [];
      list.push(project);
      grouped.set(name, list);
    }
  }
  return [...grouped.entries()].sort(
    (a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])
  );
}

/** One hover bar stands for this many pesos. */
export const PESOS_PER_BAR = 1_000_000;

export function budgetTotal(lines: NationalProject[]): number {
  return lines.reduce((sum, line) => sum + (line.amount ?? 0), 0);
}

/** Bars for the projects-map lift. A named barangay with no pesos still gets one. */
export function budgetBarCount(lines: NationalProject[]): number {
  if (lines.length === 0) return 0;
  return Math.max(1, Math.round(budgetTotal(lines) / PESOS_PER_BAR));
}
