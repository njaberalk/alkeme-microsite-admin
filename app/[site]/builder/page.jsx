'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { sites } from '@/lib/sites.config';
import PagesSidebar from '@/components/visual-editor/PagesSidebar';

const GrapeEditor = dynamic(() => import('@/components/builder/GrapeEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="flex items-center gap-3 text-gray-400">
        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading Page Builder...
      </div>
    </div>
  ),
});

export default function BuilderPage() {
  const { site } = useParams();
  const config = sites[site];
  const [currentPath, setCurrentPath] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPages, setShowPages] = useState(true);
  const [editorKey, setEditorKey] = useState(0);

  const handleSave = useCallback(async ({ html, css, path }) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/visual-editor/${site}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changes: [{ type: 'builder', html, css, path }],
          path: path || '/',
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      throw e;
    } finally {
      setSaving(false);
    }
  }, [site]);

  function handleNavigate(path) {
    setCurrentPath(path);
    setEditorKey((k) => k + 1); // Force re-mount GrapeJS with new content
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Link href={`/${site}`} className="text-white/50 hover:text-white text-sm">
            &larr;
          </Link>
          <button
            onClick={() => setShowPages(!showPages)}
            className={`p-1 rounded transition-colors ${showPages ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'}`}
            title="Toggle pages panel"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="w-px h-4 bg-white/20" />
          <span className="text-sm font-semibold">{config?.name}</span>
          <span className="text-xs text-white/40">Page Builder</span>
          {currentPath && (
            <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{currentPath || '/'}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-green-400">Published!</span>}
          <button
            onClick={() => {
              const url = config?.vercelUrl + (config?.basePath || '') + (currentPath || '/');
              window.open(url, '_blank');
            }}
            className="text-xs text-white/50 hover:text-white transition-colors"
          >
            View Live
          </button>
          <button
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
          >
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Main: Pages sidebar + GrapeJS */}
      <div className="flex-1 flex overflow-hidden">
        {/* Pages sidebar (collapsible) */}
        {showPages && (
          <PagesSidebar
            site={site}
            currentPath={currentPath}
            onNavigate={handleNavigate}
            onCreatePage={() => {}}
          />
        )}

        {/* GrapeJS canvas */}
        <div className="flex-1 overflow-hidden">
          <GrapeEditor
            key={editorKey}
            site={site}
            currentPath={currentPath}
            onSave={handleSave}
            siteConfig={config}
          />
        </div>
      </div>
    </div>
  );
}
