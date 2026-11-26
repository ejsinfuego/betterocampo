import type { LucideIcon } from 'lucide-react';
import {
  BriefcaseBusiness,
  Building2,
  CircleDot,
  ClipboardList,
  Facebook,
  HeartPulse,
  MapPin,
  Phone,
  Siren,
  Trash2,
} from 'lucide-react';

/**
 * Resident intents for Ocampo, grounded in local patterns:
 * barangay clearance / permits, health (RHU), garbage, infrastructure reports,
 * emergencies, LGU Facebook (primary public channel), and municipal contact.
 */
export type ResidentNeed = {
  id: string;
  title: string;
  description: string;
  href: string;
  external?: boolean;
  icon: LucideIcon;
  group: 'urgent' | 'everyday' | 'reports';
};

export const RESIDENT_NEED_GROUPS = [
  {
    id: 'urgent' as const,
    title: 'Urgent',
    hint: 'Call first when someone is in danger. Local Ocampo numbers stay unpublished until verified.',
  },
  {
    id: 'everyday' as const,
    title: 'Everyday needs',
    hint: 'Guides residents look for most often — permits, health, waste, and how to reach the LGU.',
  },
  {
    id: 'reports' as const,
    title: 'Community reports',
    hint: 'Report problems so we can help raise them with the municipality. Not an official LGU ticket.',
  },
];

export const RESIDENT_NEEDS: ResidentNeed[] = [
  {
    id: 'emergency',
    title: 'Call for help',
    description:
      'National 911, plus PNP / BFP / RHU / MDRRMO shortcuts in the top bar.',
    href: 'tel:911',
    external: true,
    icon: Siren,
    group: 'urgent',
  },
  {
    id: 'facebook',
    title: 'LGU Facebook updates',
    description:
      'Public announcements from the Municipality of Ocampo (no municipal website found).',
    href: 'https://www.facebook.com/101706771551898',
    external: true,
    icon: Facebook,
    group: 'urgent',
  },
  {
    id: 'permits',
    title: 'Barangay clearance & business permits',
    description: 'Start at your barangay hall, then mayor’s permit steps.',
    href: '/services/business/apply-for-barangay-clearance-and-mayors-business-permits',
    icon: BriefcaseBusiness,
    group: 'everyday',
  },
  {
    id: 'health',
    title: 'Health & RHU services',
    description:
      'Check-ups, maternal care, medicines, and local health programs.',
    href: '/services/health-services',
    icon: HeartPulse,
    group: 'everyday',
  },
  {
    id: 'garbage',
    title: 'Garbage collection',
    description: 'Schedules, segregation, special pickup, and dumping reports.',
    href: '/services/garbage-waste-disposal',
    icon: Trash2,
    group: 'everyday',
  },
  {
    id: 'contact',
    title: 'Contact & municipal hall',
    description: 'What we know about reaching offices in Ocampo (ZIP 4419).',
    href: '/government/departments/contact',
    icon: Building2,
    group: 'everyday',
  },
  {
    id: 'hotlines-bar',
    title: 'See local hotline bar',
    description:
      'PNP, BFP, RHU, and MDRRMO shortcuts sit in the header on every page.',
    href: '#hotlines',
    icon: Phone,
    group: 'everyday',
  },
  {
    id: 'file-report',
    title: 'Report a problem',
    description:
      'Roads, bridges, drainage, lights, waste — we’ll help raise it with the municipality.',
    href: '/report',
    icon: ClipboardList,
    group: 'reports',
  },
  {
    id: 'track-report',
    title: 'Check a Report status',
    description: 'Look up your Reference ID — no account needed.',
    href: '/report/track',
    icon: CircleDot,
    group: 'reports',
  },
  {
    id: 'public-reports',
    title: 'See published Reports',
    description:
      'Operator-approved, redacted Reports the community can browse.',
    href: '/reports',
    icon: MapPin,
    group: 'reports',
  },
];

/** Compact links for Hero / chrome — highest-frequency resident intents. */
export const RESIDENT_QUICK_LINKS = [
  { label: 'What I need', href: '/needs' },
  { label: 'Education', href: '/services/education' },
  { label: 'Health', href: '/services/health-services' },
  { label: 'Report a problem', href: '/report' },
  { label: 'Projects', href: '/projects' },
  { label: 'Contact', href: '/government/departments/contact' },
  {
    label: 'Facebook Page',
    href: 'https://www.facebook.com/101706771551898',
    external: true,
  },
] as const;
