# Editor 0.1.0-alpha8 — Media Manager integration design

Date: 2026-09-29
Status: proposed specification after approved architectural direction
Target: Joomla 6.1.3+
Repository: `xdecaro/editor`
Base: `feature/editor-alpha7-builder-consolidation` / Editor `0.1.0-alpha7`

## 1. Goal

Editor alpha8 introduces a safe reusable media-selection layer for Editor content blocks without duplicating Joomla Media Manager or the Photos component.

The release focuses on:

- selecting a single image through Joomla Media Manager;
- replacing and removing the selected image from an Editor image block;
- preserving and editing image alt text, caption, aspect ratio and focal position;
- selecting a downloadable file through Joomla Media Manager for the File block;
- keeping Editor usable when Photos is not installed;
- defining, but not implementing, the future optional Gallery integration contract with `com_xdecarophotos`.

Alpha8 does not implement physical image cropping, image derivatives, gallery ownership, photo storage, or Photo Studio features.

## 2. Product boundaries

### 2.1 Joomla Media Manager

Joomla remains responsible for the generic media browser and native upload flow used by Editor.

Editor must not create a parallel generic file manager or upload subsystem in alpha8.

Where Joomla already provides media selection and authorization behavior, Editor should integrate with it instead of duplicating it.

### 2.2 Editor

Editor owns the content-editing experience and the mapping between a selected Joomla media item and an Editor block.

Editor may own:

- opening the media selector from an Editor block;
- constraining the expected media kind for the current block;
- normalizing the selected item into an Editor-safe value;
- applying a selected image/file to the current block;
- image block metadata such as alt text and caption;
- visual presentation such as aspect ratio and focal position;
- replacement/removal actions;
- editor-specific accessibility, lifecycle and events.

Editor must not own in alpha8:

- a second generic upload browser;
- filesystem path generation;
- image-library ownership;
- physical crop files;
- thumbnail/variant generation;
- gallery records;
- photo ownership/context rules used by the Photos product.

### 2.3 Photos

`com_xdecarophotos` is the image-management product for the xdecaro ecosystem and owns:

- photo originals;
- generated variants;
- crop/transform metadata;
- Photo Studio;
- photo ownership/context;
- galleries and gallery management.

Editor must not duplicate those responsibilities.

The Editor `Gallery` block becomes an optional future consumer of a stable Photos public API. Editor must not query `#__xdecarophotos_*` tables directly or derive Photos storage paths.

## 3. Dependency direction

The intended direction is:

`Editor -> Joomla Media Manager`

and, only for Gallery/photo-library features that explicitly require it:

`Editor -> Photos` (optional)

Core does not depend on Editor or Photos.

Photos does not need Editor in order to function.

Editor must continue to install and work without Photos.

## 4. Alpha8 architecture

Alpha8 adds a small Editor-specific media layer rather than expanding `editor.js` into a monolith.

### 4.1 `media-bridge.js`

Responsibilities:

- expose a product-neutral Editor API for opening Joomla Media Manager;
- accept a media-selection request describing expected kind and optional constraints;
- receive the Joomla selection result;
- return a normalized selection object to the caller;
- clean up temporary listeners/state after completion or cancellation;
- prevent duplicate listeners when opened repeatedly;
- support destroy/remount lifecycle in dynamic Joomla views.

Conceptual API:

```js
const bridge = XdecaroEditorMedia.mount(root, options);

const selection = await bridge.select({
  kind: 'image'
});

bridge.destroy();
```

The exact Joomla interaction mechanism must follow Joomla 6.1.3 APIs available in the installed environment; Editor must not depend on deprecated private internals when a supported public integration path exists.

### 4.2 `media-selection.js`

A small normalization/validation module shared by Image and File blocks.

Conceptual normalized object:

```js
{
  kind: 'image',
  path: 'images/example/photo.jpg',
  url: '/images/example/photo.jpg',
  mime: 'image/jpeg',
  name: 'photo.jpg'
}
```

Only fields that Joomla reliably supplies should become required. The implementation must not invent metadata that is unavailable.

