export interface ExecutiveOfficial {
  name: string;
  phone?: string;
  phoneNote?: string;
  email?: string;
  photo?: string;
  elected?: string;
  bio?: string;
}

export interface ExecutiveField {
  label: string;
  value: string;
}

export interface ExecutiveGroup {
  title: string;
  items: string[];
}

export interface ExecutiveProfile {
  summary?: string;
  governmentName: string;
  yearElected: string;
  mayor: ExecutiveOfficial;
  viceMayor: ExecutiveOfficial;
  responsibilities: string[];
  inviteIntro?: string;
  inviteRequirements: string[];
  contact: {
    address?: string;
    website?: string;
    facebook?: string;
  };
  bac?: {
    source?: string;
    fields: ExecutiveField[];
    note?: string;
  };
  postingSites?: {
    source?: string;
    sites: string[];
  };
  complex?: {
    source?: string;
    groups: ExecutiveGroup[];
    note?: string;
  };
  sources: Array<{
    label: string;
    url?: string;
    note?: string;
  }>;
  missingNote?: string;
}

function sectionBody(markdown: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

function fieldMap(body: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const line of bulletLines(body)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (key && value) map[key] = value;
  }
  return map;
}

function proseAfterBullets(body: string): string {
  const lines = body.split('\n').map(line => line.trim());
  const prose: string[] = [];
  let pastBullets = false;
  for (const line of lines) {
    if (line.startsWith('- ')) {
      pastBullets = true;
      continue;
    }
    if (!pastBullets && !line) continue;
    if (pastBullets && line) prose.push(line);
  }
  return prose.join(' ').replace(/\*\*/g, '').trim();
}

function labeledFields(body: string): ExecutiveField[] {
  return bulletLines(body).flatMap(line => {
    const idx = line.indexOf(':');
    if (idx === -1) return [];
    const label = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    return label && value ? [{ label, value }] : [];
  });
}

function sourceLine(body: string): string | undefined {
  return body
    .split('\n')
    .map(line => line.trim())
    .find(line => /^source:/i.test(line))
    ?.replace(/^source:\s*/i, '')
    .trim();
}

function proseLines(body: string): string | undefined {
  const text = body
    .split('\n')
    .map(line => line.trim())
    .filter(
      line =>
        line &&
        !line.startsWith('- ') &&
        !line.startsWith('#') &&
        !/^source:/i.test(line)
    )
    .join(' ')
    .trim();
  return text || undefined;
}

function parseGroups(body: string): ExecutiveGroup[] {
  const groups: ExecutiveGroup[] = [];
  let current: ExecutiveGroup | null = null;
  for (const raw of body.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('### ')) {
      current = { title: line.slice(4).trim(), items: [] };
      groups.push(current);
      continue;
    }
    if (line.startsWith('- ') && current) {
      current.items.push(line.slice(2).trim());
    }
  }
  return groups.filter(group => group.items.length > 0);
}

function parseSources(body: string): ExecutiveProfile['sources'] {
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
    const parts = line.split(/\s+[—–]\s+/);
    if (parts.length >= 2) {
      return {
        label: parts[0].trim(),
        note: parts.slice(1).join(' — ').trim(),
      };
    }
    return { label: line };
  });
}

/**
 * Builds the executive UI model from interpolated executive.md.
 * Companion JSON values are already substituted before this runs.
 */
export function parseExecutiveMarkdown(
  markdown: string
): ExecutiveProfile | null {
  const summaryMatch = markdown.match(/^#\s+.+$\n\n(.+?)(?:\n\n|$)/m);
  const summary = summaryMatch?.[1]?.trim();

  const mayorFields = fieldMap(sectionBody(markdown, 'Mayor'));
  const viceFields = fieldMap(sectionBody(markdown, 'Vice Mayor'));
  if (!mayorFields.name || !viceFields.name) return null;

  const contactFields = fieldMap(
    sectionBody(markdown, "Contact the Mayor's Office")
  );
  const inviteBody = sectionBody(markdown, 'Invite the Mayor');
  const inviteLines = inviteBody.split('\n').map(line => line.trim());
  const inviteIntro = inviteLines.find(
    line => line && !line.startsWith('- ') && !line.startsWith('Submit')
  );
  const inviteRequirements = bulletLines(inviteBody);

  const bacBody = sectionBody(markdown, 'Bids and Awards Committee');
  const bacFields = labeledFields(bacBody);
  const postingBody = sectionBody(markdown, 'Official posting sites');
  const postingSites = bulletLines(postingBody);
  const complexBody = sectionBody(markdown, 'Municipal complex');
  const complexGroups = parseGroups(complexBody);

  const sourcesBody = sectionBody(markdown, 'Sources');
  const missingMatch = markdown.match(
    /The municipal hall street address[\s\S]*$/m
  );

  const governmentNameMatch = summary?.match(
    /Local Government Unit of\s+(.+?), reported/i
  );
  const yearMatch =
    mayorFields.elected || summary?.match(/\b(20\d{2})\b/)?.[1] || '';

  return {
    summary,
    governmentName: governmentNameMatch?.[1]?.trim() || 'Ocampo, Camarines Sur',
    yearElected: yearMatch,
    mayor: {
      name: mayorFields.name,
      phone: mayorFields.phone,
      email: mayorFields.email,
      photo: mayorFields.photo,
      elected: mayorFields.elected,
      bio: proseAfterBullets(sectionBody(markdown, 'Mayor')),
    },
    viceMayor: {
      name: viceFields.name,
      phone: viceFields.phone,
      phoneNote: viceFields['phone note'],
      email: viceFields.email,
      photo: viceFields.photo,
      elected: viceFields.elected,
      bio: proseAfterBullets(sectionBody(markdown, 'Vice Mayor')),
    },
    responsibilities: bulletLines(
      sectionBody(markdown, 'Mayor responsibilities')
    ),
    inviteIntro,
    inviteRequirements,
    contact: {
      address: contactFields.address,
      website: contactFields.website,
      facebook: contactFields.facebook,
    },
    bac: bacFields.length
      ? {
          source: sourceLine(bacBody),
          fields: bacFields,
          note: proseLines(bacBody),
        }
      : undefined,
    postingSites: postingSites.length
      ? { source: sourceLine(postingBody), sites: postingSites }
      : undefined,
    complex: complexGroups.length
      ? {
          source: sourceLine(complexBody),
          groups: complexGroups,
          note: proseLines(complexBody),
        }
      : undefined,
    sources: parseSources(sourcesBody),
    missingNote: missingMatch?.[0]?.trim(),
  };
}
