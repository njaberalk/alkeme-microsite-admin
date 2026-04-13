/**
 * Visual Editor — Production Injection Script
 * Runs inside the microsite iframe (same-origin via proxy).
 * Features: inline text editing, floating toolbar, drag-drop reorder,
 * resize handles, slash commands, visual feedback, undo/redo.
 */
(function () {
  if (window.__cmsEditorActive) return;
  window.__cmsEditorActive = true;

  // =========================================================================
  // MODULE: State
  // =========================================================================
  const State = {
    selectedEl: null,
    selectedType: null,
    hoveredEl: null,
    mode: 'select',
    changes: window.__cmsChanges || [],
    originalValues: new Map(),
  };

  // =========================================================================
  // MODULE: History
  // =========================================================================
  const History = {
    stack: window.__cmsHistory || [],
    index: window.__cmsHistoryIndex ?? -1,
    push(entry) {
      this.stack.length = this.index + 1;
      this.stack.push(entry);
      this.index = this.stack.length - 1;
      this.notify();
    },
    undo() { if (this.index < 0) return; this.stack[this.index].undo(); this.index--; this.notify(); Changes.rebuild(); },
    redo() { if (this.index >= this.stack.length - 1) return; this.index++; this.stack[this.index].redo(); this.notify(); Changes.rebuild(); },
    notify() {
      window.__cmsHistory = this.stack; window.__cmsHistoryIndex = this.index;
      Bridge.send('cms-history-state', { canUndo: this.index >= 0, canRedo: this.index < this.stack.length - 1 });
    },
  };

  // =========================================================================
  // MODULE: Changes
  // =========================================================================
  const Changes = {
    add(change) {
      const i = State.changes.findIndex(c => c.type === change.type && c.selector === change.selector && c.property === change.property);
      if (i >= 0) State.changes[i] = change; else State.changes.push(change);
      window.__cmsChanges = State.changes; this.notify();
    },
    rebuild() {
      State.changes = [];
      for (let i = 0; i <= History.index; i++) {
        const ch = History.stack[i]?.change;
        if (!ch) continue;
        const j = State.changes.findIndex(c => c.type === ch.type && c.selector === ch.selector && c.property === ch.property);
        if (j >= 0) State.changes[j] = ch; else State.changes.push(ch);
      }
      window.__cmsChanges = State.changes; this.notify();
    },
    notify() {
      Bridge.send('cms-changes', { changes: State.changes, count: State.changes.length });
      const el = document.querySelector('.__cms-toolbar .change-count');
      if (el) { const n = State.changes.length; el.textContent = n ? `${n} change${n===1?'':'s'}` : 'No changes'; el.style.color = n ? '#fbbf24' : 'rgba(255,255,255,0.6)'; }
    },
  };

  // =========================================================================
  // MODULE: Bridge
  // =========================================================================
  const Bridge = {
    send(type, data = {}) { window.parent.postMessage({ type, ...data }, '*'); },
    listen() {
      window.addEventListener('message', (e) => {
        if (!e.data?.type) return;
        const d = e.data;
        switch (d.type) {
          case 'cms-set-mode': State.mode = d.mode; Selection.updateModeClass(); break;
          case 'cms-image-replace': ImageEditor.apply(d.selector, d.src, d.alt); break;
          case 'cms-style-change': StyleEditor.apply(d.selector, d.property, d.value); break;
          case 'cms-link-update': LinkEditor.apply(d.selector, d.href, d.text, d.target); break;
          case 'cms-insert-element': InsertHandler.insert(d.position, d.elementType, d.config); break;
          case 'cms-undo': History.undo(); break;
          case 'cms-redo': History.redo(); break;
          case 'cms-deselect': Selection.deselect(); break;
          case 'cms-read-headings':
            const hds = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(h => !isCmsChrome(h))
              .map(h => ({ tag: h.tagName, text: h.textContent.trim().slice(0, 80) }));
            Bridge.send('cms-headings-data', { headings: hds }); break;
          case 'cms-highlight':
            const hl = document.querySelector(d.selector);
            if (hl) hl.scrollIntoView({ behavior: 'smooth', block: 'center' }); break;
        }
      });
    },
  };

  // =========================================================================
  // MODULE: Helpers
  // =========================================================================
  function getCssSelector(el) {
    if (!el || el === document.body) return 'body';
    if (el.id && !el.id.startsWith('__cms')) return '#' + el.id;
    const path = [];
    while (el && el !== document.body) {
      let s = el.tagName.toLowerCase();
      if (el.id && !el.id.startsWith('__cms')) { path.unshift('#' + el.id); break; }
      const sibs = el.parentElement ? [...el.parentElement.children].filter(c => c.tagName === el.tagName) : [];
      if (sibs.length > 1) s += ':nth-of-type(' + (sibs.indexOf(el) + 1) + ')';
      path.unshift(s);
      el = el.parentElement;
    }
    return path.join(' > ');
  }

  function getComputedProps(el) {
    const cs = window.getComputedStyle(el);
    return { color: cs.color, backgroundColor: cs.backgroundColor, borderColor: cs.borderColor,
      fontSize: cs.fontSize, fontWeight: cs.fontWeight, fontStyle: cs.fontStyle,
      textAlign: cs.textAlign, textDecoration: cs.textDecoration, lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing, paddingTop: cs.paddingTop, paddingRight: cs.paddingRight,
      paddingBottom: cs.paddingBottom, paddingLeft: cs.paddingLeft, marginTop: cs.marginTop,
      marginRight: cs.marginRight, marginBottom: cs.marginBottom, marginLeft: cs.marginLeft,
      borderRadius: cs.borderRadius, display: cs.display, position: cs.position,
      width: cs.width, height: cs.height, backgroundImage: cs.backgroundImage };
  }

  function isCmsChrome(el) {
    if (!el) return false;
    return el.closest('.__cms-toolbar') || el.closest('.__cms-block-controls') ||
      el.closest('.__cms-floating-toolbar') || el.closest('.__cms-slash-menu') ||
      el.closest('.__cms-type-label') || el.closest('.__cms-drop-indicator') ||
      el.closest('.__cms-resize-handles') || el.classList?.contains('__cms-add-block');
  }

  // =========================================================================
  // MODULE: Selection
  // =========================================================================
  const Selection = {
    BLOCK_SELECTOR: 'section, [class*="section"], [class*="Section"]',
    detectType(el) {
      if (el.tagName === 'IMG') return 'image';
      const bg = window.getComputedStyle(el).backgroundImage;
      if (bg && bg !== 'none' && el.children.length === 0) return 'image';
      if (el.tagName === 'A' || el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') return 'link';
      if (['H1','H2','H3','H4','H5','H6','P','SPAN','LI','STRONG','EM','LABEL'].includes(el.tagName)) return 'text';
      if (el.matches(this.BLOCK_SELECTOR)) return 'section';
      return 'element';
    },
    select(el) {
      if (isCmsChrome(el)) return;
      this.deselect();
      State.selectedEl = el;
      State.selectedType = this.detectType(el);
      el.classList.add(State.selectedType === 'section' ? '__cms-section-selected' : '__cms-selected');
      // Show type label
      TypeLabels.show(el, State.selectedType);
      // Show floating toolbar for text
      if (State.selectedType === 'text' || State.selectedType === 'link') FloatingToolbar.show(el);
      else FloatingToolbar.hide();
      // Show resize handles for images
      if (State.selectedType === 'image') ResizeHandles.show(el);
      else ResizeHandles.hide();

      Bridge.send('cms-element-selected', {
        elementType: State.selectedType, properties: this.getProperties(el),
        selector: getCssSelector(el), tag: el.tagName,
      });
    },
    deselect() {
      if (State.selectedEl) {
        State.selectedEl.classList.remove('__cms-selected', '__cms-section-selected');
        State.selectedEl = null; State.selectedType = null;
        Bridge.send('cms-element-deselected', {});
      }
      FloatingToolbar.hide();
      TypeLabels.hide();
      ResizeHandles.hide();
    },
    getProperties(el) {
      const computed = getComputedProps(el);
      const base = { ...computed, selector: getCssSelector(el) };
      if (el.tagName === 'IMG') { base.src = el.src; base.alt = el.alt; base.naturalWidth = el.naturalWidth; base.naturalHeight = el.naturalHeight; }
      if (el.tagName === 'A' || el.tagName === 'BUTTON') { base.href = el.href || el.getAttribute('href') || ''; base.text = el.textContent; base.target = el.target || ''; }
      if (['H1','H2','H3','H4','H5','H6','P','SPAN','LI'].includes(el.tagName)) base.text = el.textContent;
      const bg = computed.backgroundImage;
      if (bg && bg !== 'none') { const m = bg.match(/url\(["']?([^"')]+)["']?\)/); base.backgroundImageUrl = m ? m[1] : ''; }
      return base;
    },
    updateModeClass() {
      document.body.classList.remove('__cms-mode-image', '__cms-mode-color');
      if (State.mode === 'image') document.body.classList.add('__cms-mode-image');
      if (State.mode === 'color') document.body.classList.add('__cms-mode-color');
    },
    init() {
      document.addEventListener('click', (e) => {
        if (isCmsChrome(e.target)) return;
        if (State.mode === 'inspect') { e.preventDefault(); e.stopPropagation(); this.select(e.target);
          Bridge.send('cms-element-inspected', { selector: getCssSelector(e.target), tag: e.target.tagName, computedStyles: getComputedProps(e.target) }); return; }
        this.select(e.target);
      }, true);
      document.addEventListener('mouseover', (e) => {
        const el = e.target; if (isCmsChrome(el) || el === State.hoveredEl) return;
        if (State.hoveredEl) State.hoveredEl.classList.remove('__cms-hover', '__cms-link-hover');
        State.hoveredEl = el;
        const type = this.detectType(el);
        el.classList.add(type === 'link' ? '__cms-link-hover' : '__cms-hover');
      });
      document.addEventListener('mouseout', (e) => {
        if (State.hoveredEl) { State.hoveredEl.classList.remove('__cms-hover', '__cms-link-hover'); State.hoveredEl = null; }
      });
    },
  };

  // =========================================================================
  // MODULE: FloatingToolbar (appears above selected text)
  // =========================================================================
  const FloatingToolbar = {
    el: null,
    build() {
      const tb = document.createElement('div');
      tb.className = '__cms-floating-toolbar';
      tb.innerHTML = `
        <button data-cmd="bold" title="Bold (Ctrl+B)"><b>B</b></button>
        <button data-cmd="italic" title="Italic (Ctrl+I)"><i>I</i></button>
        <button data-cmd="underline" title="Underline (Ctrl+U)"><u>U</u></button>
        <span class="__cms-ft-sep"></span>
        <select data-cmd="heading" title="Heading level">
          <option value="P">P</option><option value="H1">H1</option><option value="H2">H2</option>
          <option value="H3">H3</option><option value="H4">H4</option>
        </select>
        <span class="__cms-ft-sep"></span>
        <button data-cmd="alignLeft" title="Align left">\u2261</button>
        <button data-cmd="alignCenter" title="Center">\u2263</button>
        <button data-cmd="alignRight" title="Align right">\u2262</button>
        <span class="__cms-ft-sep"></span>
        <button data-cmd="sizeDown" title="Smaller">A-</button>
        <button data-cmd="sizeUp" title="Larger">A+</button>
        <span class="__cms-ft-sep"></span>
        <button data-cmd="link" title="Insert link">\u{1F517}</button>
      `;
      // Button click handlers
      tb.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        e.preventDefault(); e.stopPropagation();
        const cmd = btn.dataset.cmd;
        const el = State.selectedEl;
        if (!el) return;
        const sel = getCssSelector(el);
        switch (cmd) {
          case 'bold': document.execCommand('bold'); break;
          case 'italic': document.execCommand('italic'); break;
          case 'underline': document.execCommand('underline'); break;
          case 'alignLeft': StyleEditor.apply(sel, 'textAlign', 'left'); break;
          case 'alignCenter': StyleEditor.apply(sel, 'textAlign', 'center'); break;
          case 'alignRight': StyleEditor.apply(sel, 'textAlign', 'right'); break;
          case 'sizeDown': case 'sizeUp': {
            const cs = parseInt(window.getComputedStyle(el).fontSize) || 16;
            const nv = cmd === 'sizeUp' ? cs + 2 : Math.max(10, cs - 2);
            StyleEditor.apply(sel, 'fontSize', nv + 'px'); break;
          }
          case 'link': {
            const url = prompt('Enter URL:');
            if (url) document.execCommand('createLink', false, url);
            break;
          }
        }
      });
      // Heading select handler
      tb.querySelector('select').addEventListener('change', (e) => {
        const newTag = e.target.value;
        const el = State.selectedEl;
        if (!el || el.tagName === newTag) return;
        this.changeTag(el, newTag);
      });
      document.body.appendChild(tb);
      tb.style.display = 'none';
      this.el = tb;
    },
    changeTag(el, newTag) {
      const newEl = document.createElement(newTag);
      newEl.innerHTML = el.innerHTML;
      newEl.className = el.className;
      newEl.contentEditable = 'true'; newEl.spellcheck = false;
      for (const attr of el.attributes) {
        if (attr.name !== 'contenteditable' && attr.name !== 'class') newEl.setAttribute(attr.name, attr.value);
      }
      const oldTag = el.tagName; const oldHTML = el.outerHTML;
      el.parentNode.replaceChild(newEl, el);
      TextEditor.makeEditable(newEl);
      State.selectedEl = newEl;
      const selector = getCssSelector(newEl);
      History.push({
        change: { type: 'tag-change', selector, oldTag, newTag },
        undo: () => { const r = document.createElement(oldTag); r.innerHTML = newEl.innerHTML; r.className = newEl.className; r.contentEditable='true'; newEl.parentNode.replaceChild(r, newEl); },
        redo: () => { this.changeTag(State.selectedEl, newTag); },
      });
      Changes.add({ type: 'tag-change', selector, oldTag, newTag });
      Selection.select(newEl);
    },
    show(el) {
      if (!this.el) this.build();
      const rect = el.getBoundingClientRect();
      const tb = this.el;
      tb.style.display = 'flex';
      // Set current heading level in dropdown
      const select = tb.querySelector('select');
      select.value = ['H1','H2','H3','H4'].includes(el.tagName) ? el.tagName : 'P';
      // Position above element
      const tbRect = tb.getBoundingClientRect();
      let top = rect.top - tbRect.height - 8 + window.scrollY;
      let left = rect.left + (rect.width - tbRect.width) / 2 + window.scrollX;
      if (top < window.scrollY + 5) top = rect.bottom + 8 + window.scrollY; // flip below
      left = Math.max(5, Math.min(left, window.innerWidth - tbRect.width - 5));
      tb.style.top = top + 'px'; tb.style.left = left + 'px';
    },
    hide() { if (this.el) this.el.style.display = 'none'; },
  };

  // =========================================================================
  // MODULE: TypeLabels (element type badge)
  // =========================================================================
  const TypeLabels = {
    el: null,
    show(target, type) {
      if (!this.el) { this.el = document.createElement('div'); this.el.className = '__cms-type-label'; document.body.appendChild(this.el); }
      const colors = { text: '#3b82f6', image: '#a855f7', link: '#10b981', section: '#8b5cf6', element: '#6b7280' };
      this.el.textContent = target.tagName;
      this.el.style.backgroundColor = colors[type] || colors.element;
      this.el.style.display = 'block';
      const rect = target.getBoundingClientRect();
      this.el.style.top = (rect.top + window.scrollY - 20) + 'px';
      this.el.style.left = (rect.left + window.scrollX) + 'px';
    },
    hide() { if (this.el) this.el.style.display = 'none'; },
  };

  // =========================================================================
  // MODULE: DragDrop (section reordering)
  // =========================================================================
  const DragDrop = {
    draggedEl: null,
    indicator: null,
    init() {
      this.indicator = document.createElement('div');
      this.indicator.className = '__cms-drop-indicator';
      document.body.appendChild(this.indicator);
      this.indicator.style.display = 'none';

      document.querySelectorAll(Selection.BLOCK_SELECTOR).forEach((block) => {
        if (isCmsChrome(block) || block.closest('nav') || block.closest('header') || block.closest('footer')) return;
        // Add drag handle to existing controls or create one
        const handle = document.createElement('div');
        handle.className = '__cms-drag-handle';
        handle.innerHTML = '\u2801\u2801\u2801'; // braille dots
        handle.title = 'Drag to reorder';
        handle.draggable = true;

        handle.addEventListener('dragstart', (e) => {
          this.draggedEl = block;
          block.classList.add('__cms-dragging');
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', '');
        });

        block.addEventListener('dragover', (e) => {
          if (!this.draggedEl || this.draggedEl === block) return;
          e.preventDefault(); e.dataTransfer.dropEffect = 'move';
          const rect = block.getBoundingClientRect();
          const mid = rect.top + rect.height / 2;
          const above = e.clientY < mid;
          this.indicator.style.display = 'block';
          this.indicator.style.top = (above ? rect.top : rect.bottom) + window.scrollY + 'px';
          this.indicator.style.left = rect.left + 'px';
          this.indicator.style.width = rect.width + 'px';
          block.__cmsDragAbove = above;
        });

        block.addEventListener('dragleave', () => { this.indicator.style.display = 'none'; });

        block.addEventListener('drop', (e) => {
          e.preventDefault();
          if (!this.draggedEl || this.draggedEl === block) return;
          const above = block.__cmsDragAbove;
          const parent = block.parentNode;
          const origNext = this.draggedEl.nextSibling;
          const origParent = this.draggedEl.parentNode;
          if (above) parent.insertBefore(this.draggedEl, block);
          else parent.insertBefore(this.draggedEl, block.nextSibling);
          const dragged = this.draggedEl;
          History.push({
            change: { type: 'block', action: 'reorder', selector: getCssSelector(dragged) },
            undo: () => origParent.insertBefore(dragged, origNext),
            redo: () => { if (above) parent.insertBefore(dragged, block); else parent.insertBefore(dragged, block.nextSibling); },
          });
          Changes.add({ type: 'block', action: 'reorder', selector: getCssSelector(dragged) });
        });

        handle.addEventListener('dragend', () => {
          if (this.draggedEl) this.draggedEl.classList.remove('__cms-dragging');
          this.draggedEl = null;
          this.indicator.style.display = 'none';
        });

        // Prepend handle before existing controls
        block.style.position = block.style.position || 'relative';
        block.appendChild(handle);
        handle.style.display = 'none';
        block.addEventListener('mouseenter', () => { handle.style.display = 'flex'; });
        block.addEventListener('mouseleave', () => { handle.style.display = 'none'; });
      });
    },
  };

  // =========================================================================
  // MODULE: ResizeHandles
  // =========================================================================
  const ResizeHandles = {
    container: null,
    active: false,
    startX: 0, startY: 0, startW: 0, startH: 0, handle: null, ratio: 1,
    show(el) {
      if (!this.container) { this.container = document.createElement('div'); this.container.className = '__cms-resize-handles'; document.body.appendChild(this.container); }
      this.container.innerHTML = '';
      const corners = ['nw','ne','sw','se'];
      corners.forEach(pos => {
        const h = document.createElement('div');
        h.className = `__cms-resize-handle __cms-rh-${pos}`;
        h.dataset.pos = pos;
        h.addEventListener('mousedown', (e) => this.startResize(e, el, pos));
        this.container.appendChild(h);
      });
      this.container.style.display = 'block';
      this.position(el);
    },
    position(el) {
      if (!this.container || !el) return;
      const r = el.getBoundingClientRect();
      const handles = this.container.querySelectorAll('.__cms-resize-handle');
      const positions = {
        nw: [r.left-4, r.top-4+window.scrollY], ne: [r.right-4, r.top-4+window.scrollY],
        sw: [r.left-4, r.bottom-4+window.scrollY], se: [r.right-4, r.bottom-4+window.scrollY],
      };
      handles.forEach(h => {
        const [x,y] = positions[h.dataset.pos];
        h.style.left = x+'px'; h.style.top = y+'px';
      });
    },
    startResize(e, el, pos) {
      e.preventDefault(); e.stopPropagation();
      this.active = true; this.handle = pos;
      this.startX = e.clientX; this.startY = e.clientY;
      this.startW = el.offsetWidth; this.startH = el.offsetHeight;
      this.ratio = this.startW / this.startH;
      const onMove = (e2) => {
        if (!this.active) return;
        const dx = e2.clientX - this.startX;
        const dy = e2.clientY - this.startY;
        let newW = this.startW, newH = this.startH;
        if (pos.includes('e')) newW = this.startW + dx;
        if (pos.includes('w')) newW = this.startW - dx;
        if (pos.includes('s')) newH = this.startH + dy;
        if (pos.includes('n')) newH = this.startH - dy;
        // Maintain aspect ratio for images
        if (el.tagName === 'IMG') { newH = newW / this.ratio; }
        newW = Math.max(50, newW); newH = Math.max(30, newH);
        el.style.width = newW + 'px'; el.style.height = newH + 'px';
        this.position(el);
      };
      const onUp = () => {
        this.active = false;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        const sel = getCssSelector(el);
        const newW = el.style.width, newH = el.style.height;
        const oldW = this.startW+'px', oldH = this.startH+'px';
        History.push({
          change: { type: 'style', selector: sel, property: 'width', oldValue: oldW, newValue: newW },
          undo: () => { el.style.width = oldW; el.style.height = oldH; this.position(el); },
          redo: () => { el.style.width = newW; el.style.height = newH; this.position(el); },
        });
        Changes.add({ type: 'style', selector: sel, property: 'width', oldValue: oldW, newValue: newW });
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    hide() { if (this.container) this.container.style.display = 'none'; },
  };

  // =========================================================================
  // MODULE: SlashCommand (/ to insert)
  // =========================================================================
  const SlashCommand = {
    menu: null, items: [], activeIndex: 0, targetEl: null,
    ITEMS: [
      { type: 'paragraph', label: 'Paragraph', icon: '\u00b6' },
      { type: 'heading', label: 'Heading', icon: 'H', config: { level: 'h2' } },
      { type: 'image', label: 'Image', icon: '\u{1F5BC}' },
      { type: 'button', label: 'Button', icon: '\u25A2' },
      { type: 'divider', label: 'Divider', icon: '\u2014' },
      { type: 'list', label: 'List', icon: '\u2022' },
      { type: 'faq', label: 'FAQ', icon: '?' },
      { type: 'card', label: 'Card', icon: '\u25A1' },
    ],
    show(el) {
      this.targetEl = el;
      if (!this.menu) { this.menu = document.createElement('div'); this.menu.className = '__cms-slash-menu'; document.body.appendChild(this.menu); }
      this.activeIndex = 0; this.items = [...this.ITEMS];
      this.render(); this.position(el);
      this.menu.style.display = 'block';
    },
    hide() { if (this.menu) this.menu.style.display = 'none'; this.targetEl = null; },
    render(filter = '') {
      const filtered = filter ? this.ITEMS.filter(i => i.label.toLowerCase().includes(filter.toLowerCase())) : this.ITEMS;
      this.items = filtered;
      this.menu.innerHTML = filtered.map((item, i) =>
        `<div class="__cms-slash-item ${i === this.activeIndex ? '__cms-slash-active' : ''}" data-type="${item.type}" data-index="${i}">
          <span class="__cms-slash-icon">${item.icon}</span>
          <span>${item.label}</span>
        </div>`
      ).join('') || '<div class="__cms-slash-empty">No results</div>';
      this.menu.querySelectorAll('.__cms-slash-item').forEach(el => {
        el.addEventListener('click', (e) => {
          const type = el.dataset.type;
          const itemDef = this.ITEMS.find(i => i.type === type);
          this.execute(type, itemDef?.config);
        });
      });
    },
    position(el) {
      const rect = el.getBoundingClientRect();
      this.menu.style.top = (rect.bottom + 4 + window.scrollY) + 'px';
      this.menu.style.left = rect.left + 'px';
    },
    navigate(dir) {
      this.activeIndex = Math.max(0, Math.min(this.items.length - 1, this.activeIndex + dir));
      this.render();
    },
    execute(type, config) {
      const el = this.targetEl;
      if (!el) return;
      // Remove the slash text
      el.textContent = el.textContent.replace(/\/.*$/, '').trim();
      // Insert after the current section
      const section = el.closest('section, [class*="section"], [class*="Section"]');
      if (section) {
        InsertHandler.insert(
          { parentSelector: getCssSelector(section.parentNode), afterSelector: getCssSelector(section) },
          type, config
        );
      }
      this.hide();
    },
    handleKey(e) {
      if (!this.menu || this.menu.style.display === 'none') return false;
      if (e.key === 'ArrowDown') { e.preventDefault(); this.navigate(1); return true; }
      if (e.key === 'ArrowUp') { e.preventDefault(); this.navigate(-1); return true; }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (this.items[this.activeIndex]) this.execute(this.items[this.activeIndex].type, this.items[this.activeIndex].config);
        return true;
      }
      if (e.key === 'Escape') { this.hide(); return true; }
      return false;
    },
    init() {
      document.addEventListener('input', (e) => {
        const el = e.target;
        if (!el.contentEditable || el.contentEditable !== 'true') return;
        const text = el.textContent;
        if (text.startsWith('/')) {
          const query = text.slice(1);
          this.show(el);
          this.render(query);
        } else {
          this.hide();
        }
      });
    },
  };

  // =========================================================================
  // MODULE: TextEditor
  // =========================================================================
  const TextEditor = {
    TAGS: ['H1','H2','H3','H4','H5','H6','P','SPAN','LI','STRONG','EM'],
    makeEditable(el) {
      if (el.contentEditable === 'true') return;
      if (el.closest('nav') || el.closest('header') || el.closest('footer')) return;
      if (el.closest('button') || el.closest('[role="button"]')) return;
      if (isCmsChrome(el)) return;
      State.originalValues.set(el, el.textContent);
      el.contentEditable = 'true'; el.spellcheck = false;
      el.addEventListener('focus', () => { State.originalValues.set(el, el.textContent); });
      el.addEventListener('blur', () => {
        const oldText = State.originalValues.get(el);
        const newText = el.textContent;
        if (oldText !== newText) {
          const selector = getCssSelector(el);
          const change = { type: 'text', selector, tag: el.tagName, oldText, newText };
          History.push({ change, undo: () => { el.textContent = oldText; }, redo: () => { el.textContent = newText; } });
          Changes.add(change);
        }
      });
      el.addEventListener('keydown', (e) => {
        // Slash command intercept
        if (SlashCommand.handleKey(e)) return;
        if (e.key === 'Enter' && !e.shiftKey && el.tagName !== 'P') { e.preventDefault(); el.blur(); }
      });
    },
    init() { document.querySelectorAll(this.TAGS.join(',')).forEach(el => this.makeEditable(el)); },
  };

  // =========================================================================
  // MODULE: ImageEditor
  // =========================================================================
  const ImageEditor = {
    init() {
      document.querySelectorAll('img').forEach(img => {
        if (isCmsChrome(img)) return;
        img.addEventListener('click', (e) => { e.stopPropagation(); Selection.select(img); });
      });
    },
    apply(selector, newSrc, newAlt) {
      const el = document.querySelector(selector); if (!el) return;
      const oldSrc = el.tagName === 'IMG' ? el.src : '';
      const oldAlt = el.tagName === 'IMG' ? el.alt : '';
      if (el.tagName === 'IMG') {
        History.push({ change: { type: 'image', selector, oldSrc, newSrc, oldAlt, newAlt: newAlt||oldAlt },
          undo: () => { el.src = oldSrc; if (newAlt) el.alt = oldAlt; }, redo: () => { el.src = newSrc; if (newAlt) el.alt = newAlt; } });
        el.src = newSrc; if (newAlt) el.alt = newAlt;
      } else {
        const oldBg = el.style.backgroundImage;
        History.push({ change: { type: 'image', selector, oldSrc: oldBg, newSrc, isBackgroundImage: true },
          undo: () => { el.style.backgroundImage = oldBg; }, redo: () => { el.style.backgroundImage = `url('${newSrc}')`; } });
        el.style.backgroundImage = `url('${newSrc}')`;
      }
      Changes.add({ type: 'image', selector, oldSrc, newSrc, oldAlt, newAlt: newAlt||oldAlt });
    },
  };

  // =========================================================================
  // MODULE: StyleEditor
  // =========================================================================
  const StyleEditor = {
    apply(selector, property, value) {
      const el = document.querySelector(selector); if (!el) return;
      const oldValue = el.style[property] || window.getComputedStyle(el)[property];
      History.push({ change: { type: 'style', selector, property, oldValue, newValue: value },
        undo: () => { el.style[property] = oldValue; }, redo: () => { el.style[property] = value; } });
      el.style[property] = value;
      Changes.add({ type: 'style', selector, property, oldValue, newValue: value });
      if (State.selectedEl === el) Bridge.send('cms-element-selected', { elementType: State.selectedType, properties: Selection.getProperties(el), selector, tag: el.tagName });
    },
  };

  // =========================================================================
  // MODULE: LinkEditor
  // =========================================================================
  const LinkEditor = {
    apply(selector, href, text, target) {
      const el = document.querySelector(selector); if (!el) return;
      const oldHref = el.getAttribute('href')||''; const oldText = el.textContent; const oldTarget = el.target||'';
      History.push({ change: { type: 'link', selector, oldHref, newHref: href, oldText, newText: text },
        undo: () => { if (href) el.setAttribute('href', oldHref); if (text) el.textContent = oldText; if (target!==undefined) el.target = oldTarget; },
        redo: () => { if (href) el.setAttribute('href', href); if (text) el.textContent = text; if (target!==undefined) el.target = target; } });
      if (href!==undefined) el.setAttribute('href', href);
      if (text!==undefined) el.textContent = text;
      if (target!==undefined) el.target = target;
      Changes.add({ type: 'link', selector, oldHref, newHref: href, oldText, newText: text });
    },
  };

  // =========================================================================
  // MODULE: BlockManager
  // =========================================================================
  const BlockManager = {
    SELECTOR: 'section, [class*="section"], [class*="Section"]',
    addControls(block) {
      if (block.__cmsControls || isCmsChrome(block)) return;
      block.style.position = block.style.position || 'relative';
      const bar = document.createElement('div'); bar.className = '__cms-block-controls';
      bar.innerHTML = '<button class="up" title="Move up">\u2191</button><button class="down" title="Move down">\u2193</button><button class="dup" title="Duplicate">+</button><button class="delete" title="Delete">\u00d7</button>';
      bar.querySelector('.up').onclick = (e) => { e.stopPropagation(); this.move(block, -1); };
      bar.querySelector('.down').onclick = (e) => { e.stopPropagation(); this.move(block, 1); };
      bar.querySelector('.dup').onclick = (e) => { e.stopPropagation(); this.duplicate(block); };
      bar.querySelector('.delete').onclick = (e) => { e.stopPropagation(); this.remove(block); };
      block.appendChild(bar); bar.style.display = 'none'; block.__cmsControls = bar;
      block.addEventListener('mouseenter', () => { bar.style.display = 'flex'; block.classList.add('__cms-block-hover'); });
      block.addEventListener('mouseleave', () => { bar.style.display = 'none'; block.classList.remove('__cms-block-hover'); });
    },
    move(block, dir) {
      const sibling = dir===-1 ? block.previousElementSibling : block.nextElementSibling;
      if (!sibling || sibling.classList.contains('__cms-add-block')) return;
      const parent = block.parentNode;
      History.push({ change: { type: 'block', action: 'move', selector: getCssSelector(block) },
        undo: () => { dir===-1 ? parent.insertBefore(sibling, block) : parent.insertBefore(block, sibling); },
        redo: () => { dir===-1 ? parent.insertBefore(block, sibling) : parent.insertBefore(sibling, block); } });
      if (dir===-1) parent.insertBefore(block, sibling); else parent.insertBefore(sibling, block);
      Changes.add({ type: 'block', action: 'move', selector: getCssSelector(block) });
    },
    duplicate(block) {
      const clone = block.cloneNode(true); delete clone.__cmsControls;
      block.parentNode.insertBefore(clone, block.nextSibling);
      this.addControls(clone); TextEditor.init();
      const sel = getCssSelector(clone);
      History.push({ change: { type: 'block', action: 'add', selector: sel }, undo: () => clone.remove(), redo: () => block.parentNode.insertBefore(clone, block.nextSibling) });
      Changes.add({ type: 'block', action: 'add', selector: sel });
    },
    remove(block) {
      const parent = block.parentNode; const next = block.nextSibling; const html = block.outerHTML;
      History.push({ change: { type: 'block', action: 'delete', selector: getCssSelector(block), html },
        undo: () => { const t = document.createElement('div'); t.innerHTML = html; parent.insertBefore(t.firstChild, next); },
        redo: () => block.remove() });
      block.remove(); Changes.add({ type: 'block', action: 'delete', selector: getCssSelector(block) });
    },
    addInsertZones() {
      document.querySelectorAll(this.SELECTOR).forEach(section => {
        if (section.nextElementSibling && !section.nextElementSibling.classList.contains('__cms-add-block')) {
          const zone = document.createElement('div'); zone.className = '__cms-add-block';
          zone.innerHTML = '<span class="__cms-add-block-label">+ Add Block</span>';
          zone.onclick = () => {
            Bridge.send('cms-insert-request', { position: { parentSelector: getCssSelector(section.parentNode), afterSelector: getCssSelector(section) } });
          };
          section.parentNode.insertBefore(zone, section.nextSibling);
        }
      });
    },
    init() { document.querySelectorAll(this.SELECTOR).forEach(b => this.addControls(b)); this.addInsertZones(); },
  };

  // =========================================================================
  // MODULE: InsertHandler
  // =========================================================================
  const InsertHandler = {
    templates: {
      paragraph: () => { const p = document.createElement('p'); p.contentEditable='true'; p.textContent='Click to edit...'; p.style.cssText='font-size:1rem;line-height:1.7;margin-bottom:1rem;color:inherit;'; return p; },
      heading: (c) => { const h = document.createElement(c?.level||'h2'); h.contentEditable='true'; h.textContent=c?.text||'New Heading'; h.style.cssText='font-weight:bold;margin-bottom:1rem;color:inherit;'; return h; },
      image: (c) => { const img = document.createElement('img'); img.src=c?.src||'https://placehold.co/800x400/25475e/f4f4ec?text=Click+to+replace'; img.alt=c?.alt||'New image'; img.style.cssText='max-width:100%;border-radius:1rem;margin:1rem 0;'; return img; },
      button: () => { const a = document.createElement('a'); a.href='#'; a.textContent='Button Text'; a.contentEditable='true'; a.style.cssText='display:inline-flex;align-items:center;justify-content:center;padding:0.8rem 2rem;background:#25475e;color:#f4f4ec;border-radius:2rem;font-weight:600;text-decoration:none;font-size:0.85rem;letter-spacing:0.1em;text-transform:uppercase;margin:1rem 0;'; return a; },
      divider: () => { const hr = document.createElement('hr'); hr.style.cssText='border:none;border-top:2px solid #e3e3d8;margin:2rem 0;'; return hr; },
      list: () => { const ul = document.createElement('ul'); ul.style.cssText='list-style:disc;padding-left:1.5rem;margin:1rem 0;'; for(let i=0;i<3;i++){const li=document.createElement('li');li.contentEditable='true';li.textContent=`Item ${i+1}`;li.style.cssText='margin-bottom:0.5rem;';ul.appendChild(li);} return ul; },
      faq: () => { const d = document.createElement('div'); d.style.cssText='border:2px solid #e3e3d8;border-radius:2rem;padding:1.5rem;margin:1rem 0;'; d.innerHTML='<h4 contenteditable="true" style="font-weight:bold;margin-bottom:0.5rem;color:#25475e;">New Question?</h4><p contenteditable="true" style="color:#25475e99;font-size:0.9rem;line-height:1.6;">Answer here.</p>'; return d; },
      card: () => { const d = document.createElement('div'); d.style.cssText='border:2px solid rgba(227,227,216,0.3);border-radius:2rem;padding:1.5rem;'; d.innerHTML='<h4 contenteditable="true" style="font-weight:bold;margin-bottom:0.5rem;color:#f4f4ec;">Card Title</h4><p contenteditable="true" style="color:#f5f1e8;font-size:0.8rem;">Description.</p>'; return d; },
    },
    insert(position, elementType, config) {
      const parent = document.querySelector(position.parentSelector);
      const after = document.querySelector(position.afterSelector);
      if (!parent) return;
      const section = document.createElement('div'); section.style.cssText='max-width:68rem;margin:0 auto;padding:2rem 60px;';
      const fn = this.templates[elementType]; if (!fn) return;
      section.appendChild(fn(config));
      const wrapper = document.createElement('section'); wrapper.appendChild(section);
      const ref = after ? after.nextSibling : parent.firstChild;
      parent.insertBefore(wrapper, ref); BlockManager.addControls(wrapper);
      const sel = getCssSelector(wrapper);
      History.push({ change: { type: 'block', action: 'insert', selector: sel, elementType }, undo: () => wrapper.remove(), redo: () => parent.insertBefore(wrapper, ref) });
      Changes.add({ type: 'block', action: 'insert', selector: sel, elementType, html: wrapper.outerHTML });
    },
  };

  // =========================================================================
  // MODULE: Toolbar
  // =========================================================================
  const Toolbar = {
    build() {
      const bar = document.createElement('div'); bar.className = '__cms-toolbar';
      bar.innerHTML = `<button class="undo" title="Undo" disabled>\u21a9</button><button class="redo" title="Redo" disabled>\u21aa</button><div class="divider"></div><span class="change-count" style="opacity:0.6">No changes</span><div class="divider"></div><button class="discard">Discard</button><button class="primary save">Save</button>`;
      bar.querySelector('.undo').onclick = () => History.undo();
      bar.querySelector('.redo').onclick = () => History.redo();
      bar.querySelector('.discard').onclick = () => window.location.reload();
      bar.querySelector('.save').onclick = () => Bridge.send('cms-save', { changes: State.changes });
      document.body.appendChild(bar);
      window.addEventListener('message', (e) => {
        if (e.data?.type === 'cms-history-state') { bar.querySelector('.undo').disabled = !e.data.canUndo; bar.querySelector('.redo').disabled = !e.data.canRedo; }
      });
    },
  };

  // =========================================================================
  // MODULE: Keyboard
  // =========================================================================
  const Keyboard = {
    init() {
      document.addEventListener('keydown', (e) => {
        if (SlashCommand.handleKey(e)) return;
        if ((e.ctrlKey||e.metaKey) && e.key==='z' && !e.shiftKey) { e.preventDefault(); History.undo(); }
        if ((e.ctrlKey||e.metaKey) && (e.key==='y' || (e.key==='z'&&e.shiftKey))) { e.preventDefault(); History.redo(); }
        if (e.key === 'Escape') { SlashCommand.hide(); Selection.deselect(); }
      });
    },
  };

  // =========================================================================
  // INIT
  // =========================================================================
  function init() {
    document.body.classList.add('__cms-editing');
    Bridge.listen(); Selection.init(); TextEditor.init(); ImageEditor.init();
    BlockManager.init(); DragDrop.init(); SlashCommand.init();
    Toolbar.build(); Keyboard.init(); History.notify();
    Bridge.send('cms-editor-ready');
  }

  if (document.readyState === 'complete') setTimeout(init, 300);
  else window.addEventListener('load', () => setTimeout(init, 300));
})();
