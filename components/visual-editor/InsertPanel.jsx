'use client';

const elements = [
  { type: 'paragraph', label: 'Paragraph', icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12' },
  { type: 'heading', label: 'Heading', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z', config: { level: 'h2' } },
  { type: 'image', label: 'Image', icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z' },
  { type: 'button', label: 'Button', icon: 'M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25' },
  { type: 'divider', label: 'Divider', icon: 'M5 12h14' },
  { type: 'list', label: 'List', icon: 'M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z' },
  { type: 'faq', label: 'FAQ Item', icon: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z' },
  { type: 'card', label: 'Card', icon: 'M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z' },
];

export default function InsertPanel({ insertPosition, onInsert }) {
  return (
    <div className="p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Insert Element</h3>
      <p className="text-xs text-gray-400">Choose an element to insert</p>

      <div className="grid grid-cols-2 gap-2">
        {elements.map((el) => (
          <button
            key={el.type}
            onClick={() => onInsert(el.type, el.config)}
            className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors group"
          >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={el.icon} />
            </svg>
            <span className="text-xs text-gray-600 group-hover:text-blue-700">{el.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
