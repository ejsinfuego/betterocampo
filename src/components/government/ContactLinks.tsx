import { Mail, Phone } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ContactFields } from './legislativeRoster';

export default function ContactLinks({
  email,
  emailNote,
  phone,
  phoneNote,
  tone = 'default',
  compact = false,
}: ContactFields & { tone?: 'default' | 'onPrimary'; compact?: boolean }) {
  if (!email && !phone) return null;

  const linkClass = cn(
    'inline-flex max-w-full items-center gap-1.5 underline underline-offset-2',
    compact ? 'text-[13px]' : 'text-sm',
    compact ? 'min-w-0' : 'break-all',
    tone === 'onPrimary'
      ? 'text-white decoration-white/40 hover:decoration-white'
      : 'text-primary-700 decoration-primary-200 hover:text-primary-800'
  );

  const noteClass = tone === 'onPrimary' ? 'text-white/75' : 'text-gray-500';

  return (
    <div className={cn('mt-2 flex flex-col', compact ? 'gap-1' : 'gap-1.5')}>
      {email ? (
        <a
          href={`mailto:${email}`}
          className={linkClass}
          title={emailNote ? `${email} (${emailNote})` : email}
        >
          <Mail className="size-3.5 shrink-0" aria-hidden="true" />
          <span className={cn(compact && 'truncate')}>
            {email}
            {emailNote ? (
              <span className={cn('ml-1 no-underline', noteClass)}>
                ({emailNote})
              </span>
            ) : null}
          </span>
        </a>
      ) : null}
      {phone ? (
        <a
          href={`tel:${phone.replace(/[^\d+]/g, '')}`}
          className={linkClass}
          title={phoneNote ? `${phone} (${phoneNote})` : phone}
        >
          <Phone className="size-3.5 shrink-0" aria-hidden="true" />
          <span className={cn(compact && 'truncate')}>
            {phone}
            {phoneNote ? (
              <span className={cn('ml-1 no-underline', noteClass)}>
                ({phoneNote})
              </span>
            ) : null}
          </span>
        </a>
      ) : null}
    </div>
  );
}
