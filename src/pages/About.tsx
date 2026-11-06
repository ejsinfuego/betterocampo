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
import { CivicPage, PageHeader } from '../components/ui/PageFrame';

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
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-emerald-300/80 bg-emerald-50/80 p-4 text-xs text-emerald-950">
            <span className="inline-flex items-center gap-2 font-bold">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Local fees, schedules, and hotlines stay blank until a public
              source is checked
            </span>
            <span className="text-emerald-700">•</span>
            <span>
              Postal code: <strong className="font-mono">4419</strong>
            </span>
            <span className="text-emerald-700">•</span>
            <a href="#contact" className="font-semibold underline">
              Municipal contact
            </a>
          </div>
        </PageHeader>

        <section className="grid gap-5 md:grid-cols-3">
          <article className="civic-card-hover rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white">
              Promise 1
            </span>
            <h2 className="mt-3 text-base font-bold text-gray-950">
              Independent community guide
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              This site is an independent community guide. No municipal website
              was found when this was checked. Public updates are on the{' '}
              <a
                className="font-semibold text-blue-700 underline"
                href={FACEBOOK}
              >
                LGU Facebook page
              </a>
              .
            </p>
          </article>
          <article className="civic-card-hover rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white">
              Promise 2
            </span>
            <h2 className="mt-3 text-base font-bold text-gray-950">
              Only records that can be checked
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              <Link
                className="font-semibold text-blue-700 underline"
                to="/government/departments"
              >
                Government records
              </Link>{' '}
              cover officials, the budget, national projects, ordinances, and
              contact details that could be checked against a public source.{' '}
              <Link
                className="font-semibold text-blue-700 underline"
                to="/services"
              >
                Service guides
              </Link>{' '}
              cover permits, health, education, and waste.
            </p>
          </article>
          <article className="civic-card-hover rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <span className="rounded-md bg-amber-600 px-2 py-0.5 text-[11px] font-bold text-white">
              Promise 3
            </span>
            <h2 className="mt-3 text-base font-bold text-gray-950">
              Missing details stay off the page
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              Local fees, schedules, and hotlines stay off those pages until
              they are verified. No municipal hotline or office email is listed
              until one is verified.
            </p>
          </article>
        </section>

        <section className="rounded-2xl border border-rose-200 bg-rose-50/70 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <Scale className="mt-0.5 size-5 shrink-0 text-rose-700" />
            <div>
              <h2 className="text-lg font-bold text-gray-950 sm:text-xl">
                Municipal questions go to the LGU
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                The people maintaining this portal do not answer municipal
                transactions. Use the LGU Facebook page or the contact details
                that have already been checked and published here.
              </p>
            </div>
          </div>
        </section>

        <section id="sources" className="scroll-mt-28 space-y-4">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-blue-700 uppercase">
              <BookOpenCheck className="size-4" />
              Public sources named on this portal
            </p>
            <h2 className="mt-1 text-xl font-bold text-gray-950 sm:text-2xl">
              Where the records come from
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {sources.map(source => (
              <article
                key={source.name}
                className="civic-card-hover flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="space-y-2">
                  <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900">
                    Named in this guide
                  </span>
                  <h3 className="text-base font-bold text-gray-950">
                    {source.name}
                  </h3>
                  <p className="text-xs leading-relaxed text-gray-600">
                    {source.note}
                  </p>
                </div>
                {source.href ? (
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 underline"
                  >
                    Open source
                    <ExternalLink className="size-3" />
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section
          id="contact"
          className="scroll-mt-28 grid gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-2"
        >
          <div className="space-y-3">
            <p className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-blue-700 uppercase">
              <Send className="size-4" />
              Contact
            </p>
            <h2 className="text-xl font-bold text-gray-950">
              Municipal Hall, Ocampo, Camarines Sur 4419
            </h2>
            <p className="text-xs leading-relaxed text-gray-600">
              Municipal questions go to the LGU, not to the people maintaining
              this portal.
            </p>
            <ul className="space-y-2 text-xs text-gray-700">
              <li>
                <a
                  className="font-semibold text-blue-700 underline"
                  href={FACEBOOK}
                >
                  LGU Facebook page
                </a>
              </li>
              <li>
                <Link
                  className="font-semibold text-blue-700 underline"
                  to="/government/departments/contact"
                >
                  Contact details published on this portal
                </Link>
              </li>
              <li>No municipal website was found when this was checked.</li>
            </ul>
            <p className="text-xs text-gray-600">
              No municipal hotline or office email is listed until one is
              verified.
            </p>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-blue-200 bg-blue-50/70 p-5">
            <div className="space-y-2">
              <p className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-emerald-700 uppercase">
                <HeartHandshake className="size-4" />
                Corrections
              </p>
              <h2 className="text-xl font-bold text-gray-950">
                Built for Ocampo at ₱0
              </h2>
              <p className="text-xs leading-relaxed text-gray-600">
                This portal is an open community project. If a page states a
                fact that a public record does not support, open an issue on
                GitHub.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={GITHUB}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                <ShieldCheck className="size-3.5" />
                Open an issue on GitHub
              </a>
              <Link
                to="/services"
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-900 hover:bg-gray-50"
              >
                Browse service guides
              </Link>
            </div>
          </div>
        </section>
      </CivicPage>
    </>
  );
};

export default About;
