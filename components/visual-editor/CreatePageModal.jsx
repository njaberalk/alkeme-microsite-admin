'use client';

import { useState } from 'react';

const pageTypes = [
  { type: 'coverages', label: 'Coverage', route: '/coverage', icon: '\u{1F6E1}' },
  { type: 'industries', label: 'Industry', route: '/industries', icon: '\u{1F3ED}' },
  { type: 'resources', label: 'Resource', route: '/resources', icon: '\u{1F4DA}' },
  { type: 'blog', label: 'Blog Post', route: '/blog', icon: '\u{1F4DD}' },
  { type: 'states-part1', label: 'State', route: '/states', icon: '\u{1F4CD}' },
  { type: 'cities-part1', label: 'City', route: '/cities', icon: '\u{1F3D8}' },
];

export default function CreatePageModal({ site, onClose, onCreated }) {
  const [step, setStep] = useState(1); // 1 = pick type, 2 = fill details
  const [selectedType, setSelectedType] = useState(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  function handleTitleChange(val) {
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'));
  }

  async function handleCreate() {
    if (!title.trim() || !slug.trim() || !selectedType) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`/api/visual-editor/${site}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType.type, title: title.trim(), slug: slug.trim() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      onCreated(data.route);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {step === 1 ? 'Create New Page' : `New ${selectedType?.label}`}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">{error}</div>
          )}

          {/* Step 1: Pick type */}
          {step === 1 && (
            <div className="grid grid-cols-3 gap-3">
              {pageTypes.map((pt) => (
                <button
                  key={pt.type}
                  onClick={() => { setSelectedType(pt); setStep(2); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                >
                  <span className="text-2xl">{pt.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{pt.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Fill details */}
          {step === 2 && (
            <div className="space-y-4">
              <button onClick={() => setStep(1)} className="text-sm text-gray-400 hover:text-gray-600">&larr; Change type</button>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  placeholder={`e.g., ${selectedType?.label === 'Coverage' ? 'Cyber Liability' : selectedType?.label === 'Industry' ? 'Food Trucks' : selectedType?.label === 'State' ? 'Texas' : 'New Topic'}`}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <span>alkemeins.com{selectedType?.route}/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    className="flex-1 border border-gray-300 rounded px-2 py-1 font-mono text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Preview what will be auto-generated */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Auto-generated</div>
                <div className="text-xs text-gray-500">
                  <div><span className="text-gray-400">Meta Title:</span> {title || '...'} Insurance</div>
                  <div><span className="text-gray-400">H1:</span> {title || '...'} Insurance</div>
                  <div><span className="text-gray-400">Default sections, FAQs, and overview will be created</span></div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreate}
                  disabled={!title.trim() || !slug.trim() || creating}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Page'}
                </button>
                <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
