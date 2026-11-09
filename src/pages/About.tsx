import { Link } from 'react-router';
import {
  BookOpenCheck,
  CheckCircle2,
  ExternalLink,
  HeartHandshake,
  Scale,
  Send,
  ShieldCheck,
} from 'lucide-react';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { CivicPage, PageHeader, SurfaceCard } from '../components/ui/PageFrame';

const GITHUB = 'https://github.com/ejsinfuego/betterocampo';
const FACEBOOK = 'https://www.facebook.com/101706771551898';

const sources = [
  {
    name: '2025 election reports and the DILG profile',
    note: 'Used for officials and municipal profile facts that can be checked against a published report.',
  },
  {
    name: 'Commission on Audit totals on Wikidata',
    href: 'https://www.wikidata.org',
    note: 'Audit totals are taken as recorded on Wikidata, not from a line-item reading of the audit PDF.',
  },
  {
    name: 'BetterGov budget database',
    href: 'https://bettergov.ph',
    note: 'National project lines published from the BetterGov budget database.',
  },
  {
    name: 'LGU Facebook page',
    href: FACEBOOK,
    note: 'Public posts from the municipal Facebook page.',
  },
  {
    name: 'Official Gazette',
    href: 'https://www.officialgazette.gov.ph',
    note: 'Used for the municipality’s founding order.',
  },
  {
    name: 'Municipal website',
    note: 'No municipal website was found when this was checked. Public updates are on the LGU Facebook page.',
  },
];

const promises = [
  {
    title: 'Independent community guide',
    body: (
      <>
        This site is an independent community guide. No municipal website was
        found when this was checked. Public updates are on the{' '}
        <a className="font-semibold text-primary-700 underline" href={FACEBOOK}>
          LGU Facebook page
        </a>
        .
      </>
    ),
  },
  {
    title: 'Only records that can be checked',
    body: (
      <>
        <Link
          className="font-semibold text-primary-700 underline"
          to="/government/departments"
        >
          Government records
        </Link>{' '}
        cover officials, the budget, national projects, ordinances, and contact
        details that could be checked against a public source.{' '}
        <Link
          className="font-semibold text-primary-700 underline"
          to="/services"
        >
          Service guides
        </Link>{' '}
        cover permits, health, education, and waste.
      </>
    ),
  },
  {
    title: 'Missing details stay off the page',
    body: (
      <>
        Local fees, schedules, and hotlines stay off those pages until they are
        verified. No municipal hotline or office email is listed until one is
        verified.
      </>
    ),
  },
] as const;

const About: React.FC = () => {
  return (
    <>
      <SEO
        title="About"
        description="Better Ocampo is a community transparency portal for the Municipality of Ocampo, Camarines Sur. No municipal website was found when this was checked."
        keywords="Ocampo, Camarines Sur, Better Ocampo, transparency, local government"
      />
      <CivicPage>
        <Breadcrumbs />
        <PageHeader
          eyebrow="Independent community guide"
          title="About Better Ocampo"
          description="Better Ocampo is a community transparency portal for the Municipality of Ocampo, Camarines Sur. No municipal website was found when this was checked."
        >
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-4 text-xs text-emerald-950">
            <span className="inline-flex items-center gap-2 font-semibold">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Local fees, schedules, and hotlines stay blank until a public
              source is checked
            </span>
            <span className="text-emerald-700">•</span>
            <span>
              Postal code: <strong className="font-mono">4419</strong>
            </span>
            <span className="text-emerald-700">•</span>
            <a
              href="#contact"
              className="font-semibold text-primary-700 underline"
            >
              Municipal contact
            </a>
          </div>
        </PageHeader>

        <section className="grid gap-4 md:grid-cols-3">
          {promises.map(promise => (
            <SurfaceCard
              key={promise.title}
              as="article"
              className="civic-card-hover p-6"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10">
                <CheckCircle2 className="size-5" />
              </div>
              <h2 className="mt-5 text-lg font-semibold tracking-tight text-gray-950">
                {promise.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {promise.body}
              </p>
            </SurfaceCard>
          ))}
        </section>

        <SurfaceCard
          as="section"
          className="border-error-200/80 bg-error-50/60 p-6 sm:p-8"
        >
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/80 text-error-700 ring-1 ring-error-600/10">
              <Scale className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-gray-950 sm:text-xl">
                Municipal questions go to the LGU
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                The people maintaining this portal do not answer municipal
                transactions. Use the LGU Facebook page or the contact details
                that have already been checked and published here.
              </p>
            </div>
          </div>
        </SurfaceCard>

        <section id="sources" className="scroll-mt-28 space-y-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-primary-700 uppercase">
              <span className="inline-flex items-center gap-1.5">
                <BookOpenCheck className="size-4" />
                Public sources named on this portal
              </span>
            </p>
            <h2 className="mt-2 text-2xl tracking-tight text-gray-950 sm:text-3xl">
              Where the records come from
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {sources.map(source => (
              <SurfaceCard
                key={source.name}
                as="article"
                className="civic-card-hover flex flex-col justify-between p-5"
              >
                <div className="space-y-2">
                  <span className="text-[11px] font-medium tracking-wide text-gray-400 uppercase">
                    Named in this guide
                  </span>
                  <h3 className="text-lg font-semibold tracking-tight text-gray-950">
                    {source.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500">
                    {source.note}
                  </p>
                </div>
                {source.href ? (
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline"
                  >
                    Open source
                    <ExternalLink className="size-3.5" />
                  </a>
                ) : null}
              </SurfaceCard>
            ))}
          </div>
        </section>

        <section
          id="contact"
          className="scroll-mt-28 grid gap-4 lg:grid-cols-2"
        >
          <SurfaceCard className="space-y-3 p-6 sm:p-8">
            <p className="text-xs font-semibold tracking-wide text-primary-700 uppercase">
              <span className="inline-flex items-center gap-1.5">
                <Send className="size-4" />
                Contact
              </span>
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-gray-950">
              Municipal Hall, Ocampo, Camarines Sur 4419
            </h2>
            <p className="text-sm leading-relaxed text-gray-500">
              Municipal questions go to the LGU, not to the people maintaining
              this portal.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <a
                  className="font-semibold text-primary-700 underline"
                  href={FACEBOOK}
                >
                  LGU Facebook page
                </a>
              </li>
              <li>
                <Link
                  className="font-semibold text-primary-700 underline"
                  to="/government/departments/contact"
                >
                  Contact details published on this portal
                </Link>
              </li>
              <li>No municipal website was found when this was checked.</li>
            </ul>
            <p className="text-sm text-gray-500">
              No municipal hotline or office email is listed until one is
              verified.
            </p>
          </SurfaceCard>

          <SurfaceCard className="flex flex-col justify-between gap-4 border-primary-200/80 bg-primary-50/50 p-6 sm:p-8">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-wide text-primary-700 uppercase">
                <span className="inline-flex items-center gap-1.5">
                  <HeartHandshake className="size-4" />
                  Corrections
                </span>
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-gray-950">
                Built for Ocampo at ₱0
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                This portal is an open community project. If a page states a
                fact that a public record does not support, open an issue on
                GitHub.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={GITHUB}
                className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
              >
                <ShieldCheck className="size-4" />
                Open an issue on GitHub
              </a>
              <Link
                to="/services"
                className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-gray-200/90 bg-white/80 px-5 text-sm font-semibold text-gray-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-gray-300 hover:text-primary-700"
              >
                Browse service guides
              </Link>
            </div>
          </SurfaceCard>
        </section>
      </CivicPage>
    </>
  );
};

export default About;
