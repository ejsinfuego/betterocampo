import { Link } from 'react-router';
import type { ReactNode } from 'react';
import {
  CalendarDays,
  ExternalLink,
  Gavel,
  Landmark,
  ListChecks,
  Mail,
} from 'lucide-react';
import { SurfaceCard } from '../ui/PageFrame';
import { cn } from '../../lib/utils';
import ContactLinks from './ContactLinks';
import DirectorySectionHeading from './DirectorySectionHeading';
import type { ExecutiveOfficial, ExecutiveProfile } from './executiveProfile';

function PortraitCard({
  official,
  role,
  term,
  subtitle,
  objectPosition = 'object-center',
  footer,
  className,
  eager,
}: {
  official: ExecutiveOfficial;
  role: string;
  term: string;
  subtitle: string;
  objectPosition?: string;
  footer?: ReactNode;
  className?: string;
  eager?: boolean;
}) {
  return (
    <SurfaceCard
      as="section"
      className={cn(
        'group relative isolate min-h-[28rem] overflow-hidden sm:min-h-[32rem]',
        className
      )}
    >
      {official.photo ? (
        <img
          src={official.photo}
          alt={`${role} ${official.name}`}
          className={cn(
            'absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]',
            objectPosition
          )}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
        />
      ) : (
        <div className="absolute inset-0 bg-primary-700" aria-hidden="true" />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5"
        aria-hidden="true"
      />
      <div className="relative flex h-full min-h-[28rem] flex-col justify-end p-5 text-white sm:min-h-[32rem] sm:p-6">
        <div className="flex items-center gap-2 text-white/85">
          {role === 'Mayor' ? (
            <Landmark className="size-4 shrink-0" aria-hidden="true" />
          ) : (
            <Gavel className="size-4 shrink-0" aria-hidden="true" />
          )}
          <p className="text-sm font-medium">
            {role} · Term {term}–2028
          </p>
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {official.name}
        </h2>
        <p className="mt-1.5 text-sm text-white/85">{subtitle}</p>
        <ContactLinks
          email={official.email}
          phone={official.phone}
          phoneNote={official.phoneNote}
          tone="onPrimary"
        />
        {footer}
      </div>
    </SurfaceCard>
  );
}

export default function ExecutiveView({
  profile,
}: {
  profile: ExecutiveProfile;
}) {
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
        <PortraitCard
          className="animate-civic-fade-up"
          official={profile.mayor}
          role="Mayor"
          term={profile.yearElected}
          subtitle={`Chief executive of ${profile.governmentName}`}
          objectPosition="object-[center_18%]"
          eager
        />
        <PortraitCard
          className="animate-civic-fade-up [animation-delay:60ms]"
          official={profile.viceMayor}
          role="Vice Mayor"
          term={profile.yearElected}
          subtitle="Presides over the Sangguniang Bayan"
          objectPosition="object-[center_12%]"
          footer={
            <Link
              to="/government/departments/legislative"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white underline decoration-white/40 underline-offset-2 hover:decoration-white"
            >
              View Sangguniang Bayan roster
            </Link>
          }
        />
      </div>

      {profile.mayor.bio ? (
        <SurfaceCard
          as="section"
          className="animate-civic-fade-up p-5 [animation-delay:100ms] sm:p-6"
        >
          <DirectorySectionHeading
            icon={<Landmark className="size-4" aria-hidden="true" />}
            title="About the Mayor"
            description={`Officeholders listed for ${profile.governmentName}.`}
          />
          <p className="max-w-3xl text-sm leading-relaxed text-gray-700 sm:text-base">
            {profile.mayor.bio}
          </p>
        </SurfaceCard>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
        <SurfaceCard
          as="section"
          className="animate-civic-fade-up p-5 [animation-delay:140ms] sm:p-6"
        >
          <DirectorySectionHeading
            icon={<ListChecks className="size-4" aria-hidden="true" />}
            title="Mayor responsibilities"
            count={profile.responsibilities.length}
          />
          <ul className="m-0 list-none space-y-0 p-0">
            {profile.responsibilities.map((item, i) => (
              <li
                key={item}
                className="flex items-start gap-3 border-b border-gray-100 py-3 last:border-b-0"
              >
                <span
                  className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary-600/[0.08] font-mono text-[11px] font-semibold tabular-nums text-primary-800 ring-1 ring-primary-600/10"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-sm leading-relaxed text-gray-800 sm:text-base">
                  {item}
                </p>
              </li>
            ))}
          </ul>
        </SurfaceCard>

        <SurfaceCard
          as="section"
          className="animate-civic-fade-up p-5 [animation-delay:180ms] sm:p-6"
        >
          <DirectorySectionHeading
            icon={<CalendarDays className="size-4" aria-hidden="true" />}
            title="Invite the Mayor"
            description={profile.inviteIntro}
            count={profile.inviteRequirements.length}
          />
          <ul className="m-0 list-none p-0">
            {profile.inviteRequirements.map((item, i) => (
              <li
                key={item}
                className="border-b border-gray-100 py-3 text-sm leading-relaxed text-gray-800 last:border-b-0 sm:text-base"
                style={{ animationDelay: `${200 + i * 30}ms` }}
              >
                {item}
              </li>
            ))}
          </ul>
        </SurfaceCard>
      </div>

      <SurfaceCard
        as="section"
        className="animate-civic-fade-up p-5 [animation-delay:220ms] sm:p-6"
      >
        <DirectorySectionHeading
          icon={<Mail className="size-4" aria-hidden="true" />}
          title="Contact the Mayor's Office"
          description={profile.contact.address}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
              Office contacts
            </p>
            <ContactLinks
              email={profile.mayor.email}
              phone={profile.mayor.phone}
            />
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
              Online
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              {profile.contact.website ? (
                <a
                  href={profile.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 break-all underline decoration-primary-200 underline-offset-2 hover:text-primary-800"
                >
                  <ExternalLink
                    className="size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  Municipal website
                </a>
              ) : null}
              {profile.contact.facebook ? (
                <a
                  href={profile.contact.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 break-all underline decoration-primary-200 underline-offset-2 hover:text-primary-800"
                >
                  <ExternalLink
                    className="size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  LGU Facebook page
                </a>
              ) : null}
              <Link
                to="/government/departments/contact"
                className="text-sm font-semibold text-primary-700 underline decoration-primary-200 underline-offset-2 hover:text-primary-800"
              >
                Full office directory
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-5">
          <h3 className="text-sm font-semibold tracking-tight text-gray-950">
            Sources
          </h3>
          <ul className="mt-3 space-y-2.5">
            {profile.sources.map(source => (
              <li key={source.label} className="text-sm leading-relaxed">
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary-700 underline decoration-primary-200 underline-offset-2 hover:text-primary-800"
                  >
                    {source.label}
                  </a>
                ) : (
                  <span className="font-medium text-gray-800">
                    {source.label}
                  </span>
                )}
                {source.note ? (
                  <span className="text-gray-600"> — {source.note}</span>
                ) : null}
              </li>
            ))}
          </ul>
          {profile.missingNote ? (
            <p className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700">
              {profile.missingNote}
            </p>
          ) : null}
        </div>
      </SurfaceCard>
    </div>
  );
}
