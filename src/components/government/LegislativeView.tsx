import type { CSSProperties } from 'react';
import { Gavel, Landmark, Users, UserRound } from 'lucide-react';
import { SurfaceCard } from '../ui/PageFrame';
import { cn } from '../../lib/utils';
import ContactLinks from './ContactLinks';
import DirectorySectionHeading from './DirectorySectionHeading';
import type { ContactFields, LegislativeRoster } from './legislativeRoster';

function SeatNumber({ n, compact = false }: { n: number; compact?: boolean }) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg bg-primary-600/[0.08] font-mono font-semibold tabular-nums text-primary-800 ring-1 ring-primary-600/10',
        compact ? 'size-8 text-[11px]' : 'size-9 text-xs sm:size-10 sm:text-sm'
      )}
      aria-hidden="true"
    >
      {String(n).padStart(2, '0')}
    </span>
  );
}

function MemberRow({
  name,
  meta,
  seat,
  email,
  phone,
  phoneNote,
  className,
  style,
}: {
  name: string;
  meta?: string;
  seat?: number;
  className?: string;
  style?: CSSProperties;
} & ContactFields) {
  return (
    <li
      className={cn(
        'animate-civic-fade-up flex items-start gap-3 border-b border-gray-100 py-3.5 last:border-b-0 sm:gap-4 sm:py-4',
        className
      )}
      style={style}
    >
      {seat !== undefined ? <SeatNumber n={seat} /> : null}
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold tracking-tight text-gray-950 sm:text-lg">
          {name}
        </p>
        {meta ? <p className="mt-0.5 text-sm text-gray-600">{meta}</p> : null}
        <ContactLinks email={email} phone={phone} phoneNote={phoneNote} />
      </div>
    </li>
  );
}

