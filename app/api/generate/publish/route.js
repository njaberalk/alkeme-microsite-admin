import { NextResponse } from 'next/server';
import { readFile, writeFile } from '@/lib/github';
import { parseDataFile, serializeDataFile } from '@/lib/parser';
import { getSite } from '@/lib/sites.config';
import { getKeywords, saveKeywords } from '@/lib/keywords';

export async function POST(request) {
  try {
    const { siteId, post } = await request.json();

    if (!siteId || !post) {
      return NextResponse.json({ error: 'siteId and post are required' }, { status: 400 });
    }

    const site = getSite(siteId);
    if (!site) {
      return NextResponse.json({ error: `Unknown site: ${siteId}` }, { status: 400 });
    }

    const branch = site.branch || 'master';
    const filePath = 'data/blog.js';

    // Read current blog.js from GitHub
    const { content, sha } = await readFile(site.repo, filePath, branch);

    // Parse the JS file to get existing posts
    const parsed = parseDataFile(content);
    const blogPosts = parsed.data;

    // Check for duplicate slug
    if (blogPosts.some(p => p.slug === post.slug)) {
      return NextResponse.json({ error: `Slug "${post.slug}" already exists` }, { status: 409 });
    }

    // Append the new post
    blogPosts.push(post);

    // Serialize back to JS
    const newContent = serializeDataFile('blogPosts', blogPosts, content);

    // Write back to GitHub
    const result = await writeFile(
      site.repo,
      filePath,
      newContent,
      sha,
      `Add blog post: ${post.title} (via CMS Content Generator)`,
      branch
    );

    // Update keyword status to "published"
    try {
      const keywords = getKeywords(siteId);
      if (keywords.length > 0) {
        const title = (post.title || '').toLowerCase();
        const slug = (post.slug || '').toLowerCase();
        const updated = keywords.map((k) => {
          const kw = k.keyword.toLowerCase();
          if (title.includes(kw) || slug.includes(kw.replace(/\s+/g, '-')) || k.assignedSlug === post.slug) {
            return { ...k, status: 'published', assignedSlug: post.slug, publishedDate: new Date().toISOString().split('T')[0] };
          }
          return k;
        });
        saveKeywords(siteId, updated);
      }
    } catch { /* keyword tracking is non-critical */ }

    return NextResponse.json({
      success: true,
      commitSha: result.commit,
      previewUrl: `${site.vercelUrl}${site.basePath}/blog/${post.slug}/`,
    });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
