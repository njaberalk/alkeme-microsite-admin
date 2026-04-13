import { NextResponse } from 'next/server';
import { sites, contentTypes } from '@/lib/sites.config';
import { readFile, writeFile } from '@/lib/github';
import { parseDataFile, serializeDataFile } from '@/lib/parser';

export async function POST(request, { params }) {
  try {
    const { site, type } = await params;
    const body = await request.json();
    const { slug } = body;

    const siteConfig = sites[site];
    const typeConfig = contentTypes[type];
    if (!siteConfig || !typeConfig) return NextResponse.json({ error: 'Invalid site or type' }, { status: 404 });
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

    const { content, sha } = await readFile(siteConfig.repo, typeConfig.file);
    const parsed = parseDataFile(content);
    const items = Array.isArray(parsed.data) ? parsed.data : [];

    const index = items.findIndex((i) => i.slug === slug);
    if (index === -1) return NextResponse.json({ error: `Item "${slug}" not found` }, { status: 404 });

    const removed = items.splice(index, 1)[0];
    const newContent = serializeDataFile(parsed.primaryExport, items);

    const result = await writeFile(
      siteConfig.repo, typeConfig.file, newContent, sha,
      `CMS: Delete ${type}/${slug}`,
    );

    return NextResponse.json({ success: true, deleted: removed.title || removed.name || slug, sha: result.sha });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
