export interface ContactFields {
  email?: string;
  emailNote?: string;
  phone?: string;
  phoneNote?: string;
}

export interface LegislativeMember extends ContactFields {
  name: string;
  role?: string;
}

export interface LegislativeRoster {
  term: string;
  summary?: string;
  registeredVoters: string;
  mayor: {
    office: string;
    name: string;
    votes: string;
  };
  presiding: {
    office: string;
    name: string;
    votes: string;
    note: string;
  } & ContactFields;
  council: LegislativeMember[];
  exOfficio: LegislativeMember[];
  secretariat: LegislativeMember[];
  districtRepresentative: {
    name: string;
    district: string;
  };
  sources: Array<{
    label: string;
    url?: string;
    note?: string;
  }>;
  missingNote: string;
}

function sectionBody(markdown: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Avoid /m: under multiline mode `$` matches every line end and truncates.
  const re = new RegExp(
    `(?:^|\\n)##\\s+${escaped}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`
  );
  const match = markdown.match(re);
  return match?.[1]?.trim() ?? '';
}

function bulletLines(body: string): string[] {
  return body
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('- '))
    .map(line => line.slice(2).trim());
}

function isEmail(value: string): boolean {
  return value.includes('@');
}

function isPhone(value: string): boolean {
  return /^0\d/.test(value.replace(/[()\s-]/g, ''));
}

function parsePhone(value: string): { phone: string; phoneNote?: string } {
  const noteMatch = value.match(/^(.+?)\s*\((.+)\)\s*$/);
  if (noteMatch) {
    return {
      phone: noteMatch[1].trim(),
      phoneNote: noteMatch[2].trim(),
    };
  }
  return { phone: value.trim() };
}

function parseMemberLine(line: string): LegislativeMember {
  const parts = line
    .split(/\s+[—–]\s+/)
    .map(part => part.trim())
    .filter(Boolean);

  const member: LegislativeMember = { name: parts[0] ?? line };

  for (const part of parts.slice(1)) {
    if (isEmail(part)) {
      member.email = part;
      continue;
    }
    if (isPhone(part)) {
      Object.assign(member, parsePhone(part));
      continue;
    }
    if (!member.role) {
      member.role = part;
    }
  }

  return member;
}

function parseOfficerTable(body: string): {
  mayor?: { name: string; votes: string };
  viceMayor?: {
    name: string;
    votes: string;
    email?: string;
    phone?: string;
    phoneNote?: string;
  };
} {
  const rows = body
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('|') && !/^\|\s*-+/.test(line));

  const result: {
    mayor?: { name: string; votes: string };
    viceMayor?: {
      name: string;
      votes: string;
      email?: string;
      phone?: string;
      phoneNote?: string;
    };
  } = {};

  for (const row of rows) {
    const cells = row
      .split('|')
      .map(cell => cell.trim())
      .filter(Boolean);
    if (cells.length < 3) continue;
    const [office, name, votes, email = '', contact = ''] = cells;
    if (/^office$/i.test(office)) continue;

    const contactFields: ContactFields = {};
    if (email && isEmail(email)) contactFields.email = email;
    if (contact) Object.assign(contactFields, parsePhone(contact));

    if (/mayor/i.test(office) && !/vice/i.test(office)) {
      result.mayor = { name, votes };
    } else if (/vice\s*mayor/i.test(office)) {
      result.viceMayor = { name, votes, ...contactFields };
    }
  }

  return result;
}

function parseSources(body: string): LegislativeRoster['sources'] {
  return bulletLines(body).map(line => {
    const linkMatch = line.match(/^\[([^\]]+)\]\(([^)]+)\)\s*[.,—–-]?\s*(.*)$/);
    if (linkMatch) {
      const note = linkMatch[3].replace(/^[.,\s]+/, '').trim();
      return {
        label: linkMatch[1],
        url: linkMatch[2],
        ...(note ? { note } : {}),
      };
    }

    const plain = parseMemberLine(line);
    if (plain.role) {
      return { label: plain.name, note: plain.role };
    }
    return { label: line };
  });
}

/**
 * Builds the chamber roster UI model from legislative.md.
 * Returns null when required sections are missing so Document can fall back
 * to plain markdown rendering.
 */
