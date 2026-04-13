import { NextResponse } from 'next/server';
import { sites } from '@/lib/sites.config';
import { readFile, writeFile } from '@/lib/github';
import { parseDataFile, serializeDataFile } from '@/lib/parser';

export async function POST(request, { params }) {
  try {
    const { site } = await params;
    const body = await request.json();
    const { changes, path } = body;

    const siteConfig = sites[site];
    if (!siteConfig) return NextResponse.json({ error: 'Invalid site' }, { status: 404 });
    if (!changes || changes.length === 0) return NextResponse.json({ error: 'No changes' }, { status: 400 });

    const pageInfo = parsePath(path);
    const results = { applied: 0, staged: 0 };

    // Separate changes by type
    const textChanges = changes.filter((c) => c.type === 'text');
    const styleChanges = changes.filter((c) => c.type === 'style');
    const imageChanges = changes.filter((c) => c.type === 'image');
    const linkChanges = changes.filter((c) => c.type === 'link');
    const blockChanges = changes.filter((c) => c.type === 'block');

    // 1. Apply text changes to data files (if on a content page)
    if (pageInfo && textChanges.length > 0) {
      try {
        const { content, sha } = await readFile(siteConfig.repo, pageInfo.file);
        const parsed = parseDataFile(content);
        const items = Array.isArray(parsed.data) ? parsed.data : [];
        const item = items.find((i) => i.slug === pageInfo.slug);

        if (item) {
          let modified = false;
          for (const change of textChanges) {
            modified = applyTextChange(item, change) || modified;
          }
          if (modified) {
            const newContent = serializeDataFile(parsed.primaryExport, items);
            await writeFile(siteConfig.repo, pageInfo.file, newContent, sha,
              `CMS: Update ${pageInfo.type}/${pageInfo.slug} (visual editor)`);
            results.applied += textChanges.length;
          }
        }
      } catch (e) {
        console.error('Text change apply error:', e);
      }
    }

    // 2. Apply style changes that match theme tokens to globals.css
    const themeStyleChanges = styleChanges.filter((c) =>
      ['color', 'backgroundColor', 'borderColor'].includes(c.property)
    );
    // Non-theme style changes go to staged
    const otherStyleChanges = styleChanges.filter((c) =>
      !['color', 'backgroundColor', 'borderColor'].includes(c.property)
    );

    // 3. Stage everything that can't be auto-applied
    const stagedChanges = [
      ...(!pageInfo ? textChanges : []),
      ...otherStyleChanges,
      ...themeStyleChanges, // TODO: map to theme tokens
      ...imageChanges,
      ...linkChanges,
      ...blockChanges,
    ];

    if (stagedChanges.length > 0) {
      const changeData = JSON.stringify({
        path,
        site,
        changes: stagedChanges,
        timestamp: new Date().toISOString(),
      }, null, 2);
      await writeFile(
        siteConfig.repo,
        `cms-changes/${Date.now()}.json`,
        changeData,
        null,
        `CMS Visual Editor: ${stagedChanges.length} change(s) on ${path}`,
      );
      results.staged += stagedChanges.length;
    }

    return NextResponse.json({
      success: true,
      applied: results.applied,
      staged: results.staged,
      message: results.applied > 0
        ? `Applied ${results.applied} changes directly. ${results.staged > 0 ? `${results.staged} staged for review.` : ''}`
        : `${results.staged} changes staged for review.`,
    });
  } catch (error) {
    console.error('Visual editor save error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function parsePath(path) {
  const relative = path.replace(/^\/|\/$/g, '');
  const typeMap = {
    coverage: { type: 'coverages', file: 'data/coverages.js' },
    industry: { type: 'industries', file: 'data/industries.js' },
    resources: { type: 'resources', file: 'data/resources.js' },
    blog: { type: 'blog', file: 'data/blog.js' },
    state: { type: 'states', file: 'data/states-part1.js' },
    city: { type: 'cities', file: 'data/cities-part1.js' },
  };
  const parts = relative.split('/');
  if (parts.length < 2) return null;
  const mapping = typeMap[parts[0]];
  if (!mapping) return null;
  return { ...mapping, slug: parts[1] };
}

function applyTextChange(item, change) {
  const oldText = change.oldText?.trim();
  const newText = change.newText?.trim();
  if (!oldText || !newText || oldText === newText) return false;

  const fields = ['title', 'heroHeading', 'heroSubheading', 'overview', 'metaTitle', 'metaDescription'];
  for (const f of fields) {
    if (item[f]?.trim() === oldText) { item[f] = newText; return true; }
  }
  if (item.sections) {
    for (const s of item.sections) {
      if (s.heading?.trim() === oldText) { s.heading = newText; return true; }
      if (s.content?.trim() === oldText) { s.content = newText; return true; }
      if (s.bullets) {
        for (let i = 0; i < s.bullets.length; i++) {
          if (s.bullets[i]?.trim() === oldText) { s.bullets[i] = newText; return true; }
        }
      }
    }
  }
  if (item.faqs) {
    for (const f of item.faqs) {
      if (f.q?.trim() === oldText) { f.q = newText; return true; }
      if (f.a?.trim() === oldText) { f.a = newText; return true; }
    }
  }
  return false;
}
