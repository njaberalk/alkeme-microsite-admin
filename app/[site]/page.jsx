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

      {/* Visual Editor */}
      <Link
        href={`/${site}/visual-editor`}
        className="mb-10 flex items-center gap-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 hover:from-blue-700 hover:to-blue-800 transition-all group shadow-sm"
      >
        <svg className="w-8 h-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <div>
          <h3 className="font-bold text-lg">Visual Editor</h3>
          <p className="text-white/70 text-sm">Click directly on the live site to edit text, add blocks, and rearrange sections</p>
        </div>
      </Link>

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
