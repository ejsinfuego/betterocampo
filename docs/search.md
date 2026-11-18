# Local search

Site search runs entirely in the browser with [MiniSearch](https://lucaong.github.io/minisearch/). There is no Meilisearch server or API key.

## How it works

1. `npm run index-content` reads markdown under `content/` (via category YAML) and writes `src/data/search-index.json`.
2. `src/lib/search.ts` loads that JSON into MiniSearch.
3. `/search` and the hero search box query that in-memory index.

`npm run dev` and `npm run build` regenerate the index automatically.

## When to re-index

Re-run indexing after adding or editing pages under `content/`:

```bash
npm run index-content
```

If the Vite dev server is already running, restart it (or run `index-content` and let HMR pick up the JSON change).

## No environment variables

Search does not use `VITE_MEILISEARCH_*` or admin keys. Those can be removed from `.env` / `.env.local` if present.
