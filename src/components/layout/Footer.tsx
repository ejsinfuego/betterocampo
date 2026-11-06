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

const OFFICIAL_SITE = 'https://ocampo.camarinessur.gov.ph';
const GITHUB = 'https://github.com/ejsinfuego/betterocampo';

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Government', href: '/government' },
  { label: 'About', href: '/about' },
];

const sources = [
  { label: 'Official LGU website', href: OFFICIAL_SITE },
  { label: 'Open Data Philippines', href: 'https://data.gov.ph' },
  { label: 'Freedom of Information', href: 'https://www.foi.gov.ph' },
  { label: 'Official Gazette', href: 'https://www.officialgazette.gov.ph' },
  { label: 'BetterGov.ph', href: 'https://bettergov.ph' },
];

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const siteName = import.meta.env.VITE_GOVERNMENT_NAME || 'Better Ocampo';
  const facebook = footerNavigation.socialLinks[0];

  return (
    <footer className="mt-16 border-t border-gray-200 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <Link to="/" className="inline-flex items-center gap-2">
              <img
                src="/ocampo-seal.png"
                alt=""
                className="h-12 w-12 object-contain"
              />
              <span>
                <span className="block text-sm font-bold text-white">
                  {siteName}
                </span>
                <span className="text-[11px] text-slate-400">
                  Bicol Region V
                </span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              {t('hero.subtitle')} Facts stay linked to a public source. Missing
              local details are left blank instead of guessed.
            </p>
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-xs">
              <p className="font-semibold text-amber-400">
                Independent community guide
              </p>
              <p className="mt-1 leading-relaxed text-slate-400">
                For official municipal transactions, visit{' '}
                <a
                  href={OFFICIAL_SITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white underline hover:text-blue-300"
                >
                  ocampo.camarinessur.gov.ph
                </a>
                .
              </p>
            </div>
            {facebook ? (
              <a
                href={facebook.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-blue-900/60 bg-blue-950/40 px-3 py-2 text-xs font-semibold text-blue-200 hover:bg-blue-900/60 hover:text-white"
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
                    className="hover:text-white hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {footerNavigation.mainSections[1]?.links.slice(0, 4).map(link => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="hover:text-white hover:underline"
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
                    className="inline-flex items-center gap-1 text-slate-300 hover:text-white"
                  >
                    {source.label}
                    <ExternalLink className="size-3 shrink-0 text-slate-500" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <div
              role="status"
              className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/90 via-slate-900 to-blue-950/80 p-4 text-xs text-white"
            >
              <p className="font-semibold tracking-wide text-slate-300 uppercase">
                Community transparency pledge
              </p>
              <p className="mt-1.5 text-sm font-bold">
                Cost to the people of Ocampo ={' '}
                <span className="rounded-md border border-emerald-400/40 bg-emerald-500/20 px-2 py-0.5 font-mono text-emerald-300">
                  ₱0
                </span>
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                Volunteer-run public guide. It does not replace the municipal
                website.
              </p>
            </div>
            <a
              href={GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-500"
            >
              <HeartHandshake className="size-4" />
              Contribute on GitHub
            </a>
            <Link
              to="/about#contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white"
            >
              <FileText className="size-4" />
              Share a public record
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-950/60 px-3 py-2 text-[11px] font-medium text-emerald-300 hover:bg-emerald-900/60"
            >
              <ShieldCheck className="size-3.5" />
              Read how records are chosen
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-xs text-slate-400">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-white">{t('footer.copyright')}</p>
            <a
              href={GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-300 hover:text-white"
            >
              GitHub repository
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
