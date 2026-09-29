# Editor 0.1.0-alpha8 Media Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add safe Joomla 6.1.3+ Media Manager selection for Editor Image and File blocks without duplicating Photos gallery/storage responsibilities or regressing the alpha7 editor/provider/Builder contracts.

**Architecture:** Render native Joomla `media` Form API proxy fields for `images` and `documents`, then drive those proxies through a dedicated Editor `media-bridge.js`. Normalize all selected values in a pure `media-selection.js` layer before `editor.js` applies them to the originally requested block. Gallery remains out of scope and owned by `com_xdecarophotos`.

**Tech Stack:** Joomla 6.1.3+, PHP 8.3+, Joomla Form API `media` field, Web Asset Manager, native `joomla-field-media`, `Joomla.Modal`, vanilla JavaScript, Node smoke/runtime tests, GitHub Actions deterministic ZIP build.

**Spec:** `docs/superpowers/specs/2026-09-29-editor-alpha8-media-manager-design.md`

## Global Constraints

- Target is **Joomla 6.1.3+ only**; do not add Joomla 4/5 compatibility shims.
- Target version is **`0.1.0-alpha8`** and the version number must not be reused for different code.
- Joomla Media Manager remains the generic browser/upload owner; Editor adds no parallel upload endpoint or physical delete action.
- `com_xdecarophotos` remains the owner of galleries, originals, variants, crop/transform metadata and Photo Studio; alpha8 must not query Photos private tables or invent a gallery reference contract.
- Photos is optional; Editor must continue working when Photos is absent.
- Preserve `Joomla.XdecaroEditor.scan(root)`, `Joomla.editors.instances`, canonical textarea submission, alpha7 Builder assets/contracts and optional Core behavior.
- Use Joomla language files for every new user-facing string; maintain `en-GB` and `it-IT` together.
- Media selection is untrusted input: reject unsafe schemes, encoded traversal and wrong media kind before applying it to block HTML.

## Review Focus

- Encoded or mixed traversal (`..`, `%2e%2e`, backslash variants) must be rejected rather than normalized into a usable path; Task 1 pins this.
- A valid Joomla image value containing `#joomlaImage://...?...` must preserve the raw Joomla value while deriving a clean public path/URL; Task 1 pins this.
- Closing the native Joomla dialog without selection must resolve as cancellation, restore focus and leave content unchanged; Task 2 pins this.
- A late selection from a superseded/destroyed request must never apply to the newly selected block; Task 2 and Task 4 pin this.
- Multiple Editor instances on one Joomla page must use independent proxy fields/listeners and never cross-apply media; Task 3 and Task 4 pin this.

---

## File Structure

- `component/media/js/media-selection.js` — pure normalization/validation contract for Joomla media values.
- `component/media/js/media-bridge.js` — lifecycle-safe bridge between an Editor root and native Joomla `joomla-field-media` proxies.
- `component/admin/forms/media.xml` — Joomla Form API definition for hidden image/document proxy fields.
- `component/admin/src/Service/MediaPickerService.php` — creates uniquely scoped Form API proxies and registers alpha8 language strings.
- `component/media/js/editor.js` — consumes the media bridge and applies selected media to Image/File blocks only.
- `component/media/css/editor.css` — responsive/light-dark media property UI.
- `component/media/joomla.asset.json` — registers media assets and dependency order.
- `component/admin/src/View/Editor/HtmlView.php` + `component/admin/tmpl/editor/default.php` — make native media proxies available in the administrator workbench.
- `plugin/src/Extension/Decaroeditor.php` — make the same media capability and File block available when Editor is embedded as the Joomla editor provider.
- `component/admin/language/{en-GB,it-IT}/com_decaroeditor.ini` — alpha8 labels/messages.
- `tests/media-selection-smoke.mjs` — pure safety/normalization tests.
- `tests/media-bridge-lifecycle-smoke.mjs` — bridge mount/open/cancel/destroy/remount/supersede tests.
- `tests/media-integration-contract-smoke.mjs` — source/asset/provider integration contract.
- Existing manifest/version/update/README/changelog/workflow files — alpha8 release consistency.

