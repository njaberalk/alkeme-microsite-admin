import { NextResponse } from 'next/server';
import { sites } from '@/lib/sites.config';
import { listFiles } from '@/lib/github';

export async function GET(request, { params }) {
  try {
    const { site } = await params;
    const siteConfig = sites[site];
    if (!siteConfig) return NextResponse.json({ error: 'Invalid site' }, { status: 404 });

    let images = [];
    try {
      const files = await listFiles(siteConfig.repo, 'public/images');
      images = files
        .filter((f) => f.type === 'file' && /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(f.name))
        .map((f) => ({
          name: f.name,
          path: f.path,
          url: `${siteConfig.vercelUrl}${siteConfig.basePath}/images/${f.name}`,
          size: f.size,
        }));
    } catch {
      // Directory may not exist yet
    }

    return NextResponse.json({ images });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
