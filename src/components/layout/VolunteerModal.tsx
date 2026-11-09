import React, { useCallback, useEffect, useState } from 'react';
import {
  Database,
  HeartHandshake,
  Languages,
  Layers,
  Megaphone,
  Palette,
  X,
} from 'lucide-react';
import { Link } from 'react-router';

const DISMISSED_STORAGE_KEY = 'betterocampo:volunteer-popup:dismissed:v2';
const GITHUB = 'https://github.com/ejsinfuego/betterocampo';
const OPEN_DELAY_MS = 12000;

const ROLES = [
  { label: 'Community writers', Icon: Megaphone },
  { label: 'Visual design', Icon: Palette },
  { label: 'Public records research', Icon: Database },
  { label: 'Bikol / Filipino translation', Icon: Languages },
  { label: 'Service guide updates', Icon: Layers },
  { label: 'Barangay outreach', Icon: HeartHandshake },
] as const;

const VolunteerModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const siteName = import.meta.env.VITE_GOVERNMENT_NAME || 'Better Ocampo';

  const dismiss = useCallback(() => {
    setOpen(false);
    try {
      window.sessionStorage.setItem(DISMISSED_STORAGE_KEY, '1');
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(DISMISSED_STORAGE_KEY)) return;
    } catch {
      // Ignore storage errors
    }

    const timer = window.setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, dismiss]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="volunteer-popup-title"
      className="fixed inset-0 z-[100] flex items-end justify-center bg-gray-950/50 p-4 sm:items-center"
      onClick={event => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <div className="animate-civic-fade-up relative w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close volunteer popup"
          className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
        >
          <X className="size-4" />
        </button>

        <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 px-6 pt-7 pb-6 text-center text-white">
          <span
            className="pointer-events-none absolute -top-16 -right-10 size-44 rounded-full bg-white/10 blur-2xl"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -bottom-20 -left-12 size-48 rounded-full bg-primary-400/30 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative">
            <img
              src="/logos/png/BetterOcampo-Seal.png"
              alt=""
              className="mx-auto size-16 object-contain"
            />
            <span className="mt-3 inline-block rounded-full bg-white/15 px-3 py-0.5 text-[11px] font-semibold tracking-wide text-white/95 uppercase">
              {siteName} · Cost to residents = ₱0
            </span>
            <h2
              id="volunteer-popup-title"
              className="mt-2 font-serif text-2xl font-semibold tracking-tight"
            >
              Help keep this guide useful
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-white/90">
              Ocampo, Camarines Sur deserves a clear community guide. Help keep
              local pages accurate for every resident.
            </p>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <p className="text-center text-sm leading-relaxed text-gray-700">
            We welcome people from Ocampo and nearby towns who want to help
            through their skills:
          </p>

          <div role="list" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ROLES.map(({ label, Icon }) => (
              <div
                key={label}
                role="listitem"
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-900"
              >
                <Icon className="size-4 shrink-0 text-primary-600" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <a
              href={GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              onClick={dismiss}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-xs font-bold text-white hover:bg-primary-700"
            >
              <HeartHandshake className="size-4" />
              Contribute on GitHub
            </a>
            <Link
              to="/about"
              onClick={dismiss}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-xs font-bold text-primary-800 hover:bg-primary-100"
            >
              Read About
            </Link>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={dismiss}
              className="text-xs font-medium text-gray-600 underline-offset-2 hover:text-gray-950 hover:underline"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerModal;
