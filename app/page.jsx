import Link from 'next/link';
import { sites } from '@/lib/sites.config';

const siteIcons = {
  trucking: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  towing: 'M13 10V3L4 14h7v7l9-11h-7z',
  hospitality: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  construction: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  cannabis: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  'employee-benefits': 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
  'business-insurance': 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21',
};

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-brand text-white px-8 py-6">
        <h1 className="text-2xl font-bold">ALKEME Microsite Admin</h1>
        <p className="text-white/70 mt-1">Manage content across all insurance verticals</p>
      </header>

      {/* Quick links */}
      <main className="max-w-6xl mx-auto px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Link href="/keywords" className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl p-5 hover:from-purple-700 hover:to-purple-800 transition-all">
            <svg className="w-7 h-7 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
            </svg>
            <div>
              <div className="font-bold">Keyword Strategy</div>
              <div className="text-white/70 text-xs">Upload CSVs, track coverage, auto-generate</div>
            </div>
          </Link>
          <Link href="/generate" className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-5 hover:from-blue-700 hover:to-blue-800 transition-all">
            <svg className="w-7 h-7 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            <div>
              <div className="font-bold">AI Content Generator</div>
              <div className="text-white/70 text-xs">Generate blog posts with Claude AI</div>
            </div>
          </Link>
          <Link href="/keywords" className="flex items-center gap-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl p-5 hover:from-amber-700 hover:to-amber-800 transition-all">
            <svg className="w-7 h-7 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <div>
              <div className="font-bold">Bulk Generate (7 Sites)</div>
              <div className="text-white/70 text-xs">Schedule: 1st & 15th — 14 articles/month</div>
            </div>
          </Link>
        </div>

        <h2 className="text-lg font-semibold text-gray-700 mb-6">Select a site to manage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(sites).map((site) => (
            <Link
              key={site.id}
              href={`/${site.id}`}
              className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-brand/30 transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: site.color + '15' }}
                >
                  <svg
                    className="w-6 h-6"
                    style={{ color: site.color }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={siteIcons[site.id]} />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-brand transition-colors">
                    {site.name}
                  </h3>
                  <p className="text-sm text-gray-500">{site.brand}</p>
                </div>
              </div>
              <div className="flex gap-4 text-xs text-gray-400">
                <span>{site.dataFiles.length} data files</span>
                <span>{site.components.length} components</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Content Generator Quick Access */}
        <div className="mt-10 bg-gradient-to-r from-brand to-brand/80 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">AI Content Generator</h3>
              <p className="text-white/70 text-sm">Generate SEO-optimized blog posts for any vertical using Claude AI</p>
            </div>
            <Link
              href="/generate"
              className="bg-white text-brand px-6 py-2 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors"
            >
              Open Generator
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
