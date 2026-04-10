import Link from 'next/link';
import { sites } from '@/lib/sites.config';

const siteIcons = {
  trucking: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  towing: 'M13 10V3L4 14h7v7l9-11h-7z',
  hospitality: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  construction: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  cannabis: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
};

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-brand text-white px-8 py-6">
        <h1 className="text-2xl font-bold">ALKEME Microsite Admin</h1>
        <p className="text-white/70 mt-1">Manage content across all insurance verticals</p>
      </header>

      {/* Site Grid */}
      <main className="max-w-6xl mx-auto px-8 py-10">
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
      </main>
    </div>
  );
}
