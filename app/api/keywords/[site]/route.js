import { NextResponse } from 'next/server';
import { getKeywords, saveKeywords, parseAhrefsCsv } from '@/lib/keywords';
import { enrichKeywords } from '@/lib/keyword-strategy';

export async function GET(request, { params }) {
  const { site } = await params;
  const raw = getKeywords(site);
  const keywords = enrichKeywords(raw);
  return NextResponse.json({ keywords });
}

export async function POST(request, { params }) {
  const { site } = await params;
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('text/csv') || contentType.includes('multipart/form-data')) {
    // CSV upload — parse and merge with existing
    const text = await request.text();
    try {
      const parsed = parseAhrefsCsv(text);
      const existing = getKeywords(site);
      // Merge: keep existing status if keyword already exists
      const merged = [];
      const seen = new Set();
      for (const kw of existing) { merged.push(kw); seen.add(kw.keyword.toLowerCase()); }
      for (const kw of parsed) {
        if (!seen.has(kw.keyword.toLowerCase())) { merged.push(kw); seen.add(kw.keyword.toLowerCase()); }
      }
      const enriched = enrichKeywords(merged);
      saveKeywords(site, enriched);
      return NextResponse.json({ keywords: enriched, count: enriched.length, new: parsed.length - (enriched.length - existing.length) });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  // JSON body — could be full keyword array (update) or new keywords to add
  const body = await request.json();
  const keywords = Array.isArray(body) ? body : body.keywords;
  if (Array.isArray(keywords)) {
    const enriched = enrichKeywords(keywords);
    saveKeywords(site, enriched);
    return NextResponse.json({ keywords: enriched });
  }

  return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
}
