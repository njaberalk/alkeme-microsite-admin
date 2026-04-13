'use client';

const groups = [
  { label: 'Layout', props: ['display', 'position', 'width', 'height'] },
  { label: 'Spacing', props: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft'] },
  { label: 'Typography', props: ['fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textAlign', 'color'] },
  { label: 'Background', props: ['backgroundColor', 'backgroundImage'] },
  { label: 'Border', props: ['borderColor', 'borderRadius'] },
];

export default function InspectorPanel({ tag, computedStyles, onStyleChange }) {
  if (!computedStyles) return null;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-900">Inspector</h3>
        <code className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">&lt;{tag?.toLowerCase()}&gt;</code>
      </div>

      {groups.map((group) => (
        <div key={group.label}>
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{group.label}</div>
          <div className="space-y-1">
            {group.props.map((prop) => {
              const val = computedStyles[prop];
              if (!val) return null;
              return (
                <div key={prop} className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500 w-24 shrink-0 font-mono truncate">{prop.replace(/([A-Z])/g, '-$1').toLowerCase()}</span>
                  <input
                    type="text"
                    defaultValue={val}
                    onBlur={(e) => {
                      if (e.target.value !== val) onStyleChange(prop, e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.target.blur(); }
                    }}
                    className="flex-1 border border-gray-200 rounded px-1.5 py-0.5 text-[11px] font-mono text-gray-700 focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500 outline-none min-w-0"
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
