'use client';

import { useState } from 'react';
import SectionEditor from './SectionEditor';
import FaqEditor from './FaqEditor';

export default function ContentForm({ item, type, onSave, saving }) {
  const [formData, setFormData] = useState({ ...item });

  function update(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Title & Slug */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Basic Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Slug" value={formData.slug} onChange={(v) => update('slug', v)} mono />
          <Field label="Title" value={formData.title} onChange={(v) => update('title', v)} />
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">SEO</h2>
        <div className="space-y-4">
          <Field label="Meta Title" value={formData.metaTitle} onChange={(v) => update('metaTitle', v)} />
          <Field
            label="Meta Description"
            value={formData.metaDescription}
            onChange={(v) => update('metaDescription', v)}
            textarea
            maxLength={160}
          />
        </div>
      </div>

      {/* Hero */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Hero</h2>
        <div className="space-y-4">
          <Field label="Hero Heading" value={formData.heroHeading} onChange={(v) => update('heroHeading', v)} />
          <Field
            label="Hero Subheading"
            value={formData.heroSubheading}
            onChange={(v) => update('heroSubheading', v)}
            textarea
          />
        </div>
      </div>

      {/* Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Overview</h2>
        <Field
          label="Overview Text"
          value={formData.overview}
          onChange={(v) => update('overview', v)}
          textarea
          rows={6}
        />
      </div>

      {/* Sections */}
      {formData.sections && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Sections ({formData.sections.length})
          </h2>
          <SectionEditor
            sections={formData.sections}
            onChange={(sections) => update('sections', sections)}
          />
        </div>
      )}

      {/* FAQs */}
      {formData.faqs && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            FAQs ({formData.faqs.length})
          </h2>
          <FaqEditor
            faqs={formData.faqs}
            onChange={(faqs) => update('faqs', faqs)}
          />
        </div>
      )}

      {/* Related Coverages */}
      {formData.relatedCoverages && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Related Coverages</h2>
          <TagEditor
            tags={formData.relatedCoverages}
            onChange={(tags) => update('relatedCoverages', tags)}
            placeholder="Add coverage slug..."
          />
        </div>
      )}

      {/* Save Button */}
      <div className="sticky bottom-0 bg-stone/90 backdrop-blur-sm py-4 border-t border-gray-200 -mx-8 px-8">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand text-white px-8 py-3 rounded-lg hover:bg-brand-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving & Committing...' : 'Save & Commit to GitHub'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, textarea, mono, maxLength, rows = 3 }) {
  const inputClass = `w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all ${mono ? 'font-mono' : ''}`;
  const charCount = maxLength ? (value || '').length : null;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">
        {label}
        {charCount !== null && (
          <span className={`float-right font-normal ${charCount > maxLength ? 'text-red-500' : 'text-gray-400'}`}>
            {charCount}/{maxLength}
          </span>
        )}
      </label>
      {textarea ? (
        <textarea
          className={inputClass + ' resize-y'}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
        />
      ) : (
        <input
          type="text"
          className={inputClass}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

function TagEditor({ tags, onChange, placeholder }) {
  const [input, setInput] = useState('');

  function addTag() {
    const tag = input.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInput('');
  }

  function removeTag(index) {
    onChange(tags.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 bg-brand/10 text-brand px-3 py-1 rounded-full text-sm"
          >
            {tag}
            <button type="button" onClick={() => removeTag(i)} className="hover:text-red-500">
              &times;
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          placeholder={placeholder}
        />
        <button type="button" onClick={addTag} className="text-sm text-brand hover:text-brand-dark font-medium px-3">
          Add
        </button>
      </div>
    </div>
  );
}
