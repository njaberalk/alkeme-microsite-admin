import { NextResponse } from 'next/server';
import { generateBlogPost } from '@/lib/generator';

export async function POST(request) {
  try {
    const { siteId, keyword, topic, existingSlugs } = await request.json();

    if (!siteId || !keyword) {
      return NextResponse.json({ error: 'siteId and keyword are required' }, { status: 400 });
    }

    const post = await generateBlogPost(siteId, keyword, topic, existingSlugs || []);
    return NextResponse.json({ post });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
