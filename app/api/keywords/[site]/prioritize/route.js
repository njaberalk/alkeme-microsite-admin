import { NextResponse } from 'next/server';
import { getKeywords } from '@/lib/keywords';
import { enrichKeywords, pickNextCluster, getStats } from '@/lib/keyword-strategy';

export async function GET(request, { params }) {
  try {
    const { site } = await params;
    const raw = await getKeywords(site);
    const enriched = enrichKeywords(raw);
    const nextCluster = pickNextCluster(enriched);
    const stats = getStats(enriched);

    return NextResponse.json({
      stats,
      nextCluster,
      topKeywords: enriched.filter((k) => !k.status || k.status === 'untargeted').slice(0, 10),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