function MemberCard({
  name,
  meta,
  seat,
  email,
  phone,
  phoneNote,
  className,
  style,
}: {
  name: string;
  meta?: string;
  seat?: number;
  className?: string;
  style?: CSSProperties;
} & ContactFields) {
  return (
    <li
      className={cn(
        'animate-civic-fade-up flex h-full flex-col rounded-xl border border-gray-200/90 bg-gray-50/70 p-3.5 sm:p-4',
        className
      )}
      style={style}
    >
      <div className="flex items-start gap-2.5">
        {seat !== undefined ? <SeatNumber n={seat} compact /> : null}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight text-gray-950 sm:text-[15px]">
            {name}
          </p>
          {meta ? (
            <p className="mt-0.5 text-xs leading-snug text-gray-600">{meta}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-auto">
        <ContactLinks
          email={email}
          phone={phone}
          phoneNote={phoneNote}
          compact
        />
      </div>
    </li>
  );
}

export default function LegislativeView({
  roster,
}: {
  roster: LegislativeRoster;
}) {
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Chamber overview: mayor + presiding officer */}
      <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
        <SurfaceCard
          as="section"
          className="animate-civic-fade-up overflow-hidden p-5 sm:p-6 lg:col-span-5"
        >
          <h2 className="text-2xl font-semibold tracking-tight text-gray-950">
            {roster.mayor.name}
          </h2>
          <p className="mt-1 text-sm font-medium text-primary-700">
            {roster.mayor.office}
          </p>
          <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
            <div>
              <dt className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                2025 votes
              </dt>
              <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-gray-950">
                {roster.mayor.votes}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                Registered voters
              </dt>
              <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-gray-950">
                {roster.registeredVoters}
              </dd>
            </div>
          </dl>
        </SurfaceCard>

        <SurfaceCard
          as="section"
          className="animate-civic-fade-up relative overflow-hidden border-primary-500 bg-primary-600 p-5 text-white shadow-[0_18px_40px_-24px_rgba(0,93,245,0.65)] [animation-delay:60ms] sm:p-6 lg:col-span-7"
        >
          <span
            className="pointer-events-none absolute -right-8 -bottom-10 size-44 rounded-full bg-white/10 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-primary-100">
                <Gavel className="size-4 shrink-0" aria-hidden="true" />
                <p className="text-sm font-medium">
                  {roster.presiding.office} · Term {roster.term}
                </p>
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {roster.presiding.name}
              </h2>
              <p className="mt-1.5 text-sm text-primary-100/95">
                {roster.presiding.note}
              </p>
              <ContactLinks
                email={roster.presiding.email}
                phone={roster.presiding.phone}
                phoneNote={roster.presiding.phoneNote}
                tone="onPrimary"
              />
            </div>
            <div className="shrink-0 rounded-xl bg-white/12 px-4 py-3 ring-1 ring-white/15">
              <p className="text-[11px] font-semibold tracking-wide text-primary-100 uppercase">
                2025 votes
              </p>
              <p className="mt-0.5 font-mono text-2xl font-semibold tabular-nums text-white">
                {roster.presiding.votes}
              </p>
            </div>
          </div>
        </SurfaceCard>
      </div>

      {/* Elected council */}
      <SurfaceCard
        as="section"
        className="animate-civic-fade-up p-5 [animation-delay:100ms] sm:p-6"
      >
        <DirectorySectionHeading
          icon={<Users className="size-4" aria-hidden="true" />}
          title="Municipal council"
          description="Elected Sangguniang Bayan members for the current term."
          count={roster.council.length}
        />
        <ol className="m-0 mt-1 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {roster.council.map((member, i) => (
            <MemberCard
              key={member.name}
              name={member.name}
              seat={i + 1}
              email={member.email}
              phone={member.phone}
              phoneNote={member.phoneNote}
              style={{ animationDelay: `${120 + i * 40}ms` }}
            />
          ))}
        </ol>
      </SurfaceCard>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
        {/* Ex-officio */}
        <SurfaceCard
          as="section"
          className="animate-civic-fade-up p-5 [animation-delay:160ms] sm:p-6"
        >
          <DirectorySectionHeading
            icon={<Landmark className="size-4" aria-hidden="true" />}
            title="Ex-officio members"
            description="Sector representatives who sit with the council."
            count={roster.exOfficio.length}
          />
          <ul className="m-0 list-none p-0">
            {roster.exOfficio.map((member, i) => (
              <MemberRow
                key={member.name}
                name={member.name}
                meta={member.role}
                email={member.email}
                phone={member.phone}
                phoneNote={member.phoneNote}
                style={{ animationDelay: `${180 + i * 40}ms` }}
              />
            ))}
          </ul>
        </SurfaceCard>

        {/* Secretariat */}
        <SurfaceCard
          as="section"
          className="animate-civic-fade-up p-5 [animation-delay:200ms] sm:p-6"
        >
          <DirectorySectionHeading
            icon={<UserRound className="size-4" aria-hidden="true" />}
            title="Secretariat"
            description="Staff who support legislative sessions and records."
            count={roster.secretariat.length}
          />
          <ul className="m-0 list-none p-0">
            {roster.secretariat.map((member, i) => (
              <MemberRow
                key={member.name}
                name={member.name}
                meta={member.role}
                email={member.email}
                phone={member.phone}
                phoneNote={member.phoneNote}
                style={{ animationDelay: `${220 + i * 40}ms` }}
              />
            ))}
          </ul>
        </SurfaceCard>
      </div>

      {/* District + sources */}
      <SurfaceCard
        as="section"
        className="animate-civic-fade-up p-5 [animation-delay:240ms] sm:p-6"
      >
        <h2 className="text-lg font-semibold tracking-tight text-gray-950 sm:text-xl">
          District representative
        </h2>
        <p className="mt-3 text-xl font-semibold tracking-tight text-gray-950">
          {roster.districtRepresentative.name}
        </p>
        <p className="mt-1 text-sm text-gray-600">
          {roster.districtRepresentative.district}
        </p>

        <div className="mt-6 border-t border-gray-100 pt-5">
          <h3 className="text-sm font-semibold tracking-tight text-gray-950">
            Sources
          </h3>
          <ul className="mt-3 space-y-2.5">
            {roster.sources.map(source => (
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
          <p className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700">
            {roster.missingNote}
          </p>
        </div>
      </SurfaceCard>
    </div>
  );
}
