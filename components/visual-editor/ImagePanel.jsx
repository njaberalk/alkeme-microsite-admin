'use client';

import { useState, useRef } from 'react';

export default function ImagePanel({ properties, onApply }) {
  const [url, setUrl] = useState(properties?.src || properties?.backgroundImageUrl || '');
  const [alt, setAlt] = useState(properties?.alt || '');
  const fileRef = useRef(null);

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUrl(reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Image</h3>

      {/* Preview */}
      {url && (
        <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <img src={url} alt={alt} className="w-full h-32 object-cover" />
        </div>
      )}

      {/* URL input */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Image URL</label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          placeholder="https://..."
        />
      </div>

      {/* Alt text */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Alt Text</label>
        <input
          type="text"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          placeholder="Describe the image"
        />
      </div>

      {/* Upload */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
      <button
        onClick={() => fileRef.current?.click()}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-sm text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-colors"
      >
        Upload from Computer
      </button>

      {/* Apply */}
      <button
        onClick={() => onApply({ src: url, alt })}
        className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Apply Image
      </button>
    </div>
  );
}
