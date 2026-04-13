'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

function rgbToHex(rgb) {
  if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '#ffffff';
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return '#ffffff';
  return '#' + match.slice(0, 3).map((n) => parseInt(n).toString(16).padStart(2, '0')).join('');
}

export default function BackgroundPanel({ properties, onStyleChange }) {
  const bgColor = rgbToHex(properties?.backgroundColor);
  const [showPicker, setShowPicker] = useState(false);
  const [bgUrl, setBgUrl] = useState(properties?.backgroundImageUrl || '');

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Background</h3>

      {/* Color */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Background Color</label>
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-lg border border-gray-300" style={{ backgroundColor: bgColor }} />
          <span className="text-sm font-mono text-gray-600">{bgColor}</span>
        </button>
        {showPicker && (
          <div className="mt-2">
            <HexColorPicker
              color={bgColor}
              onChange={(c) => onStyleChange('backgroundColor', c)}
              style={{ width: '100%', height: 150 }}
            />
          </div>
        )}
      </div>

      {/* Background image */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Background Image</label>
        <input
          type="text"
          value={bgUrl}
          onChange={(e) => {
            setBgUrl(e.target.value);
            if (e.target.value) onStyleChange('backgroundImage', `url('${e.target.value}')`);
            else onStyleChange('backgroundImage', 'none');
          }}
          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          placeholder="https://..."
        />
      </div>
    </div>
  );
}
