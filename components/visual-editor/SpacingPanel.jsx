'use client';

export default function SpacingPanel({ properties, onStyleChange }) {
  const vals = {
    pt: parseInt(properties?.paddingTop) || 0,
    pr: parseInt(properties?.paddingRight) || 0,
    pb: parseInt(properties?.paddingBottom) || 0,
    pl: parseInt(properties?.paddingLeft) || 0,
    mt: parseInt(properties?.marginTop) || 0,
    mr: parseInt(properties?.marginRight) || 0,
    mb: parseInt(properties?.marginBottom) || 0,
    ml: parseInt(properties?.marginLeft) || 0,
  };

  const propMap = { pt: 'paddingTop', pr: 'paddingRight', pb: 'paddingBottom', pl: 'paddingLeft', mt: 'marginTop', mr: 'marginRight', mb: 'marginBottom', ml: 'marginLeft' };

  function update(key, value) {
    onStyleChange(propMap[key], value + 'px');
  }

  function SpacingInput({ label, value, onChange }) {
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-12 text-center border border-gray-300 rounded text-xs py-0.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
        title={label}
      />
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Spacing</h3>

      {/* Box model visualization */}
      <div className="bg-gray-50 rounded-lg p-3">
        {/* Margin */}
        <div className="text-[10px] text-gray-400 font-medium mb-1">MARGIN</div>
        <div className="border-2 border-dashed border-orange-300 rounded-lg p-2 bg-orange-50/30">
          <div className="flex justify-center mb-1">
            <SpacingInput label="margin-top" value={vals.mt} onChange={(v) => update('mt', v)} />
          </div>
          <div className="flex items-center justify-between">
            <SpacingInput label="margin-left" value={vals.ml} onChange={(v) => update('ml', v)} />

            {/* Padding */}
            <div className="border-2 border-dashed border-green-400 rounded-lg p-2 bg-green-50/30 mx-2 flex-1">
              <div className="text-[10px] text-gray-400 font-medium mb-1 text-center">PADDING</div>
              <div className="flex justify-center mb-1">
                <SpacingInput label="padding-top" value={vals.pt} onChange={(v) => update('pt', v)} />
              </div>
              <div className="flex items-center justify-between">
                <SpacingInput label="padding-left" value={vals.pl} onChange={(v) => update('pl', v)} />
                <div className="w-10 h-6 bg-blue-100 rounded mx-1" />
                <SpacingInput label="padding-right" value={vals.pr} onChange={(v) => update('pr', v)} />
              </div>
              <div className="flex justify-center mt-1">
                <SpacingInput label="padding-bottom" value={vals.pb} onChange={(v) => update('pb', v)} />
              </div>
            </div>

            <SpacingInput label="margin-right" value={vals.mr} onChange={(v) => update('mr', v)} />
          </div>
          <div className="flex justify-center mt-1">
            <SpacingInput label="margin-bottom" value={vals.mb} onChange={(v) => update('mb', v)} />
          </div>
        </div>
      </div>

      <p className="text-[10px] text-gray-400">All values in pixels. Changes apply immediately.</p>
    </div>
  );
}
