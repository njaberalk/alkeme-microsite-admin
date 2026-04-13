import { NextResponse } from 'next/server';
import { getKeywords, saveKeywords, parseAhrefsCsv } from '@/lib/keywords';

export async function GET(request, { params }) {
  const { site } = await params;
  const keywords = getKeywords(site);
  return NextResponse.json({ keywords });
}

export async function POST(request, { params }) {
  const { site } = await params;
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data') || contentType.includes('text/csv')) {
    // CSV upload
    const text = await request.text();
    try {
      const keywords = parseAhrefsCsv(text);
      saveKeywords(site, keywords);
      return NextResponse.json({ keywords, count: keywords.length });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  // JSON body — manual keyword add
  const { keywords } = await request.json();
  if (Array.isArray(keywords)) {
    const existing = getKeywords(site);
    const merged = [...existing, ...keywords.filter(k => !existing.some(e => e.keyword === k.keyword))];
    saveKeywords(site, merged);
    return NextResponse.json({ keywords: merged });
  }

  return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
}
