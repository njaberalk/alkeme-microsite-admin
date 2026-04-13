'use client';

const typeColors = {
  text: 'bg-blue-100 text-blue-600',
  image: 'bg-purple-100 text-purple-600',
  style: 'bg-amber-100 text-amber-600',
  link: 'bg-green-100 text-green-600',
  block: 'bg-red-100 text-red-600',
};

export default function ChangesPanel({ changes }) {
  if (!changes || changes.length === 0) {
    return (
      <div className="p-4 text-center py-12">
        <div className="text-gray-300 mb-2">
          <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
          </svg>
        </div>
        <p className="text-sm text-gray-400">No changes yet</p>
        <p className="text-xs text-gray-300 mt-1">Click on elements to start editing</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-50">
      <div className="p-3 bg-gray-50">
        <span className="text-xs font-semibold text-gray-500">{changes.length} change{changes.length !== 1 ? 's' : ''}</span>
      </div>
      {changes.map((change, i) => (
        <div key={i} className="px-3 py-2.5">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${typeColors[change.type] || 'bg-gray-100 text-gray-500'}`}>
              {change.type === 'block' ? change.action : change.type}
            </span>
            {change.tag && (
              <code className="text-[10px] text-gray-400">&lt;{change.tag?.toLowerCase()}&gt;</code>
            )}
            {change.property && (
              <code className="text-[10px] text-gray-400">{change.property}</code>
            )}
          </div>
          {change.newText && (
            <p className="text-xs text-gray-600 truncate">{change.newText.slice(0, 60)}</p>
          )}
          {change.newValue && (
            <p className="text-xs text-gray-500 font-mono truncate">{change.newValue}</p>
          )}
          {change.newSrc && (
            <p className="text-xs text-gray-500 truncate">{change.newSrc.slice(0, 50)}</p>
          )}
        </div>
      ))}
    </div>
  );
}