Responsibilities:

- normalize relative Joomla media paths and URLs;
- reject unsafe protocols;
- reject traversal attempts;
- validate the selected kind against the requesting block;
- return a stable object to `editor.js`;
- avoid embedding arbitrary HTML from the media result.

### 4.3 `editor.js`

`editor.js` remains responsible for Editor-domain behavior:

- rendering Image/File block properties;
- requesting media through the bridge;
- applying the accepted result to the selected block;
- updating alt/caption/ratio/focal position;
- recording Editor history/change state;
- keeping the canonical textarea synchronization unchanged through the existing field bridge.

It must not contain Joomla Media Manager implementation details beyond consuming the public bridge.

## 5. Image block UX

When an Image block is selected, the properties panel should offer:

- `Select image` when empty;
- image preview when selected;
- `Replace`;
- `Remove`;
- alt text;
- caption;
- aspect ratio;
- focal position.

The raw URL field may remain available only if it is useful as an advanced/fallback input, but the primary workflow must be media selection, not manual URL entry.

Selecting an image should update the block immediately and remain undoable through the existing Editor history behavior.

Cancelling the Media Manager must leave the block unchanged.

Removing an image removes the block's media reference only. It must never delete the physical Joomla file.

## 6. File block UX

The File block should use the same media bridge.

Properties should support:

- `Select file`;
- selected filename/path display;
- link label;
- `Replace`;
- `Remove`.

Removing a File block reference must not delete the physical Joomla file.

Alpha8 should accept normal Joomla-managed downloadable files according to the capabilities and restrictions of the native media subsystem. Editor should not invent a separate MIME allowlist that conflicts with Joomla configuration; it may still reject a selection clearly incompatible with the requested block kind.

## 7. Gallery block and Photos integration

Alpha8 does not implement gallery management.

The existing Editor Gallery block must not grow its own media collection model.

Future intended flow:

1. Editor detects whether a compatible Photos public integration is available.
2. If available, the Gallery block offers `Select gallery`.
3. Photos owns the gallery and its images.
4. Editor stores only a stable public reference needed to render/resolve that gallery.
5. Rendering resolves the gallery through a Photos public API/service/layout contract.
6. If Photos is unavailable, Editor remains functional and the Gallery action fails gracefully or is hidden/disabled with a clear administrator-facing message.

The exact Photos gallery reference format is intentionally not fixed in alpha8 because the Photos public API is still being developed. Editor must not freeze a private or guessed Photos contract prematurely.

## 8. Security

Media selection handles user-controlled paths/URLs and must be treated as untrusted input even when it originates from a Joomla UI.

Alpha8 requirements:

- server-side permissions remain enforced by Joomla for native Media Manager operations;
- no new unauthenticated upload endpoint;
- no client-supplied filesystem path is used for server-side file access by Editor;
- reject `javascript:`, `data:` where unsafe, and other unexpected schemes;
- normalize/validate relative media paths;
- reject `..` traversal segments after decoding/normalization;
- no arbitrary selected HTML is injected into Editor;
- image/file URLs are escaped when serialized into block HTML;
- no physical delete action is exposed from Editor alpha8;
- existing canonical textarea behavior is preserved;
- existing paste/embed protections must not be weakened.

If Joomla exposes a token/session requirement for a media action, Editor must use Joomla's native mechanism rather than creating a parallel token scheme.

## 9. Lifecycle

The alpha7 lifecycle rules remain mandatory.

The Media Bridge must be safe for dynamic Joomla interfaces:

- repeated `mount()` does not duplicate listeners;
- repeated open/cancel/open cycles do not accumulate handlers;
- only one active request per bridge instance unless explicitly designed otherwise;
- cancellation resolves/returns cleanly without modifying content;
- `destroy()` removes listeners and pending state;
- a destroyed root can be mounted again;
- no stale promise/callback may apply a selection to a newly selected block after the original request has been cancelled or superseded.

## 10. Accessibility and responsive behavior

The primary image/file actions must be keyboard reachable and have Joomla language labels.

Requirements:

