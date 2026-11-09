import * as LucideIcons from 'lucide-react';
import { ArrowRight, Landmark } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from '../../hooks/useTranslation';
import { governmentCategories } from '../../data/yamlLoader';
import DirectoryCard from '../ui/DirectoryCard';
import { CivicPage, PageHeader } from '../ui/PageFrame';

interface Category {
  category: string;
  slug: string;
  description: string;
  icon: string;
}

export default function GovernmentActivitySection({
  title,
  description,
  limit,
  asPage = false,
  eyebrow = 'Local government',
}: {
  title?: string;
  description?: string;
  limit?: number;
  asPage?: boolean;
  eyebrow?: string;
} = {}) {
  const { t } = useTranslation();
  const categories = governmentCategories.categories as Category[];
  const shown =
    typeof limit === 'number' ? categories.slice(0, limit) : categories;

  const getIcon = (name: string) => {
    const IconComponent = LucideIcons[
      name as keyof typeof LucideIcons
    ] as React.ComponentType<{ className?: string }>;
    return IconComponent ? <IconComponent className="size-5" /> : null;
  };

  const heading = title || t('governmentActivity.title');
  const body = description || t('governmentActivity.description');

  if (asPage) {
    return (
      <CivicPage>
        <PageHeader eyebrow={eyebrow} title={heading} description={body} />
        <div
          id="government"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {shown.map(category => (
            <DirectoryCard
              key={category.slug}
              to={`/government/${category.slug}`}
              title={category.category}
              description={category.description}
              icon={getIcon(category.icon)}
              footer="Open section"
            />
          ))}
        </div>
      </CivicPage>
    );
  }

  return (
    <section id="government" className="relative">
      <div className="relative mx-auto w-full max-w-7xl px-4 pt-4 pb-14 sm:px-6 sm:pt-6 sm:pb-20 lg:px-8">
        <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1.2fr)_auto] lg:gap-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-primary-700 uppercase">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-3xl tracking-tight text-gray-950 sm:text-4xl">
              {heading}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
              {body}
            </p>
          </div>

          {typeof limit === 'number' ? (
            <Link
              to="/government"
              className="inline-flex h-11 items-center justify-center gap-1.5 self-start rounded-xl border border-gray-200/90 bg-white/80 px-5 text-sm font-semibold text-gray-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-sm hover:bg-white hover:text-primary-700 lg:self-end"
            >
              View all {categories.length} sections
              <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map(category => (
            <DirectoryCard
              key={category.slug}
              to={`/government/${category.slug}`}
              title={category.category}
              description={category.description}
              icon={getIcon(category.icon)}
              footer="Open section"
            />
          ))}
          {typeof limit === 'number' ? (
            <DirectoryCard
              featured
              to="/government"
              title="Browse government sections"
              description="Departments, news, guides, reports, consultations, and transparency documents for Ocampo."
              badge={`${categories.length} sections`}
              icon={<Landmark className="size-5" />}
              footer="Browse all"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
