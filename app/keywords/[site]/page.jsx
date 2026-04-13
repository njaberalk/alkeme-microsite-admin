'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { sites } from '@/lib/sites.config';

export default function SiteKeywordManager() {
  const { site } = useParams();
  const config = sites[site];
  const fileRef = useRef(null);

  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('priority');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => { loadKeywords(); }, [site]);

  async function loadKeywords() {
    setLoading(true);
    try {
      const res = await fetch(`/api/keywords/${site}`);
      const data = await res.json();
      setKeywords(data.keywords || []);
    } catch { setKeywords([]); }
    setLoading(false);
  }

  async function handleCsvUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const text = await file.text();
    try {
      const res = await fetch(`/api/keywords/${site}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/csv' },
        body: text,
      });
      const data = await res.json();
      setKeywords(data.keywords || []);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function updateStatus(keyword, status) {
    const updated = keywords.map((k) => k.keyword === keyword ? { ...k, status } : k);
    setKeywords(updated);
    await fetch(`/api/keywords/${site}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  }

  // Filter and sort
  let filtered = keywords;
  if (filter !== 'all') filtered = filtered.filter((k) => (k.status || 'untargeted') === filter);
  if (search) filtered = filtered.filter((k) => k.keyword.toLowerCase().includes(search.toLowerCase()));
  filtered = [...filtered].sort((a, b) => {
    const av = a[sort] || 0, bv = b[sort] || 0;
    return sortDir === 'desc' ? (typeof bv === 'string' ? bv.localeCompare(av) : bv - av) : (typeof av === 'string' ? av.localeCompare(bv) : av - bv);
  });

  function toggleSort(col) {
    if (sort === col) setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    else { setSort(col); setSortDir('desc'); }
  }

  const stats = {
    total: keywords.length,
    published: keywords.filter((k) => k.status === 'published').length,
    planned: keywords.filter((k) => k.status === 'planned').length,
    untargeted: keywords.filter((k) => !k.status || k.status === 'untargeted').length,
  };

  const statusColors = { untargeted: 'bg-gray-100 text-gray-600', planned: 'bg-blue-100 text-blue-600', published: 'bg-green-100 text-green-600', skipped: 'bg-red-100 text-red-600' };

  return (
    <div className="min-h-screen bg-stone">
      <header className="bg-brand text-white px-8 py-6">
        <Link href="/keywords" className="text-white/50 text-sm hover:text-white/80">&larr; All Keywords</Link>
        <h1 className="text-2xl font-bold mt-1">{config?.name} Keywords</h1>
        <p className="text-white/70 mt-1">{stats.total} keywords &middot; {stats.published} published &middot; {stats.untargeted} untargeted</p>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-6">
        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            <div className="text-xs text-gray-400">Published</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.planned}</div>
            <div className="text-xs text-gray-400">Planned</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.untargeted}</div>
            <div className="text-xs text-gray-400">Untargeted</div>
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex items-center gap-3 mb-4">
          <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={handleCsvUpload} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-dark disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload CSV'}
          </button>

          <Link
            href={`/generate/${site}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Generate Article
          </Link>

          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search keywords..."
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>

          {/* Filter */}
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand/20 outline-none">
            <option value="all">All ({stats.total})</option>
            <option value="untargeted">Untargeted ({stats.untargeted})</option>
            <option value="planned">Planned ({stats.planned})</option>
            <option value="published">Published ({stats.published})</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading keywords...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-2">No keywords{filter !== 'all' ? ` with status "${filter}"` : ''}</p>
            <p className="text-sm text-gray-300">Upload an Ahrefs or SEMrush CSV to get started</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {[
                    { key: 'keyword', label: 'Keyword' },
                    { key: 'volume', label: 'Volume' },
                    { key: 'difficulty', label: 'KD' },
                    { key: 'cpc', label: 'CPC' },
                    { key: 'priority', label: 'Priority' },
                    { key: 'cluster', label: 'Cluster' },
                    { key: 'status', label: 'Status' },
                  ].map((col) => (
                    <th key={col.key} className="px-4 py-3 cursor-pointer hover:text-gray-700" onClick={() => toggleSort(col.key)}>
                      {col.label} {sort === col.key && (sortDir === 'desc' ? '\u2193' : '\u2191')}
                    </th>
                  ))}
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.slice(0, 200).map((kw, i) => (
                  <tr key={kw.keyword + i} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-sm text-gray-900 font-medium max-w-xs truncate">{kw.keyword}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{(kw.volume || 0).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-sm">
                      <span className={`${(kw.difficulty || 0) > 70 ? 'text-red-600' : (kw.difficulty || 0) > 40 ? 'text-amber-600' : 'text-green-600'}`}>
                        {kw.difficulty || 0}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">${(kw.cpc || 0).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-sm font-semibold text-brand">{kw.priority || 0}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-400 truncate max-w-[120px]">{kw.cluster || '—'}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${statusColors[kw.status || 'untargeted']}`}>
                        {kw.status || 'untargeted'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1">
                        <Link href={`/generate/${site}?keyword=${encodeURIComponent(kw.keyword)}`}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium">Use</Link>
                        {(!kw.status || kw.status === 'untargeted') && (
                          <button onClick={() => updateStatus(kw.keyword, 'skipped')}
                            className="text-xs text-gray-400 hover:text-red-600 ml-2">Skip</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > 200 && (
              <div className="px-4 py-2 bg-gray-50 text-xs text-gray-400 text-center">
                Showing 200 of {filtered.length} keywords
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