- visible focus state;
- no icon-only action without accessible name;
- replace/remove buttons usable by keyboard;
- Media Manager launch must not trap focus permanently after close;
- properties remain usable on desktop, tablet and smartphone;
- mobile properties panel must not overflow horizontally;
- light and dark mode contrast must remain consistent.

## 11. Language

No new user-facing alpha8 string should be hardcoded in JavaScript/PHP when it can be translated.

Add Joomla language keys for at least:

- Select image;
- Replace image;
- Remove image;
- Select file;
- Replace file;
- Remove file;
- Media selection unavailable;
- Invalid media selection;
- Photos unavailable / Gallery integration unavailable when that state is surfaced.

The technical default remains `en-GB`, with `it-IT` maintained alongside it.

## 12. Joomla target

Editor alpha8 targets **Joomla 6.1.3+ only**.

No effort should be spent preserving Joomla 4 or Joomla 5 compatibility.

The implementation may use supported Joomla 6 APIs without compatibility shims for older Joomla major versions.

Manifest/update metadata should reflect the actual minimum supported Joomla 6 baseline where the package format permits that precision.

## 13. Versioning

Target version: `0.1.0-alpha8`.

When implementation is complete, update coherently:

- `VERSION`;
- component manifest;
- editor plugin manifest;
- package manifest;
- Web Asset version;
- update-server metadata;
- README current development version;
- changelog;
- deterministic build artifacts.

Do not publish different alpha8 code under the same version number.

## 14. Testing strategy

Implementation follows RED -> GREEN.

Automated checks should cover at least:

### Media selection contract

- media bridge and selection modules are shipped as declared Joomla assets;
- Image block can consume a valid normalized image selection;
- File block can consume a valid normalized file selection;
- unsafe protocols are rejected;
- path traversal is rejected;
- wrong media kind is rejected;
- cancellation returns without content change.

### Lifecycle

- mount -> open -> cancel -> open does not duplicate listeners;
- mount -> destroy -> remount creates a new usable instance;
- stale/superseded selections are ignored;
- destroy during an active selection does not leak listeners or apply late results.

### Existing regression coverage

- alpha7 Builder contract/lifecycle tests remain green;
- `Joomla.XdecaroEditor.scan(root)` remains idempotent;
- `Joomla.editors.instances` remains available;
- canonical textarea synchronization remains unchanged;
- PHP syntax and optional Core smoke test remain green;
- Web Asset declarations resolve to shipped files;
- deterministic package build remains reproducible.

### Manual Joomla 6.1.3 validation

- open image selector;
- select image;
- cancel image selector;
- replace image;
- remove image reference;
- edit alt/caption/ratio/focal position;
- select/replace/remove File reference;
- repeated open/close;
- undo/redo around media changes;
- dynamic editor scan/remount;
- keyboard/focus;
- desktop/tablet/smartphone;
- light/dark mode;
- JavaScript Console clean;
- no PHP warnings/errors.

## 15. Out of scope for alpha8

Explicitly deferred:

- non-destructive physical crop derivatives;
- Photo Studio;
- image ownership/context database;
- image variant database;
- Photos gallery picker implementation;
- gallery ordering/editing inside Editor;
- physical media deletion from Editor;
- bulk media management;
- AI image generation/editing;
- persistent revision history.

These must not be quietly introduced as side work during alpha8.

## 16. Acceptance criteria

Alpha8 is ready for manual testing when:

1. Editor is still installable on Joomla 6.1.3+ as component + editor plugin package.
2. Image selection uses Joomla Media Manager through a dedicated Editor bridge.
3. File selection uses the same bridge.
4. Selected media is normalized and validated before application.
5. Repeated open/cancel/destroy/remount cycles are lifecycle-safe.
6. Existing alpha7 Builder and editor-provider behavior has not regressed.
7. Gallery logic has not been duplicated; Photos remains its owner.
8. Editor works when Photos is absent.
9. CI and deterministic packaging are green.
10. Manual responsive/light-dark/focus checks remain pending until tested on the real Joomla installation.
