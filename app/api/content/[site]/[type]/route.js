import { NextResponse } from 'next/server';
import { sites, contentTypes } from '@/lib/sites.config';
import { readFile } from '@/lib/github';
import { parseDataFile, parseCrossLinksFile } from '@/lib/parser';

export async function GET(request, { params }) {
  try {
    const { site, type } = await params;
    const siteConfig = sites[site];
    const typeConfig = contentTypes[type];

    if (!siteConfig || !typeConfig) {
      return NextResponse.json({ error: 'Invalid site or type' }, { status: 404 });
    }

    const branch = siteConfig.branch || 'master';
    const { content, sha } = await readFile(siteConfig.repo, typeConfig.file, branch);

    let items;
    if (type === 'cross-links') {
      items = parseCrossLinksFile(content);
      return NextResponse.json({ items, sha, isCrossLinks: true });
    }

    const parsed = parseDataFile(content);
    items = Array.isArray(parsed.data) ? parsed.data : [];

    return NextResponse.json({
      items,
      sha,
      exportName: parsed.primaryExport,
      count: items.length,
    });
  } catch (error) {
    console.error('Content list error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
