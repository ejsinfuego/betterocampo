import type { LucideIcon } from 'lucide-react';
import {
  BriefcaseBusiness,
  Building2,
  Facebook,
  HeartPulse,
  Phone,
  Siren,
  Trash2,
} from 'lucide-react';

/**
 * Resident intents for Ocampo, grounded in local patterns:
 * barangay clearance / permits, health (RHU), garbage, emergencies,
 * LGU Facebook (primary public channel), and municipal contact.
 * Community reporting links stay out until that feature ships.
 */
export type ResidentNeed = {
  id: string;
  title: string;
  description: string;
  href: string;
  external?: boolean;
  icon: LucideIcon;
  group: 'urgent' | 'everyday';
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
];

/** Compact links for Hero / chrome — highest-frequency resident intents. */
export const RESIDENT_QUICK_LINKS = [
  { label: 'What I need', href: '/needs' },
  { label: 'Education', href: '/services/education' },
  { label: 'Health', href: '/services/health-services' },
  { label: 'Projects', href: '/projects' },
  { label: 'Contact', href: '/government/departments/contact' },
  {
    label: 'Facebook Page',
    href: 'https://www.facebook.com/101706771551898',
    external: true,
  },
] as const;
