'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { sites } from '@/lib/sites.config';
import PagesSidebar from '@/components/visual-editor/PagesSidebar';
import ToolsPanel from '@/components/visual-editor/ToolsPanel';
import PropertyPanel from '@/components/visual-editor/PropertyPanel';
import CreatePageModal from '@/components/visual-editor/CreatePageModal';

export default function VisualEditorPage() {
  const { site } = useParams();
  const config = sites[site];
  const iframeRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState('select');
  const [changes, setChanges] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [device, setDevice] = useState('desktop');

  // Right panel state
  const [rightTab, setRightTab] = useState('seo');
  const [selectedElement, setSelectedElement] = useState(null);
  const [inspectedElement, setInspectedElement] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [insertPosition, setInsertPosition] = useState(null);

  const proxyBase = `/api/proxy/${site}`;

  // Listen for iframe messages
  useEffect(() => {
    function handleMessage(e) {
      if (!e.data?.type) return;
      switch (e.data.type) {
        case 'cms-editor-ready':
          setReady(true);
          break;
        case 'cms-element-selected':
          setSelectedElement(e.data);
          setRightTab('properties');
          break;
        case 'cms-element-deselected':
          setSelectedElement(null);
          break;
        case 'cms-element-inspected':
          setInspectedElement(e.data);
          setRightTab('inspector');
          break;
        case 'cms-insert-request':
          setInsertPosition(e.data.position);
          setRightTab('insert');
          break;
        case 'cms-changes':
          setChanges(e.data.changes || []);
          break;
        case 'cms-history-state':
          setCanUndo(e.data.canUndo);
          setCanRedo(e.data.canRedo);
          break;
        case 'cms-save':
          handleSave(e.data.changes);
          break;
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  function sendToIframe(msg) {
    iframeRef.current?.contentWindow?.postMessage(msg, '*');
  }

  function handleModeChange(newMode) {
    setMode(newMode);
    sendToIframe({ type: 'cms-set-mode', mode: newMode });
    if (newMode === 'inspect') setRightTab('inspector');
    else if (newMode === 'insert') setRightTab('insert');
    else if (newMode === 'seo') setRightTab('seo');
    else if (selectedElement) setRightTab('properties');
  }

  function handleNavigate(path) {
    setCurrentPath(path);
    setReady(false);
    setSelectedElement(null);
    setRightTab('seo');
  }

  const handleIframeLoad = useCallback(() => {
    setReady(true);
  }, []);

  async function handleSave(changesToSave) {
    setSaving(true);
    try {
      const res = await fetch(`/api/visual-editor/${site}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes: changesToSave || changes, path: currentPath }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  const deviceWidths = { mobile: 375, tablet: 768, desktop: '100%' };

  return (
    <div className="flex flex-col h-screen bg-gray-200">
      {/* ===== TOP BAR ===== */}
      <div className="bg-gray-900 text-white px-3 py-1.5 flex items-center justify-between shrink-0 text-sm border-b border-gray-800">
        {/* Left: back + site name */}
        <div className="flex items-center gap-3">
          <Link href={`/${site}`} className="text-white/40 hover:text-white transition-colors text-xs">
            &larr;
          </Link>
          <span className="font-semibold text-xs text-white/80">{config?.name}</span>
          <div className="w-px h-4 bg-white/15" />

          {/* Undo / Redo */}
          <button onClick={() => sendToIframe({ type: 'cms-undo' })} disabled={!canUndo}
            className="p-1 rounded hover:bg-white/10 disabled:opacity-20 transition-colors" title="Undo">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          </button>
          <button onClick={() => sendToIframe({ type: 'cms-redo' })} disabled={!canRedo}
            className="p-1 rounded hover:bg-white/10 disabled:opacity-20 transition-colors" title="Redo">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
            </svg>
          </button>
        </div>

        {/* Center: tool icons */}
        <ToolsPanel activeMode={mode} onModeChange={handleModeChange} />

        {/* Right: device + save */}
        <div className="flex items-center gap-2">
          {['desktop', 'tablet', 'mobile'].map((d) => (
            <button key={d} onClick={() => setDevice(d)} title={d}
              className={`p-1 rounded transition-colors ${device === d ? 'bg-white/15 text-white' : 'text-white/30 hover:text-white'}`}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={
                  d === 'desktop' ? 'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z' :
                  d === 'tablet' ? 'M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25v-15a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z' :
                  'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3'
                } />
              </svg>
            </button>
          ))}

          <div className="w-px h-4 bg-white/15" />

          {changes.length > 0 && (
            <span className="text-[11px] text-amber-400">{changes.length}</span>
          )}
          {saved && <span className="text-[11px] text-green-400">Saved!</span>}

          <button
            onClick={() => handleSave()}
            disabled={changes.length === 0 || saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
          >
            {saving ? '...' : 'Publish'}
          </button>
        </div>
      </div>

      {/* ===== MAIN: Pages + Canvas + Properties ===== */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Pages sidebar */}
        <PagesSidebar site={site} currentPath={currentPath} onNavigate={handleNavigate} onCreatePage={() => setShowCreateModal(true)} />

        {/* Center: Iframe canvas */}
        <div className="flex-1 flex items-start justify-center overflow-auto bg-gray-200 p-3">
          <div
            style={{ width: deviceWidths[device], maxWidth: '100%', height: '100%', transition: 'width 0.3s ease' }}
            className="bg-white shadow-xl rounded-lg overflow-hidden relative"
          >
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading...
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={proxyBase + currentPath}
              className="w-full h-full border-0"
              style={{ minHeight: 'calc(100vh - 44px)' }}
              onLoad={handleIframeLoad}
            />
          </div>
        </div>

        {/* Right: Property panel */}
        <div className="w-[300px] bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 shrink-0">
            {[
              { id: 'properties', label: 'Style' },
              { id: 'seo', label: 'SEO' },
              { id: 'changes', label: `Changes${changes.length ? ` (${changes.length})` : ''}` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setRightTab(t.id)}
                className={`flex-1 py-2 text-[11px] font-medium transition-colors ${
                  rightTab === t.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <PropertyPanel
              tab={rightTab}
              site={site}
              currentPath={currentPath}
              selectedElement={selectedElement}
              inspectedElement={inspectedElement}
              insertPosition={insertPosition}
              changes={changes}
              onSendToIframe={sendToIframe}
            />
          </div>
        </div>
      </div>

      {/* Create Page Modal */}
      {showCreateModal && (
        <CreatePageModal
          site={site}
          onClose={() => setShowCreateModal(false)}
          onCreated={(route) => handleNavigate(route)}
        />
      )}
    </div>
  );
}
