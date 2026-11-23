import Breadcrumbs from '../components/ui/Breadcrumbs';
import {
  CivicPage,
  Notice,
  PageHeader,
  SurfaceCard,
} from '../components/ui/PageFrame';
import DirectoryCard from '../components/ui/DirectoryCard';
import { useLocation, useParams } from 'react-router';
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
import ContactView from '../components/government/ContactView';
import ExecutiveView from '../components/government/ExecutiveView';
import LegislativeView from '../components/government/LegislativeView';
import ProjectsMap from '../components/government/ProjectsMap';
import { projectsBody } from '../components/government/nationalProjects';
import { parseContactMarkdown } from '../components/government/contactDirectory';
import { parseExecutiveMarkdown } from '../components/government/executiveProfile';
import {
  legislativePageMeta,
  parseLegislativeMarkdown,
} from '../components/government/legislativeRoster';
import { FileText } from 'lucide-react';

interface DocumentProps {
  theme?: string;
  categoryType?: 'service' | 'government';
  slug?: string;
  category?: string;
}

export default function Document({
  theme: initialTheme = 'default',
  categoryType,
  slug,
  category: categoryProp,
}: DocumentProps) {
  const params = useParams();
  const { pathname } = useLocation();
  const documentSlug = slug ?? params.documentSlug;
  const category = categoryProp ?? params.category;
  const siteUrl = (
    import.meta.env.VITE_WEBSITE_URL || 'https://betterocampo.org'
  ).replace(/\/$/, '');
  const [markdownContent, setMarkdownContent] =
    useState<MarkdownContent | null>(null);
  const [nestedIndex, setNestedIndex] = useState<CategoryIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState<string | null>(null);

  const markdownComponents = createMarkdownComponents(
    getTypographyTheme(initialTheme)
  );

  const [breadcrumbs, setBreadcrumbs] = useState([
    { label: 'Home', href: '/' },
  ]);

  useEffect(() => {
    setPageTitle(null);

    if (!documentSlug || !category || !categoryType) {
      setError('No document specified');
      setLoading(false);
      return;
    }

    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);
        setMarkdownContent(null);
        setNestedIndex(null);

        const isGovernment = categoryType === 'government';
        const categories = isGovernment
          ? governmentCategories.categories
          : serviceCategories.categories;
        const sectionLabel = isGovernment ? 'Government' : 'Services';
        const sectionHref = isGovernment ? '/government' : '/services';
        const categoryData = categories.find(c => c.slug === category);
        const index = await getCategorySubcategories(category);
        const listedPage = index.pages.find(page => page.slug === documentSlug);
        setPageTitle(listedPage?.name ?? null);

        const nextBreadcrumbs =
          documentSlug === 'projects'
            ? [
                { label: 'Home', href: '/' },
                { label: 'Projects', href: '/projects' },
              ]
            : [
                { label: 'Home', href: '/' },
                { label: sectionLabel, href: sectionHref },
                {
                  label: categoryData?.category ?? category,
                  href: `${sectionHref}/${category}`,
                },
                {
                  label: listedPage?.name ?? documentSlug,
                  href: `${sectionHref}/${category}/${documentSlug}`,
                },
              ];
        setBreadcrumbs(nextBreadcrumbs);

        // If the slug maps to its own index, render it as a nested listing
        if (isNestedCategory(documentSlug)) {
          const nested = await getCategorySubcategories(documentSlug);
          setNestedIndex(nested);
          return;
        }

        const content = await loadMarkdownContent(
          documentSlug,
          category,
          categoryType
        );
        setMarkdownContent(content);
        if (content.title) {
          setBreadcrumbs(current =>
            current.map((item, i) =>
              i === current.length - 1
                ? { ...item, label: content.title ?? item.label }
                : item
            )
          );
        }
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
    const uncheckedTitle = pageTitle || 'This page';
    return (
      <>
        <SEO
          title={uncheckedTitle}
          description="The information for this page has not been checked yet."
        />
        <CivicPage>
          <Breadcrumbs items={breadcrumbs} />
          <PageHeader
            eyebrow="Not checked yet"
            title={uncheckedTitle}
            description="The information for this page has not been checked yet. Local fees, schedules, and hotlines stay off until a public source is added."
          />
        </CivicPage>
      </>
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

  const legislativeRoster =
    documentSlug === 'legislative'
      ? parseLegislativeMarkdown(markdownContent.content)
      : null;
  const contactDirectory =
    documentSlug === 'contact'
      ? parseContactMarkdown(markdownContent.content)
      : null;
  const executiveProfile =
    documentSlug === 'executive'
      ? parseExecutiveMarkdown(markdownContent.content)
      : null;
  const legislativeMeta = legislativeRoster
    ? legislativePageMeta(legislativeRoster, `${siteUrl}${pathname}`, siteUrl)
    : null;

  return (
    <>
      <SEO
        title={legislativeMeta?.title || markdownContent.title || documentSlug}
        description={
          documentSlug === 'projects'
            ? 'Ocampo Cam Sur projects named in the national budget for Ocampo, Camarines Sur.'
            : legislativeMeta?.description ||
              markdownContent.description ||
              `Government service information for ${documentSlug}`
        }
        keywords={
          documentSlug === 'projects'
            ? 'ocampo cam sur projects, Ocampo Cam Sur projects, Ocampo, Camarines Sur'
            : legislativeMeta?.keywords ||
              `${documentSlug}, government services, public services, local government`
        }
        url={legislativeMeta ? `${siteUrl}${pathname}` : undefined}
        jsonLd={legislativeMeta?.jsonLd}
      />
      <CivicPage>
        <Breadcrumbs items={breadcrumbs} />
        {legislativeRoster ? (
          <>
            <PageHeader
              eyebrow={`Camarines Sur · ${legislativeRoster.term}`}
              title={legislativeMeta?.title || 'Sangguniang Bayan'}
              description={
                legislativeRoster.summary ||
                markdownContent.description ||
                `Sangguniang Bayan roster for term ${legislativeRoster.term}.`
              }
            />
            <LegislativeView roster={legislativeRoster} />
          </>
        ) : contactDirectory ? (
          <>
            <PageHeader
              title={markdownContent.title || 'Contact'}
              description={
                contactDirectory.summary ||
                markdownContent.description ||
                'How to reach municipal offices in Ocampo.'
              }
            />
            <ContactView directory={contactDirectory} />
          </>
        ) : executiveProfile ? (
          <>
            <PageHeader
              title={markdownContent.title || 'Executive'}
              description={
                executiveProfile.summary ||
                markdownContent.description ||
                'Mayor and Vice Mayor for the current term.'
              }
            />
            <ExecutiveView profile={executiveProfile} />
          </>
        ) : documentSlug === 'projects' ? (
          <>
            <PageHeader
              title={markdownContent.title || 'Projects'}
              description={markdownContent.description}
            />
            <ProjectsMap markdown={markdownContent.content} />
            <SurfaceCard as="article" className="p-5 sm:p-8">
              <div className="markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {projectsBody(markdownContent.content)}
                </ReactMarkdown>
              </div>
            </SurfaceCard>
          </>
        ) : (
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
        )}
      </CivicPage>
    </>
  );
}