### Task 1: Safe media selection normalization

**Files:**
- Create: `component/media/js/media-selection.js`
- Create: `tests/media-selection-smoke.mjs`
- Modify: `component/media/joomla.asset.json`
- Modify: `.github/workflows/build.yml`

**Interfaces:**
- Consumes: Joomla media-picker extension lists when supplied by the caller; no DOM or Editor state.
- Produces: `window.XdecaroEditorMediaSelection.normalize(rawValue, kind, options = {}) -> MediaSelection | null` where `kind` is `image` or `file` and `MediaSelection` contains `kind`, `rawValue`, `path`, `url`, and `name` (plus `mime` only when reliably supplied).

- [ ] **Step 1: Write failing normalization/security tests**

Add assertions for:
- `images/example/photo.jpg#joomlaImage://local-images/example/photo.jpg?width=800&height=600` -> clean path `images/example/photo.jpg`, URL `/images/example/photo.jpg`, original `rawValue` preserved;
- valid `https://example.test/photo.jpg` accepted for `image` when external URLs are enabled;
- `javascript:`, unsafe `data:`, `../`, `%2e%2e/`, and backslash traversal rejected;
- image request rejects a `.pdf` value when injected image extensions are `jpg,jpeg,png,webp`;
- file request accepts `.pdf` when injected document extensions include `pdf`;
- empty input returns `null`.

- [ ] **Step 2: Run the new test in CI and verify RED**

Run: `node tests/media-selection-smoke.mjs`
Expected: FAIL because `media-selection.js` / public normalizer does not exist.

- [ ] **Step 3: Implement the minimal normalizer**

Implement in `media-selection.js`:
- `normalize(rawValue, kind, options = {})`;
- relative Joomla value parsing before `#joomlaImage://` metadata;
- protocol allowlist (`http:`, `https:` for external media only);
- decoded traversal rejection before URL construction;
- extension validation using injected/Joomla media-picker extension lists rather than a second hardcoded product allowlist;
- no arbitrary HTML parsing/injection.

Register asset `com_decaroeditor.media-selection`.

- [ ] **Step 4: Run RED test plus alpha7 JS checks**

Run: `node tests/media-selection-smoke.mjs && node tests/builder-contract-smoke.mjs && node tests/builder-lifecycle-smoke.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `feat: add safe media selection normalization`

### Task 2: Lifecycle-safe native Joomla Media Bridge

**Files:**
- Create: `component/media/js/media-bridge.js`
- Create: `tests/media-bridge-lifecycle-smoke.mjs`
- Modify: `component/media/joomla.asset.json`
- Modify: `.github/workflows/build.yml`

**Interfaces:**
- Consumes: `XdecaroEditorMediaSelection.normalize(...)`; within each editor root, native proxies marked `data-xde-media-proxy="image"` / `"file"` containing `joomla-field-media`, `.field-media-input`, `.button-select`.
- Produces: `window.XdecaroEditorMediaBridge.mount(root, options = {}) -> bridge`; `bridge.select(kind, invoker = null) -> Promise<MediaSelection|null>`; `bridge.destroy() -> void`.

- [ ] **Step 1: Write failing bridge lifecycle tests**

The runtime harness must assert:
- repeated `mount(root)` returns the same live instance;
- selecting valid proxy input resolves exactly once with normalized media;
- `Joomla.Modal.getCurrent()` dialog close before change resolves `null` and restores focus to the invoker;
- a second `select()` supersedes the first pending request and the first resolves `null`;
- late change from a superseded request is ignored;
- `destroy()` resolves any pending request as `null`, removes listeners, clears root instance reference;
- `mount()` after destroy returns a fresh usable bridge;
- repeated open/cancel/open does not accumulate change/close listeners.

- [ ] **Step 2: Run the lifecycle test and verify RED**

Run: `node tests/media-bridge-lifecycle-smoke.mjs`
Expected: FAIL because the bridge does not exist.

- [ ] **Step 3: Implement the bridge around Joomla's native field**

Implementation rules:
- trigger the native proxy's `.button-select` instead of reimplementing `com_media`;
- listen to the native `joomla-field-media` `change` event for accepted values;
- after opening, use Joomla's documented `Joomla.Modal.getCurrent()` contract to attach a one-shot `joomla-dialog:close` cancellation handler;
- keep one pending request token per bridge; selection/cancel/supersede/destroy must settle it exactly once;
- return focus to the invoker after dialog closure;
- never depend on Photos.

Register `com_decaroeditor.media-bridge` with dependency on `com_decaroeditor.media-selection`.

- [ ] **Step 4: Run media + alpha7 lifecycle suites**

Run: `node tests/media-selection-smoke.mjs && node tests/media-bridge-lifecycle-smoke.mjs && node tests/builder-lifecycle-smoke.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `feat: bridge editor to native Joomla media picker`

