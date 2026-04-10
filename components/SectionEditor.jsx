'use client';

export default function SectionEditor({ sections, onChange }) {
  function updateSection(index, field, value) {
    const updated = sections.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    );
    onChange(updated);
  }

  function addSection() {
    onChange([...sections, { heading: '', content: '' }]);
  }

  function removeSection(index) {
    onChange(sections.filter((_, i) => i !== index));
  }

  function moveSection(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sections.length) return;
    const updated = [...sections];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  }

  function updateBullet(sectionIndex, bulletIndex, value) {
    const section = { ...sections[sectionIndex] };
    section.bullets = [...(section.bullets || [])];
    section.bullets[bulletIndex] = value;
    updateSection(sectionIndex, 'bullets', section.bullets);
  }

  function addBullet(sectionIndex) {
    const section = { ...sections[sectionIndex] };
    section.bullets = [...(section.bullets || []), ''];
    updateSection(sectionIndex, 'bullets', section.bullets);
  }

  function removeBullet(sectionIndex, bulletIndex) {
    const section = { ...sections[sectionIndex] };
    section.bullets = (section.bullets || []).filter((_, i) => i !== bulletIndex);
    updateSection(sectionIndex, 'bullets', section.bullets);
  }

  return (
    <div className="space-y-4">
      {sections.map((section, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400">Section {i + 1}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveSection(i, -1)}
                disabled={i === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="Move up"
              >
                &uarr;
              </button>
              <button
                type="button"
                onClick={() => moveSection(i, 1)}
                disabled={i === sections.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="Move down"
              >
                &darr;
              </button>
              <button
                type="button"
                onClick={() => removeSection(i)}
                className="p-1 text-red-400 hover:text-red-600 ml-2"
                title="Remove section"
              >
                &times;
              </button>
            </div>
          </div>

          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium mb-3 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
            value={section.heading}
            onChange={(e) => updateSection(i, 'heading', e.target.value)}
            placeholder="Section heading"
          />

          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-y mb-3 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
            value={section.content || ''}
            onChange={(e) => updateSection(i, 'content', e.target.value)}
            placeholder="Section content"
            rows={4}
          />

          {/* Bullets */}
          {section.bullets && (
            <div className="ml-4 space-y-2">
              <span className="text-xs font-medium text-gray-400">Bullet Points</span>
              {section.bullets.map((bullet, bi) => (
                <div key={bi} className="flex gap-2">
                  <span className="text-gray-300 mt-2">-</span>
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                    value={bullet}
                    onChange={(e) => updateBullet(i, bi, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeBullet(i, bi)}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addBullet(i)}
                className="text-xs text-brand hover:text-brand-dark font-medium"
              >
                + Add bullet
              </button>
            </div>
          )}

          {!section.bullets && (
            <button
              type="button"
              onClick={() => updateSection(i, 'bullets', [''])}
              className="text-xs text-gray-400 hover:text-brand font-medium"
            >
              + Add bullet points
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addSection}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-sm text-gray-400 hover:text-brand hover:border-brand/30 transition-colors"
      >
        + Add Section
      </button>
    </div>
  );
}
