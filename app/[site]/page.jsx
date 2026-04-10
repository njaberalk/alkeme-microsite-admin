import Link from 'next/link';
import { sites, contentTypes } from '@/lib/sites.config';

export default async function SiteDashboard({ params }) {
  const { site } = await params;
  const config = sites[site];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{config.name}</h1>
      <p className="text-gray-500 mb-8">Manage content, components, and themes</p>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl font-bold text-brand">{config.dataFiles.length}</div>
          <div className="text-sm text-gray-500 mt-1">Data Files</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl font-bold text-brand">{config.components.length}</div>
          <div className="text-sm text-gray-500 mt-1">Components</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl font-bold text-brand">1</div>
          <div className="text-sm text-gray-500 mt-1">Theme</div>
        </div>
      </div>

      {/* Content Types */}
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Content</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {config.dataFiles
          .filter((f) => contentTypes[f])
          .map((f) => (
            <Link
              key={f}
              href={`/${site}/content/${f}`}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-brand/30 hover:shadow-sm transition-all group"
            >
              <h3 className="font-medium text-gray-900 group-hover:text-brand transition-colors">
                {contentTypes[f].label}
              </h3>
              <p className="text-xs text-gray-400 mt-1">{contentTypes[f].file}</p>
            </Link>
          ))}
      </div>

      {/* Components */}
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Components</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
        {config.components.map((c) => (
          <Link
            key={c}
            href={`/${site}/components/${c}`}
            className="bg-white rounded-lg border border-gray-200 p-3 text-center hover:border-brand/30 hover:shadow-sm transition-all group"
          >
            <span className="text-sm font-medium text-gray-700 group-hover:text-brand transition-colors">
              {c}
            </span>
          </Link>
        ))}
      </div>

      {/* Theme */}
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Design</h2>
      <Link
        href={`/${site}/theme`}
        className="inline-flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-4 hover:border-brand/30 hover:shadow-sm transition-all group"
      >
        <div className="flex gap-1">
          <div className="w-6 h-6 rounded-full bg-brand" />
          <div className="w-6 h-6 rounded-full bg-gold" />
          <div className="w-6 h-6 rounded-full bg-blue-400" />
        </div>
        <span className="font-medium text-gray-700 group-hover:text-brand transition-colors">
          Theme Editor
        </span>
      </Link>
    </div>
  );
}