### Task 3: Native Form API media proxies in workbench and editor provider

**Files:**
- Create: `component/admin/forms/media.xml`
- Create: `component/admin/src/Service/MediaPickerService.php`
- Create: `tests/media-integration-contract-smoke.mjs`
- Modify: `component/decaroeditor.xml` (ship `forms` folder)
- Modify: `component/admin/src/View/Editor/HtmlView.php`
- Modify: `component/admin/tmpl/editor/default.php`
- Modify: `plugin/src/Extension/Decaroeditor.php`
- Modify: `.github/workflows/build.yml`

**Interfaces:**
- Consumes: Joomla Form API `type="media"`; native Joomla media layout loads `webcomponent.field-media`, `webcomponent.media-select`, `media-picker-api`, and `media-picker` options.
- Produces: `MediaPickerService::renderProxies(string $scopeId, ?string $asset = null, ?int $authorId = null): string`; markup includes unique image/document native fields wrapped by `data-xde-media-proxy`.

- [ ] **Step 1: Write failing integration contract tests**

Assert source/package contract:
- `media.xml` exists and defines exactly one `types="images"` proxy and one `types="documents"` proxy;
- component manifest ships `forms`;
- service uses Joomla Form API rather than constructing a parallel upload endpoint;
- proxy names/IDs are scoped by sanitized Editor instance id;
- administrator workbench renders proxies inside its Editor root;
- plugin `renderEditor()` renders proxies for each editor instance and loads `com_decaroeditor.media-bridge`;
- two different scope ids generate distinct control ids/names;
- if the component media service cannot be autoloaded, the plugin renderer does not fatal and leaves normal Editor/manual URL behavior available;
- no `com_xdecarophotos` hard dependency/private table reference is introduced.

- [ ] **Step 2: Run contract test and verify RED**

Run: `node tests/media-integration-contract-smoke.mjs`
Expected: FAIL because Form API proxies/service are absent.

- [ ] **Step 3: Implement `MediaPickerService` and `media.xml`**

Service responsibilities:
- sanitize the supplied scope id for Form/DOM use;
- create a uniquely named Joomla `Form` instance from `component/admin/forms/media.xml`;
- populate `asset_id` / `created_by` when supplied;
- render the two media fields inside hidden proxy wrappers;
- register new alpha8 language strings via `Text::script(...)` once per request;
- return an empty/controlled fallback only if Joomla media field rendering itself is unavailable; do not introduce custom upload behavior.

The service is stateless; it does not require a cross-extension DI container contract.

- [ ] **Step 4: Wire both render surfaces**

- Administrator `HtmlView`: instantiate `MediaPickerService`, expose proxy markup, and load `com_decaroeditor.media-bridge`.
- Administrator template: output proxy markup inside the `data-xde-editor` scope.
- Editor plugin: guard with `class_exists(\Xdecaro\Component\Decaroeditor\Administrator\Service\MediaPickerService::class)`, instantiate the same stateless service when available, append uniquely scoped proxy markup inside each `data-xde-editor` shell, and load `media-bridge` only when proxies are available.
- If the service/component is unavailable, keep the editor functional with its existing manual URL behavior and no fatal error.

