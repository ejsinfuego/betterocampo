import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useQueryState } from 'nuqs';
import { ArrowRight, Search as SearchIcon } from 'lucide-react';
import { trackSearch } from '../lib/analytics';
import { searchContent } from '../lib/search';
import type { SearchHit } from '../lib/search';
import { CivicPage, PageHeader } from '../components/ui/PageFrame';

export default function Search() {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [results, setResults] = useState<SearchHit[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(() => {
      const term = query.trim();
      const hits = searchContent(term);
      setResults(hits);
      setHasSearched(true);
      trackSearch(term);
    }, 200);

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

      {hasSearched && results.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-500">
          No results for{' '}
          <span className="font-medium text-gray-800">
            &ldquo;{query}&rdquo;
          </span>
        </p>
      )}

      {results.length > 0 && (
        <div>
          <p className="mb-1 text-xs text-gray-500">
            {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;
            {query}&rdquo;
          </p>
          <ul className="divide-y divide-gray-100 border-t border-gray-100">
            {results.map(hit => (
              <li key={hit.id}>
                <Link
                  to={hit.url}
                  className="group flex items-start gap-3 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-[11px] font-medium tracking-wide uppercase ${
                        hit.type === 'service'
                          ? 'text-primary-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {hit.category}
                    </p>
                    <p className="mt-0.5 text-[15px] font-semibold tracking-tight text-gray-950 group-hover:text-primary-800">
                      {hit.title}
                    </p>
                    {hit.description ? (
                      <p className="mt-0.5 line-clamp-1 text-sm text-gray-500">
                        {hit.description}
                      </p>
                    ) : null}
                  </div>
                  <ArrowRight className="mt-1 size-4 shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary-700" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!hasSearched && (
        <p className="py-8 text-center text-sm text-gray-400">
          Start typing to search across services and government information
        </p>
      )}
    </CivicPage>
  );
}
