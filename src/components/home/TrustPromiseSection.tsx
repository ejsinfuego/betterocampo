import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';

const principles = [
  {
    title: 'Public sources only',
    body: 'Fees, schedules, and hotlines appear here only after a published source is checked.',
  },
  {
    title: 'Blanks stay blank',
    body: 'If the municipality has not posted a detail, this guide does not invent one.',
  },
  {
    title: 'Questions go to the LGU',
    body: 'Municipal requests belong with Ocampo offices—not the volunteers who maintain this portal.',
  },
] as const;

export default function TrustPromiseSection() {
  return (
    <section className="relative bg-white">
      <div className="relative mx-auto w-full max-w-7xl px-4 pt-4 pb-16 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8">
        <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1.2fr)_auto] lg:gap-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-primary-700 uppercase">
              Honest data promise
            </p>
            <h2 className="mt-2 text-3xl tracking-tight text-gray-950 sm:text-4xl">
              Unpublished local details stay blank
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
              Better Ocampo is a volunteer community guide. We publish what
              residents can verify—and leave gaps visible when a public source
              is missing.
            </p>
          </div>

          <div className="flex flex-col gap-2 self-start sm:flex-row lg:self-end">
            <Link
              to="/about"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
            >
              <ShieldCheck className="size-4" />
              How records are chosen
            </Link>
            <Link
              to="/about#contact"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-gray-200/90 bg-white px-5 text-sm font-semibold text-gray-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-gray-300 hover:text-primary-700"
            >
              <CheckCircle2 className="size-4 text-emerald-600" />
              Share a public record
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {principles.map(item => (
            <div
              key={item.title}
              className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.1)]"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10">
                <CheckCircle2 className="size-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-gray-950">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
