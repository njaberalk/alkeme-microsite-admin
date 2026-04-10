import { NextResponse } from 'next/server';
import { sites } from '@/lib/sites.config';
import { readFile, writeFile } from '@/lib/github';
import { parseTheme, serializeTheme } from '@/lib/theme-parser';

export async function GET(request, { params }) {
  try {
    const { site } = await params;
    const siteConfig = sites[site];
    if (!siteConfig) {
      return NextResponse.json({ error: 'Invalid site' }, { status: 404 });
    }

    const { content, sha } = await readFile(siteConfig.repo, 'app/globals.css');
    const theme = parseTheme(content);

    return NextResponse.json({ colors: theme.colors, fonts: theme.fonts, sha });
  } catch (error) {
    console.error('Theme get error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { site } = await params;
    const body = await request.json();
    const { colors, fonts, sha } = body;

    const siteConfig = sites[site];
    if (!siteConfig) {
      return NextResponse.json({ error: 'Invalid site' }, { status: 404 });
    }

    const { content } = await readFile(siteConfig.repo, 'app/globals.css');
    const newContent = serializeTheme(content, colors, fonts);

    const result = await writeFile(
      siteConfig.repo,
      'app/globals.css',
      newContent,
      sha,
      `CMS: Update theme tokens`,
    );

    return NextResponse.json({ success: true, sha: result.sha });
  } catch (error) {
    console.error('Theme save error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
