# Editor

**Editor by xdecaro** is a modern visual content editor for Joomla 6.

The project is designed around a simple workflow:

**Write → Add content → Edit → Preview → Publish**

The editor must remain fast, visual, accessible and easy to use without requiring HTML or CSS knowledge.

## Current development version

**0.1.0-alpha6**

Version `1.0.0` is reserved for the first stable release after installation, Joomla editor integration, media handling, accessibility and responsive regression checks are complete.

## Package

- Joomla component: `com_decaroeditor`
- Joomla package: `pkg_decaroeditor`
- Joomla editor plugin: `plg_editors_decaroeditor`
- Repository: `xdecaro/editor`

## Current alpha implementation

The repository contains the installable project architecture:

- Joomla 6 administrator component scaffold;
- reusable shared editor CSS/JavaScript assets;
- Joomla `editors` plugin that keeps the original textarea as the canonical form value;
- public, idempotent `Joomla.XdecaroEditor.scan(root)` bridge for editor fields inserted dynamically;
- standard `Joomla.editors.instances` integration for get/set/insert/save operations;
- visual three-area editing interface;
- initial block insertion;
- slash-menu insertion;
- contextual block properties;
- undo/redo history in the active editing session;
- intelligent paste cleaning;
- YouTube, Vimeo and direct MP4 URL recognition;
- initial responsive behavior for desktop, tablet and smartphone;
- Joomla light/dark adaptive styling;
- optional Core by xdecaro 1.3+ design-token foundation with local fallback;
- package manifest and GitHub update-server definitions;
- deterministic build script, SHA-256 checksums and GitHub Actions package build/release workflows.

The alpha is a development baseline, not the final production release. Media Manager integration, real non-destructive crop derivatives, persistent revision history and final security/accessibility regression testing remain release milestones.

## Core interface

The reference interface uses three contextual areas:

1. **Blocks** on the left.
2. **Live content editor** in the center.
3. **Properties** for the selected block on the right.

The block list and properties panel must be collapsible. On small screens the properties area becomes a mobile panel instead of forcing a three-column layout.

## Initial blocks

- Text
- Heading
- Image
- Video
- Gallery
- Button
- Quote
- Divider
- File
- Embed
- Column layout

Blocks can be inserted with the `+` control, drag and drop, or the `/` command menu.

## Images

Image handling is a primary feature of the editor and must include upload, Joomla Media Manager integration, replacement, crop, zoom, rotation, responsive sizing, caption, alternative text, alignment, links and lightbox support.

Cropping must be non-destructive: the original file is preserved and the editor stores/uses a derived version.

Preset ratios include free, 1:1, 4:3, 3:2, 16:9 and 9:16.

## Video

The editor will support at least YouTube, Vimeo, local MP4 and Joomla media. Pasting a supported URL should automatically create the correct video block.

## Intelligent paste

Content pasted from Word, Google Docs, websites or email should preserve useful structure while removing unnecessary inline formatting, external classes and unsafe markup.

## Editing experience

- autosave status;
- undo and redo;
- version-history architecture;
- responsive preview for desktop, tablet and smartphone;
- contextual formatting toolbar;
- slash commands;
- keyboard navigation;
- light and dark mode.

## AI

AI features are optional enhancements and must never be required to use the editor. Planned actions include improve, shorten, expand, correct, translate, change tone, generate image alt text and suggest captions.

## Joomla integration

Editor is reusable through Joomla's normal editor-plugin contract. Other components should not call Editor component internals or duplicate its engine. They render/use the editor plugin through Joomla and interact with the standard `Joomla.editors.instances` API.

For dynamic interfaces, after inserting editor markup into the DOM, consumers may call:

```js
Joomla.XdecaroEditor?.scan(container);
```

The scan is idempotent: already initialized editor roots are ignored. The hidden textarea remains the canonical submitted value and existing pages that never call `scan()` continue to initialize automatically on DOM ready.

This public bridge is product-neutral. Forms, Courses, Events and other consumers remain responsible for their own data model, validation, workflow and persistence.

All interface strings use Joomla language files. The technical default language is `en-GB`, with `it-IT` included from the first release and additional languages added without changing application logic.

## Core by xdecaro integration

Editor consumes the Core `1.3.0+` public reference contract through an optional runtime adapter using the canonical `xdecaro\Core` namespace. Other components can identify the entity being edited without exposing private tables or duplicating integration rules.

When Core `1.3.0+` is available, Editor can also opt into the shared Core design-token foundation through `AssetService::useFoundation()` and `.xdecaro-scope`. Editor CSS maps only common colors, surfaces, borders, radii and shadows to Core. Canvas, blocks, media behavior, history, responsive editing and JavaScript remain specific to Editor.

Editor continues to work without Core, with Core older than `1.3.0`, or when Core assets cannot be registered: local Editor token fallbacks remain active. Only features that explicitly require cross-product references are unavailable and fail with a controlled administrator-facing error.

The deprecated `Xdecaro\Core` compatibility namespace is not consumed by Editor runtime code.

See `docs/core-integration.md` for the integration boundary and service API.

## Engineering rules

- Joomla MVC, namespaces, services and WebAssetManager;
- server-side ACL and CSRF checks;
- filtered input and escaped output;
- bound database queries using the `#__` prefix;
- secure upload validation and safe embed handling;
- no destructive database updates;
- responsive desktop/tablet/mobile UI;
- Joomla administrator light/dark mode support;
- accessible labels, focus states and keyboard interaction;
- no duplicated editor logic across integrations;
- semantic versioning and installable Joomla ZIP packages;
- update-server compatibility without deleting content or configuration.

## Requirements

- Joomla 6.0+
- PHP 8.3+

Developed by **Luca De Caro**.
