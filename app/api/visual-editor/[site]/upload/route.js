import { NextResponse } from 'next/server';
import { sites } from '@/lib/sites.config';
import { writeFile } from '@/lib/github';

export async function POST(request, { params }) {
  try {
    const { site } = await params;
    const siteConfig = sites[site];
    if (!siteConfig) return NextResponse.json({ error: 'Invalid site' }, { status: 404 });

    const body = await request.json();
    const { filename, data } = body;

    if (!filename || !data) {
      return NextResponse.json({ error: 'filename and data required' }, { status: 400 });
    }

    // Generate unique filename
    const ext = filename.split('.').pop();
    const name = filename.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const uniqueName = `${name}-${Date.now()}.${ext}`;
    const path = `public/images/${uniqueName}`;

    // Strip data URL prefix if present
    const base64 = data.includes(',') ? data.split(',')[1] : data;

    const result = await writeFile(
      siteConfig.repo,
      path,
      Buffer.from(base64, 'base64').toString('utf-8'),
      null,
      `CMS: Upload image ${uniqueName}`,
    );

    // Return the URL where the image will be accessible after deploy
    const url = `${siteConfig.vercelUrl}${siteConfig.basePath}/images/${uniqueName}`;

    return NextResponse.json({ success: true, url, path, sha: result.sha });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
