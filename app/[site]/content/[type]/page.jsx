'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { contentTypes } from '@/lib/sites.config';

function seoScore(item) {
  let score = 0, issues = [];
  if (item.metaTitle) {
    score += 20;
    if (item.metaTitle.length > 60) issues.push('Title > 60 chars');
    else if (item.metaTitle.length < 30) issues.push('Title too short');
    else score += 10;
  } else issues.push('No meta title');

  if (item.metaDescription) {
    score += 20;
    if (item.metaDescription.length > 160) issues.push('Description > 160 chars');
    else if (item.metaDescription.length < 80) issues.push('Description too short');
    else score += 10;
  } else issues.push('No meta description');

  if (item.heroHeading) score += 15; else issues.push('No H1 heading');
  if (item.overview && item.overview.length > 100) score += 10; else issues.push('Thin overview');
  if (item.sections && item.sections.length >= 2) score += 10; else issues.push('Few sections');
  if (item.faqs && item.faqs.length >= 2) score += 5; else issues.push('Few FAQs');

  return { score, issues, color: score >= 80 ? 'green' : score >= 50 ? 'amber' : 'red' };
}

export default function ContentListPage() {
  const { site, type } = useParams();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [deleting, setDeleting] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);

  const typeConfig = contentTypes[type];

  useEffect(() => {
    loadItems();
  }, [site, type]);

  function loadItems() {
    setLoading(true);
    fetch(`/api/content/${site}/${type}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setItems(data.items || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  async function handleDelete(slug, title) {
    if (!confirm(`Delete "${title || slug}"? This commits to GitHub and triggers a redeploy.`)) return;
    setDeleting(slug);
    try {
      const res = await fetch(`/api/content/${site}/${type}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setItems((prev) => prev.filter((i) => i.slug !== slug));
    } catch (e) {
      alert('Delete failed: ' + e.message);
    } finally {
      setDeleting(null);
    }
  }

  async function handleDuplicate(item) {
    const newSlug = item.slug + '-copy';
    const newItem = { ...item, slug: newSlug, title: (item.title || item.name || '') + ' (Copy)' };
    setCreating(true);
    try {
      const res = await fetch(`/api/visual-editor/${site}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title: newItem.title, slug: newSlug }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      loadItems();
    } catch (e) {
      alert('Duplicate failed: ' + e.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleCreate() {
    if (!newTitle.trim()) return;
    const slug = newTitle.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    setCreating(true);
    try {
      const res = await fetch(`/api/visual-editor/${site}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title: newTitle.trim(), slug }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setShowCreate(false);
      setNewTitle('');
      router.push(`/${site}/content/${type}/${slug}`);
    } catch (e) {
      alert('Create failed: ' + e.message);
    } finally {
      setCreating(false);
    }
  }

  function toggleSelect(slug) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map((i) => i.slug)));
  }

  if (!typeConfig) return <div className="p-8 text-red-600">Unknown content type: {type}</div>;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{typeConfig.label}</h1>
          <p className="text-sm text-gray-500 mt-1">{typeConfig.file} &mdash; {items.length} items</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBulkMode(!bulkMode)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              bulkMode ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {bulkMode ? 'Done' : 'Select'}
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-brand text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors"
          >
            + New {typeConfig.label.replace(/s$/, '').replace(/ies$/, 'y')}
          </button>
        </div>
      </div>

      {/* Create inline form */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex items-center gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Enter page title..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
            autoFocus
          />
          <button onClick={handleCreate} disabled={creating || !newTitle.trim()}
            className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-dark disabled:opacity-50">
            {creating ? 'Creating...' : 'Create'}
          </button>
          <button onClick={() => { setShowCreate(false); setNewTitle(''); }}
            className="text-gray-400 hover:text-gray-600 text-sm">Cancel</button>
        </div>
      )}

      {/* Bulk actions bar */}
      {bulkMode && selected.size > 0 && (
        <div className="bg-brand/5 border border-brand/20 rounded-xl p-3 mb-4 flex items-center gap-4">
          <span className="text-sm text-brand font-medium">{selected.size} selected</span>
          <button
            onClick={() => {
              if (confirm(`Delete ${selected.size} items? This cannot be undone.`)) {
                // Delete all selected
                Promise.all([...selected].map((slug) =>
                  fetch(`/api/content/${site}/${type}/delete`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slug }),
                  })
                )).then(() => { setSelected(new Set()); loadItems(); });
              }
            }}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Delete Selected
          </button>
        </div>
      )}

      {/* Error */}
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">{error}</div>}

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-gray-500 py-12 justify-center">
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </div>
      )}

      {/* Items list */}
      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {/* Select all header */}
          {bulkMode && (
            <div className="px-6 py-2 bg-gray-50 flex items-center gap-3">
              <input type="checkbox" checked={selected.size === items.length} onChange={selectAll}
                className="rounded border-gray-300" />
              <span className="text-xs text-gray-500">Select All</span>
            </div>
          )}

          {items.map((item, i) => {
            const seo = seoScore(item);
            const title = item.title || item.name || (item.city ? `${item.city}, ${item.abbreviation}` : item.slug);
            const isDeleting = deleting === item.slug;

            return (
              <div key={item.slug || i} className={`flex items-center px-6 py-3 hover:bg-gray-50 transition-colors group ${isDeleting ? 'opacity-50' : ''}`}>
                {/* Checkbox */}
                {bulkMode && (
                  <input type="checkbox" checked={selected.has(item.slug)} onChange={() => toggleSelect(item.slug)}
                    className="rounded border-gray-300 mr-4" />
                )}

                {/* SEO score dot */}
                <div className="mr-3 shrink-0" title={seo.issues.join(', ') || 'Good SEO'}>
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    seo.color === 'green' ? 'bg-green-500' : seo.color === 'amber' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                </div>

                {/* Content */}
                <Link href={`/${site}/content/${type}/${item.slug || i}`}
                  className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 group-hover:text-brand transition-colors truncate">
                    {title}
                  </h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    {item.metaDescription && (
                      <p className="text-xs text-gray-400 truncate max-w-md">{item.metaDescription}</p>
                    )}
                  </div>
                </Link>

                {/* Stats */}
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  {item.sections && <span className="text-xs text-gray-400">{item.sections.length}s</span>}
                  {item.faqs && <span className="text-xs text-gray-400">{item.faqs.length}q</span>}
                  <span className={`text-xs font-medium ${
                    seo.color === 'green' ? 'text-green-600' : seo.color === 'amber' ? 'text-amber-600' : 'text-red-600'
                  }`}>{seo.score}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={(e) => { e.preventDefault(); handleDuplicate(item); }}
                    title="Duplicate" className="p-1.5 text-gray-400 hover:text-brand rounded transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.5a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                    </svg>
                  </button>
                  <button onClick={(e) => { e.preventDefault(); handleDelete(item.slug, title); }}
                    title="Delete" disabled={isDeleting}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                  <Link href={`/${site}/content/${type}/${item.slug || i}`}
                    className="p-1.5 text-gray-400 hover:text-brand rounded transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
