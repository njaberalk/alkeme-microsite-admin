'use client';

import { useState, useEffect } from 'react';

export default function SeoPanel({ site, currentPath, onSendToIframe }) {
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  // Load SEO data from the data file via API
  useEffect(() => {
    loadSeoData();
  }, [site, currentPath]);

  async function loadSeoData() {
    setLoading(true);
    setError(null);
    try {
      // Parse path to determine content type and slug
      const pathParts = currentPath.replace(/^\/|\/$/g, '').split('/');
      if (pathParts.length < 2 || !pathParts[0]) {
        // Homepage — read from iframe meta tags
        readFromIframe();
        return;
      }

      const typeMap = { coverage: 'coverages', industry: 'industries', resources: 'resources', blog: 'blog', state: 'states-part1', city: 'cities-part1' };
      const type = typeMap[pathParts[0]];
      const slug = pathParts[1];

      if (!type) {
        readFromIframe();
        return;
      }

      const res = await fetch(`/api/content/${site}/${type}/${slug}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSeoData({
        source: 'data-file',
        type,
        slug,
        sha: data.sha,
        exportName: data.exportName,
        item: data.item,
        // Extract SEO fields
        metaTitle: data.item.metaTitle || '',
        metaDescription: data.item.metaDescription || '',
        heroHeading: data.item.heroHeading || '',
        heroSubheading: data.item.heroSubheading || '',
        title: data.item.title || '',
        currentSlug: data.item.slug || '',
      });
    } catch (e) {
      setError(e.message);
      readFromIframe();
    } finally {
      setLoading(false);
    }
  }

  function readFromIframe() {
    // Read meta tags from the iframe DOM
    onSendToIframe({ type: 'cms-read-seo' });
    setSeoData({
      source: 'iframe',
      metaTitle: '',
      metaDescription: '',
      heroHeading: '',
      heroSubheading: '',
      title: '',
      currentSlug: '',
    });
    setLoading(false);
  }

  function updateField(field, value) {
    setSeoData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!seoData || seoData.source !== 'data-file') return;
    setSaving(true);
    setError(null);
    try {
      const updatedItem = {
        ...seoData.item,
        metaTitle: seoData.metaTitle,
        metaDescription: seoData.metaDescription,
        heroHeading: seoData.heroHeading,
        heroSubheading: seoData.heroSubheading,
        title: seoData.title,
        slug: seoData.currentSlug,
      };

      const res = await fetch(`/api/content/${site}/${seoData.type}/${seoData.item.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: updatedItem, sha: seoData.sha }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSaved(true);
      setSeoData((prev) => ({ ...prev, sha: data.sha }));
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  // Listen for SEO data from iframe
  useEffect(() => {
    function handleMessage(e) {
      if (e.data?.type === 'cms-seo-data') {
        setSeoData((prev) => ({
          ...prev,
          metaTitle: e.data.title || prev?.metaTitle || '',
          metaDescription: e.data.description || prev?.metaDescription || '',
          images: e.data.images || [],
        }));
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (loading) {
    return (
      <div className="p-4 text-center py-8 text-gray-400 text-sm">Loading SEO data...</div>
    );
  }

  const descLen = (seoData?.metaDescription || '').length;

  return (
    <div className="p-4 space-y-5">
      <h3 className="text-sm font-semibold text-gray-900">SEO & Meta</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-red-600 text-xs">{error}</div>
      )}
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-green-600 text-xs">Saved to GitHub!</div>
      )}

      {/* Slug */}
      {seoData?.currentSlug && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            URL Slug
          </label>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">/{seoData.type?.replace('coverages', 'coverage').replace('industries', 'industry')}/</span>
            <input
              type="text"
              value={seoData.currentSlug}
              onChange={(e) => updateField('currentSlug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      )}

      {/* Page Title */}
      {seoData?.title && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Page Title</label>
          <input
            type="text"
            value={seoData.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          />
        </div>
      )}

      {/* Meta Title */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Meta Title
          <span className="float-right font-normal text-gray-400">{(seoData?.metaTitle || '').length}/60</span>
        </label>
        <input
          type="text"
          value={seoData?.metaTitle || ''}
          onChange={(e) => updateField('metaTitle', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
        />
        {/* Google preview */}
        <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Google Preview</div>
          <div className="text-blue-700 text-sm font-medium truncate">
            {seoData?.metaTitle || 'Page Title'}
          </div>
          <div className="text-green-700 text-xs truncate">
            alkemeins.com/{seoData?.type?.replace('coverages', 'coverage')}/{seoData?.currentSlug}
          </div>
          <div className="text-gray-600 text-xs mt-0.5 line-clamp-2">
            {seoData?.metaDescription || 'No description set'}
          </div>
        </div>
      </div>

      {/* Meta Description */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Meta Description
          <span className={`float-right font-normal ${descLen > 160 ? 'text-red-500' : 'text-gray-400'}`}>
            {descLen}/160
          </span>
        </label>
        <textarea
          value={seoData?.metaDescription || ''}
          onChange={(e) => updateField('metaDescription', e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm resize-y focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Hero Heading */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Hero Heading (H1)</label>
        <input
          type="text"
          value={seoData?.heroHeading || ''}
          onChange={(e) => updateField('heroHeading', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Hero Subheading */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Hero Subheading</label>
        <textarea
          value={seoData?.heroSubheading || ''}
          onChange={(e) => updateField('heroSubheading', e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm resize-y focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Image Alt Tags */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Image Alt Tags</h4>
        <p className="text-[11px] text-gray-400 mb-2">Click any image in the editor to set alt text.</p>
      </div>

      {/* Heading Hierarchy */}
      <HeadingHierarchy onSendToIframe={onSendToIframe} />

      {/* Keyword Density */}
      <KeywordDensity seoData={seoData} />

      {/* Readability */}
      <ReadabilityScore seoData={seoData} />

      {/* Save */}
      {seoData?.source === 'data-file' && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save SEO Changes'}
        </button>
      )}
    </div>
  );
}

// Sub-component: Heading Hierarchy
function HeadingHierarchy({ onSendToIframe }) {
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    onSendToIframe({ type: 'cms-read-headings' });
    function handleMsg(e) {
      if (e.data?.type === 'cms-headings-data') setHeadings(e.data.headings || []);
    }
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  const h1Count = headings.filter(h => h.tag === 'H1').length;
  const skipsLevel = headings.some((h, i) => {
    if (i === 0) return false;
    const prevLevel = parseInt(headings[i-1].tag[1]);
    const curLevel = parseInt(h.tag[1]);
    return curLevel > prevLevel + 1;
  });

  return (
    <div className="border-t border-gray-200 pt-4">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Heading Hierarchy</h4>
      {headings.length === 0 ? (
        <p className="text-[11px] text-gray-400">Loading...</p>
      ) : (
        <>
          {h1Count === 0 && <div className="text-[11px] text-red-500 mb-1">Missing H1 tag</div>}
          {h1Count > 1 && <div className="text-[11px] text-amber-500 mb-1">Multiple H1 tags ({h1Count})</div>}
          {skipsLevel && <div className="text-[11px] text-amber-500 mb-1">Heading levels skip (e.g., H1 to H3)</div>}
          <div className="space-y-0.5 max-h-32 overflow-y-auto">
            {headings.slice(0, 20).map((h, i) => {
              const level = parseInt(h.tag[1]);
              const colors = { 1: 'text-green-600', 2: 'text-blue-600', 3: 'text-purple-600', 4: 'text-gray-500' };
              return (
                <div key={i} className="flex items-start gap-1" style={{ paddingLeft: (level - 1) * 12 }}>
                  <span className={`text-[10px] font-bold shrink-0 ${colors[level] || 'text-gray-400'}`}>{h.tag}</span>
                  <span className="text-[10px] text-gray-600 truncate">{h.text}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// Sub-component: Keyword Density
function KeywordDensity({ seoData }) {
  const [keyword, setKeyword] = useState('');

  const allText = [
    seoData?.metaTitle, seoData?.metaDescription, seoData?.heroHeading,
    seoData?.heroSubheading, seoData?.item?.overview,
    ...(seoData?.item?.sections || []).map(s => `${s.heading} ${s.content || ''} ${(s.bullets || []).join(' ')}`),
    ...(seoData?.item?.faqs || []).map(f => `${f.q} ${f.a}`),
  ].filter(Boolean).join(' ').toLowerCase();

  const words = allText.split(/\s+/).filter(Boolean);
  const totalWords = words.length;

  let count = 0, density = 0;
  if (keyword.trim()) {
    const kw = keyword.toLowerCase().trim();
    count = (allText.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length;
    density = totalWords > 0 ? ((count / totalWords) * 100) : 0;
  }

  const densityColor = !keyword ? 'text-gray-400' : density === 0 ? 'text-red-500' : density < 0.5 ? 'text-amber-500' : density <= 3 ? 'text-green-500' : density <= 5 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="border-t border-gray-200 pt-4">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Keyword Density</h4>
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Enter target keyword..."
        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm mb-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
      />
      {keyword && (
        <div className="flex items-center gap-3 text-[11px]">
          <span className={densityColor + ' font-semibold'}>{density.toFixed(1)}%</span>
          <span className="text-gray-400">{count} occurrences in {totalWords} words</span>
        </div>
      )}
    </div>
  );
}

// Sub-component: Readability Score
function ReadabilityScore({ seoData }) {
  const allText = [
    seoData?.item?.overview,
    ...(seoData?.item?.sections || []).map(s => s.content || ''),
  ].filter(Boolean).join(' ');

  const words = allText.split(/\s+/).filter(Boolean);
  const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const wordCount = words.length;
  const sentenceCount = Math.max(1, sentences.length);
  const avgSentenceLength = Math.round(wordCount / sentenceCount);

  // Simplified Flesch reading ease
  const syllables = words.reduce((sum, w) => sum + Math.max(1, w.replace(/[^aeiouy]/gi, '').length), 0);
  const flesch = Math.round(206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllables / wordCount));
  const fleschClamped = Math.max(0, Math.min(100, flesch));

  const fleschColor = fleschClamped >= 60 ? 'text-green-600' : fleschClamped >= 30 ? 'text-amber-600' : 'text-red-600';
  const fleschLabel = fleschClamped >= 70 ? 'Easy' : fleschClamped >= 50 ? 'Standard' : fleschClamped >= 30 ? 'Difficult' : 'Very Difficult';

  return (
    <div className="border-t border-gray-200 pt-4">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Readability</h4>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-700">{wordCount}</div>
          <div className="text-[10px] text-gray-400">Words</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-700">{avgSentenceLength}</div>
          <div className="text-[10px] text-gray-400">Avg sent.</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${fleschColor}`}>{fleschClamped}</div>
          <div className="text-[10px] text-gray-400">{fleschLabel}</div>
        </div>
      </div>
    </div>
  );
}
