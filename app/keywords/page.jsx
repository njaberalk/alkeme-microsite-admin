'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { sites } from '@/lib/sites.config';

export default function KeywordDashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  useEffect(() => {
    loadAllStats();
  }, []);

  async function loadAllStats() {
    setLoading(true);
    const results = {};
    await Promise.all(
      Object.keys(sites).map(async (siteId) => {
        try {
          const res = await fetch(`/api/keywords/${siteId}`);
          const data = await res.json();
          const keywords = data.keywords || [];
          const published = keywords.filter((k) => k.status === 'published').length;
          const totalVol = keywords.reduce((s, k) => s + (k.volume || 0), 0);
          const capturedVol = keywords.filter((k) => k.status === 'published').reduce((s, k) => s + (k.volume || 0), 0);
          results[siteId] = {
            total: keywords.length,
            published,
            untargeted: keywords.filter((k) => !k.status || k.status === 'untargeted').length,
            planned: keywords.filter((k) => k.status === 'planned').length,
            coverage: keywords.length > 0 ? Math.round((published / keywords.length) * 100) : 0,
            totalVolume: totalVol,
            volumeCoverage: totalVol > 0 ? Math.round((capturedVol / totalVol) * 100) : 0,
          };
        } catch {
          results[siteId] = { total: 0, published: 0, untargeted: 0, planned: 0, coverage: 0, totalVolume: 0, volumeCoverage: 0 };
        }
      })
    );
    setStats(results);
    setLoading(false);
  }

  async function handleBulkGenerate() {
    if (!confirm('Generate 1 article for each of the 7 verticals? This uses Claude AI.')) return;
    setGenerating(true);
    setBulkResult(null);
    try {
      const res = await fetch('/api/generate/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'all', count: 1 }),
      });
      const data = await res.json();
      setBulkResult(data);
    } catch (e) {
      setBulkResult({ error: e.message });
    } finally {
      setGenerating(false);
    }
  }

  const totalKeywords = Object.values(stats).reduce((s, v) => s + v.total, 0);
  const totalPublished = Object.values(stats).reduce((s, v) => s + v.published, 0);
  const totalUntargeted = Object.values(stats).reduce((s, v) => s + v.untargeted, 0);

  return (
    <div className="min-h-screen bg-stone">
      <header className="bg-brand text-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/" className="text-white/50 text-sm hover:text-white/80">&larr; Dashboard</Link>
            <h1 className="text-2xl font-bold mt-1">Keyword Strategy</h1>
            <p className="text-white/70 mt-1">Track, prioritize, and auto-target keywords across all 7 verticals</p>
          </div>
          <button
            onClick={handleBulkGenerate}
            disabled={generating}
            className="bg-gold text-brand px-6 py-3 rounded-lg font-bold text-sm hover:bg-gold-hover disabled:opacity-50 transition-colors"
          >
            {generating ? 'Generating 7 Articles...' : 'Generate Next Batch (7 Articles)'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-8">
        {/* Global stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="text-3xl font-bold text-brand">{totalKeywords}</div>
            <div className="text-sm text-gray-500 mt-1">Total Keywords</div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="text-3xl font-bold text-green-600">{totalPublished}</div>
            <div className="text-sm text-gray-500 mt-1">Published</div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="text-3xl font-bold text-amber-600">{totalUntargeted}</div>
            <div className="text-sm text-gray-500 mt-1">Untargeted</div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="text-3xl font-bold text-brand">
              {totalKeywords > 0 ? Math.round((totalPublished / totalKeywords) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-500 mt-1">Coverage</div>
          </div>
        </div>

        {/* Schedule info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-blue-800">Auto-generation schedule:</span>
            <span className="text-sm text-blue-600 ml-2">1st and 15th of each month — 1 article per vertical (7 total)</span>
          </div>
          <span className="text-xs text-blue-500">14 articles/month &middot; 168/year</span>
        </div>

        {/* Bulk result */}
        {bulkResult && (
          <div className={`rounded-xl p-4 mb-8 ${bulkResult.error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
            {bulkResult.error ? (
              <p className="text-red-700 text-sm">{bulkResult.error}</p>
            ) : (
              <div>
                <p className="text-green-800 font-medium text-sm mb-2">Generated {bulkResult.drafts?.length || 0} articles:</p>
                {bulkResult.drafts?.map((d, i) => (
                  <div key={i} className="text-sm text-green-700">
                    {d.site}: <span className="font-medium">{d.title}</span> — targeting "{d.keyword}"
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Per-site cards */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Keywords by Vertical</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(sites).map(([id, site]) => {
            const s = stats[id] || {};
            return (
              <Link
                key={id}
                href={`/keywords/${id}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-brand/30 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 group-hover:text-brand transition-colors">{site.name}</h3>
                  <span className="text-xs text-gray-400">{site.brand}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-gray-100 rounded-full mb-3 overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${s.coverage || 0}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-700">{s.total || 0}</div>
                    <div className="text-[10px] text-gray-400">Keywords</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{s.published || 0}</div>
                    <div className="text-[10px] text-gray-400">Published</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-amber-600">{s.untargeted || 0}</div>
                    <div className="text-[10px] text-gray-400">Untargeted</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
