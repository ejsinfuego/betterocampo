import {
  ExternalLink,
  FileText,
  Globe,
  HeartHandshake,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { footerNavigation } from '../../data/navigation';
import { cn } from '../../lib/utils';

const LGU_FACEBOOK = 'https://www.facebook.com/101706771551898';
const GITHUB = 'https://github.com/ejsinfuego/betterocampo';

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Government', href: '/government' },
  { label: 'About', href: '/about' },
  { label: 'Privacy', href: '/about#privacy' },
];

const sources = [
  { label: 'LGU Facebook page', href: LGU_FACEBOOK },
  { label: 'Open Data Philippines', href: 'https://data.gov.ph' },
  { label: 'Freedom of Information', href: 'https://www.foi.gov.ph' },
  { label: 'Official Gazette', href: 'https://www.officialgazette.gov.ph' },
  { label: 'BetterGov.ph', href: 'https://bettergov.ph' },
];

const Footer: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useTranslation();
  const siteName = import.meta.env.VITE_GOVERNMENT_NAME || 'Better Ocampo';
  const facebook = footerNavigation.socialLinks[0];

  return (
    <footer
      className={cn(
        'mt-16 border-t border-white/15 bg-primary-900 text-primary-100',
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <Link to="/" className="inline-flex items-center gap-2">
              <img
                src="/logos/webp/BetterOcampo-Seal.webp"
                alt=""
                width={640}
                height={640}
                decoding="async"
                className="h-12 w-12 object-contain"
              />
              <span>
                <span className="block text-sm font-bold text-white">
                  {siteName}
                </span>
                <span className="text-[11px] text-primary-200">
                  Bicol Region V
                </span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-primary-100">
              {t('hero.subtitle')} Facts stay linked to a public source. Missing
              local details are left blank instead of guessed.
            </p>
            <div className="rounded-xl border border-white/15 bg-white/10 p-3 text-xs">
              <p className="font-semibold text-amber-400">
                Independent community guide
              </p>
              <p className="mt-1 leading-relaxed text-slate-400">
                No municipal website was found when this was checked. Public
                updates are on the{' '}
                <a
                  href={LGU_FACEBOOK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white underline hover:text-blue-300"
                >
                  LGU Facebook page
                </a>
                .
              </p>
            </div>
            {facebook ? (
              <a
                href={facebook.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15"
              >
                <span className="truncate">LGU Facebook page</span>
                <ExternalLink className="ml-auto size-3 shrink-0 text-blue-400" />
              </a>
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold tracking-wider text-white uppercase">
              Quick links
            </h2>
            <ul className="grid grid-cols-2 gap-2 text-xs">
              {quickLinks.map(link => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="inline-flex min-h-6 items-center hover:text-white hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {footerNavigation.mainSections[1]?.links.slice(0, 4).map(link => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="inline-flex min-h-6 items-center hover:text-white hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-white uppercase">
              <Globe className="size-3.5 text-blue-400" />
              Public sources
            </h2>
            <ul className="flex flex-col gap-1.5 text-xs">
              {sources.map(source => (
                <li key={source.href}>
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-6 items-center gap-1 py-1 text-slate-300 hover:text-white"
                  >
                    {source.label}
                    <ExternalLink className="size-3 shrink-0 text-primary-200" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <div
              role="status"
              className="rounded-2xl border border-white/25 bg-white/10 p-4 text-xs text-white"
            >
              <p className="font-semibold tracking-wide text-primary-200 uppercase">
                Community transparency pledge
              </p>
              <p className="mt-1.5 text-sm font-bold">
                Cost to the people of Ocampo ={' '}
                <span className="rounded-md border border-emerald-400/40 bg-emerald-500/20 px-2 py-0.5 font-mono text-emerald-300">
                  ₱0
                </span>
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-primary-200">
                Volunteer-run public guide. Public updates stay on the LGU
                Facebook page.
              </p>
            </div>
            <a
              href={GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/15"
            >
              <HeartHandshake className="size-4" />
              Contribute on GitHub
            </a>
            <Link
              to="/about#contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15"
            >
              <FileText className="size-4" />
              Share a public record
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-[11px] font-medium text-white hover:bg-white/15"
            >
              <ShieldCheck className="size-3.5" />
              Read how records are chosen
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-white/15 pt-6 text-xs text-primary-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="font-semibold text-white">
                {t('footer.copyright')}
              </p>
              <p className="mt-1 leading-relaxed">
                Page views and the words in a completed search are sent to
                Google Analytics. The site does not ask for an account, and it
                does not collect PhilSys records.
              </p>
            </div>
            <span className="inline-flex items-center gap-4">
              <Link
                to="/about#privacy"
                className="inline-flex min-h-6 items-center text-white hover:underline"
              >
                Privacy
              </Link>
              <a
                href={GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-6 items-center gap-1 text-primary-200 hover:text-white"
              >
                GitHub repository
                <ExternalLink className="size-3" />
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
