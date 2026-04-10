'use client';

export default function FaqEditor({ faqs, onChange }) {
  function updateFaq(index, field, value) {
    const updated = faqs.map((f, i) =>
      i === index ? { ...f, [field]: value } : f
    );
    onChange(updated);
  }

  function addFaq() {
    onChange([...faqs, { q: '', a: '' }]);
  }

  function removeFaq(index) {
    onChange(faqs.filter((_, i) => i !== index));
  }

  function moveFaq(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= faqs.length) return;
    const updated = [...faqs];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400">FAQ {i + 1}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveFaq(i, -1)}
                disabled={i === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                &uarr;
              </button>
              <button
                type="button"
                onClick={() => moveFaq(i, 1)}
                disabled={i === faqs.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                &darr;
              </button>
              <button
                type="button"
                onClick={() => removeFaq(i)}
                className="p-1 text-red-400 hover:text-red-600 ml-2"
              >
                &times;
              </button>
            </div>
          </div>

          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium mb-3 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
            value={faq.q}
            onChange={(e) => updateFaq(i, 'q', e.target.value)}
            placeholder="Question"
          />
          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-y focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
            value={faq.a}
            onChange={(e) => updateFaq(i, 'a', e.target.value)}
            placeholder="Answer"
            rows={3}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addFaq}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-sm text-gray-400 hover:text-brand hover:border-brand/30 transition-colors"
      >
        + Add FAQ
      </button>
    </div>
  );
}
