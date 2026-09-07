(() => {
  'use strict';

  const selectors = {
    root: '[data-xde-editor]',
    canvas: '[data-xde-canvas]',
    add: '[data-xde-add-block]',
    properties: '[data-xde-properties]',
    propertiesForm: '[data-xde-properties-form]',
    propertiesEmpty: '[data-xde-properties-empty]',
    saveState: '[data-xde-save-state]',
    slashMenu: '[data-xde-slash-menu]',
    slashResults: '[data-xde-slash-results]',
    inlineToolbar: '[data-xde-inline-toolbar]'
  };

  const labels = {
    heading: 'Titolo', text: 'Testo', image: 'Immagine', video: 'Video', gallery: 'Galleria',
    button: 'Pulsante', quote: 'Citazione', divider: 'Separatore', file: 'File', embed: 'Embed', columns: 'Layout colonne'
  };

  class XdeEditor {
    constructor(root) {
      this.root = root;
      this.canvas = root.querySelector(selectors.canvas);
      this.properties = root.querySelector(selectors.properties);
      this.propertiesForm = root.querySelector(selectors.propertiesForm);
      this.propertiesEmpty = root.querySelector(selectors.propertiesEmpty);
      this.saveState = root.querySelector(selectors.saveState);
      this.slashMenu = root.querySelector(selectors.slashMenu);
      this.slashResults = root.querySelector(selectors.slashResults);
      this.inlineToolbar = root.querySelector(selectors.inlineToolbar);
      this.selected = null;
      this.history = [];
      this.historyIndex = -1;
      this.saveTimer = null;
      this.captureHistory();
      this.bind();
      this.renderSlashResults();
    }

    bind() {
      this.root.addEventListener('click', (event) => {
        const add = event.target.closest(selectors.add);
        if (add) {
          this.insertBlock(add.dataset.xdeAddBlock);
          return;
        }

        const block = event.target.closest('[data-xde-block]');
        if (block && this.canvas.contains(block)) {
          this.selectBlock(block);
        }

        const toggle = event.target.closest('[data-xde-toggle]');
        if (toggle) this.togglePanel(toggle.dataset.xdeToggle);

        if (event.target.closest('[data-xde-open-slash]')) this.openSlashMenu();
        if (event.target.closest('[data-xde-undo]')) this.undo();
        if (event.target.closest('[data-xde-redo]')) this.redo();
        if (event.target.closest('[data-xde-mobile-properties-open]')) this.properties?.classList.add('is-open');

        const command = event.target.closest('[data-xde-command]');
        if (command) this.execCommand(command.dataset.xdeCommand);
      });

      this.canvas.addEventListener('input', () => this.changed());
      this.canvas.addEventListener('keyup', (event) => {
        if (event.key === '/') this.openSlashMenu();
        this.positionInlineToolbar();
      });
      this.canvas.addEventListener('mouseup', () => this.positionInlineToolbar());
      this.canvas.addEventListener('paste', (event) => this.cleanPaste(event));

      this.root.querySelector('[data-xde-block-search]')?.addEventListener('input', (event) => {
        const query = event.target.value.toLowerCase().trim();
        this.root.querySelectorAll(selectors.add).forEach((button) => {
          button.hidden = query && !button.textContent.toLowerCase().includes(query);
        });
      });

      this.root.querySelector('[data-xde-slash-search]')?.addEventListener('input', (event) => this.renderSlashResults(event.target.value));

      document.addEventListener('keydown', (event) => {
        if (!(event.ctrlKey || event.metaKey)) return;
        if (event.key.toLowerCase() === 'z') {
          event.preventDefault();
          event.shiftKey ? this.redo() : this.undo();
        }
      });
    }

    createBlock(type) {
      const wrapper = document.createElement('div');
      wrapper.dataset.xdeBlock = type;

      switch (type) {
        case 'heading': wrapper.innerHTML = '<h2>Nuovo titolo</h2>'; break;
        case 'text': wrapper.innerHTML = '<p>Scrivi il tuo testo…</p>'; break;
        case 'image': wrapper.innerHTML = '<figure><div class="xde-placeholder" data-xde-image-placeholder>Seleziona o inserisci un’immagine</div><figcaption>Aggiungi una didascalia…</figcaption></figure>'; break;
        case 'video': wrapper.innerHTML = '<div class="xde-video-frame"><div class="xde-placeholder">Incolla un URL video nelle proprietà</div></div>'; break;
        case 'gallery': wrapper.innerHTML = '<div class="xde-placeholder">Galleria immagini</div>'; break;
        case 'button': wrapper.innerHTML = '<p><a class="btn btn-primary" href="#">Pulsante</a></p>'; break;
        case 'quote': wrapper.innerHTML = '<blockquote>“Scrivi una citazione…”</blockquote>'; break;
        case 'divider': wrapper.innerHTML = '<hr>'; break;
        case 'file': wrapper.innerHTML = '<p><a href="#">File da scaricare</a></p>'; break;
        case 'embed': wrapper.innerHTML = '<div class="xde-placeholder">Contenuto incorporato</div>'; break;
        case 'columns': wrapper.innerHTML = '<div class="xde-columns"><div class="xde-column"><p>Colonna 1</p></div><div class="xde-column"><p>Colonna 2</p></div></div>'; break;
        default: wrapper.innerHTML = '<p>Nuovo contenuto</p>';
      }
      return wrapper;
    }

    insertBlock(type) {
      const block = this.createBlock(type);
      this.canvas.append(block);
      this.selectBlock(block);
      this.changed(true);
      this.closeSlashMenu();
      block.scrollIntoView({behavior: 'smooth', block: 'center'});
    }

    selectBlock(block) {
      this.canvas.querySelectorAll('.is-selected').forEach((el) => el.classList.remove('is-selected'));
      this.selected = block;
      block.classList.add('is-selected');
      this.renderProperties();
      const mobileBar = this.root.parentElement?.querySelector('[data-xde-mobile-properties]');
      if (mobileBar && window.matchMedia('(max-width: 1100px)').matches) mobileBar.hidden = false;
    }

    renderProperties() {
      if (!this.selected) return;
      this.propertiesEmpty.hidden = true;
      const type = this.selected.dataset.xdeBlock;
      let html = `<div class="xde-property"><strong>${labels[type] || type}</strong></div>`;

      if (type === 'image') {
        const img = this.selected.querySelector('img');
        const caption = this.selected.querySelector('figcaption')?.textContent || '';
        html += this.field('image-src', 'URL immagine', img?.getAttribute('src') || '');
        html += this.field('image-alt', 'Testo alternativo (alt)', img?.getAttribute('alt') || '');
        html += this.field('image-caption', 'Didascalia', caption);
        html += this.select('image-ratio', 'Rapporto', ['auto','1/1','4/3','3/2','16/9','9/16'], this.selected.dataset.ratio || 'auto');
        html += this.select('image-position', 'Posizione', ['50% 50%','50% 25%','50% 75%','25% 50%','75% 50%'], this.selected.dataset.position || '50% 50%');
      } else if (type === 'video') {
        html += this.field('video-url', 'URL video', this.selected.dataset.url || '');
        html += this.select('video-ratio', 'Rapporto', ['16/9','4/3','1/1','9/16'], this.selected.dataset.ratio || '16/9');
      } else if (type === 'button') {
        const link = this.selected.querySelector('a');
        html += this.field('button-label', 'Testo', link?.textContent || 'Pulsante');
        html += this.field('button-url', 'Link', link?.getAttribute('href') || '#');
      } else if (type === 'file') {
        const link = this.selected.querySelector('a');
        html += this.field('file-label', 'Testo', link?.textContent || 'File da scaricare');
        html += this.field('file-url', 'URL file', link?.getAttribute('href') || '#');
      } else {
        html += '<div class="xde-properties-empty">Seleziona direttamente il testo nell’area centrale per modificarlo.</div>';
      }

      this.propertiesForm.innerHTML = html;
      this.propertiesForm.querySelectorAll('input,select').forEach((field) => field.addEventListener('input', () => this.applyProperties()));
    }

    field(name, label, value) {
      const escaped = String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
      return `<div class="xde-property"><label for="xde-${name}">${label}</label><input class="form-control" id="xde-${name}" data-xde-property="${name}" value="${escaped}"></div>`;
    }

    select(name, label, options, current) {
      return `<div class="xde-property"><label for="xde-${name}">${label}</label><select class="form-select" id="xde-${name}" data-xde-property="${name}">${options.map((option) => `<option value="${option}"${option === current ? ' selected' : ''}>${option}</option>`).join('')}</select></div>`;
    }

    value(name) { return this.propertiesForm.querySelector(`[data-xde-property="${name}"]`)?.value || ''; }

    applyProperties() {
      if (!this.selected) return;
      const type = this.selected.dataset.xdeBlock;
      if (type === 'image') {
        const src = this.value('image-src').trim();
        let img = this.selected.querySelector('img');
        const placeholder = this.selected.querySelector('[data-xde-image-placeholder]');
        if (src && !img) {
          img = document.createElement('img');
          img.loading = 'lazy';
          placeholder?.replaceWith(img);
        }
        if (img) {
          img.src = src;
          img.alt = this.value('image-alt');
          img.style.aspectRatio = this.value('image-ratio') === 'auto' ? '' : this.value('image-ratio');
          img.style.objectFit = this.value('image-ratio') === 'auto' ? '' : 'cover';
          img.style.objectPosition = this.value('image-position');
        }
        const caption = this.selected.querySelector('figcaption');
        if (caption) caption.textContent = this.value('image-caption');
        this.selected.dataset.ratio = this.value('image-ratio');
        this.selected.dataset.position = this.value('image-position');
      }
      if (type === 'video') this.updateVideo();
      if (type === 'button') {
        const link = this.selected.querySelector('a');
        if (link) { link.textContent = this.value('button-label'); link.href = this.safeUrl(this.value('button-url')); }
      }
      if (type === 'file') {
        const link = this.selected.querySelector('a');
        if (link) { link.textContent = this.value('file-label'); link.href = this.safeUrl(this.value('file-url')); }
      }
      this.changed();
    }

    updateVideo() {
      const url = this.value('video-url').trim();
      const ratio = this.value('video-ratio') || '16/9';
      this.selected.dataset.url = url;
      this.selected.dataset.ratio = ratio;
      const frame = this.selected.querySelector('.xde-video-frame');
      frame.style.aspectRatio = ratio;
      const embed = this.videoEmbed(url);
      frame.innerHTML = embed || '<div class="xde-placeholder">URL video non riconosciuto</div>';
    }

    videoEmbed(url) {
      try {
        const parsed = new URL(url, window.location.origin);
        const host = parsed.hostname.replace(/^www\./, '');
        if (host === 'youtube.com' || host === 'm.youtube.com') {
          const id = parsed.searchParams.get('v');
          return id ? `<iframe loading="lazy" allowfullscreen src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}"></iframe>` : '';
        }
        if (host === 'youtu.be') {
          const id = parsed.pathname.split('/').filter(Boolean)[0];
          return id ? `<iframe loading="lazy" allowfullscreen src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}"></iframe>` : '';
        }
        if (host === 'vimeo.com' || host === 'player.vimeo.com') {
          const id = parsed.pathname.split('/').filter(Boolean).find((part) => /^\d+$/.test(part));
          return id ? `<iframe loading="lazy" allowfullscreen src="https://player.vimeo.com/video/${encodeURIComponent(id)}"></iframe>` : '';
        }
        if (/\.mp4($|\?)/i.test(parsed.href)) return `<video controls preload="metadata" src="${this.escapeAttr(parsed.href)}"></video>`;
      } catch (error) { return ''; }
      return '';
    }

    safeUrl(value) {
      try {
        const url = new URL(value, window.location.origin);
        return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? url.href : '#';
      } catch (error) { return '#'; }
    }

    cleanPaste(event) {
      const html = event.clipboardData?.getData('text/html');
      const text = event.clipboardData?.getData('text/plain');
      if (!html) return;
      event.preventDefault();
      const template = document.createElement('template');
      template.innerHTML = html;
      template.content.querySelectorAll('script,style,iframe,object,embed,form,input,button').forEach((el) => el.remove());
      template.content.querySelectorAll('*').forEach((el) => {
        [...el.attributes].forEach((attr) => {
          if (!['href','src','alt','title','colspan','rowspan'].includes(attr.name.toLowerCase())) el.removeAttribute(attr.name);
        });
      });
      document.execCommand('insertHTML', false, template.innerHTML || this.escapeHtml(text || ''));
      this.changed();
    }

    execCommand(command) {
      if (command === 'createLink') {
        const url = window.prompt('URL del collegamento');
        if (!url) return;
        document.execCommand('createLink', false, this.safeUrl(url));
      } else {
        document.execCommand(command, false);
      }
      this.changed();
    }

    positionInlineToolbar() {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.rangeCount || !this.canvas.contains(selection.anchorNode)) {
        this.inlineToolbar.hidden = true;
        return;
      }
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      const workspaceRect = this.root.querySelector('.xde-editor-workspace').getBoundingClientRect();
      this.inlineToolbar.style.left = `${Math.max(8, rect.left - workspaceRect.left)}px`;
      this.inlineToolbar.style.top = `${Math.max(8, rect.top - workspaceRect.top - 46)}px`;
      this.inlineToolbar.hidden = false;
    }

    changed(forceHistory = false) {
      this.saveState.textContent = 'Salvataggio…';
      clearTimeout(this.saveTimer);
      this.saveTimer = setTimeout(() => { this.saveState.textContent = 'Salvato ✓'; }, 650);
      if (forceHistory) this.captureHistory();
      else {
        clearTimeout(this.historyTimer);
        this.historyTimer = setTimeout(() => this.captureHistory(), 500);
      }
    }

    captureHistory() {
      const value = this.canvas.innerHTML;
      if (this.history[this.historyIndex] === value) return;
      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push(value);
      if (this.history.length > 50) this.history.shift();
      this.historyIndex = this.history.length - 1;
    }

    undo() {
      if (this.historyIndex <= 0) return;
      this.historyIndex--;
      this.canvas.innerHTML = this.history[this.historyIndex];
      this.clearSelection();
    }

    redo() {
      if (this.historyIndex >= this.history.length - 1) return;
      this.historyIndex++;
      this.canvas.innerHTML = this.history[this.historyIndex];
      this.clearSelection();
    }

    clearSelection() {
      this.selected = null;
      this.propertiesForm.innerHTML = '';
      this.propertiesEmpty.hidden = false;
      this.canvas.querySelectorAll('.is-selected').forEach((el) => el.classList.remove('is-selected'));
    }

    togglePanel(panel) {
      if (panel === 'blocks') this.root.classList.toggle('is-blocks-collapsed');
      if (panel === 'properties') this.root.classList.toggle('is-properties-collapsed');
    }

    openSlashMenu() {
      this.slashMenu.hidden = false;
      this.slashMenu.style.left = '28px';
      this.slashMenu.style.bottom = '70px';
      this.root.querySelector('[data-xde-slash-search]')?.focus();
      this.renderSlashResults();
    }

    closeSlashMenu() { this.slashMenu.hidden = true; }

    renderSlashResults(query = '') {
      if (!this.slashResults) return;
      const q = query.toLowerCase().trim();
      this.slashResults.innerHTML = Object.entries(labels)
        .filter(([, label]) => !q || label.toLowerCase().includes(q))
        .map(([type, label]) => `<button type="button" class="xde-block-button" data-xde-add-block="${type}"><span class="xde-block-icon">＋</span><span>${label}</span></button>`)
        .join('');
    }

    escapeHtml(value) { const div = document.createElement('div'); div.textContent = value; return div.innerHTML; }
    escapeAttr(value) { return this.escapeHtml(value).replaceAll('"', '&quot;'); }
  }

  const boot = () => document.querySelectorAll(selectors.root).forEach((root) => new XdeEditor(root));
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();
