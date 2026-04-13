'use client';

import ImagePanel from './ImagePanel';
import ColorPanel from './ColorPanel';
import TypographyPanel from './TypographyPanel';
import SpacingPanel from './SpacingPanel';
import LinkPanel from './LinkPanel';
import BackgroundPanel from './BackgroundPanel';
import InsertPanel from './InsertPanel';
import InspectorPanel from './InspectorPanel';
import ChangesPanel from './ChangesPanel';
import SeoPanel from './SeoPanel';

export default function PropertyPanel({
  tab,
  site,
  currentPath,
  selectedElement,
  inspectedElement,
  insertPosition,
  changes,
  onSendToIframe,
}) {
  const props = selectedElement?.properties;
  const selector = selectedElement?.selector;

  function sendStyle(property, value) {
    onSendToIframe({ type: 'cms-style-change', selector, property, value });
  }

  function sendImageReplace({ src, alt }) {
    onSendToIframe({ type: 'cms-image-replace', selector, src, alt });
  }

  function sendLinkUpdate({ href, text, target }) {
    onSendToIframe({ type: 'cms-link-update', selector, href, text, target });
  }

  function sendInsert(elementType, config) {
    onSendToIframe({ type: 'cms-insert-element', position: insertPosition, elementType, config });
  }

  // Show SEO panel
  if (tab === 'seo') {
    return <SeoPanel site={site} currentPath={currentPath} onSendToIframe={onSendToIframe} />;
  }

  // Show insert panel when requested
  if (tab === 'insert' && insertPosition) {
    return <InsertPanel insertPosition={insertPosition} onInsert={sendInsert} />;
  }

  // Show inspector
  if (tab === 'inspector' && inspectedElement) {
    return (
      <InspectorPanel
        tag={inspectedElement.tag}
        computedStyles={inspectedElement.computedStyles}
        onStyleChange={sendStyle}
      />
    );
  }

  // Show changes log
  if (tab === 'changes' || !selectedElement) {
    return <ChangesPanel changes={changes} />;
  }

  // Show contextual panel based on element type
  const type = selectedElement.elementType;

  return (
    <div className="overflow-y-auto">
      {/* Element type badge */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-600">
          {type}
        </span>
        <code className="text-[10px] text-gray-400">&lt;{selectedElement.tag?.toLowerCase()}&gt;</code>
      </div>

      {/* Image panel */}
      {type === 'image' && (
        <ImagePanel properties={props} onApply={sendImageReplace} />
      )}

      {/* Text panels: typography + color */}
      {type === 'text' && (
        <>
          <TypographyPanel properties={props} onStyleChange={sendStyle} />
          <div className="border-t border-gray-100" />
          <ColorPanel properties={props} onStyleChange={sendStyle} />
        </>
      )}

      {/* Link panel + color */}
      {type === 'link' && (
        <>
          <LinkPanel properties={props} onApply={sendLinkUpdate} onStyleChange={sendStyle} />
          <div className="border-t border-gray-100" />
          <ColorPanel properties={props} onStyleChange={sendStyle} />
        </>
      )}

      {/* Section panels: background + spacing + color */}
      {type === 'section' && (
        <>
          <BackgroundPanel properties={props} onStyleChange={sendStyle} />
          <div className="border-t border-gray-100" />
          <SpacingPanel properties={props} onStyleChange={sendStyle} />
        </>
      )}

      {/* Generic element: color + spacing */}
      {type === 'element' && (
        <>
          <ColorPanel properties={props} onStyleChange={sendStyle} />
          <div className="border-t border-gray-100" />
          <SpacingPanel properties={props} onStyleChange={sendStyle} />
        </>
      )}
    </div>
  );
}