- [ ] **Step 5: Verify PHP/source contracts and package file presence**

Run: `find component plugin tests -type f -name '*.php' -print0 | xargs -0 -n1 php -l && node tests/media-integration-contract-smoke.mjs`
Expected: PASS.

- [ ] **Step 6: Commit**

Commit message: `feat: render native Joomla media proxies`

### Task 4: Image and File block UX integration

**Files:**
- Modify: `component/media/js/editor.js`
- Modify: `component/media/css/editor.css`
- Modify: `component/admin/language/en-GB/com_decaroeditor.ini`
- Modify: `component/admin/language/it-IT/com_decaroeditor.ini`
- Modify: `plugin/src/Extension/Decaroeditor.php`
- Extend: `tests/media-integration-contract-smoke.mjs`

**Interfaces:**
- Consumes: `XdecaroEditorMediaBridge.mount(root)` and normalized `MediaSelection` from Tasks 1-2.
- Produces: Image/File property actions `select`, `replace`, `remove`; no Gallery implementation.

- [ ] **Step 1: Add failing Editor media behavior contract assertions**

Pin these behaviors in the source/runtime smoke harness:
- Editor mounts one media bridge per Editor root when available;
- Image properties expose translated Select/Replace/Remove actions and preserve existing alt/caption/ratio/focal-position controls;
- File properties expose translated Select/Replace/Remove plus label and selected path/name display;
- the Joomla editor plugin exposes the File block and uses the same shared Editor runtime rather than a plugin-specific media implementation;
- existing manual URL field remains as advanced/fallback behavior so alpha7 functionality is not removed;
- media request captures the original target block; changing `this.selected` while dialog is open cannot redirect the result to another block;
- disconnected/deleted target block ignores late result;
- remove clears only the block reference and never calls any delete API;
- media apply/remove records editor history and therefore remains undoable;
- Image manual URL handling no longer accepts `javascript:`/unsafe values;
- no Gallery picker or Photos private-table logic appears in `editor.js`.

- [ ] **Step 2: Run the contract test and verify RED**

Run: `node tests/media-integration-contract-smoke.mjs`
Expected: FAIL on missing Image/File media actions and File block parity in the provider.

- [ ] **Step 3: Implement Editor media actions**

Add focused methods to `XdeEditor`:
- `selectMedia(kind, targetBlock, invoker)` — calls bridge and applies only if `targetBlock.isConnected`;
- `applyImageSelection(targetBlock, selection)` — creates/reuses `<img>`, uses normalized safe URL, preserves current metadata controls;
- `removeImageSelection(targetBlock)` — returns block to image placeholder without deleting the source file;
- `applyFileSelection(targetBlock, selection)` — updates download link href while preserving existing link label;
- `removeFileSelection(targetBlock)` — clears the media href/reference without deleting the source file.

Keep the existing advanced URL fields; route image URL application through the same safe media validation rules.

- [ ] **Step 4: Bring File block and translations to provider parity**

Add `file` to the plugin's translated label map and block list so embedded Joomla Editor instances expose the same File workflow as the administrator workbench. Do not add Gallery integration in alpha8.

Add matching `en-GB` / `it-IT` keys for select/replace/remove image/file, selected media, unavailable/invalid selection. Use `Joomla.Text._(...)` in JS. Add compact action rows/preview/path styles with existing Core/local tokens; no light-only hardcoded surfaces; mobile actions wrap instead of horizontal overflow.

- [ ] **Step 5: Run media and editor-provider regressions**

Run: `node tests/media-selection-smoke.mjs && node tests/media-bridge-lifecycle-smoke.mjs && node tests/media-integration-contract-smoke.mjs && node tests/builder-contract-smoke.mjs && node tests/builder-lifecycle-smoke.mjs`
Expected: PASS.

