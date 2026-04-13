'use client';

import { useState, useCallback } from 'react';
import grapesjs from 'grapesjs';
import GjsEditor, { Canvas } from '@grapesjs/react';
import { alkemeBlocks } from './blocks';

export default function GrapeEditor({ site, currentPath, onSave, siteConfig }) {
  const [editor, setEditor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const onEditorReady = useCallback((editorInstance) => {
    setEditor(editorInstance);

    // Load content from proxy
    if (currentPath !== undefined) {
      loadPageContent(editorInstance, site, currentPath);
    }

    // Add save command
    editorInstance.Commands.add('save', {
      run: async (ed) => {
        const html = ed.getHtml();
        const css = ed.getCss();
        if (onSave) {
          setSaving(true);
          try {
            await onSave({ html, css, path: currentPath });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
          } catch (e) {
            alert('Save failed: ' + e.message);
          } finally {
            setSaving(false);
          }
        }
      },
    });

    // Add preview command
    editorInstance.Commands.add('preview-page', {
      run: () => {
        const url = siteConfig?.vercelUrl + (siteConfig?.basePath || '') + (currentPath || '/');
        window.open(url, '_blank');
      },
    });
  }, [site, currentPath, onSave, siteConfig]);

  async function loadPageContent(ed, site, path) {
    try {
      const proxyUrl = `/api/proxy/${site}${path || ''}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) return;
      const html = await res.text();

      // Extract body content (between <body> and </body>)
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      if (bodyMatch) {
        // Remove script tags and editor injection
        let content = bodyMatch[1]
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<link[^>]*visual-editor[^>]*>/gi, '');

        ed.setComponents(content);
      }

      // Extract CSS links and inject into canvas
      const cssLinks = html.match(/href="([^"]*\.css[^"]*)"/g);
      if (cssLinks) {
        const urls = cssLinks.map(l => l.match(/href="([^"]*)"/)?.[1]).filter(Boolean);
        urls.forEach(url => {
          ed.Canvas.getDocument().head.insertAdjacentHTML('beforeend',
            `<link rel="stylesheet" href="${url}" />`
          );
        });
      }
    } catch (e) {
      console.error('Failed to load page:', e);
    }
  }

  return (
    <GjsEditor
      grapesjs={grapesjs}
      grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
      onEditor={onEditorReady}
      options={{
        height: '100%',
        width: '100%',
        fromElement: false,
        storageManager: {
          type: 'local',
          autosave: true,
          autoload: false,
          stepsBeforeSave: 3,
          id: `gjs-${site}-${currentPath || 'home'}`,
        },
        undoManager: { maximumStackLength: 50 },
        canvas: {
          styles: [
            'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap',
          ],
        },
        deviceManager: {
          devices: [
            { id: 'desktop', name: 'Desktop', width: '' },
            { id: 'tablet', name: 'Tablet', width: '768px', widthMedia: '992px' },
            { id: 'mobile', name: 'Mobile', width: '375px', widthMedia: '480px' },
          ],
        },
        blockManager: {
          blocks: alkemeBlocks,
        },
        styleManager: {
          sectors: [
            {
              name: 'Layout',
              open: true,
              buildProps: ['display', 'flex-direction', 'justify-content', 'align-items', 'flex-wrap', 'gap'],
            },
            {
              name: 'Dimension',
              open: false,
              buildProps: ['width', 'min-width', 'max-width', 'height', 'min-height', 'padding', 'margin'],
            },
            {
              name: 'Typography',
              open: false,
              buildProps: ['font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'color', 'text-align', 'text-transform', 'text-decoration'],
            },
            {
              name: 'Background',
              open: false,
              buildProps: ['background-color', 'background-image', 'background-size', 'background-position', 'background-repeat'],
            },
            {
              name: 'Border',
              open: false,
              buildProps: ['border', 'border-radius', 'box-shadow'],
            },
            {
              name: 'Effects',
              open: false,
              buildProps: ['opacity', 'transition', 'transform'],
            },
          ],
        },
      }}
    />
  );
}
