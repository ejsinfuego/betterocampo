import Breadcrumbs from '../components/ui/Breadcrumbs';
import {
  CivicPage,
  Notice,
  PageHeader,
  SurfaceCard,
} from '../components/ui/PageFrame';
import DirectoryCard from '../components/ui/DirectoryCard';
import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  loadMarkdownContent,
  type MarkdownContent,
} from '../lib/markdownLoader';
import { createMarkdownComponents } from '../lib/markdownComponents';
import { getTypographyTheme } from '../lib/typographyThemes';
import {
  serviceCategories,
  governmentCategories,
  getCategorySubcategories,
  isNestedCategory,
  type Subcategory,
  type CategoryIndex,
} from '../data/yamlLoader';
import SEO from '../components/SEO';
import { FileText } from 'lucide-react';

interface DocumentProps {
  theme?: string;
  categoryType?: 'service' | 'government';
}

export default function Document({
  theme: initialTheme = 'default',
  categoryType,
}: DocumentProps) {
  const { documentSlug, category } = useParams();
  const [markdownContent, setMarkdownContent] =
    useState<MarkdownContent | null>(null);
  const [nestedIndex, setNestedIndex] = useState<CategoryIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const markdownComponents = createMarkdownComponents(
    getTypographyTheme(initialTheme)
  );

  const [breadcrumbs, setBreadcrumbs] = useState([
    { label: 'Home', href: '/' },
  ]);

  useEffect(() => {
    if (!documentSlug || !category || !categoryType) {
      setError('No document specified');
      setLoading(false);
      return;
    }

    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const isGovernment = categoryType === 'government';
        const categories = isGovernment
          ? governmentCategories.categories
          : serviceCategories.categories;
        const sectionLabel = isGovernment ? 'Government' : 'Services';
        const sectionHref = isGovernment ? '/government' : '/services';
        const categoryData = categories.find(c => c.slug === category);

        // If the slug maps to its own index, render it as a nested listing
        if (isNestedCategory(documentSlug)) {
          const index = await getCategorySubcategories(documentSlug);
          setNestedIndex(index);
          setBreadcrumbs([
            { label: 'Home', href: '/' },
            { label: sectionLabel, href: sectionHref },
            {
              label: categoryData?.category ?? category,
              href: `${sectionHref}/${category}`,
            },
            {
              label: documentSlug,
              href: `${sectionHref}/${category}/${documentSlug}`,
            },
          ]);
          return;
        }

        const content = await loadMarkdownContent(
          documentSlug,
          category,
          categoryType
        );
        setMarkdownContent(content);

        setBreadcrumbs([
          { label: 'Home', href: '/' },
          { label: sectionLabel, href: sectionHref },
          {
            label: categoryData?.category ?? category,
            href: `${sectionHref}/${category}`,
          },
          {
            label: content.title ?? documentSlug,
            href: `${sectionHref}/${category}/${documentSlug}`,
          },
        ]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load document'
        );
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [documentSlug, category, categoryType]);

  if (loading) {
    return (
      <CivicPage>
        <Notice tone="info" title="Loading document">
          The page is opening.
        </Notice>
      </CivicPage>
    );
  }

  if (error) {
    return (
      <CivicPage>
        <Breadcrumbs items={breadcrumbs} />
        <Notice tone="error" title="Document not found">
          {error}
        </Notice>
      </CivicPage>
    );
  }

  if (nestedIndex) {
    const nestedPages: Subcategory[] = nestedIndex.pages;
    const sectionHref =
      categoryType === 'government' ? '/government' : '/services';
    return (
      <>
        <SEO
          title={documentSlug}
          keywords={`${documentSlug}, government services, local government`}
        />
        <CivicPage>
          <Breadcrumbs items={breadcrumbs} />
          <PageHeader
            eyebrow="Directory"
            title={nestedIndex.title || documentSlug || 'Pages'}
            description={nestedIndex.description}
          />
          <div
            className={
              nestedIndex.layout === 'grid'
                ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid grid-cols-1 gap-4'
            }
          >
            {nestedPages.map((page, i) => (
              <DirectoryCard
                key={page.slug ?? i}
                to={`${sectionHref}/${documentSlug}/${page.slug}`}
                title={page.name}
                description={page.description}
                icon={<FileText className="size-5" />}
                footer="Read page"
              />
            ))}
          </div>
        </CivicPage>
      </>
    );
  }

  if (!markdownContent) {
    return null;
  }

  return (
    <>
      <SEO
        title={markdownContent.title || documentSlug}
        description={
          markdownContent.description ||
          `Government service information for ${documentSlug}`
        }
        keywords={`${documentSlug}, government services, public services, local government`}
      />
      <CivicPage>
        <Breadcrumbs items={breadcrumbs} />
        <SurfaceCard as="article" className="p-5 sm:p-8">
          {markdownContent.description ? (
            <p className="mb-5 rounded-xl border border-primary-100 bg-primary-50/70 px-4 py-3 text-sm text-gray-700">
              {markdownContent.description}
            </p>
          ) : null}
          <div className="markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {markdownContent.content}
            </ReactMarkdown>
          </div>
        </SurfaceCard>
      </CivicPage>
    </>
  );
}
