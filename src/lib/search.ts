import MiniSearch from 'minisearch';
import searchIndex from '../data/search-index.json';

export interface SearchHit {
  id: string;
  title: string;
  description: string;
  type: 'service' | 'government';
  category: string;
  categorySlug: string;
  slug: string;
  url: string;
}

interface SearchDocument extends SearchHit {
  content: string;
}

const documents = searchIndex as SearchDocument[];

const miniSearch = new MiniSearch<SearchDocument>({
  fields: ['title', 'description', 'content', 'category'],
  storeFields: [
    'id',
    'title',
    'description',
    'type',
    'category',
    'categorySlug',
    'slug',
    'url',
  ],
  searchOptions: {
    boost: { title: 3, description: 2, category: 1.5 },
    fuzzy: 0.2,
    prefix: true,
  },
});

miniSearch.addAll(documents);

export function searchContent(query: string, limit = 20): SearchHit[] {
  const term = query.trim();
  if (!term) return [];

  return miniSearch
    .search(term)
    .slice(0, limit)
    .map(result => ({
      id: result.id,
      title: result.title,
      description: result.description,
      type: result.type,
      category: result.category,
      categorySlug: result.categorySlug,
      slug: result.slug,
      url: result.url,
    }));
}
