'use client';

import clsx from 'clsx';

const tools = [
  { id: 'select', label: 'Select', icon: 'M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59' },
  { id: 'text', label: 'Text', icon: 'M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.001 15.675 3 19.5m7.5 2.25l4.457-9.914' },
  { id: 'image', label: 'Image', icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z' },
  { id: 'color', label: 'Color', icon: 'M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z' },
  { id: 'spacing', label: 'Spacing', icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15' },
  { id: 'insert', label: 'Insert', icon: 'M12 4.5v15m7.5-7.5h-15' },
  { id: 'seo', label: 'SEO', icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z' },
  { id: 'inspect', label: 'Inspect', icon: 'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5' },
];

/** Horizontal tool icons for the top bar */
export default function ToolsPanel({ activeMode, onModeChange }) {
  return (
    <div className="flex items-center gap-0.5">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onModeChange(tool.id)}
          title={tool.label}
          className={clsx(
            'w-7 h-7 rounded flex items-center justify-center transition-colors',
            activeMode === tool.id
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          )}
        >
          <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={tool.icon} />
          </svg>
        </button>
      ))}
    </div>
  );
}
