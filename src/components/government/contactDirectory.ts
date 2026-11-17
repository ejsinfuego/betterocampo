import type { ContactFields } from './legislativeRoster';

export interface ContactChannel {
  label: string;
  text: string;
  url?: string;
  note?: string;
}

export interface ContactOffice extends ContactFields {
  office: string;
  head: string;
}

export interface ContactDirectory {
  summary?: string;
  channels: ContactChannel[];
  mayor: {
    name: string;
    phone?: string;
    email?: string;
  };
  directoryIntro?: string;
  offices: ContactOffice[];
  sources: Array<{
    label: string;
    url?: string;
    note?: string;
  }>;
  missingNote?: string;
  privacyNote?: string;
}

function sectionBody(markdown: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    `(?:^|\\n)##\\s+${escaped}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`
  );
  const match = markdown.match(re);
  return match?.[1]?.trim() ?? '';
}

function tableRows(body: string): string[][] {
  return body
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('|') && !/^\|\s*-+/.test(line))
    .map(line =>
      line
        .split('|')
        .map(cell => cell.trim())
        .filter(Boolean)
    )
    .filter(cells => cells.length > 0);
}

function parseLinkedCell(cell: string): {
  text: string;
  url?: string;
  note?: string;
} {
  const linkMatch = cell.match(/^\[([^\]]+)\]\(([^)]+)\)\s*[.,]?\s*(.*)$/);
  if (linkMatch) {
    const note = linkMatch[3].trim();
    return {
      text: linkMatch[1],
      url: linkMatch[2],
      ...(note ? { note } : {}),
    };
  }
  return { text: cell };
}

function parseEmailCell(
  value: string
): Pick<ContactFields, 'email' | 'emailNote'> {
  if (!value) return {};
  const uncertain = /\(uncertain\)/i.test(value);
  const email = value.replace(/\s*\(uncertain\)\s*/i, '').trim();
  if (!email.includes('@')) return {};
  return {
    email,
    ...(uncertain ? { emailNote: 'uncertain' } : {}),
  };
}

function bulletLines(body: string): string[] {
  return body
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('- '))
    .map(line => line.slice(2).trim());
}

function parseSources(body: string): ContactDirectory['sources'] {
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
 * Builds the contact directory UI model from contact.md.
 */
export function parseContactMarkdown(
  markdown: string
): ContactDirectory | null {
  const summaryMatch = markdown.match(/^#\s+.+$\n\n(.+?)(?:\n\n|$)/m);
  const summary = summaryMatch?.[1]?.trim();

  const channels = tableRows(sectionBody(markdown, 'Channels'))
    .filter(cells => cells.length >= 2)
    .map(([label, value]) => {
      const linked = parseLinkedCell(value);
      return {
        label,
        text: linked.text,
        url: linked.url,
        note: linked.note,
      };
    })
    .filter(item => item.label && item.text);

  const mayorRows = tableRows(sectionBody(markdown, 'Office of the Mayor'));
  const mayorMap = Object.fromEntries(
    mayorRows.map(([key, value]) => [key.toLowerCase(), value])
  );
  const mayorName = mayorMap.mayor;
  if (!mayorName) return null;

  const directoryBody = sectionBody(markdown, 'LGU office directory');
  const directoryIntro = directoryBody
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('|'))
    .join(' ')
    .trim();

  const offices = tableRows(directoryBody)
    .filter(cells => cells.length >= 4)
    .filter(cells => !/^office$/i.test(cells[0]))
    .map(([office, head, phone, emailCell]) => ({
      office,
      head,
      phone: phone || undefined,
      ...parseEmailCell(emailCell),
    }));

  if (offices.length === 0) return null;

  const sourcesBody = sectionBody(markdown, 'Sources');
  const sources = parseSources(sourcesBody);
  const missingMatch = markdown.match(
    /Still missing from a clear public source:[\s\S]*?(?=\n\nPhilSys|\n*$)/
  );
  const privacyMatch = markdown.match(/PhilSys local records[\s\S]*$/);

  return {
    summary,
    channels,
    mayor: {
      name: mayorName,
      phone: mayorMap['contact number'],
      email: mayorMap.email,
    },
    directoryIntro: directoryIntro || undefined,
    offices,
    sources,
    missingNote: missingMatch?.[0]?.trim(),
    privacyNote: privacyMatch?.[0]?.trim(),
  };
}
