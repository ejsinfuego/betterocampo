import * as LucideIcons from 'lucide-react';
import { ArrowRight, Landmark } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from '../../hooks/useTranslation';
import { governmentCategories } from '../../data/yamlLoader';
import DirectoryCard from '../ui/DirectoryCard';

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
  eyebrow = 'Local government records',
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

  return (
    <section
      id="government"
      className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
    >
      <div
        className={
          asPage
            ? 'rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-50/80 via-white to-white p-4 shadow-sm sm:p-6 lg:p-8'
            : 'flex flex-col justify-between gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-end'
        }
      >
        <div>
          {asPage ? (
            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold tracking-wide text-blue-900 uppercase">
              {eyebrow}
            </span>
          ) : (
            <p className="text-xs font-semibold text-gray-500">{eyebrow}</p>
          )}
          {asPage ? (
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
              {title || t('governmentActivity.title')}
            </h1>
          ) : (
            <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-gray-950 sm:text-3xl">
              {title || t('governmentActivity.title')}
            </h2>
          )}
          <p
            className={`mt-2 max-w-3xl text-gray-500 ${asPage ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}
          >
            {description || t('governmentActivity.description')}
          </p>
        </div>
        {typeof limit === 'number' ? (
          <Link
            to="/government"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-800 hover:border-blue-300 hover:text-blue-700"
          >
            View all sections
            <ArrowRight className="size-3.5" />
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map(category => (
          <DirectoryCard
            key={category.slug}
            to={`/government/${category.slug}`}
            title={category.category}
            description={category.description}
            badge="Government"
            icon={getIcon(category.icon)}
            footer="Open section"
          />
        ))}
        {typeof limit === 'number' ? (
          <DirectoryCard
            featured
            to="/government"
            title="Browse government sections"
            description="Departments, news, guides, reports, consultations, and transparency documents."
            badge={`${categories.length} sections`}
            icon={<Landmark className="size-5" />}
            footer="Open government directory"
          />
        ) : null}
      </div>
    </section>
  );
}
