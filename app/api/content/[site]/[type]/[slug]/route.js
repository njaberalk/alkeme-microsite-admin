import { NextResponse } from 'next/server';
import { sites, contentTypes } from '@/lib/sites.config';
import { readFile, writeFile } from '@/lib/github';
import { parseDataFile, serializeDataFile } from '@/lib/parser';
import { getSchemaForType } from '@/lib/schemas/content';

export async function GET(request, { params }) {
  try {
    const { site, type, slug } = await params;
    const siteConfig = sites[site];
    const typeConfig = contentTypes[type];
    if (!siteConfig || !typeConfig) return NextResponse.json({ error: 'Invalid site or type' }, { status: 404 });

    const branch = siteConfig.branch || 'master';
    const { content, sha } = await readFile(siteConfig.repo, typeConfig.file, branch);
    const parsed = parseDataFile(content);
    const items = Array.isArray(parsed.data) ? parsed.data : [];

    const index = parseInt(slug, 10);
    const item = isNaN(index) ? items.find((i) => i.slug === slug) : items[index];
    if (!item) return NextResponse.json({ error: `Item "${slug}" not found` }, { status: 404 });

    return NextResponse.json({ item, sha, exportName: parsed.primaryExport });
  } catch (error) {
    console.error('Content get error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { site, type, slug } = await params;
    const body = await request.json();
    const { item: updatedItem } = body;

    const siteConfig = sites[site];
    const typeConfig = contentTypes[type];
    if (!siteConfig || !typeConfig) return NextResponse.json({ error: 'Invalid site or type' }, { status: 404 });

    const branch = siteConfig.branch || 'master';

    // Validate against Zod schema if available (skip for states/cities which use name/city)
    const schema = getSchemaForType(type);
    if (schema && !type.includes('states') && !type.includes('cities')) {
      const validation = schema.safeParse(updatedItem);
      if (!validation.success) {
        const errors = validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        return NextResponse.json({ error: `Validation failed: ${errors.join(', ')}` }, { status: 400 });
      }
    }

    // Re-read current file to get LATEST sha (fixes stale SHA conflict bug)
    const { content, sha: latestSha } = await readFile(siteConfig.repo, typeConfig.file, branch);
    const parsed = parseDataFile(content);
    const items = Array.isArray(parsed.data) ? parsed.data : [];

    const index = parseInt(slug, 10);
    const itemIndex = isNaN(index) ? items.findIndex((i) => i.slug === slug) : index;
    if (itemIndex === -1) return NextResponse.json({ error: `Item "${slug}" not found` }, { status: 404 });

    items[itemIndex] = updatedItem;
    const newContent = serializeDataFile(parsed.primaryExport, items);

    // Use latestSha from re-read, NOT the stale sha from request body
    const result = await writeFile(siteConfig.repo, typeConfig.file, newContent, latestSha, `CMS: Update ${type}/${slug}`, branch);

    return NextResponse.json({ success: true, sha: result.sha });
  } catch (error) {
    console.error('Content save error:', error);
    if (error.status === 409) {
      return NextResponse.json({ error: 'Conflict: file was modified. Reload and try again.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
