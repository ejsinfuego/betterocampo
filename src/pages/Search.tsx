import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useQueryState } from 'nuqs';
import { ArrowRight, Search as SearchIcon } from 'lucide-react';
import { searchClient, SEARCH_INDEX } from '../lib/meilisearch';
import type { SearchHit } from '../lib/meilisearch';
import { CivicPage, PageHeader, SurfaceCard } from '../components/ui/PageFrame';

export default function Search() {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [results, setResults] = useState<SearchHit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const index = searchClient!.index(SEARCH_INDEX);
        const res = await index.search<SearchHit>(query, { limit: 20 });
        setResults(res.hits);
        setHasSearched(true);
      } catch {
        setError('Search is unavailable. Please try again later.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <CivicPage className="max-w-3xl">
      <PageHeader
        eyebrow="Find a page"
        title="Search"
        description="Look through service guides and government pages published on this portal."
      />

      <div className="relative">
        <SearchIcon className="absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value || null)}
          placeholder="Search services, departments, guides..."
          className="h-12 w-full rounded-xl border border-gray-200/90 bg-white/80 pr-4 pl-11 text-sm shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none backdrop-blur-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-500/20"
          autoFocus
        />
      </div>

      {error && (
        <p className="py-10 text-center text-sm text-error-600">{error}</p>
      )}

      {!error && isLoading && (
        <p className="py-10 text-center text-sm text-gray-500">Searching...</p>
      )}

      {!error && !isLoading && hasSearched && results.length === 0 && (
        <p className="py-10 text-center text-sm text-gray-500">
          No results for{' '}
          <span className="font-medium text-gray-800">
            &ldquo;{query}&rdquo;
          </span>
        </p>
      )}

      {!error && !isLoading && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;
            {query}&rdquo;
          </p>
          {results.map(hit => (
            <Link key={hit.id} to={hit.url} className="group block">
              <SurfaceCard className="civic-card-hover p-5 transition-[border-color,background-color,box-shadow] duration-300 hover:border-gray-300 hover:bg-white">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`text-[11px] font-medium tracking-wide uppercase ${
                      hit.type === 'service'
                        ? 'text-primary-700'
                        : 'text-emerald-700'
                    }`}
                  >
                    {hit.category}
                  </span>
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-gray-950 transition-colors group-hover:text-primary-700">
                  {hit.title}
                </h2>
                {hit.description ? (
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-500">
                    {hit.description}
                  </p>
                ) : null}
                <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary-700">
                  <span>Open</span>
                  <ArrowRight className="size-4 opacity-60 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                </div>
              </SurfaceCard>
            </Link>
          ))}
        </div>
      )}

      {!hasSearched && !isLoading && !error && (
        <p className="py-10 text-center text-sm text-gray-400">
          Start typing to search across services and government information
        </p>
      )}
    </CivicPage>
  );
}