- [ ] **Step 6: Commit**

Commit message: `feat: add native media actions to editor blocks`

### Task 5: Alpha8 version/package/CI consistency and release-candidate artifact

**Files:**
- Modify: `VERSION`
- Modify: `component/decaroeditor.xml`
- Modify: `plugin/decaroeditor.xml`
- Modify: `package/pkg_decaroeditor.xml`
- Modify: `component/media/joomla.asset.json`
- Modify: `updates/com_decaroeditor.xml`
- Modify: `updates/pkg_decaroeditor.xml`
- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Modify: `.github/workflows/build.yml`

**Interfaces:**
- Consumes: completed Tasks 1-4.
- Produces: deterministic installable `0.1.0-alpha8` component/plugin/package artifacts ready for manual Joomla 6.1.3 testing; no merge/release until manual acceptance.

- [ ] **Step 1: Add/extend CI consistency assertions before bumping version**

CI must assert:
- all new local Web Asset targets exist;
- `media-bridge` depends on `media-selection` and Editor loads bridge in both component/plugin paths;
- component package includes `admin/forms/media.xml`;
- update feeds remain Joomla `6.*`, PHP `8.3+`;
- no runtime references to Joomla 4/5 compatibility code are added;
- no private `#__xdecarophotos_` references exist in Editor.

Run CI and verify the new assertions fail where alpha8 metadata/files are not yet aligned.

- [ ] **Step 2: Bump every version reference to `0.1.0-alpha8`**

Update `VERSION`, component/plugin/package manifests, package inner ZIP names, Web Asset version, update-feed URLs/version, README current version, and changelog. README requirement becomes `Joomla 6.1.3+`.

Do not add release SHA256 values until the final deterministic artifacts actually exist.

- [ ] **Step 3: Run the complete fresh verification suite**

Run the GitHub Actions equivalent of:

`find component plugin tests -type f -name '*.php' -print0 | xargs -0 -n1 php -l`

`php tests/core-integration-smoke.php`

`find component/media/js plugin/media/js -type f -name '*.js' -print0 2>/dev/null | xargs -0 -r -n1 node --check`

`node tests/builder-contract-smoke.mjs`

`node tests/builder-lifecycle-smoke.mjs`

`node tests/media-selection-smoke.mjs`

`node tests/media-bridge-lifecycle-smoke.mjs`

`node tests/media-integration-contract-smoke.mjs`

`tools/build.sh "$(cat VERSION)"`

`for file in dist/*.zip; do unzip -t "$file" >/dev/null; done`

run the build a second time and diff `SHA256SUMS.txt`.

Expected: all commands exit 0 and deterministic checksums match.

- [ ] **Step 4: Review final diff against the spec**

Explicitly verify:
- Image and File only;
- Gallery remains owned by Photos and unimplemented in alpha8;
- no crop derivative/storage subsystem was introduced;
- no physical delete action;
- Photos absence is harmless;
- editor plugin/provider path has the same media capability as administrator workbench;
- alpha7 Builder/provider/textarea behavior remains present.

- [ ] **Step 5: Open/update a Draft PR and attach CI evidence**

Base the alpha8 PR on the alpha7 consolidation branch until alpha7 lands; retarget to `main` only after alpha7 is merged. Keep PR Draft until manual Joomla 6.1.3 checks pass.

- [ ] **Step 6: Produce manual-test package**

Use the CI deterministic `pkg_decaroeditor_0.1.0-alpha8.zip` artifact for the user's real Joomla 6.1.3 test. Manual checklist: image select/cancel/replace/remove; alt/caption/ratio/focal position; file select/replace/remove; repeated open/close; undo/redo; multiple editor instances; dynamic `scan(root)`; keyboard/focus; desktop/tablet/mobile; light/dark; clean JS Console/PHP logs.

- [ ] **Step 7: Commit**

Commit message: `chore: prepare Editor 0.1.0-alpha8`
