'use client';

import { useState } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';

function rgbToHex(rgb) {
  if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '#000000';
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return '#000000';
  return '#' + match.slice(0, 3).map((n) => parseInt(n).toString(16).padStart(2, '0')).join('');
}

const colorProps = [
  { key: 'color', label: 'Text Color' },
  { key: 'backgroundColor', label: 'Background' },
  { key: 'borderColor', label: 'Border' },
];

export default function ColorPanel({ properties, onStyleChange }) {
  const [activeColor, setActiveColor] = useState(null); // which property is being edited

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Colors</h3>

      {colorProps.map(({ key, label }) => {
        const raw = properties?.[key];
        if (!raw || raw === 'transparent' || raw === 'rgba(0, 0, 0, 0)') {
          if (key !== 'color') return null; // skip empty bg/border
        }
        const hex = rgbToHex(raw);
        const isActive = activeColor === key;

        return (
          <div key={key}>
            <button
              onClick={() => setActiveColor(isActive ? null : key)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div
                className="w-8 h-8 rounded-lg border border-gray-300 shrink-0"
                style={{ backgroundColor: hex }}
              />
              <div>
                <div className="text-xs font-medium text-gray-700">{label}</div>
                <div className="text-[10px] text-gray-400 font-mono">{hex}</div>
              </div>
            </button>

            {isActive && (
              <div className="mt-2 space-y-2">
                <HexColorPicker
                  color={hex}
                  onChange={(c) => onStyleChange(key, c)}
                  style={{ width: '100%', height: 160 }}
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">#</span>
                  <HexColorInput
                    color={hex}
                    onChange={(c) => onStyleChange(key, '#' + c)}
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
