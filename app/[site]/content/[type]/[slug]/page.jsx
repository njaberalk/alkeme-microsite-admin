'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { contentTypes } from '@/lib/sites.config';
import ContentForm from '@/components/ContentForm';

export default function ContentEditPage() {
  const { site, type, slug } = useParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [sha, setSha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const typeConfig = contentTypes[type];

  useEffect(() => {
    fetch(`/api/content/${site}/${type}/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setItem(data.item);
        setSha(data.sha);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [site, type, slug]);

  async function handleSave(updatedItem) {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`/api/content/${site}/${type}/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: updatedItem, sha }),
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
        Loading...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href={`/${site}/content/${type}`} className="hover:text-brand transition-colors">
          {typeConfig?.label || type}
        </Link>
        <span>/</span>
        <span className="text-gray-700">{item?.title || slug}</span>
      </div>

      {/* Status bar */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-green-700 text-sm">
          Saved and committed to GitHub successfully.
        </div>
      )}

      {item && (
        <ContentForm
          item={item}
          type={type}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}
