'use client';

import { useState } from 'react';

const weights = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Normal' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semibold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extrabold' },
];

const aligns = ['left', 'center', 'right'];

export default function TypographyPanel({ properties, onStyleChange }) {
  const fontSize = parseInt(properties?.fontSize) || 16;
  const fontWeight = properties?.fontWeight || '400';
  const textAlign = properties?.textAlign || 'left';
  const lineHeight = parseFloat(properties?.lineHeight) || 1.5;

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Typography</h3>

      {/* Font size */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Font Size</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="10"
            max="96"
            value={fontSize}
            onChange={(e) => onStyleChange('fontSize', e.target.value + 'px')}
            className="flex-1"
          />
          <input
            type="number"
            value={fontSize}
            onChange={(e) => onStyleChange('fontSize', e.target.value + 'px')}
            className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Font weight */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Font Weight</label>
        <select
          value={fontWeight}
          onChange={(e) => onStyleChange('fontWeight', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
        >
          {weights.map((w) => (
            <option key={w.value} value={w.value}>{w.label} ({w.value})</option>
          ))}
        </select>
      </div>

      {/* Text align */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Alignment</label>
        <div className="flex gap-1">
          {aligns.map((a) => (
            <button
              key={a}
              onClick={() => onStyleChange('textAlign', a)}
              className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                textAlign === a ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {a.charAt(0).toUpperCase() + a.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Line height */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Line Height</label>
        <input
          type="range"
          min="1"
          max="3"
          step="0.1"
          value={lineHeight}
          onChange={(e) => onStyleChange('lineHeight', e.target.value)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{lineHeight}</span>
      </div>

      {/* Text decoration */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Style</label>
        <div className="flex gap-1">
          <button
            onClick={() => onStyleChange('fontWeight', fontWeight === '700' ? '400' : '700')}
            className={`px-3 py-1.5 rounded text-sm font-bold transition-colors ${
              parseInt(fontWeight) >= 700 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            B
          </button>
          <button
            onClick={() => onStyleChange('fontStyle', properties?.fontStyle === 'italic' ? 'normal' : 'italic')}
            className={`px-3 py-1.5 rounded text-sm italic transition-colors ${
              properties?.fontStyle === 'italic' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            I
          </button>
          <button
            onClick={() => onStyleChange('textDecoration', properties?.textDecoration?.includes('underline') ? 'none' : 'underline')}
            className={`px-3 py-1.5 rounded text-sm underline transition-colors ${
              properties?.textDecoration?.includes('underline') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            U
          </button>
        </div>
      </div>
    </div>
  );
}
