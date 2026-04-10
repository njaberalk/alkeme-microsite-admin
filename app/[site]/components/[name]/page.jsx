'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ComponentEditorPage() {
  const { site, name } = useParams();
  const [data, setData] = useState(null);
  const [sha, setSha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/components/${site}/${name}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.error) throw new Error(res.error);
        setData(res.data);
        setSha(res.sha);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [site, name]);

  async function handleSave(varName, newData) {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`/api/components/${site}/${name}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ varName, data: newData, sha }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      setSha(result.sha);
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
        Loading component data...
      </div>
    );
  }

  const vars = data ? Object.entries(data) : [];

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href={`/${site}`} className="hover:text-brand transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-gray-700">{name}</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">{name} Component</h1>
      <p className="text-sm text-gray-500 mb-8">Edit hardcoded data in components/{name}.jsx</p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-green-700 text-sm">
          Saved and committed to GitHub.
        </div>
      )}

      {vars.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-yellow-700">
          <p className="font-medium">No extractable data found</p>
          <p className="text-sm mt-1">
            This component may use inline JSX text rather than const arrays.
            To make it editable, extract the data into a const variable at the top of the file.
          </p>
        </div>
      )}

      {vars.map(([varName, varData]) => (
        <ArrayEditor
          key={varName}
          varName={varName}
          data={varData}
          onSave={(newData) => handleSave(varName, newData)}
          saving={saving}
        />
      ))}
    </div>
  );
}

function ArrayEditor({ varName, data, onSave, saving }) {
  const [items, setItems] = useState(Array.isArray(data) ? data : [data]);
  const isArray = Array.isArray(data);

  function updateItem(index, field, value) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function addItem() {
    if (items.length === 0) return;
    const template = {};
    Object.keys(items[0]).forEach((k) => (template[k] = ''));
    setItems([...items, template]);
  }

  function removeItem(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  const fields = items.length > 0 ? Object.keys(items[0]) : [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">
          <code className="text-brand bg-brand/5 px-2 py-0.5 rounded">{varName}</code>
          {isArray && <span className="text-sm text-gray-400 ml-2">{items.length} items</span>}
        </h2>
      </div>

      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
            <div className="flex justify-between mb-3">
              <span className="text-xs font-medium text-gray-400">
                {isArray ? `Item ${i + 1}` : 'Value'}
              </span>
              {isArray && (
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
            {fields.map((field) => (
              <div key={field} className="mb-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">{field}</label>
                {typeof item[field] === 'string' && item[field].length > 100 ? (
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-y focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                    value={item[field]}
                    onChange={(e) => updateItem(i, field, e.target.value)}
                    rows={3}
                  />
                ) : (
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                    value={typeof item[field] === 'string' ? item[field] : JSON.stringify(item[field])}
                    onChange={(e) => updateItem(i, field, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {isArray && (
        <button
          type="button"
          onClick={addItem}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-sm text-gray-400 hover:text-brand hover:border-brand/30 transition-colors mt-4"
        >
          + Add Item
        </button>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={() => onSave(isArray ? items : items[0])}
          disabled={saving}
          className="bg-brand text-white px-6 py-2.5 rounded-lg hover:bg-brand-dark transition-colors font-medium text-sm disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save & Commit'}
        </button>
      </div>
    </div>
  );
}
