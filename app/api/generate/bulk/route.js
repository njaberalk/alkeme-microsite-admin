import { NextResponse } from 'next/server';
import { sites } from '@/lib/sites.config';
import { getKeywords, saveKeywords } from '@/lib/keywords';
import { enrichKeywords, pickNextCluster } from '@/lib/keyword-strategy';
import { generateBlogPost } from '@/lib/generator';
import { readFile } from '@/lib/github';
import { parseDataFile } from '@/lib/parser';

/**
 * Bulk generate articles for all (or specific) verticals.
 * Picks the best keyword per site, generates an article, saves as draft.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { mode = 'all', siteIds, count = 1 } = body;

    const targetSites = mode === 'all'
      ? Object.keys(sites)
      : (siteIds || []).filter((id) => sites[id]);

    const drafts = [];
    const errors = [];

    for (const siteId of targetSites) {
      try {
        // 1. Get keywords and pick best target
        const raw = await getKeywords(siteId);
        const enriched = enrichKeywords(raw);
        const cluster = pickNextCluster(enriched);

        if (!cluster) {
          errors.push({ site: siteId, error: 'No untargeted keywords — upload a CSV first' });
          continue;
        }

        const keyword = cluster.primaryKeyword.keyword;

        // 2. Get existing blog slugs to avoid duplicates
        const siteConfig = sites[siteId];
        let existingSlugs = [];
        try {
          const { content } = await readFile(siteConfig.repo, 'data/blog.js');
          const parsed = parseDataFile(content);
          existingSlugs = (Array.isArray(parsed.data) ? parsed.data : []).map((p) => p.slug);
        } catch { /* no blog file yet */ }

        // 3. Generate the article
        const post = await generateBlogPost(siteId, keyword, '', existingSlugs);

        // 4. Mark keywords as "planned"
        const updated = enriched.map((k) => {
          if (cluster.keywords.some((ck) => ck.keyword === k.keyword)) {
            return { ...k, status: 'planned', assignedSlug: post.slug };
          }
          return k;
        });
        await saveKeywords(siteId, updated);

        drafts.push({
          site: siteId,
          siteName: siteConfig.name,
          keyword,
          clusterSize: cluster.keywords.length,
          title: post.title,
          slug: post.slug,
          post, // full generated post for review
        });
      } catch (e) {
        errors.push({ site: siteId, error: e.message });
      }
    }

    return NextResponse.json({
      success: true,
      drafts,
      errors,
      summary: `Generated ${drafts.length} articles, ${errors.length} errors`,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
