import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const enginePath = path.join(root, 'component/media/js/builder-engine.js');
const intentsPath = path.join(root, 'component/media/js/builder-intent-controller.js');
const assetsPath = path.join(root, 'component/media/joomla.asset.json');

assert.ok(fs.existsSync(enginePath), 'builder-engine.js must be shipped');
assert.ok(fs.existsSync(intentsPath), 'builder-intent-controller.js must be shipped');

const engine = fs.readFileSync(enginePath, 'utf8');
const intents = fs.readFileSync(intentsPath, 'utf8');
const assets = JSON.parse(fs.readFileSync(assetsPath, 'utf8'));
const assetNames = new Set(assets.assets.map((asset) => asset.name));

assert.ok(assetNames.has('com_decaroeditor.builder-engine'), 'builder-engine Joomla asset must be registered');
assert.ok(assetNames.has('com_decaroeditor.builder-intents'), 'builder-intents Joomla asset must be registered');

for (const token of [
  'mount(',
  'mountAll(',
  'moveItem(',
  'setWidth(',
  'normalizeRow(',
  'snapshot(',
  'applySnapshot(',
  'captureHistory(',
  'undo(',
  'redo(',
  'refresh(',
  'destroy(',
  'requestDuplicate(',
  'requestDelete('
]) {
  assert.ok(engine.includes(token), `builder engine public contract missing ${token}`);
}

assert.match(engine, /maxColumns:\s*4\b/, 'builder engine default maxColumns must be 4');
assert.ok(engine.includes('data-xde-builder-width'), 'builder engine must expose the width data attribute');
assert.ok(engine.includes('--xde-builder-width'), 'builder engine must expose the width CSS variable');
assert.ok(engine.includes("xdecaro:builder:"), 'builder events must use the xdecaro:builder namespace');

assert.match(intents, /pointerdown|PointerEvent/, 'intent controller must use Pointer Events');
assert.ok(intents.includes('destroy('), 'intent controller must expose destroy cleanup');

for (const forbidden of [
  'com_decaroforms',
  'decaroforms',
  'data-xde-form',
  'formsBuilder',
  'formFields'
]) {
  assert.ok(!engine.includes(forbidden), `builder engine must remain product-neutral: ${forbidden}`);
  assert.ok(!intents.includes(forbidden), `builder intent controller must remain product-neutral: ${forbidden}`);
}

console.log('Shared Builder contract smoke test passed.');
