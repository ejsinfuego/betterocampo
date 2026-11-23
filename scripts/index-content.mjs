/**
 * Builds a static search index from markdown content.
 *
 * Usage:
 *   node scripts/index-content.mjs
 *   npm run index-content
 *
 * Writes src/data/search-index.json for the client MiniSearch index.
 * Re-run after adding or editing content under content/.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT = join(ROOT, 'src/data/search-index.json');

function extractTitle(markdown) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '';
}

function extractDescription(markdown) {
  const match = markdown.match(/^#\s+.+$\n\n(.+?)(?:\n\n|$)/ms);
  if (!match) return '';
  return match[1].replace(/^>\s*/, '').trim();
}

function loadCompanion(mdPath) {
  const jsonPath = mdPath.replace(/\.md$/, '.json');
  if (!existsSync(jsonPath)) return {};
  try {
    const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
    return data && typeof data === 'object' ? data : {};
  } catch {
    return {};
  }
}

function interpolate(content, data) {
  return content.replace(/\{([A-Z0-9_]+)\}/g, (match, key) => {
    if (
      data &&
      Object.prototype.hasOwnProperty.call(data, key) &&
      data[key] != null
    ) {
      return String(data[key]);
    }
    return match;
  });
}

function prepareMarkdown(mdPath, raw) {
  return interpolate(raw, loadCompanion(mdPath)).replace(/^TODO:.*$/gm, '');
}

function stripMarkdown(content) {
  return content
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/gs, '$1')
    .replace(/\*(.+?)\*/gs, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\{[A-Z0-9_]+\}/g, '')
    .replace(/\|.+\|/g, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function loadMarkdownPages(dir, categorySlug, categoryName, type) {
  const documents = [];

  const indexPath = join(ROOT, `content/${dir}/${categorySlug}/index.yaml`);
  let pages = [];
  try {
    const indexYaml = readFileSync(indexPath, 'utf8');
    const indexData = yaml.load(indexYaml);
    pages = indexData.pages ?? [];
  } catch {
    return documents;
  }

  for (const page of pages) {
    const mdPath = join(ROOT, `content/${dir}/${categorySlug}/${page.slug}.md`);
    try {
      const raw = prepareMarkdown(mdPath, readFileSync(mdPath, 'utf8'));
      const title = extractTitle(raw) || page.name;
      const description = extractDescription(raw) || page.description || '';
      documents.push({
        id: `${type}-${categorySlug}-${page.slug}`,
        title,
        description,
        content: stripMarkdown(raw),
        type,
        category: categoryName,
        categorySlug,
        slug: page.slug,
        url: `/${dir === 'services' ? 'services' : 'government'}/${categorySlug}/${page.slug}`,
      });
    } catch {
      // Content file doesn't exist yet — skip
    }
  }

  return documents;
}

function collectDocuments() {
  const documents = [];

  const servicesYaml = readFileSync(
    join(ROOT, 'src/data/services.yaml'),
    'utf8'
  );
  const servicesData = yaml.load(servicesYaml);
  for (const cat of servicesData.categories) {
    documents.push(
      ...loadMarkdownPages('services', cat.slug, cat.category, 'service')
    );
  }

  const govYaml = readFileSync(join(ROOT, 'src/data/government.yaml'), 'utf8');
  const govData = yaml.load(govYaml);
  for (const cat of govData.categories) {
    documents.push(
      ...loadMarkdownPages('government', cat.slug, cat.category, 'government')
    );
    if (cat.subcategories) {
      for (const sub of cat.subcategories) {
        documents.push(
          ...loadMarkdownPages(
            'government',
            `${cat.slug}/${sub.slug}`,
            sub.name,
            'government'
          )
        );
      }
    }
  }

  const projectsPath = join(ROOT, 'content/government/departments/projects.md');
  try {
    const raw = prepareMarkdown(
      projectsPath,
      readFileSync(projectsPath, 'utf8')
    );
    documents.push({
      id: 'projects',
      title: extractTitle(raw) || 'Projects',
      description: extractDescription(raw),
      content: stripMarkdown(raw),
      type: 'government',
      category: 'Projects',
      categorySlug: 'projects',
      slug: 'projects',
      url: '/projects',
    });
  } catch {
    // The standalone projects page is optional.
  }

  return documents;
}

function main() {
  const documents = collectDocuments();

  if (documents.length === 0) {
    console.warn('No documents found to index. Check content/ directory.');
    process.exit(1);
  }

  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, `${JSON.stringify(documents, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${documents.length} documents to ${OUTPUT}`);
}

main();
