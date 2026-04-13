'use client';
import Link from 'next/link';
import { sites } from '@/lib/sites.config';

export default function GenerateDashboard() {
  return (
    <div className="min-h-screen">
      <header className="bg-brand text-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Content Generator</h1>
            <p className="text-white/70 mt-1">AI-powered blog post generation for all verticals</p>
          </div>
          <Link href="/" className="text-white/60 hover:text-white text-sm">&larr; Back to Dashboard</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-10">
        <h2 className="text-lg font-semibold text-gray-700 mb-6">Select a vertical to generate content</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(sites).map((site) => (
            <Link
              key={site.id}
              href={`/generate/${site.id}`}
              className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-brand/30 transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: site.color + '15' }}>
                  <svg className="w-6 h-6" style={{ color: site.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-brand transition-colors">{site.name}</h3>
                  <p className="text-sm text-gray-500">{site.brand}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">Generate AI blog posts for {site.name.toLowerCase()}</p>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-gray-50 rounded-xl border border-gray-200 p-8">
          <h3 className="font-semibold text-gray-700 mb-3">How it works</h3>
          <div className="grid md:grid-cols-4 gap-6 text-sm text-gray-600">
            <div>
              <div className="w-8 h-8 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center mb-2">1</div>
              <p><strong>Choose vertical</strong> and enter a target keyword or upload Ahrefs CSV</p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center mb-2">2</div>
              <p><strong>Generate</strong> — Claude AI writes a full blog post matching your site schema</p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center mb-2">3</div>
              <p><strong>Review</strong> — Preview the generated content, edit if needed</p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center mb-2">4</div>
              <p><strong>Publish</strong> — One click commits to GitHub and auto-deploys via Vercel</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
