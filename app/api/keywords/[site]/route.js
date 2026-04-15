import { NextResponse } from 'next/server';
import { getKeywords, saveKeywords, parseAhrefsCsv } from '@/lib/keywords';
import { enrichKeywords } from '@/lib/keyword-strategy';

export async function GET(request, { params }) {
  try {
    const { site } = await params;
    const raw = await getKeywords(site);
    const keywords = enrichKeywords(raw);
    return NextResponse.json({ keywords });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { site } = await params;
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('text/csv') || contentType.includes('multipart/form-data')) {
      const text = await request.text();
      const parsed = parseAhrefsCsv(text);
      const existing = await getKeywords(site);
      const merged = [];
      const seen = new Set();
      for (const kw of existing) { merged.push(kw); seen.add(kw.keyword.toLowerCase()); }
      for (const kw of parsed) {
        if (!seen.has(kw.keyword.toLowerCase())) { merged.push(kw); seen.add(kw.keyword.toLowerCase()); }
      }
      const enriched = enrichKeywords(merged);
      await saveKeywords(site, enriched);
      return NextResponse.json({ keywords: enriched, count: enriched.length });
    }

    const body = await request.json();
    const keywords = Array.isArray(body) ? body : body.keywords;
    if (Array.isArray(keywords)) {
      const enriched = enrichKeywords(keywords);
      await saveKeywords(site, enriched);
      return NextResponse.json({ keywords: enriched });
    }

    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
