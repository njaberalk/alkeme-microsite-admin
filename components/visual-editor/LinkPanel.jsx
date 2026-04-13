'use client';

import { useState } from 'react';

export default function LinkPanel({ properties, onApply, onStyleChange }) {
  const [href, setHref] = useState(properties?.href || '');
  const [text, setText] = useState(properties?.text || '');
  const [target, setTarget] = useState(properties?.target || '');

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">
        {properties?.tag === 'BUTTON' || properties?.tag === 'A' ? 'Link / Button' : 'Link'}
      </h3>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">URL</label>
        <input
          type="text"
          value={href}
          onChange={(e) => setHref(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Text</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="newTab"
          checked={target === '_blank'}
          onChange={(e) => setTarget(e.target.checked ? '_blank' : '')}
          className="rounded border-gray-300"
        />
        <label htmlFor="newTab" className="text-sm text-gray-600">Open in new tab</label>
      </div>

      {/* Button styling */}
      <div className="border-t border-gray-200 pt-4">
        <label className="block text-xs font-medium text-gray-500 mb-2">Border Radius</label>
        <input
          type="range"
          min="0"
          max="50"
          value={parseInt(properties?.borderRadius) || 0}
          onChange={(e) => onStyleChange('borderRadius', e.target.value + 'px')}
          className="w-full"
        />
      </div>

      <button
        onClick={() => onApply({ href, text, target })}
        className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Apply Changes
      </button>
    </div>
  );
}
