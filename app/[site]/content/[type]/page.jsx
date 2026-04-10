'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { contentTypes } from '@/lib/sites.config';

export default function ContentListPage() {
  const { site, type } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const typeConfig = contentTypes[type];

  useEffect(() => {
    fetch(`/api/content/${site}/${type}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setItems(data.items || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [site, type]);

  if (!typeConfig) {
    return (
      <div className="p-8">
        <p className="text-red-600">Unknown content type: {type}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{typeConfig.label}</h1>
          <p className="text-sm text-gray-500 mt-1">{typeConfig.file}</p>
        </div>
        <span className="text-sm text-gray-400">{items.length} items</span>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-gray-500 py-12 justify-center">
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {items.map((item, i) => (
            <Link
              key={item.slug || i}
              href={`/${site}/content/${type}/${item.slug || i}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group"
            >
              <div className="min-w-0">
                <h3 className="font-medium text-gray-900 group-hover:text-brand transition-colors truncate">
                  {item.title || item.slug || `Item ${i + 1}`}
                </h3>
                {item.metaDescription && (
                  <p className="text-sm text-gray-400 mt-0.5 truncate max-w-xl">
                    {item.metaDescription}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {item.sections && (
                  <span className="text-xs text-gray-400">{item.sections.length} sections</span>
                )}
                {item.faqs && (
                  <span className="text-xs text-gray-400">{item.faqs.length} FAQs</span>
                )}
                <svg className="w-4 h-4 text-gray-300 group-hover:text-brand transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
