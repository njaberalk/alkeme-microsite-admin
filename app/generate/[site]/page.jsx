'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { sites } from '@/lib/sites.config';

export default function SiteGenerator() {
  const { site: siteId } = useParams();
  const site = sites[siteId];

  const [keyword, setKeyword] = useState('');
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [generatedPost, setGeneratedPost] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [csvFile, setCsvFile] = useState(null);

  // Load saved keywords
  useEffect(() => {
    fetch(`/api/keywords/${siteId}`).then(r => r.json()).then(d => setKeywords(d.keywords || [])).catch(() => {});
  }, [siteId]);

  if (!site) return <div className="p-8 text-red-500">Site not found: {siteId}</div>;

  async function handleGenerate() {
    setGenerating(true);
    setError('');
    setGeneratedPost(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, keyword, topic: topic || undefined, existingSlugs: [] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGeneratedPost(data.post);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handlePublish() {
    if (!generatedPost) return;
    setPublishing(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/generate/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, post: generatedPost }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`Published! View at: ${data.previewUrl}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setPublishing(false);
    }
  }

  async function handleCsvUpload() {
    if (!csvFile) return;
    const text = await csvFile.text();
    try {
      const res = await fetch(`/api/keywords/${siteId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/csv' },
        body: text,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setKeywords(data.keywords || []);
      setCsvFile(null);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand text-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Generate: {site.name}</h1>
            <p className="text-white/70 mt-1">Create AI-powered blog posts for {site.name.toLowerCase()}</p>
          </div>
          <Link href="/generate" className="text-white/60 hover:text-white text-sm">&larr; All Verticals</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-10">
        {/* Keyword Input */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Target Keyword</h2>
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="e.g. trucking insurance cost 2026"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brand"
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Optional: specific angle or topic (e.g. 'focus on small fleets under 10 trucks')"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brand"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={!keyword || generating}
            className="bg-brand text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? 'Generating...' : 'Generate Blog Post'}
          </button>
        </div>

        {/* Keyword Suggestions from CSV */}
        {keywords.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="font-semibold text-gray-800 mb-3">Saved Keywords ({keywords.length})</h2>
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2">Keyword</th><th className="pb-2">Volume</th><th className="pb-2">KD</th><th className="pb-2">CPC</th><th className="pb-2"></th></tr></thead>
                <tbody>
                  {keywords.slice(0, 20).map((kw, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2 text-gray-800">{kw.keyword}</td>
                      <td className="py-2 text-gray-600">{kw.volume?.toLocaleString()}</td>
                      <td className="py-2 text-gray-600">{kw.difficulty}</td>
                      <td className="py-2 text-gray-600">${kw.cpc?.toFixed(2)}</td>
                      <td className="py-2">
                        <button onClick={() => setKeyword(kw.keyword)} className="text-brand text-xs font-semibold hover:underline">Use</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CSV Upload */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">Import Keywords (Ahrefs CSV)</h2>
          <div className="flex gap-3 items-center">
            <input type="file" accept=".csv,.tsv,.txt" onChange={e => setCsvFile(e.target.files[0])} className="text-sm" />
            <button onClick={handleCsvUpload} disabled={!csvFile} className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 disabled:opacity-50 transition-colors">
              Upload
            </button>
          </div>
        </div>

        {/* Error/Success */}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6 text-sm">{success}</div>}

        {/* Generated Post Preview */}
        {generatedPost && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-gray-800">Generated Post Preview</h2>
              <div className="flex gap-3">
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {publishing ? 'Publishing...' : 'Publish to Site'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Slug:</span> <span className="font-mono text-gray-800">{generatedPost.slug}</span></div>
                  <div><span className="text-gray-500">Category:</span> <span className="text-gray-800">{generatedPost.category}</span></div>
                  <div className="col-span-2"><span className="text-gray-500">Meta Title:</span> <span className="text-gray-800">{generatedPost.metaTitle}</span></div>
                  <div className="col-span-2"><span className="text-gray-500">Meta Desc:</span> <span className="text-gray-800">{generatedPost.metaDescription}</span></div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{generatedPost.heroHeading}</h3>
                <p className="text-gray-600 mb-4">{generatedPost.heroSubheading}</p>
                <p className="text-gray-700 leading-relaxed">{generatedPost.overview}</p>
              </div>

              {generatedPost.sections?.map((section, i) => (
                <div key={i} className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">{section.heading}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{section.content}</p>
                </div>
              ))}

              {generatedPost.faqs?.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">FAQs</h4>
                  {generatedPost.faqs.map((faq, i) => (
                    <div key={i} className="mb-3">
                      <p className="text-sm font-semibold text-gray-700">{faq.q}</p>
                      <p className="text-sm text-gray-600">{faq.a}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-500">
                <strong>Related Posts:</strong> {generatedPost.relatedPosts?.join(', ') || 'none'}<br />
                <strong>Related Coverages:</strong> {generatedPost.relatedCoverages?.join(', ') || 'none'}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
