import { NextResponse } from 'next/server';
import { getKeywords } from '@/lib/keywords';
import { enrichKeywords, clusterKeywords } from '@/lib/keyword-strategy';

export async function GET(request, { params }) {
  try {
    const { site } = await params;
    const raw = await getKeywords(site);
    const enriched = enrichKeywords(raw);
    const clusters = clusterKeywords(enriched);

    // Format for display
    const result = Object.entries(clusters).map(([name, kws]) => ({
      name,
      count: kws.length,
      totalVolume: kws.reduce((s, k) => s + (k.volume || 0), 0),
      avgDifficulty: Math.round(kws.reduce((s, k) => s + (k.difficulty || 0), 0) / kws.length),
      keywords: kws.map((k) => k.keyword),
      status: kws.every((k) => k.status === 'published') ? 'published' :
              kws.some((k) => k.status === 'published') ? 'partial' : 'untargeted',
    }));

    return NextResponse.json({ clusters: result.sort((a, b) => b.totalVolume - a.totalVolume) });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
