import { Link } from 'react-router';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { CivicPage, PageHeader, SurfaceCard } from '../components/ui/PageFrame';
import { RESIDENT_NEEDS, RESIDENT_NEED_GROUPS } from '../data/residentNeeds';
import { cn } from '../lib/utils';

export default function Needs() {
  return (
    <CivicPage>
      <SEO
        title="What do you need?"
        description="Quick links for common resident needs in Ocampo — permits, health, garbage, emergencies, and how to reach the LGU."
      />
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'What do you need?' }]}
      />

      <div className="space-y-8">
        <PageHeader
          eyebrow="For residents"
          title="What do you need?"
          description="Short paths to the guides Ocampo residents look for most — based on typical municipal errands, barangay transactions, and this community’s public channels."
        />

        {RESIDENT_NEED_GROUPS.map(group => {
          const items = RESIDENT_NEEDS.filter(need => need.group === group.id);
          return (
            <section key={group.id} className="space-y-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-gray-950">
                  {group.title}
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-600">
                  {group.hint}
                </p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {items.map(need => {
                  const Icon = need.icon;
                  const className = cn(
                    'flex h-full gap-3 rounded-2xl border border-gray-200/90 bg-white/80 p-4 transition',
                    'hover:border-primary-300 hover:bg-primary-50/40',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2'
                  );
                  const body = (
                    <>
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-600/10 text-primary-800">
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-gray-950">
                          {need.title}
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-gray-600">
                          {need.description}
                        </span>
                      </span>
                    </>
                  );

                  return (
                    <li key={need.id}>
                      {need.external || need.href.startsWith('tel:') ? (
                        <a
                          href={need.href}
                          className={className}
                          {...(need.href.startsWith('http')
                            ? {
                                target: '_blank',
                                rel: 'noopener noreferrer',
                              }
                            : {})}
                        >
                          {body}
                        </a>
                      ) : need.href.startsWith('#') ? (
                        <a href={need.href} className={className}>
                          {body}
                        </a>
                      ) : (
                        <Link to={need.href} className={className}>
                          {body}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        <SurfaceCard className="p-5 text-sm text-gray-600 sm:p-6">
          <p>
            Prefer browsing by topic? Start at{' '}
            <Link
              to="/services"
              className="font-semibold text-primary-700 underline"
            >
              Services
            </Link>{' '}
            or{' '}
            <Link
              to="/government/departments"
              className="font-semibold text-primary-700 underline"
            >
              Government
            </Link>
            . Fees and unpublished hotlines stay blank until a public source is
            checked.
          </p>
        </SurfaceCard>
      </div>
    </CivicPage>
  );
}
