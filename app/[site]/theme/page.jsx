'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ThemeEditorPage() {
  const { site } = useParams();
  const [colors, setColors] = useState({});
  const [fonts, setFonts] = useState({});
  const [sha, setSha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/theme/${site}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setColors(data.colors);
        setFonts(data.fonts);
        setSha(data.sha);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [site]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`/api/theme/${site}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colors, fonts, sha }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSha(data.sha);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-gray-500 justify-center py-24">
        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading theme...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href={`/${site}`} className="hover:text-brand transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-gray-700">Theme Editor</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Theme Editor</h1>
      <p className="text-sm text-gray-500 mb-8">Edit CSS custom properties in globals.css @theme block</p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-green-700 text-sm">
          Theme saved and committed to GitHub.
        </div>
      )}

      {/* Colors */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-6">Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(colors).map(([name, value]) => (
            <div key={name} className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => setColors((prev) => ({ ...prev, [name]: e.target.value }))}
                  className="w-12 h-12 rounded-lg cursor-pointer border border-gray-200"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  --color-{name}
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setColors((prev) => ({ ...prev, [name]: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-mono focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fonts */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-6">Fonts</h2>
        {Object.entries(fonts).map(([name, value]) => (
          <div key={name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              --font-{name}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setFonts((prev) => ({ ...prev, [name]: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
            />
            <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: value }}>
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Preview</h2>
        <div className="flex gap-3 flex-wrap">
          {Object.entries(colors).map(([name, value]) => (
            <div key={name} className="text-center">
              <div
                className="w-16 h-16 rounded-lg shadow-sm border border-gray-200"
                style={{ backgroundColor: value }}
              />
              <span className="text-xs text-gray-500 mt-1 block">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="sticky bottom-0 bg-stone/90 backdrop-blur-sm py-4 border-t border-gray-200 -mx-8 px-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand text-white px-8 py-3 rounded-lg hover:bg-brand-dark transition-colors font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Theme & Commit to GitHub'}
        </button>
      </div>
    </div>
  );
}
