import { NextResponse } from 'next/server';
import { sites, contentTypes } from '@/lib/sites.config';
import { readFile, writeFile } from '@/lib/github';
import { parseDataFile, serializeDataFile } from '@/lib/parser';

export async function GET(request, { params }) {
  try {
    const { site, type, slug } = await params;
    const siteConfig = sites[site];
    const typeConfig = contentTypes[type];

    if (!siteConfig || !typeConfig) {
      return NextResponse.json({ error: 'Invalid site or type' }, { status: 404 });
    }

    const { content, sha } = await readFile(siteConfig.repo, typeConfig.file);
    const parsed = parseDataFile(content);
    const items = Array.isArray(parsed.data) ? parsed.data : [];

    // Find by slug or by index
    const index = parseInt(slug, 10);
    const item = isNaN(index)
      ? items.find((i) => i.slug === slug)
      : items[index];

    if (!item) {
      return NextResponse.json({ error: `Item "${slug}" not found` }, { status: 404 });
    }

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
    const { item: updatedItem, sha } = body;

    const siteConfig = sites[site];
    const typeConfig = contentTypes[type];

    if (!siteConfig || !typeConfig) {
      return NextResponse.json({ error: 'Invalid site or type' }, { status: 404 });
    }

    // Re-read current file to get latest data
    const { content } = await readFile(siteConfig.repo, typeConfig.file);
    const parsed = parseDataFile(content);
    const items = Array.isArray(parsed.data) ? parsed.data : [];

    // Find and replace the item
    const index = parseInt(slug, 10);
    const itemIndex = isNaN(index)
      ? items.findIndex((i) => i.slug === slug)
      : index;

    if (itemIndex === -1) {
      return NextResponse.json({ error: `Item "${slug}" not found` }, { status: 404 });
    }

    items[itemIndex] = updatedItem;

    // Serialize back to JS
    const newContent = serializeDataFile(parsed.primaryExport, items);

    // Commit to GitHub
    const result = await writeFile(
      siteConfig.repo,
      typeConfig.file,
      newContent,
      sha,
      `CMS: Update ${type}/${slug}`,
    );

    return NextResponse.json({ success: true, sha: result.sha });
  } catch (error) {
    console.error('Content save error:', error);
    if (error.status === 409) {
      return NextResponse.json(
        { error: 'Conflict: file was modified by someone else. Reload and try again.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
