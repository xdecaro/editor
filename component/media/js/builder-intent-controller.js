(() => {
  'use strict';

  const DEFAULTS = Object.freeze({
    rowSelector: '[data-xde-builder-row]',
    itemSelector: '[data-xde-builder-item]',
    itemIdAttribute: 'data-xde-builder-id',
    rowAttribute: 'data-xde-builder-row-number',
    handleSelector: null,
    ignoreSelector: 'button,input,select,textarea,a,label,[contenteditable="true"],summary,details',
    maxColumns: 4,
    mouseThreshold: 6,
    touchThreshold: 10,
    touchHoldMs: 180,
    sideZone: 0.28
  });

  const distance = (a, b) => Math.hypot((a.x || 0) - (b.x || 0), (a.y || 0) - (b.y || 0));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  class XdecaroBuilderIntentController {
    constructor(root, options = {}) {
      if (!(root instanceof Element)) {
        throw new TypeError('XdecaroBuilderIntentController requires a root Element.');
      }

      this.root = root;
      this.options = {...DEFAULTS, ...options};
      this.pointer = null;
      this.intent = null;
      this.holdTimer = null;
      this.destroyed = false;

      this.onPointerDown = this.onPointerDown.bind(this);
      this.onPointerMove = this.onPointerMove.bind(this);
      this.onPointerUp = this.onPointerUp.bind(this);
      this.onPointerCancel = this.onPointerCancel.bind(this);

      this.bind();
    }

    bind() {
      this.root.addEventListener('pointerdown', this.onPointerDown);
      document.addEventListener('pointermove', this.onPointerMove, {passive: false});
      document.addEventListener('pointerup', this.onPointerUp);
      document.addEventListener('pointercancel', this.onPointerCancel);
      this.root.setAttribute('data-xde-builder-intents-ready', 'true');
    }

    destroy() {
      if (this.destroyed) return;
      this.root.removeEventListener('pointerdown', this.onPointerDown);
      document.removeEventListener('pointermove', this.onPointerMove);
      document.removeEventListener('pointerup', this.onPointerUp);
      document.removeEventListener('pointercancel', this.onPointerCancel);
      this.root.removeAttribute('data-xde-builder-intents-ready');
      this.cancel();
      this.destroyed = true;
    }

    rows() {
      return [...this.root.querySelectorAll(this.options.rowSelector)];
    }

    items(row = this.root) {
      return [...row.querySelectorAll(this.options.itemSelector)];
    }

    itemId(item) {
      return item?.getAttribute(this.options.itemIdAttribute) || '';
    }

    rowNumber(row) {
      const explicit = Number(row?.getAttribute(this.options.rowAttribute));
      if (Number.isFinite(explicit) && explicit > 0) return explicit;
      const datasetValue = Number(row?.dataset?.row);
      if (Number.isFinite(datasetValue) && datasetValue > 0) return datasetValue;
      const index = this.rows().indexOf(row);
      return index >= 0 ? index + 1 : 1;
    }

    canStartFrom(event, item) {
      if (!item) return false;
      const handleSelector = this.options.handleSelector;
      if (handleSelector) return Boolean(event.target.closest(handleSelector));
      return !event.target.closest(this.options.ignoreSelector);
    }

    onPointerDown(event) {
      if (this.pointer || (event.button != null && event.button !== 0)) return;

      const item = event.target.closest(this.options.itemSelector);
      if (!item || !this.root.contains(item) || !this.canStartFrom(event, item)) return;

      const fieldKey = this.itemId(item);
      if (!fieldKey) return;

      this.pointer = {
        id: event.pointerId,
        type: event.pointerType || 'mouse',
        item,
        fieldKey,
        start: {x: event.clientX, y: event.clientY},
        last: {x: event.clientX, y: event.clientY},
        active: false
      };

      if (this.pointer.type === 'touch' || this.pointer.type === 'pen') {
        this.holdTimer = window.setTimeout(() => this.begin(), this.options.touchHoldMs);
      }
    }

    onPointerMove(event) {
      const pointer = this.pointer;
      if (!pointer || event.pointerId !== pointer.id) return;

      pointer.last = {x: event.clientX, y: event.clientY};
      if (!pointer.active) {
        const threshold = pointer.type === 'mouse' ? this.options.mouseThreshold : this.options.touchThreshold;
        if (distance(pointer.start, pointer.last) >= threshold) this.begin();
      }

      if (!pointer.active) return;
      event.preventDefault();

      const nextIntent = this.classify(event.clientX, event.clientY);
      if (JSON.stringify(nextIntent) !== JSON.stringify(this.intent)) {
        this.intent = nextIntent;
        this.emit('preview', {intent: nextIntent, fieldKey: pointer.fieldKey});
      }
    }

    onPointerUp(event) {
      const pointer = this.pointer;
      if (!pointer || event.pointerId !== pointer.id) return;

      window.clearTimeout(this.holdTimer);
      this.holdTimer = null;

      if (pointer.active && this.intent) {
        this.emitIntent(this.intent);
      } else if (!pointer.active) {
        this.emitIntent({type: 'select', fieldKey: pointer.fieldKey});
      }

      this.finish();
    }

    onPointerCancel(event) {
      if (!this.pointer || event.pointerId !== this.pointer.id) return;
      this.cancel();
    }

    begin() {
      const pointer = this.pointer;
      if (!pointer || pointer.active) return;
      window.clearTimeout(this.holdTimer);
      this.holdTimer = null;
      pointer.active = true;
      pointer.item.classList.add('is-xde-intent-source');
      this.root.classList.add('is-xde-intent-dragging');
      this.emit('dragstart', {fieldKey: pointer.fieldKey, pointerType: pointer.type});
    }

    classify(clientX, clientY) {
      const pointer = this.pointer;
      if (!pointer?.active) return null;

      const stack = document.elementsFromPoint ? document.elementsFromPoint(clientX, clientY) : [];
      const targetItem = stack
        .map((element) => element.closest?.(this.options.itemSelector))
        .find((item) => item && this.root.contains(item) && item !== pointer.item);

      if (targetItem) return this.classifyItem(targetItem, clientX, clientY);

      const targetRow = stack
        .map((element) => element.closest?.(this.options.rowSelector))
        .find((row) => row && this.root.contains(row));

      if (!targetRow) return null;
      const rect = targetRow.getBoundingClientRect();
      return {
        type: 'move-new-row',
        fieldKey: pointer.fieldKey,
        row: this.rowNumber(targetRow),
        position: clientY < rect.top + rect.height / 2 ? 'before' : 'after'
      };
    }

    classifyItem(targetItem, clientX, clientY) {
      const pointer = this.pointer;
      const targetRow = targetItem.closest(this.options.rowSelector);
      const sourceRow = pointer.item.closest(this.options.rowSelector);
      const rect = targetItem.getBoundingClientRect();
      const relativeX = clamp((clientX - rect.left) / Math.max(1, rect.width), 0, 1);
      const relativeY = clamp((clientY - rect.top) / Math.max(1, rect.height), 0, 1);
      const targetItems = this.items(targetRow).filter((item) => item !== pointer.item);
      const sameRow = sourceRow === targetRow;
      const resultingCount = targetItems.length + 1;
      const canShareRow = resultingCount <= this.options.maxColumns;

      if (canShareRow && relativeX <= this.options.sideZone) {
        return {
          type: 'move-beside',
          fieldKey: pointer.fieldKey,
          targetKey: this.itemId(targetItem),
          position: 'before',
          sameRow
        };
      }

      if (canShareRow && relativeX >= 1 - this.options.sideZone) {
        return {
          type: 'move-beside',
          fieldKey: pointer.fieldKey,
          targetKey: this.itemId(targetItem),
          position: 'after',
          sameRow
        };
      }

      return {
        type: 'move-new-row',
        fieldKey: pointer.fieldKey,
        row: this.rowNumber(targetRow),
        position: relativeY < 0.5 ? 'before' : 'after'
      };
    }

    emitIntent(intent) {
      if (!intent) return;
      this.root.dispatchEvent(new CustomEvent('xdecaro:builder:intent', {
        bubbles: true,
        detail: {controller: this, intent}
      }));
    }

    finish() {
      const pointer = this.pointer;
      pointer?.item?.classList.remove('is-xde-intent-source');
      this.root.classList.remove('is-xde-intent-dragging');
      this.emit('dragend', {fieldKey: pointer?.fieldKey || '', intent: this.intent});
      this.pointer = null;
      this.intent = null;
      window.clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }

    cancel() {
      if (this.pointer?.active) this.emit('cancel', {fieldKey: this.pointer.fieldKey});
      this.finish();
    }

    emit(name, detail = {}) {
      this.root.dispatchEvent(new CustomEvent(`xdecaro:builder:${name}`, {
        bubbles: true,
        detail: {controller: this, ...detail}
      }));
    }

    static mount(root, options = {}) {
      if (root.__xdecaroBuilderIntentController) return root.__xdecaroBuilderIntentController;
      root.__xdecaroBuilderIntentController = new XdecaroBuilderIntentController(root, options);
      return root.__xdecaroBuilderIntentController;
    }
  }

  window.XdecaroBuilderIntentController = XdecaroBuilderIntentController;
})();
