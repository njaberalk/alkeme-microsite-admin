/**
 * Visual Editor — Production Injection Script v2
 * Every element is clickable. Every element gets controls.
 * Click = select. Selected = action bar + resize + edit.
 */
(function () {
  if (window.__cmsEditorActive) return;
  window.__cmsEditorActive = true;

  // =========================================================================
  // STATE
  // =========================================================================
  const State = {
    selectedEl: null, selectedType: null, hoveredEl: null,
    mode: 'select', changes: window.__cmsChanges || [],
    originalValues: new Map(),
  };

  // =========================================================================
  // HISTORY
  // =========================================================================
  const History = {
    stack: window.__cmsHistory || [], index: window.__cmsHistoryIndex ?? -1,
    push(e) { this.stack.length = this.index + 1; this.stack.push(e); this.index++; this.notify(); },
    undo() { if (this.index < 0) return; this.stack[this.index].undo(); this.index--; this.notify(); Changes.rebuild(); },
    redo() { if (this.index >= this.stack.length - 1) return; this.index++; this.stack[this.index].redo(); this.notify(); Changes.rebuild(); },
    notify() { window.__cmsHistory = this.stack; window.__cmsHistoryIndex = this.index;
      Bridge.send('cms-history-state', { canUndo: this.index >= 0, canRedo: this.index < this.stack.length - 1 }); },
  };

  // =========================================================================
  // CHANGES
  // =========================================================================
  const Changes = {
    add(c) { const i = State.changes.findIndex(x => x.type===c.type && x.selector===c.selector && x.property===c.property);
      if (i >= 0) State.changes[i] = c; else State.changes.push(c); window.__cmsChanges = State.changes; this.notify(); },
    rebuild() { State.changes = []; for (let i = 0; i <= History.index; i++) { const c = History.stack[i]?.change;
      if (!c) continue; const j = State.changes.findIndex(x => x.type===c.type && x.selector===c.selector && x.property===c.property);
      if (j >= 0) State.changes[j] = c; else State.changes.push(c); } window.__cmsChanges = State.changes; this.notify(); },
    notify() { Bridge.send('cms-changes', { changes: State.changes, count: State.changes.length });
      const el = document.querySelector('.__cms-toolbar .change-count');
      if (el) { const n = State.changes.length; el.textContent = n ? `${n} change${n===1?'':'s'}` : 'No changes'; el.style.color = n ? '#fbbf24' : 'rgba(255,255,255,0.6)'; } },
  };

  // =========================================================================
  // BRIDGE
  // =========================================================================
  const Bridge = {
    send(type, data = {}) { window.parent.postMessage({ type, ...data }, '*'); },
    listen() { window.addEventListener('message', (e) => { if (!e.data?.type) return; const d = e.data;
      switch (d.type) {
        case 'cms-set-mode': State.mode = d.mode; break;
        case 'cms-image-replace': ImageEditor.apply(d.selector, d.src, d.alt); break;
        case 'cms-style-change': StyleEditor.apply(d.selector, d.property, d.value); break;
        case 'cms-link-update': LinkEditor.apply(d.selector, d.href, d.text, d.target); break;
        case 'cms-insert-element': Inserter.insert(d.position, d.elementType, d.config); break;
        case 'cms-undo': History.undo(); break;
        case 'cms-redo': History.redo(); break;
        case 'cms-deselect': Selection.deselect(); break;
        case 'cms-read-headings':
          const hds = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(h => !isChrome(h))
            .map(h => ({ tag: h.tagName, text: h.textContent.trim().slice(0, 80) }));
          Bridge.send('cms-headings-data', { headings: hds }); break;
        case 'cms-highlight': { const el = document.querySelector(d.selector); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); break; }
      }
    }); },
  };

  // =========================================================================
  // HELPERS
  // =========================================================================
  function sel(el) {
    if (!el || el === document.body) return 'body';
    if (el.id && !el.id.startsWith('__cms')) return '#' + el.id;
    const p = []; let n = el;
    while (n && n !== document.body) {
      let s = n.tagName.toLowerCase();
      if (n.id && !n.id.startsWith('__cms')) { p.unshift('#' + n.id); break; }
      const sibs = n.parentElement ? [...n.parentElement.children].filter(c => c.tagName === n.tagName) : [];
      if (sibs.length > 1) s += ':nth-of-type(' + (sibs.indexOf(n) + 1) + ')';
      p.unshift(s); n = n.parentElement;
    }
    return p.join(' > ');
  }

  function cs(el) {
    const s = window.getComputedStyle(el);
    return { color: s.color, backgroundColor: s.backgroundColor, borderColor: s.borderColor,
      fontSize: s.fontSize, fontWeight: s.fontWeight, fontStyle: s.fontStyle,
      textAlign: s.textAlign, textDecoration: s.textDecoration, lineHeight: s.lineHeight,
      letterSpacing: s.letterSpacing, paddingTop: s.paddingTop, paddingRight: s.paddingRight,
      paddingBottom: s.paddingBottom, paddingLeft: s.paddingLeft, marginTop: s.marginTop,
      marginRight: s.marginRight, marginBottom: s.marginBottom, marginLeft: s.marginLeft,
      borderRadius: s.borderRadius, display: s.display, position: s.position,
      width: s.width, height: s.height, backgroundImage: s.backgroundImage };
  }

  function isChrome(el) {
    if (!el) return false;
    return el.closest('.__cms-toolbar') || el.closest('.__cms-action-bar') ||
      el.closest('.__cms-floating-toolbar') || el.closest('.__cms-slash-menu') ||
      el.closest('.__cms-label') || el.closest('.__cms-resize') ||
      el.classList?.contains('__cms-add-zone');
  }

  function isBlock(el) {
    return el.matches('section, [class*="section"], [class*="Section"]');
  }

  function isText(el) {
    return ['H1','H2','H3','H4','H5','H6','P','SPAN','LI','STRONG','EM','LABEL'].includes(el.tagName);
  }

  function detectType(el) {
    if (el.tagName === 'IMG') return 'image';
    const bg = window.getComputedStyle(el).backgroundImage;
    if (bg && bg !== 'none' && el.children.length === 0) return 'image';
    if (el.tagName === 'A' || el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') return 'link';
    if (isText(el)) return 'text';
    if (isBlock(el)) return 'section';
    return 'element';
  }

  // =========================================================================
  // SELECTION — click anything to select it
  // =========================================================================
  const Selection = {
    select(el) {
      if (isChrome(el)) return;
      this.deselect();
      State.selectedEl = el;
      State.selectedType = detectType(el);
      el.classList.add('__cms-selected');

      // Show action bar on EVERY selected element
      ActionBar.show(el, State.selectedType);

      // Show type-specific UI
      if (State.selectedType === 'text' || State.selectedType === 'link') FloatingToolbar.show(el);
      if (State.selectedType === 'image') Resize.show(el);

      // Send to parent
      const props = this.getProps(el);
      Bridge.send('cms-element-selected', { elementType: State.selectedType, properties: props, selector: sel(el), tag: el.tagName });
    },
    deselect() {
      if (State.selectedEl) {
        State.selectedEl.classList.remove('__cms-selected');
        State.selectedEl = null; State.selectedType = null;
        Bridge.send('cms-element-deselected', {});
      }
      ActionBar.hide(); FloatingToolbar.hide(); Resize.hide(); Label.hide();
    },
    getProps(el) {
      const c = cs(el); const base = { ...c, selector: sel(el) };
      if (el.tagName === 'IMG') { base.src = el.src; base.alt = el.alt; }
      if (el.tagName === 'A' || el.tagName === 'BUTTON') { base.href = el.href || el.getAttribute('href') || ''; base.text = el.textContent; base.target = el.target || ''; }
      if (isText(el)) base.text = el.textContent;
      const bg = c.backgroundImage; if (bg && bg !== 'none') { const m = bg.match(/url\(["']?([^"')]+)["']?\)/); base.backgroundImageUrl = m ? m[1] : ''; }
      return base;
    },
    init() {
      document.addEventListener('click', (e) => {
        if (isChrome(e.target)) return;
        e.stopPropagation();
        this.select(e.target);
      }, true);
      document.addEventListener('mouseover', (e) => {
        const el = e.target; if (isChrome(el) || el === State.hoveredEl) return;
        if (State.hoveredEl) State.hoveredEl.classList.remove('__cms-hover');
        State.hoveredEl = el; el.classList.add('__cms-hover');
      });
      document.addEventListener('mouseout', (e) => {
        if (State.hoveredEl) { State.hoveredEl.classList.remove('__cms-hover'); State.hoveredEl = null; }
      });
    },
  };

  // =========================================================================
  // ACTION BAR — appears on ANY selected element
  // =========================================================================
  const ActionBar = {
    el: null,
    build() {
      const bar = document.createElement('div');
      bar.className = '__cms-action-bar';
      bar.innerHTML = `
        <div class="__cms-ab-label"></div>
        <div class="__cms-ab-sep"></div>
        <button data-action="drag" title="Drag to move">\u2630</button>
        <button data-action="duplicate" title="Duplicate">\u2398</button>
        <button data-action="delete" title="Delete" class="__cms-ab-danger">\u2715</button>
      `;
      bar.addEventListener('click', (e) => {
        const btn = e.target.closest('button'); if (!btn) return;
        e.preventDefault(); e.stopPropagation();
        const el = State.selectedEl; if (!el) return;
        switch (btn.dataset.action) {
          case 'duplicate': this.duplicateEl(el); break;
          case 'delete': this.deleteEl(el); break;
        }
      });
      // Drag handle
      const dragBtn = bar.querySelector('[data-action="drag"]');
      dragBtn.draggable = true;
      dragBtn.addEventListener('dragstart', (e) => {
        const el = State.selectedEl; if (!el) return;
        DragDrop.start(el, e);
      });
      document.body.appendChild(bar);
      bar.style.display = 'none';
      this.el = bar;
    },
    show(target, type) {
      if (!this.el) this.build();
      const bar = this.el;
      const typeLabels = { text: 'Text', image: 'Image', link: 'Link/Button', section: 'Section', element: 'Element' };
      bar.querySelector('.__cms-ab-label').textContent = `${target.tagName} \u00b7 ${typeLabels[type] || 'Element'}`;
      bar.style.display = 'flex';
      this.position(target);
      Label.show(target, type);
    },
    position(target) {
      const rect = target.getBoundingClientRect();
      const bar = this.el;
      const bRect = bar.getBoundingClientRect();
      let top = rect.top - bRect.height - 6 + window.scrollY;
      let left = rect.left + window.scrollX;
      if (top < window.scrollY + 5) top = rect.bottom + 6 + window.scrollY;
      left = Math.max(4, Math.min(left, window.innerWidth - bRect.width - 4));
      bar.style.top = top + 'px'; bar.style.left = left + 'px';
    },
    hide() { if (this.el) this.el.style.display = 'none'; },
    duplicateEl(el) {
      const clone = el.cloneNode(true);
      el.parentNode.insertBefore(clone, el.nextSibling);
      // Make text editable in clone
      clone.querySelectorAll(TextEditor.TAGS.join(',')).forEach(t => TextEditor.makeEditable(t));
      if (isText(clone)) TextEditor.makeEditable(clone);
      const s = sel(clone);
      History.push({ change: { type: 'block', action: 'duplicate', selector: s },
        undo: () => clone.remove(), redo: () => el.parentNode.insertBefore(clone, el.nextSibling) });
      Changes.add({ type: 'block', action: 'duplicate', selector: s, html: clone.outerHTML });
      Selection.select(clone);
    },
    deleteEl(el) {
      const parent = el.parentNode; const next = el.nextSibling; const html = el.outerHTML;
      History.push({ change: { type: 'block', action: 'delete', selector: sel(el), html },
        undo: () => { const t = document.createElement('div'); t.innerHTML = html; const restored = t.firstChild; parent.insertBefore(restored, next); },
        redo: () => el.remove() });
      el.remove();
      Changes.add({ type: 'block', action: 'delete', selector: sel(el) });
      Selection.deselect();
    },
  };

  // =========================================================================
  // LABEL — type badge on selected element
  // =========================================================================
  const Label = {
    el: null,
    show(target, type) {
      if (!this.el) { this.el = document.createElement('div'); this.el.className = '__cms-label'; document.body.appendChild(this.el); }
      const colors = { text: '#3b82f6', image: '#a855f7', link: '#10b981', section: '#8b5cf6', element: '#6b7280' };
      this.el.textContent = target.tagName;
      this.el.style.backgroundColor = colors[type] || '#6b7280';
      this.el.style.display = 'block';
      const r = target.getBoundingClientRect();
      this.el.style.top = (r.top + window.scrollY - 18) + 'px';
      this.el.style.left = (r.left + window.scrollX) + 'px';
    },
    hide() { if (this.el) this.el.style.display = 'none'; },
  };

  // =========================================================================
  // FLOATING TOOLBAR — text formatting (appears below action bar)
  // =========================================================================
  const FloatingToolbar = {
    el: null,
    build() {
      const t = document.createElement('div');
      t.className = '__cms-floating-toolbar';
      t.innerHTML = `
        <button data-cmd="bold" title="Bold"><b>B</b></button>
        <button data-cmd="italic" title="Italic"><i>I</i></button>
        <button data-cmd="underline" title="Underline"><u>U</u></button>
        <span class="__cms-ft-sep"></span>
        <select data-cmd="heading" title="Tag">
          <option value="P">P</option><option value="H1">H1</option><option value="H2">H2</option>
          <option value="H3">H3</option><option value="H4">H4</option>
        </select>
        <span class="__cms-ft-sep"></span>
        <button data-cmd="alignLeft" title="Left">\u2261</button>
        <button data-cmd="alignCenter" title="Center">\u2263</button>
        <button data-cmd="alignRight" title="Right">\u2262</button>
        <span class="__cms-ft-sep"></span>
        <button data-cmd="sizeDown">A\u2212</button>
        <button data-cmd="sizeUp">A+</button>
        <span class="__cms-ft-sep"></span>
        <button data-cmd="link" title="Link">\u{1F517}</button>
      `;
      t.addEventListener('click', (e) => {
        const btn = e.target.closest('button'); if (!btn) return;
        e.preventDefault(); e.stopPropagation();
        const el = State.selectedEl; if (!el) return;
        const s = sel(el);
        switch (btn.dataset.cmd) {
          case 'bold': document.execCommand('bold'); break;
          case 'italic': document.execCommand('italic'); break;
          case 'underline': document.execCommand('underline'); break;
          case 'alignLeft': StyleEditor.apply(s, 'textAlign', 'left'); break;
          case 'alignCenter': StyleEditor.apply(s, 'textAlign', 'center'); break;
          case 'alignRight': StyleEditor.apply(s, 'textAlign', 'right'); break;
          case 'sizeDown': case 'sizeUp': {
            const cur = parseInt(window.getComputedStyle(el).fontSize) || 16;
            StyleEditor.apply(s, 'fontSize', (btn.dataset.cmd === 'sizeUp' ? cur + 2 : Math.max(10, cur - 2)) + 'px'); break; }
          case 'link': { const url = prompt('URL:'); if (url) document.execCommand('createLink', false, url); break; }
        }
      });
      t.querySelector('select').addEventListener('change', (e) => {
        const el = State.selectedEl; if (!el || el.tagName === e.target.value) return;
        this.changeTag(el, e.target.value);
      });
      document.body.appendChild(t); t.style.display = 'none'; this.el = t;
    },
    changeTag(el, newTag) {
      const ne = document.createElement(newTag);
      ne.innerHTML = el.innerHTML; ne.className = el.className;
      ne.contentEditable = 'true'; ne.spellcheck = false;
      el.parentNode.replaceChild(ne, el);
      TextEditor.makeEditable(ne);
      const s = sel(ne), oldTag = el.tagName;
      History.push({ change: { type: 'tag-change', selector: s, oldTag, newTag },
        undo: () => { const r = document.createElement(oldTag); r.innerHTML = ne.innerHTML; r.className = ne.className; r.contentEditable='true'; ne.parentNode.replaceChild(r, ne); },
        redo: () => { this.changeTag(State.selectedEl, newTag); } });
      Changes.add({ type: 'tag-change', selector: s, oldTag, newTag });
      Selection.select(ne);
    },
    show(el) {
      if (!this.el) this.build();
      const t = this.el; t.style.display = 'flex';
      t.querySelector('select').value = ['H1','H2','H3','H4'].includes(el.tagName) ? el.tagName : 'P';
      // Position below the action bar
      setTimeout(() => {
        const ab = ActionBar.el;
        if (ab && ab.style.display !== 'none') {
          const abRect = ab.getBoundingClientRect();
          t.style.top = (abRect.bottom + 4 + window.scrollY) + 'px';
          t.style.left = abRect.left + 'px';
        } else {
          const r = el.getBoundingClientRect();
          t.style.top = (r.top - 40 + window.scrollY) + 'px';
          t.style.left = r.left + 'px';
        }
      }, 10);
    },
    hide() { if (this.el) this.el.style.display = 'none'; },
  };

  // =========================================================================
  // DRAG & DROP — reorder any element
  // =========================================================================
  const DragDrop = {
    dragged: null, indicator: null,
    init() {
      this.indicator = document.createElement('div');
      this.indicator.className = '__cms-drop-indicator';
      document.body.appendChild(this.indicator);
      this.indicator.style.display = 'none';

      document.addEventListener('dragover', (e) => {
        if (!this.dragged) return;
        e.preventDefault(); e.dataTransfer.dropEffect = 'move';
        // Find nearest sibling to drop next to
        const target = this.findDropTarget(e.clientY);
        if (target && target !== this.dragged) {
          const r = target.getBoundingClientRect();
          const above = e.clientY < r.top + r.height / 2;
          this.indicator.style.display = 'block';
          this.indicator.style.top = (above ? r.top : r.bottom) + window.scrollY + 'px';
          this.indicator.style.left = r.left + 'px';
          this.indicator.style.width = r.width + 'px';
          target.__dropAbove = above;
        }
      });
      document.addEventListener('drop', (e) => {
        if (!this.dragged) return;
        e.preventDefault();
        const target = this.findDropTarget(e.clientY);
        if (target && target !== this.dragged) {
          const parent = this.dragged.parentNode;
          const origNext = this.dragged.nextSibling;
          if (target.__dropAbove) target.parentNode.insertBefore(this.dragged, target);
          else target.parentNode.insertBefore(this.dragged, target.nextSibling);
          const d = this.dragged;
          History.push({ change: { type: 'block', action: 'reorder', selector: sel(d) },
            undo: () => parent.insertBefore(d, origNext),
            redo: () => { if (target.__dropAbove) target.parentNode.insertBefore(d, target); else target.parentNode.insertBefore(d, target.nextSibling); } });
          Changes.add({ type: 'block', action: 'reorder', selector: sel(d) });
        }
        this.end();
      });
      document.addEventListener('dragend', () => this.end());
    },
    start(el, e) {
      this.dragged = el;
      el.classList.add('__cms-dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', '');
    },
    end() {
      if (this.dragged) this.dragged.classList.remove('__cms-dragging');
      this.dragged = null;
      this.indicator.style.display = 'none';
    },
    findDropTarget(y) {
      if (!this.dragged) return null;
      const siblings = [...this.dragged.parentNode.children].filter(c => c !== this.dragged && !isChrome(c));
      let closest = null, closestDist = Infinity;
      for (const sib of siblings) {
        const r = sib.getBoundingClientRect();
        const mid = r.top + r.height / 2;
        const dist = Math.abs(y - mid);
        if (dist < closestDist) { closestDist = dist; closest = sib; }
      }
      return closest;
    },
  };

  // =========================================================================
  // RESIZE — handles on selected element
  // =========================================================================
  const Resize = {
    handles: null, active: false, startX: 0, startY: 0, startW: 0, startH: 0, ratio: 1,
    show(el) {
      if (!this.handles) { this.handles = document.createElement('div'); this.handles.className = '__cms-resize'; document.body.appendChild(this.handles); }
      this.handles.innerHTML = '';
      ['nw','ne','sw','se'].forEach(pos => {
        const h = document.createElement('div');
        h.className = `__cms-rh __cms-rh-${pos}`;
        h.addEventListener('mousedown', (e) => this.startResize(e, el, pos));
        this.handles.appendChild(h);
      });
      this.handles.style.display = 'block';
      this.position(el);
    },
    position(el) {
      if (!this.handles || !el) return;
      const r = el.getBoundingClientRect();
      const pos = { nw:[r.left-4,r.top-4+window.scrollY], ne:[r.right-4,r.top-4+window.scrollY],
        sw:[r.left-4,r.bottom-4+window.scrollY], se:[r.right-4,r.bottom-4+window.scrollY] };
      this.handles.querySelectorAll('.__cms-rh').forEach(h => {
        const p = pos[h.className.split('__cms-rh-')[1]];
        if (p) { h.style.left = p[0]+'px'; h.style.top = p[1]+'px'; }
      });
    },
    startResize(e, el, pos) {
      e.preventDefault(); e.stopPropagation();
      this.active = true; this.startX = e.clientX; this.startY = e.clientY;
      this.startW = el.offsetWidth; this.startH = el.offsetHeight;
      this.ratio = this.startW / this.startH;
      const move = (e2) => {
        if (!this.active) return;
        const dx = e2.clientX - this.startX, dy = e2.clientY - this.startY;
        let w = this.startW, h = this.startH;
        if (pos.includes('e')) w += dx; if (pos.includes('w')) w -= dx;
        if (pos.includes('s')) h += dy; if (pos.includes('n')) h -= dy;
        if (el.tagName === 'IMG') h = w / this.ratio;
        el.style.width = Math.max(30, w) + 'px';
        el.style.height = Math.max(20, h) + 'px';
        this.position(el);
      };
      const up = () => {
        this.active = false; document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up);
        const s = sel(el), nw = el.style.width, nh = el.style.height;
        History.push({ change: { type: 'style', selector: s, property: 'width', oldValue: this.startW+'px', newValue: nw },
          undo: () => { el.style.width = this.startW+'px'; el.style.height = this.startH+'px'; }, redo: () => { el.style.width = nw; el.style.height = nh; } });
        Changes.add({ type: 'style', selector: s, property: 'width', oldValue: this.startW+'px', newValue: nw });
      };
      document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
    },
    hide() { if (this.handles) this.handles.style.display = 'none'; },
  };

  // =========================================================================
  // SLASH COMMAND — type / to insert
  // =========================================================================
  const SlashCmd = {
    menu: null, items: [], idx: 0, target: null,
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
      this.target = el;
      if (!this.menu) { this.menu = document.createElement('div'); this.menu.className = '__cms-slash-menu'; document.body.appendChild(this.menu); }
      this.idx = 0; this.render(); this.menu.style.display = 'block';
      const r = el.getBoundingClientRect();
      this.menu.style.top = (r.bottom + 4 + window.scrollY) + 'px'; this.menu.style.left = r.left + 'px';
    },
    hide() { if (this.menu) this.menu.style.display = 'none'; this.target = null; },
    render(filter = '') {
      const f = filter ? this.ITEMS.filter(i => i.label.toLowerCase().includes(filter)) : this.ITEMS;
      this.items = f;
      this.menu.innerHTML = f.map((it, i) =>
        `<div class="__cms-si ${i===this.idx?'__cms-si-active':''}" data-i="${i}"><span class="__cms-si-icon">${it.icon}</span>${it.label}</div>`
      ).join('') || '<div style="padding:12px;color:#64748b;font-size:12px">No results</div>';
      this.menu.querySelectorAll('.__cms-si').forEach(el => {
        el.onclick = () => { const it = this.items[+el.dataset.i]; if (it) this.execute(it); };
      });
    },
    execute(item) {
      const el = this.target; if (!el) return;
      el.textContent = el.textContent.replace(/\/.*$/, '').trim();
      const sec = el.closest('section, [class*="section"]');
      if (sec) Inserter.insert({ parentSelector: sel(sec.parentNode), afterSelector: sel(sec) }, item.type, item.config);
      this.hide();
    },
    handleKey(e) {
      if (!this.menu || this.menu.style.display === 'none') return false;
      if (e.key === 'ArrowDown') { e.preventDefault(); this.idx = Math.min(this.items.length-1, this.idx+1); this.render(); return true; }
      if (e.key === 'ArrowUp') { e.preventDefault(); this.idx = Math.max(0, this.idx-1); this.render(); return true; }
      if (e.key === 'Enter') { e.preventDefault(); if (this.items[this.idx]) this.execute(this.items[this.idx]); return true; }
      if (e.key === 'Escape') { this.hide(); return true; }
      return false;
    },
    init() {
      document.addEventListener('input', (e) => {
        const el = e.target; if (el.contentEditable !== 'true') return;
        const t = el.textContent;
        if (t.startsWith('/')) { this.show(el); this.render(t.slice(1).toLowerCase()); } else this.hide();
      });
    },
  };

  // =========================================================================
  // ADD ZONES — "+" between all blocks
  // =========================================================================
  const AddZones = {
    init() {
      const blocks = document.querySelectorAll('section, [class*="section"], [class*="Section"]');
      blocks.forEach(block => {
        if (isChrome(block) || block.closest('nav') || block.closest('header')) return;
        if (block.nextElementSibling && !block.nextElementSibling.classList.contains('__cms-add-zone')) {
          const zone = document.createElement('div');
          zone.className = '__cms-add-zone';
          zone.innerHTML = '<span class="__cms-add-zone-btn">+</span>';
          zone.onclick = () => {
            Bridge.send('cms-insert-request', { position: { parentSelector: sel(block.parentNode), afterSelector: sel(block) } });
          };
          block.parentNode.insertBefore(zone, block.nextSibling);
        }
      });
    },
  };

  // =========================================================================
  // TEXT EDITOR
  // =========================================================================
  const TextEditor = {
    TAGS: ['H1','H2','H3','H4','H5','H6','P','SPAN','LI','STRONG','EM'],
    makeEditable(el) {
      if (el.contentEditable === 'true') return;
      if (el.closest('nav') || el.closest('header') || el.closest('footer')) return;
      if (el.closest('button') || el.closest('[role="button"]')) return;
      if (isChrome(el)) return;
      State.originalValues.set(el, el.textContent);
      el.contentEditable = 'true'; el.spellcheck = false;
      el.addEventListener('focus', () => State.originalValues.set(el, el.textContent));
      el.addEventListener('blur', () => {
        const old = State.originalValues.get(el), now = el.textContent;
        if (old !== now) {
          const s = sel(el);
          History.push({ change: { type: 'text', selector: s, tag: el.tagName, oldText: old, newText: now },
            undo: () => { el.textContent = old; }, redo: () => { el.textContent = now; } });
          Changes.add({ type: 'text', selector: s, tag: el.tagName, oldText: old, newText: now });
        }
      });
      el.addEventListener('keydown', (e) => {
        if (SlashCmd.handleKey(e)) return;
        if (e.key === 'Enter' && !e.shiftKey && el.tagName !== 'P') { e.preventDefault(); el.blur(); }
      });
    },
    init() { document.querySelectorAll(this.TAGS.join(',')).forEach(el => this.makeEditable(el)); },
  };

  // =========================================================================
  // IMAGE / STYLE / LINK EDITORS
  // =========================================================================
  const ImageEditor = {
    init() { document.querySelectorAll('img').forEach(img => { if (isChrome(img)) return;
      img.addEventListener('click', (e) => { e.stopPropagation(); Selection.select(img); }); }); },
    apply(s, src, alt) { const el = document.querySelector(s); if (!el) return;
      if (el.tagName === 'IMG') { const os = el.src, oa = el.alt;
        History.push({ change: { type:'image',selector:s,oldSrc:os,newSrc:src,oldAlt:oa,newAlt:alt||oa },
          undo:()=>{el.src=os;if(alt)el.alt=oa;}, redo:()=>{el.src=src;if(alt)el.alt=alt;} });
        el.src=src; if(alt)el.alt=alt; } else { const ob=el.style.backgroundImage;
        History.push({ change:{type:'image',selector:s,oldSrc:ob,newSrc:src,isBackgroundImage:true},
          undo:()=>{el.style.backgroundImage=ob;}, redo:()=>{el.style.backgroundImage=`url('${src}')`;} });
        el.style.backgroundImage=`url('${src}')`; }
      Changes.add({type:'image',selector:s,oldSrc:'',newSrc:src,oldAlt:'',newAlt:alt||''}); },
  };

  const StyleEditor = {
    apply(s, prop, val) { const el = document.querySelector(s); if (!el) return;
      const old = el.style[prop] || window.getComputedStyle(el)[prop];
      History.push({ change:{type:'style',selector:s,property:prop,oldValue:old,newValue:val},
        undo:()=>{el.style[prop]=old;}, redo:()=>{el.style[prop]=val;} });
      el.style[prop]=val;
      Changes.add({type:'style',selector:s,property:prop,oldValue:old,newValue:val});
      if (State.selectedEl===el) Bridge.send('cms-element-selected', {elementType:State.selectedType,properties:Selection.getProps(el),selector:s,tag:el.tagName}); },
  };

  const LinkEditor = {
    apply(s,href,text,target) { const el=document.querySelector(s); if(!el)return;
      const oh=el.getAttribute('href')||'',ot=el.textContent,otr=el.target||'';
      History.push({ change:{type:'link',selector:s,oldHref:oh,newHref:href,oldText:ot,newText:text},
        undo:()=>{if(href)el.setAttribute('href',oh);if(text)el.textContent=ot;if(target!==undefined)el.target=otr;},
        redo:()=>{if(href)el.setAttribute('href',href);if(text)el.textContent=text;if(target!==undefined)el.target=target;} });
      if(href!==undefined)el.setAttribute('href',href);if(text!==undefined)el.textContent=text;if(target!==undefined)el.target=target;
      Changes.add({type:'link',selector:s,oldHref:oh,newHref:href,oldText:ot,newText:text}); },
  };

  // =========================================================================
  // INSERTER
  // =========================================================================
  const Inserter = {
    T: {
      paragraph:()=>{const p=document.createElement('p');p.contentEditable='true';p.textContent='Click to edit...';p.style.cssText='font-size:1rem;line-height:1.7;margin-bottom:1rem;';return p;},
      heading:(c)=>{const h=document.createElement(c?.level||'h2');h.contentEditable='true';h.textContent=c?.text||'New Heading';h.style.cssText='font-weight:bold;margin-bottom:1rem;';return h;},
      image:()=>{const i=document.createElement('img');i.src='https://placehold.co/800x400/25475e/f4f4ec?text=Click+to+replace';i.alt='New image';i.style.cssText='max-width:100%;border-radius:1rem;margin:1rem 0;';return i;},
      button:()=>{const a=document.createElement('a');a.href='#';a.textContent='Button Text';a.contentEditable='true';a.style.cssText='display:inline-flex;padding:0.8rem 2rem;background:#25475e;color:#f4f4ec;border-radius:2rem;font-weight:600;text-decoration:none;font-size:0.85rem;letter-spacing:0.1em;text-transform:uppercase;margin:1rem 0;';return a;},
      divider:()=>{const h=document.createElement('hr');h.style.cssText='border:none;border-top:2px solid #e3e3d8;margin:2rem 0;';return h;},
      list:()=>{const u=document.createElement('ul');u.style.cssText='list-style:disc;padding-left:1.5rem;margin:1rem 0;';for(let i=0;i<3;i++){const l=document.createElement('li');l.contentEditable='true';l.textContent=`Item ${i+1}`;u.appendChild(l);}return u;},
      faq:()=>{const d=document.createElement('div');d.style.cssText='border:2px solid #e3e3d8;border-radius:2rem;padding:1.5rem;margin:1rem 0;';d.innerHTML='<h4 contenteditable="true" style="font-weight:bold;margin-bottom:0.5rem;color:#25475e;">Question?</h4><p contenteditable="true" style="color:#25475e99;">Answer here.</p>';return d;},
      card:()=>{const d=document.createElement('div');d.style.cssText='border:2px solid rgba(227,227,216,0.3);border-radius:2rem;padding:1.5rem;';d.innerHTML='<h4 contenteditable="true" style="font-weight:bold;margin-bottom:0.5rem;">Card Title</h4><p contenteditable="true" style="font-size:0.8rem;">Description.</p>';return d;},
    },
    insert(pos, type, config) {
      const parent=document.querySelector(pos.parentSelector), after=document.querySelector(pos.afterSelector);
      if(!parent)return;
      const wrap=document.createElement('section');
      const inner=document.createElement('div');inner.style.cssText='max-width:68rem;margin:0 auto;padding:2rem 60px;';
      const fn=this.T[type];if(!fn)return;
      inner.appendChild(fn(config));wrap.appendChild(inner);
      const ref=after?after.nextSibling:parent.firstChild;
      parent.insertBefore(wrap,ref);
      const s=sel(wrap);
      History.push({change:{type:'block',action:'insert',selector:s,elementType:type},undo:()=>wrap.remove(),redo:()=>parent.insertBefore(wrap,ref)});
      Changes.add({type:'block',action:'insert',selector:s,elementType:type,html:wrap.outerHTML});
      Selection.select(wrap);
    },
  };

  // =========================================================================
  // TOOLBAR (bottom bar)
  // =========================================================================
  const Toolbar = {
    build() {
      const b=document.createElement('div');b.className='__cms-toolbar';
      b.innerHTML='<button class="undo" disabled>\u21a9</button><button class="redo" disabled>\u21aa</button><div class="divider"></div><span class="change-count" style="opacity:0.6">No changes</span><div class="divider"></div><button class="discard">Discard</button><button class="primary save">Save</button>';
      b.querySelector('.undo').onclick=()=>History.undo();
      b.querySelector('.redo').onclick=()=>History.redo();
      b.querySelector('.discard').onclick=()=>window.location.reload();
      b.querySelector('.save').onclick=()=>Bridge.send('cms-save',{changes:State.changes});
      document.body.appendChild(b);
      window.addEventListener('message',(e)=>{if(e.data?.type==='cms-history-state'){b.querySelector('.undo').disabled=!e.data.canUndo;b.querySelector('.redo').disabled=!e.data.canRedo;}});
    },
  };

  // =========================================================================
  // KEYBOARD
  // =========================================================================
  document.addEventListener('keydown', (e) => {
    if (SlashCmd.handleKey(e)) return;
    if ((e.ctrlKey||e.metaKey) && e.key==='z' && !e.shiftKey) { e.preventDefault(); History.undo(); }
    if ((e.ctrlKey||e.metaKey) && (e.key==='y'||(e.key==='z'&&e.shiftKey))) { e.preventDefault(); History.redo(); }
    if (e.key==='Escape') { SlashCmd.hide(); Selection.deselect(); }
    if (e.key==='Delete' && State.selectedEl && document.activeElement !== State.selectedEl) { ActionBar.deleteEl(State.selectedEl); }
  });

  // =========================================================================
  // INIT
  // =========================================================================
  function init() {
    document.body.classList.add('__cms-editing');
    Bridge.listen(); Selection.init(); TextEditor.init(); ImageEditor.init();
    DragDrop.init(); SlashCmd.init(); AddZones.init();
    Toolbar.build(); History.notify();
    Bridge.send('cms-editor-ready');
  }

  if (document.readyState === 'complete') setTimeout(init, 300);
  else window.addEventListener('load', () => setTimeout(init, 300));
})();
