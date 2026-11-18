/**
 * Writes public/sitemap.xml and public/robots.txt from the routes and
 * markdown pages the site actually serves.
 *
 * Usage:
 *   node scripts/sitemap.mjs
 *
 * Called from `npm run index-content`, which `dev` and `build` already run.
 */

import { readFileSync, statSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = (
  process.env.SITEMAP_ORIGIN || 'https://betterocampo.org'
).replace(/\/$/, '');

function lastmod(filePath) {
  try {
    return statSync(filePath).mtime.toISOString().slice(0, 10);
  } catch {
    return undefined;
  }
}

function add(pages, loc, priority, filePath) {
  if (pages.has(loc)) return;
  const modified = filePath ? lastmod(filePath) : undefined;
  pages.set(loc, { loc, priority, lastmod: modified });
}

function markdownPages(pages, dir, categorySlug, priority) {
  const indexPath = join(ROOT, `content/${dir}/${categorySlug}/index.yaml`);
  let listed = [];
  try {
    listed = yaml.load(readFileSync(indexPath, 'utf8')).pages ?? [];
  } catch {
    return;
  }

  const section = dir === 'services' ? 'services' : 'government';
  for (const page of listed) {
    const mdPath = join(ROOT, `content/${dir}/${categorySlug}/${page.slug}.md`);
    try {
      readFileSync(mdPath, 'utf8');
    } catch {
      continue;
    }
    add(pages, `/${section}/${categorySlug}/${page.slug}`, priority, mdPath);
  }
}

function collectPages() {
  const pages = new Map();

  add(pages, '/', '1.0');
  add(pages, '/needs', '0.8');
  add(pages, '/services', '0.8');
  add(pages, '/government', '0.8');
  add(pages, '/about', '0.5');
  add(pages, '/search', '0.4');

  const services = yaml.load(
    readFileSync(join(ROOT, 'src/data/services.yaml'), 'utf8')
  );
  for (const category of services.categories) {
    const indexPath = join(
      ROOT,
      `content/services/${category.slug}/index.yaml`
    );
    add(pages, `/services/${category.slug}`, '0.7', indexPath);
    markdownPages(pages, 'services', category.slug, '0.6');
  }

  const government = yaml.load(
    readFileSync(join(ROOT, 'src/data/government.yaml'), 'utf8')
  );
  for (const category of government.categories) {
    const indexPath = join(
      ROOT,
      `content/government/${category.slug}/index.yaml`
    );
    add(pages, `/government/${category.slug}`, '0.7', indexPath);
    markdownPages(pages, 'government', category.slug, '0.6');
  }

  return [...pages.values()].sort((a, b) => {
    const byPriority = Number(b.priority) - Number(a.priority);
    if (byPriority !== 0) return byPriority;
    return a.loc.localeCompare(b.loc);
  });
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function sitemapXml(pages) {
  const urls = pages
    .map(page => {
      const lines = [
        '  <url>',
        `    <loc>${escapeXml(`${ORIGIN}${page.loc}`)}</loc>`,
      ];
      if (page.lastmod) lines.push(`    <lastmod>${page.lastmod}</lastmod>`);
      lines.push(`    <priority>${page.priority}</priority>`, '  </url>');
      return lines.join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function main() {
  const pages = collectPages();
  writeFileSync(join(ROOT, 'public/sitemap.xml'), sitemapXml(pages));
  writeFileSync(
    join(ROOT, 'public/robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`
  );
  console.log(`Wrote ${pages.length} URLs to public/sitemap.xml`);
}

main();