export function parseLegislativeMarkdown(
  markdown: string
): LegislativeRoster | null {
  const summaryMatch = markdown.match(/^#\s+.+$\n\n(.+?)(?:\n\n|$)/m);
  const summary = summaryMatch?.[1]?.trim();

  const termMatch = markdown.match(/^Term:\s*(.+)$/m);
  const term = termMatch?.[1]?.trim();
  if (!term) return null;

  const officerBody = sectionBody(markdown, 'Mayor and presiding officer');
  const { mayor, viceMayor } = parseOfficerTable(officerBody);
  if (!mayor || !viceMayor) return null;

  const votersMatch = officerBody.match(
    /Registered voters[^:]*:\s*(\d{1,3}(?:,\d{3})*)/i
  );
  const registeredVoters = votersMatch?.[1] ?? '';

  const council = bulletLines(sectionBody(markdown, 'Municipal council')).map(
    parseMemberLine
  );
  if (council.length === 0) return null;

  const exOfficio = bulletLines(sectionBody(markdown, 'Ex-officio members'))
    .map(parseMemberLine)
    .filter(item => item.name && item.role);
  if (exOfficio.length === 0) return null;

  const secretariat = bulletLines(
    sectionBody(markdown, 'Sangguniang Bayan secretariat')
  )
    .map(parseMemberLine)
    .filter(item => item.name && item.role);

  const districtBody = sectionBody(markdown, 'District representative');
  const districtMatch = districtBody.match(/^([^,]+),\s*([^,]+?)(?:,|\.|$)/m);
  if (!districtMatch) return null;

  const sources = parseSources(sectionBody(markdown, 'Sources'));
  const missingMatch = markdown.match(
    /This page does not list appointed department heads[\s\S]*$/m
  );

  return {
    term,
    summary,
    registeredVoters,
    mayor: {
      office: 'Mayor',
      name: mayor.name,
      votes: mayor.votes,
    },
    presiding: {
      office: 'Vice Mayor',
      name: viceMayor.name,
      votes: viceMayor.votes,
      note: 'Presides over the Sangguniang Bayan',
      email: viceMayor.email,
      phone: viceMayor.phone,
      phoneNote: viceMayor.phoneNote,
    },
    council,
    exOfficio,
    secretariat,
    districtRepresentative: {
      name: districtMatch[1].trim(),
      district: districtMatch[2].trim(),
    },
    sources,
    missingNote:
      missingMatch?.[0]?.trim() ??
      'This page does not list appointed department heads.',
  };
}

function person(name: string, jobTitle: string) {
  return { '@type': 'Person', name, jobTitle };
}

/** Title, description, and structured data for the legislative roster page. */
export function legislativePageMeta(
  roster: LegislativeRoster,
  pageUrl: string,
  siteUrl: string
) {
  const title = 'LGU Ocampo legislative';
  const officialName = 'Legislative Department of Ocampo, Camarines Sur';
  const description = `LGU Ocampo legislative department for Camarines Sur (Cam Sur): the Sangguniang Bayan for ${roster.term}. ${roster.mayor.office} ${roster.mayor.name}, ${roster.presiding.office} ${roster.presiding.name}, council, ex-officio members, and secretariat.`;
  const members = [
    person(roster.mayor.name, roster.mayor.office),
    person(
      roster.presiding.name,
      `${roster.presiding.office}, presiding officer`
    ),
    ...roster.council.map(member =>
      person(member.name, 'Sangguniang Bayan member')
    ),
    ...roster.exOfficio.map(member =>
      person(member.name, member.role ?? 'Ex-officio member')
    ),
    ...roster.secretariat.map(member =>
      person(member.name, member.role ?? 'Secretariat')
    ),
    person(
      roster.districtRepresentative.name,
      `Representative, ${roster.districtRepresentative.district}`
    ),
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': pageUrl,
        url: pageUrl,
        name: officialName,
        description,
        inLanguage: 'en',
        isPartOf: {
          '@type': 'WebSite',
          name: 'Better Ocampo',
          url: siteUrl,
        },
        about: { '@id': `${pageUrl}#sangguniang-bayan` },
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${siteUrl}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Government',
            item: `${siteUrl}/government`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Departments',
            item: `${siteUrl}/government/departments`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: officialName,
            item: pageUrl,
          },
        ],
      },
      {
        '@type': 'GovernmentOrganization',
        '@id': `${pageUrl}#sangguniang-bayan`,
        name: officialName,
        alternateName: [
          'LGU Ocampo legislative',
          'Sangguniang Bayan of Ocampo',
          'Legislative Department of Ocampo',
          'SB Ocampo Cam Sur',
        ],
        member: members,
        areaServed: {
          '@type': 'AdministrativeArea',
          name: 'Municipality of Ocampo, Camarines Sur, Philippines',
        },
      },
    ],
  };

  return {
    title,
    description,
    keywords:
      'lgu ocampo legislative, LGU Ocampo legislative, legislative department, Sangguniang Bayan, Ocampo, Camarines Sur, Cam Sur, municipal council, Vice Mayor',
    jsonLd: JSON.stringify(jsonLd),
  };
}
