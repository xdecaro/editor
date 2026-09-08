# Shared Builder Engine

`com_decaroeditor.builder-engine` is the reusable visual-layout engine exposed by Editor by xdecaro.

It is intentionally domain-neutral. Consuming components own their records, validation, persistence and business rules; Editor owns reusable visual-layout interaction primitives.

## Responsibility boundary

Editor Builder Engine may own:

- visual item selection;
- row and column placement;
- intelligent drag/drop primitives;
- automatic row-width distribution;
- custom width rebalance such as 40/60 or 25/75;
- layout-only undo/redo snapshots;
- reusable lifecycle and events;
- duplicate/delete *requests* that the host can resolve using its domain model.

Editor Builder Engine must not own:

- Forms field types or validation;
- required/optional field semantics;
- Forms conditional logic;
- submission storage;
- email, payment or multipage workflow rules;
- Courses, Events, Documents, Competitions or Membership domain models;
- host-specific database persistence.

## Joomla asset

Load the engine with Joomla Web Asset Manager:

```php
$wa->useScript('com_decaroeditor.builder-engine');
```

The asset is independent from `com_decaroeditor.editor`; consuming a layout engine must not force the rich-content editor UI to load.

## DOM contract

Default markup:

```html
<div data-xde-builder>
  <div data-xde-builder-row>
    <div data-xde-builder-item data-xde-builder-id="field-name">...</div>
    <div data-xde-builder-item data-xde-builder-id="field-email">...</div>
  </div>
</div>
```

The engine also accepts custom selectors and attributes so existing builders can migrate without rewriting their markup first.

Each item must have a stable host-owned identifier. If it is missing, the engine generates a temporary identifier, but integrations that persist layouts must provide stable IDs themselves.

Width is exposed through:

- `data-xde-builder-width`;
- CSS custom property `--xde-builder-width`.

The host decides how that width is rendered and persisted.

## JavaScript API

```js
const engine = XdecaroBuilderEngine.mount(root, {
  maxColumns: 4,
  autoWidths: true
});

engine.setWidth('field-name', 40); // siblings rebalance to the remaining 60%
engine.undo();
engine.redo();
engine.refresh();
```

Public methods currently include:

- `mount()` / `mountAll()`;
- `select()`;
- `moveItem()`;
- `setWidth()`;
- `normalizeRow()`;
- `snapshot()` / `applySnapshot()`;
- `captureHistory()`;
- `undo()` / `redo()`;
- `refresh()` / `destroy()`;
- `requestDuplicate()` / `requestDelete()`.

## Events

Events bubble from the builder root and use the `xdecaro:builder:*` namespace:

- `select`;
- `dragstart` / `dragend`;
- `change`;
- `history`;
- `rowcreate`;
- `refresh`;
- `duplicate-request`;
- `delete-request`.

The `change` event includes a layout snapshot. Host components must translate that layout into their own canonical state rather than treating Editor DOM as application data.

## Forms migration rule

Forms already has a mature smart-drag implementation. Do not replace it merely because the shared engine now exists.

Migration must preserve at least:

- pointer/mouse/touch interaction;
- above/below = new logical row;
- left/right = same logical row;
- maximum four fields in a row;
- automatic 100, 50/50, 33/33/34 and 25/25/25/25 distribution;
- custom widths without unexpected reset;
- drag preview and reflow animation;
- Section and Row hierarchy;
- active-field state;
- Forms undo/redo and canonical serialization;
- keyboard/accessibility behavior;
- desktop/tablet/smartphone;
- light/dark mode.

Until parity is demonstrated, Forms keeps its current smart-drag runtime and may adopt the shared engine incrementally through an adapter. This avoids turning an architectural cleanup into a Builder regression.

## Core boundary

Xdecaro Core may provide generic infrastructure used by Editor, but it must not own this builder engine and must never depend on Editor.

Expected dependency direction:

`Forms / Courses / Events / Documents / Competitions / Membership -> Editor -> Core (optional/stable infrastructure)`

Core stabilization is therefore not a blocker for developing this engine. Core-specific registration/discovery can be added later through a stable adapter.
