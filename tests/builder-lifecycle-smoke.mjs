import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  add(...names) {
    names.forEach((name) => this.values.add(name));
  }

  remove(...names) {
    names.forEach((name) => this.values.delete(name));
  }

  toggle(name, force) {
    if (force === true) {
      this.values.add(name);
      return true;
    }
    if (force === false) {
      this.values.delete(name);
      return false;
    }
    if (this.values.has(name)) {
      this.values.delete(name);
      return false;
    }
    this.values.add(name);
    return true;
  }

  [Symbol.iterator]() {
    return this.values[Symbol.iterator]();
  }
}

class FakeElement {
  constructor() {
    this.attributes = new Map();
    this.listeners = new Map();
    this.events = [];
    this.dataset = {};
    this.classList = new FakeClassList();
    this.style = {setProperty() {}};
  }

  addEventListener(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(handler);
  }

  removeEventListener(type, handler) {
    this.listeners.get(type)?.delete(handler);
  }

  dispatchEvent(event) {
    this.events.push(event.type);
    return true;
  }

  querySelectorAll() {
    return [];
  }

  setAttribute(name, value = '') {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  contains(node) {
    return node === this;
  }

  matches() {
    return false;
  }
}

class FakeCustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail;
    this.bubbles = Boolean(options.bubbles);
  }
}

const documentListeners = new Map();
const addDocumentListener = (type, handler) => {
  if (!documentListeners.has(type)) documentListeners.set(type, new Set());
  documentListeners.get(type).add(handler);
};
const removeDocumentListener = (type, handler) => documentListeners.get(type)?.delete(handler);
const documentListenerCount = (type) => documentListeners.get(type)?.size || 0;

globalThis.Element = FakeElement;
globalThis.CustomEvent = FakeCustomEvent;
globalThis.window = globalThis;
globalThis.document = {
  activeElement: null,
  addEventListener: addDocumentListener,
  removeEventListener: removeDocumentListener,
  querySelectorAll: () => [],
  elementsFromPoint: () => []
};

const loadScript = (path) => vm.runInThisContext(fs.readFileSync(path, 'utf8'), {filename: path});

loadScript('component/media/js/builder-engine.js');
loadScript('component/media/js/builder-intent-controller.js');

const builderRoot = new FakeElement();
const builder1 = XdecaroBuilderEngine.mount(builderRoot);
assert.equal(documentListenerCount('keydown'), 1, 'builder mount must bind one keyboard-history listener');
builder1.destroy();
assert.equal(builderRoot.__xdecaroBuilderEngine, undefined, 'builder destroy must clear the root mount reference');
assert.equal(documentListenerCount('keydown'), 0, 'builder destroy must remove the keyboard-history listener');

const builder2 = XdecaroBuilderEngine.mount(builderRoot);
assert.notEqual(builder2, builder1, 'builder must create a fresh instance after destroy');
assert.equal(documentListenerCount('keydown'), 1, 'builder remount must bind exactly one keyboard-history listener');
builder2.destroy();
assert.equal(documentListenerCount('keydown'), 0, 'builder second destroy must leave no keyboard-history listener');

const intentRoot = new FakeElement();
const intent1 = XdecaroBuilderIntentController.mount(intentRoot);
assert.equal(documentListenerCount('pointermove'), 1, 'intent mount must bind one pointermove listener');
intent1.destroy();
assert.equal(intentRoot.__xdecaroBuilderIntentController, undefined, 'intent destroy must clear the root mount reference');
assert.equal(documentListenerCount('pointermove'), 0, 'intent destroy must remove pointermove listener');
assert.ok(
  !intentRoot.events.includes('xdecaro:builder:dragend'),
  'destroying an idle intent controller must not emit a fake dragend event'
);

const intent2 = XdecaroBuilderIntentController.mount(intentRoot);
assert.notEqual(intent2, intent1, 'intent controller must create a fresh instance after destroy');
assert.equal(documentListenerCount('pointermove'), 1, 'intent remount must bind exactly one pointermove listener');
intent2.destroy();
assert.equal(documentListenerCount('pointermove'), 0, 'intent second destroy must leave no pointermove listener');

console.log('Shared Builder lifecycle smoke test passed.');
