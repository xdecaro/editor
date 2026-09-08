(() => {
  'use strict';

  const DEFAULTS = Object.freeze({
    rootSelector: '[data-xde-builder]',
    rowSelector: '[data-xde-builder-row]',
    itemSelector: '[data-xde-builder-item]',
    itemIdAttribute: 'data-xde-builder-id',
    widthAttribute: 'data-xde-builder-width',
    maxColumns: 4,
    historyLimit: 50,
    autoWidths: true,
    keyboardHistory: true
  });

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const roundWidth = (value) => Math.round(value * 1000) / 1000;

  class XdecaroBuilderEngine {
    constructor(root, options = {}) {
      if (!(root instanceof Element)) {
        throw new TypeError('XdecaroBuilderEngine requires a root Element.');
      }

      this.root = root;
      this.options = {...DEFAULTS, ...options};
      this.draggedItem = null;
      this.selectedItem = null;
      this.history = [];
      this.historyIndex = -1;
      this.destroyed = false;

      this.onClick = this.onClick.bind(this);
      this.onDragStart = this.onDragStart.bind(this);
      this.onDragEnd = this.onDragEnd.bind(this);
      this.onDragOver = this.onDragOver.bind(this);
      this.onDrop = this.onDrop.bind(this);
      this.onKeyDown = this.onKeyDown.bind(this);

      this.prepareDom();
      this.bind();
      this.captureHistory('init');
    }

    rows() {
      return [...this.root.querySelectorAll(this.options.rowSelector)];
    }

    items(row = this.root) {
      return [...row.querySelectorAll(this.options.itemSelector)];
    }

    getItemId(item) {
      return item?.getAttribute(this.options.itemIdAttribute) || '';
    }

    ensureItemId(item) {
      let id = this.getItemId(item);
      if (!id) {
        id = `xde-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
        item.setAttribute(this.options.itemIdAttribute, id);
      }
      return id;
    }

    prepareDom() {
      this.root.setAttribute('data-xde-builder-ready', 'true');
      this.rows().forEach((row) => this.prepareRow(row));
    }

    prepareRow(row) {
      row.setAttribute('data-xde-builder-row', '');
      this.items(row).forEach((item) => {
        this.ensureItemId(item);
        item.draggable = true;
      });
      if (this.options.autoWidths) this.normalizeRow(row, false);
    }

    bind() {
      this.root.addEventListener('click', this.onClick);
      this.root.addEventListener('dragstart', this.onDragStart);
      this.root.addEventListener('dragend', this.onDragEnd);
      this.root.addEventListener('dragover', this.onDragOver);
      this.root.addEventListener('drop', this.onDrop);
      if (this.options.keyboardHistory) document.addEventListener('keydown', this.onKeyDown);
    }

    destroy() {
      if (this.destroyed) return;
      this.root.removeEventListener('click', this.onClick);
      this.root.removeEventListener('dragstart', this.onDragStart);
      this.root.removeEventListener('dragend', this.onDragEnd);
      this.root.removeEventListener('dragover', this.onDragOver);
      this.root.removeEventListener('drop', this.onDrop);
      document.removeEventListener('keydown', this.onKeyDown);
      this.root.removeAttribute('data-xde-builder-ready');
      this.clearDropState();
      this.destroyed = true;
    }

    onClick(event) {
      const item = event.target.closest(this.options.itemSelector);
      if (!item || !this.root.contains(item)) return;
      this.select(item);
    }

    select(item) {
      if (!item || !this.root.contains(item)) return;
      this.items().forEach((candidate) => candidate.classList.toggle('is-selected', candidate === item));
      this.selectedItem = item;
      this.emit('select', {item, itemId: this.getItemId(item)});
    }

    onDragStart(event) {
      const item = event.target.closest(this.options.itemSelector);
      if (!item || !this.root.contains(item)) return;

      this.draggedItem = item;
      this.select(item);
      item.classList.add('is-dragging');
      event.dataTransfer?.setData('text/plain', this.getItemId(item));
      if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
      this.emit('dragstart', {item, itemId: this.getItemId(item)});
    }

    onDragEnd() {
      this.draggedItem?.classList.remove('is-dragging');
      this.draggedItem = null;
      this.clearDropState();
      this.emit('dragend', {});
    }

    onDragOver(event) {
      if (!this.draggedItem) return;
      const target = event.target.closest(this.options.itemSelector) || event.target.closest(this.options.rowSelector);
      if (!target || !this.root.contains(target)) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
      this.markDropTarget(target, event.clientX, event.clientY);
    }

    onDrop(event) {
      if (!this.draggedItem) return;
      const targetItem = event.target.closest(this.options.itemSelector);
      const targetRow = event.target.closest(this.options.rowSelector);
      if (!targetRow || !this.root.contains(targetRow)) return;

      event.preventDefault();
      const sourceRow = this.draggedItem.closest(this.options.rowSelector);
      const intent = targetItem && targetItem !== this.draggedItem
        ? this.getDropIntent(targetItem, event.clientX, event.clientY)
        : {mode: 'row', position: 'append'};

      this.applyDrop(this.draggedItem, targetItem, targetRow, intent);
      this.cleanupRows();
      if (sourceRow?.isConnected && this.options.autoWidths) this.normalizeRow(sourceRow, false);
      if (targetRow?.isConnected && this.options.autoWidths) this.normalizeRow(targetRow, false);
      this.prepareDom();
      this.captureHistory('move');
      this.clearDropState();
      this.emitChange('move', {itemId: this.getItemId(this.draggedItem), intent});
    }

    getDropIntent(targetItem, clientX, clientY) {
      const rect = targetItem.getBoundingClientRect();
      const x = clamp((clientX - rect.left) / Math.max(rect.width, 1), 0, 1);
      const y = clamp((clientY - rect.top) / Math.max(rect.height, 1), 0, 1);

      if (y >= 0.25 && y <= 0.75) {
        return {mode: 'column', position: x < 0.5 ? 'before' : 'after'};
      }

      return {mode: 'row', position: y < 0.5 ? 'before' : 'after'};
    }

    applyDrop(item, targetItem, targetRow, intent) {
      if (intent.mode === 'column' && targetItem) {
        const rowItems = this.items(targetRow).filter((candidate) => candidate !== item);
        const resultingCount = rowItems.length + 1;

        if (resultingCount <= this.options.maxColumns) {
          targetItem[intent.position === 'before' ? 'before' : 'after'](item);
          return;
        }
      }

      if (intent.mode === 'row' && targetItem) {
        const referenceRow = targetItem.closest(this.options.rowSelector);
        const newRow = this.createRow();
        newRow.append(item);
        referenceRow[intent.position === 'before' ? 'before' : 'after'](newRow);
        return;
      }

      targetRow.append(item);
    }

    createRow() {
      const row = document.createElement('div');
      row.setAttribute('data-xde-builder-row', '');
      this.emit('rowcreate', {row});
      return row;
    }

    moveItem(itemOrId, targetItemOrId, position = 'after', sameRow = false) {
      const item = this.resolveItem(itemOrId);
      const target = this.resolveItem(targetItemOrId);
      if (!item || !target || item === target) return false;

      const sourceRow = item.closest(this.options.rowSelector);
      const targetRow = target.closest(this.options.rowSelector);

      if (sameRow && this.items(targetRow).filter((candidate) => candidate !== item).length < this.options.maxColumns) {
        target[position === 'before' ? 'before' : 'after'](item);
      } else {
        const newRow = this.createRow();
        newRow.append(item);
        targetRow[position === 'before' ? 'before' : 'after'](newRow);
      }

      this.cleanupRows();
      if (sourceRow?.isConnected && this.options.autoWidths) this.normalizeRow(sourceRow, false);
      if (targetRow?.isConnected && this.options.autoWidths) this.normalizeRow(targetRow, false);
      this.prepareDom();
      this.captureHistory('move');
      this.emitChange('move', {itemId: this.getItemId(item), targetId: this.getItemId(target), position, sameRow});
      return true;
    }

    setWidth(itemOrId, width, rebalance = true) {
      const item = this.resolveItem(itemOrId);
      if (!item) return false;
      const row = item.closest(this.options.rowSelector);
      const siblings = this.items(row);
      if (!row || !siblings.length) return false;

      const requested = clamp(Number(width) || 100, 1, 100);
      const value = siblings.length === 1 ? 100 : requested;
      this.writeWidth(item, value);

      if (rebalance && siblings.length > 1) {
        const others = siblings.filter((candidate) => candidate !== item);
        const remainder = Math.max(0, 100 - value);
        const otherWidth = remainder / others.length;
        others.forEach((candidate) => this.writeWidth(candidate, otherWidth));
      }

      this.captureHistory('resize');
      this.emitChange('resize', {itemId: this.getItemId(item), width: value});
      return true;
    }

    normalizeRow(row, notify = true) {
      if (!row) return;
      const items = this.items(row);
      if (!items.length) return;
      const width = 100 / items.length;
      items.forEach((item) => this.writeWidth(item, width));
      if (notify) this.emitChange('normalize', {row});
    }

    writeWidth(item, width) {
      const value = roundWidth(width);
      item.setAttribute(this.options.widthAttribute, String(value));
      item.style.setProperty('--xde-builder-width', `${value}%`);
    }

    cleanupRows() {
      this.rows().forEach((row) => {
        if (!this.items(row).length) row.remove();
      });
    }

    requestDuplicate(itemOrId = this.selectedItem) {
      const item = this.resolveItem(itemOrId);
      if (!item) return;
      this.emit('duplicate-request', {item, itemId: this.getItemId(item)});
    }

    requestDelete(itemOrId = this.selectedItem) {
      const item = this.resolveItem(itemOrId);
      if (!item) return;
      this.emit('delete-request', {item, itemId: this.getItemId(item)});
    }

    refresh() {
      this.prepareDom();
      this.emit('refresh', {snapshot: this.snapshot()});
    }

    resolveItem(itemOrId) {
      if (itemOrId instanceof Element) return this.root.contains(itemOrId) ? itemOrId : null;
      if (typeof itemOrId !== 'string' || !itemOrId) return null;
      return this.items().find((item) => this.getItemId(item) === itemOrId) || null;
    }

    snapshot() {
      return this.rows().map((row) => ({
        items: this.items(row).map((item) => ({
          id: this.ensureItemId(item),
          width: Number(item.getAttribute(this.options.widthAttribute)) || 100
        }))
      }));
    }

    applySnapshot(snapshot, notify = true) {
      if (!Array.isArray(snapshot)) return false;
      const existing = new Map(this.items().map((item) => [this.getItemId(item), item]));
      const fragment = document.createDocumentFragment();

      snapshot.forEach((rowState) => {
        const row = this.createRow();
        (rowState.items || []).forEach((itemState) => {
          const item = existing.get(itemState.id);
          if (!item) return;
          this.writeWidth(item, Number(itemState.width) || 100);
          row.append(item);
        });
        if (this.items(row).length) fragment.append(row);
      });

      existing.forEach((item) => {
        if (!fragment.contains(item)) {
          const row = this.createRow();
          row.append(item);
          fragment.append(row);
        }
      });

      this.rows().forEach((row) => row.remove());
      this.root.append(fragment);
      this.prepareDom();
      if (notify) this.emitChange('restore', {snapshot: this.snapshot()});
      return true;
    }

    captureHistory(reason = 'change') {
      const state = JSON.stringify(this.snapshot());
      if (this.history[this.historyIndex]?.state === state) return;
      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push({state, reason});
      if (this.history.length > this.options.historyLimit) this.history.shift();
      this.historyIndex = this.history.length - 1;
      this.emit('history', {canUndo: this.canUndo(), canRedo: this.canRedo(), reason});
    }

    canUndo() {
      return this.historyIndex > 0;
    }

    canRedo() {
      return this.historyIndex >= 0 && this.historyIndex < this.history.length - 1;
    }

    undo() {
      if (!this.canUndo()) return false;
      this.historyIndex -= 1;
      this.applySnapshot(JSON.parse(this.history[this.historyIndex].state), false);
      this.emitChange('undo', {snapshot: this.snapshot()});
      this.emit('history', {canUndo: this.canUndo(), canRedo: this.canRedo(), reason: 'undo'});
      return true;
    }

    redo() {
      if (!this.canRedo()) return false;
      this.historyIndex += 1;
      this.applySnapshot(JSON.parse(this.history[this.historyIndex].state), false);
      this.emitChange('redo', {snapshot: this.snapshot()});
      this.emit('history', {canUndo: this.canUndo(), canRedo: this.canRedo(), reason: 'redo'});
      return true;
    }

    onKeyDown(event) {
      if (!(event.ctrlKey || event.metaKey) || !this.root.contains(document.activeElement)) return;
      const key = event.key.toLowerCase();
      if (key !== 'z') return;
      event.preventDefault();
      event.shiftKey ? this.redo() : this.undo();
    }

    markDropTarget(target, clientX, clientY) {
      this.clearDropState();
      const item = target.matches(this.options.itemSelector) ? target : null;
      if (!item) {
        target.classList.add('is-drop-target');
        return;
      }
      const intent = this.getDropIntent(item, clientX, clientY);
      item.classList.add('is-drop-target', `is-drop-${intent.mode}-${intent.position}`);
    }

    clearDropState() {
      this.root.querySelectorAll('.is-drop-target, [class*="is-drop-"]').forEach((element) => {
        [...element.classList].forEach((name) => {
          if (name === 'is-drop-target' || name.startsWith('is-drop-')) element.classList.remove(name);
        });
      });
    }

    emitChange(reason, detail = {}) {
      this.emit('change', {reason, snapshot: this.snapshot(), ...detail});
    }

    emit(name, detail = {}) {
      this.root.dispatchEvent(new CustomEvent(`xdecaro:builder:${name}`, {
        bubbles: true,
        detail: {engine: this, ...detail}
      }));
    }

    static mount(root, options = {}) {
      if (root.__xdecaroBuilderEngine) return root.__xdecaroBuilderEngine;
      const engine = new XdecaroBuilderEngine(root, options);
      root.__xdecaroBuilderEngine = engine;
      return engine;
    }

    static mountAll(selector = DEFAULTS.rootSelector, options = {}) {
      return [...document.querySelectorAll(selector)].map((root) => XdecaroBuilderEngine.mount(root, options));
    }
  }

  window.XdecaroBuilderEngine = XdecaroBuilderEngine;
})();
