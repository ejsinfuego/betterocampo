import type { CSSProperties } from 'react';
import { Building2, ExternalLink, Landmark, MapPin, Phone } from 'lucide-react';
import { SurfaceCard } from '../ui/PageFrame';
import { cn } from '../../lib/utils';
import ContactLinks from './ContactLinks';
import DirectorySectionHeading from './DirectorySectionHeading';
import type { ContactDirectory, ContactOffice } from './contactDirectory';

function OfficeCard({
  office,
  index,
  style,
}: {
  office: ContactOffice;
  index: number;
  style?: CSSProperties;
}) {
  return (
    <li
      className="animate-civic-fade-up flex h-full flex-col rounded-xl border border-gray-200/90 bg-gray-50/70 p-3.5 sm:p-4"
      style={style}
    >
      <div className="flex items-start gap-2.5">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-600/[0.08] font-mono text-[11px] font-semibold tabular-nums text-primary-800 ring-1 ring-primary-600/10"
          aria-hidden="true"
        >
          {String(index).padStart(2, '0')}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight text-gray-950 sm:text-[15px]">
            {office.office}
          </p>
          <p className="mt-0.5 text-xs leading-snug text-gray-600">
            {office.head}
          </p>
        </div>
      </div>
      <div className="mt-auto">
        <ContactLinks
          email={office.email}
          emailNote={office.emailNote}
          phone={office.phone}
          phoneNote={office.phoneNote}
          compact
        />
      </div>
    </li>
  );
}

export default function ContactView({
  directory,
}: {
  directory: ContactDirectory;
}) {
  const directoryOffices = directory.offices.filter(
    office => !/^municipal mayor$/i.test(office.office)
  );

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
        <SurfaceCard
          as="section"
          className="animate-civic-fade-up relative overflow-hidden border-primary-500 bg-primary-600 p-5 text-white shadow-[0_18px_40px_-24px_rgba(0,93,245,0.65)] sm:p-6 lg:col-span-7"
        >
          <span
            className="pointer-events-none absolute -right-8 -bottom-10 size-44 rounded-full bg-white/10 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="flex items-center gap-2 text-primary-100">
              <Landmark className="size-4 shrink-0" aria-hidden="true" />
              <p className="text-sm font-medium">Office of the Mayor</p>
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {directory.mayor.name}
            </h2>
            <p className="mt-1.5 text-sm text-primary-100/95">
              Start here for municipal hall inquiries.
            </p>
            <ContactLinks
              email={directory.mayor.email}
              phone={directory.mayor.phone}
              tone="onPrimary"
            />
          </div>
        </SurfaceCard>

        <SurfaceCard
          as="section"
          className="animate-civic-fade-up p-5 [animation-delay:60ms] sm:p-6 lg:col-span-5"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary-600 text-white sm:size-9">
              <MapPin className="size-4" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-semibold tracking-tight text-gray-950 sm:text-xl">
              Place codes
            </h2>
          </div>
          <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {directory.channels
              .filter(channel => /zip|area|psgc/i.test(channel.label))
              .map(channel => (
                <div
                  key={channel.label}
                  className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5"
                >
                  <dt className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                    {channel.label}
                  </dt>
                  <dd className="mt-1 font-mono text-base font-semibold tabular-nums text-gray-950">
                    {channel.text}
                  </dd>
                </div>
              ))}
          </dl>
        </SurfaceCard>
      </div>

      <SurfaceCard
        as="section"
        className="animate-civic-fade-up p-5 [animation-delay:100ms] sm:p-6"
      >
        <DirectorySectionHeading
          icon={<ExternalLink className="size-4" aria-hidden="true" />}
          title="Channels"
          description="Public channels for the municipality. No municipal website was found when this was checked."
          count={
            directory.channels.filter(
              channel => !/zip|area|psgc/i.test(channel.label)
            ).length
          }
        />
        <ul className="m-0 mt-1 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {directory.channels
            .filter(channel => !/zip|area|psgc/i.test(channel.label))
            .map((channel, i) => (
              <li
                key={channel.label}
                className="animate-civic-fade-up flex h-full flex-col rounded-xl border border-gray-200/90 bg-gray-50/70 p-3.5 sm:p-4"
                style={{ animationDelay: `${120 + i * 40}ms` }}
              >
                <p className="text-[11px] font-semibold tracking-wide text-primary-700 uppercase">
                  {channel.label}
                </p>
                {channel.url ? (
                  <a
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={channel.text}
                    className="mt-1.5 line-clamp-2 text-sm font-semibold tracking-tight text-gray-950 underline decoration-primary-200 underline-offset-2 hover:text-primary-800"
                  >
                    {channel.text}
                  </a>
                ) : (
                  <p className="mt-1.5 text-sm font-semibold tracking-tight text-gray-950">
                    {channel.text}
                  </p>
                )}
                {channel.note ? (
                  <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-gray-600">
                    {channel.note}
                  </p>
                ) : null}
              </li>
            ))}
        </ul>
      </SurfaceCard>

      <SurfaceCard
        as="section"
        className="animate-civic-fade-up p-5 [animation-delay:160ms] sm:p-6"
      >
        <DirectorySectionHeading
          icon={<Building2 className="size-4" aria-hidden="true" />}
          title="LGU office directory"
          description={directory.directoryIntro}
          count={directoryOffices.length}
        />
        <ul className="m-0 mt-1 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {directoryOffices.map((office, i) => (
            <OfficeCard
              key={office.office}
              office={office}
              index={i + 1}
              style={{ animationDelay: `${180 + i * 30}ms` }}
            />
          ))}
        </ul>
      </SurfaceCard>

      <SurfaceCard
        as="section"
        className="animate-civic-fade-up p-5 [animation-delay:220ms] sm:p-6"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary-600 text-white sm:size-9">
            <Phone className="size-4" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-semibold tracking-tight text-gray-950 sm:text-xl">
            Sources
          </h2>
        </div>
        <ul className="mt-4 space-y-2.5">
          {directory.sources.map(source => (
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
        {directory.missingNote ? (
          <p className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700">
            {directory.missingNote}
          </p>
        ) : null}
        {directory.privacyNote ? (
          <p
            className={cn(
              'rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700',
              directory.missingNote ? 'mt-3' : 'mt-4'
            )}
          >
            {directory.privacyNote}
          </p>
        ) : null}
      </SurfaceCard>
    </div>
  );
}
