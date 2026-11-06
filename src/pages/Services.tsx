import { useParams } from 'react-router';
import {
  serviceCategories,
  getCategorySubcategories,
  type Subcategory,
  type CategoryIndex,
} from '../data/yamlLoader';
import * as LucideIcons from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ServicesSection from '../components/home/ServicesSection';
import SEO from '../components/SEO';
import DirectoryCard from '../components/ui/DirectoryCard';
import { CivicPage, Notice, PageHeader } from '../components/ui/PageFrame';
import { useState, useEffect } from 'react';

const Services: React.FC = () => {
  const { category } = useParams();
  const [categoryIndex, setCategoryIndex] = useState<CategoryIndex>({
    layout: 'list',
    pages: [],
  });
  const [loading, setLoading] = useState(false);
  const subcategories: Subcategory[] = categoryIndex.pages;

  const getCategory = () => {
    return serviceCategories.categories.find(c => c.slug === category);
  };

  const categoryData = getCategory();
  const ResolvedIcon = LucideIcons[
    categoryData?.icon as keyof typeof LucideIcons
  ] as React.ComponentType<{ className?: string }> | undefined;
  const Icon = ResolvedIcon ?? LucideIcons.FileText;

  useEffect(() => {
    if (category && categoryData) {
      setLoading(true);
      getCategorySubcategories(category)
        .then(setCategoryIndex)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [category, categoryData]);

  if (!category) {
    return (
      <>
        <SEO
          title="Services"
          description={`All services provided by the ${import.meta.env.VITE_GOVERNMENT_NAME} government. Find what you need for citizenship, business, education, and more.`}
          keywords="government services, public services, local government, civic services"
        />
        <ServicesSection
          asPage
          eyebrow="Service guides"
          title="Services"
          description={`Guides published for ${import.meta.env.VITE_GOVERNMENT_NAME}. Local fees, schedules, and hotlines stay off these pages until they are verified.`}
        />
      </>
    );
  }
  if (!categoryData) {
    return (
      <CivicPage>
        <Breadcrumbs />
        <Notice tone="error" title="Category not found">
          The category you are looking for does not exist.
        </Notice>
      </CivicPage>
    );
  }

  return (
    <>
      <SEO
        title={categoryData.category || category}
        description={categoryData.description}
        keywords={`${categoryData.category}, government services, public services, local government`}
      />
      <CivicPage>
        <Breadcrumbs />
        <PageHeader
          eyebrow="Service guide"
          title={categoryData.category || category}
          description={categoryData.description}
        />

        {loading ? (
          <p className="text-sm text-gray-500">Loading services...</p>
        ) : (
          <>
            {categoryIndex.title ? (
              <h2 className="text-xl font-bold tracking-tight text-gray-950">
                {categoryIndex.title}
              </h2>
            ) : null}
            {categoryIndex.description ? (
              <p className="text-sm text-gray-600">
                {categoryIndex.description}
              </p>
            ) : null}
            <div
              className={
                categoryIndex.layout === 'grid'
                  ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid grid-cols-1 gap-4'
              }
            >
              {subcategories.map(subcategory => (
                <DirectoryCard
                  key={subcategory.slug}
                  to={`/services/${category}/${subcategory.slug}`}
                  title={subcategory.name}
                  description={subcategory.description}
                  badge={categoryData.category || category}
                  icon={<Icon className="size-5" />}
                  footer="Read page"
                />
              ))}
            </div>
          </>
        )}
      </CivicPage>
    </>
  );
};

export default Services;
