import { Link } from 'react-router';
import { AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import Hero from '../components/sections/Hero';
import ServicesSection from '../components/home/ServicesSection';
import GovernmentActivitySection from '../components/home/GovernmentActivitySection';
import SEO from '../components/SEO';

const Home: React.FC = () => {
  return (
    <>
      <SEO
        title="Home"
        description="Community transparency portal for the Municipality of Ocampo, Camarines Sur."
        keywords="Ocampo, Camarines Sur, government, services, transparency"
      />
      <Hero />
      <ServicesSection limit={5} />
      <GovernmentActivitySection limit={5} />
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="rounded-xl border border-amber-300/80 bg-amber-50/70 p-6 lg:col-span-3">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-1.5 rounded-full border border-amber-400 bg-amber-200/80 px-2 py-0.5 text-[11px] font-bold text-amber-950">
                <AlertTriangle className="size-3.5" />
                Honest data promise
              </p>
              <h2 className="mt-3 text-lg font-bold text-gray-950">
                Unpublished local details stay blank
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                If a fee, schedule, hotline, or office email is not yet posted
                on a public source, this guide leaves it out. Municipal
                questions go to the LGU, not to the people maintaining this
                portal.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <ShieldCheck className="size-4" />
                How records are chosen
              </Link>
              <Link
                to="/about#contact"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-100"
              >
                <CheckCircle2 className="size-4 text-amber-600" />
                Share a public record
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
