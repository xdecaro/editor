# Editor 0.1.0-alpha7 Builder Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate the draft shared Visual Builder Engine onto the current alpha6 baseline and release a regression-safe `0.1.0-alpha7` candidate.

**Architecture:** Keep the Builder as Editor-owned, domain-neutral Joomla assets independent from the rich-content editor UI. Reuse the proven PR #4 engine and host-managed Pointer Events intent controller, preserve alpha6's editor provider/field bridge unchanged, and add contract-oriented CI guards before versioning.

**Tech Stack:** Joomla 6.1.3 validation target, PHP 8.3+, vanilla JavaScript, Joomla Web Asset Manager, GitHub Actions, shell/Python/Node validation.

**Spec:** `docs/superpowers/specs/2026-09-29-editor-alpha7-builder-consolidation-design.md`

## Global Constraints

- Current baseline is `0.1.0-alpha6`; target is `0.1.0-alpha7`.
- Core remains optional and runtime code must use only the canonical `xdecaro\Core` namespace.
- `Joomla.XdecaroEditor.scan(root)`, `Joomla.editors.instances`, one-submit-listener-per-form behavior and canonical textarea synchronization must not regress.
- Builder runtime must remain product-neutral and must not contain Forms-specific domain logic.
- Default maximum columns is 4.
- Media Manager, crop derivatives, persistent revision history and AI are out of scope.
- Do not merge to `main` until CI is green and the branch is reviewed.

## Review Focus

- Repeated editor scans and Builder mount/refresh/destroy cycles must not accumulate listeners or instances.
- Host-owned custom widths such as 40/60 must survive Builder refresh/history operations.
- Pointer/touch intent calculation must remain host-managed and must not mutate a consumer's domain model directly.
- Builder assets must load independently from the rich-content editor asset.
- No Forms-specific selectors, field semantics, validation or persistence concepts may leak into shared Builder runtime.

---

### Task 1: Add Builder contract smoke test

**Files:**
- Create: `tests/builder-contract-smoke.mjs`
- Modify: `.github/workflows/build.yml`

**Interfaces:**
- Consumes: planned public files `component/media/js/builder-engine.js`, `component/media/js/builder-intent-controller.js` and `component/media/joomla.asset.json`.
- Produces: a zero-dependency Node contract test used by CI.

- [ ] **Step 1: Write the failing contract test**
  - Assert both Builder files exist.
  - Assert asset names `com_decaroeditor.builder-engine` and `com_decaroeditor.builder-intents` are registered.
  - Assert engine public methods include mount/mountAll, move/width/history/refresh/destroy and duplicate/delete request APIs.
  - Assert default `maxColumns: 4`.
  - Assert intent controller uses Pointer Events and exposes cleanup/destroy behavior.
  - Assert Builder runtime contains no Forms-specific runtime identifiers.

- [ ] **Step 2: Run `node tests/builder-contract-smoke.mjs`**
  - Expected before Task 2: FAIL because Builder assets do not exist on the alpha6 baseline.

- [ ] **Step 3: Add CI execution**
  - Run `node --check` across all shipped component/plugin JavaScript.
  - Run `node tests/builder-contract-smoke.mjs` after the Builder assets exist.

- [ ] **Step 4: Commit**
  - Commit message: `test: define shared builder contract`

### Task 2: Consolidate PR #4 Builder assets onto alpha6

**Files:**
- Create: `component/media/js/builder-engine.js`
- Create: `component/media/js/builder-intent-controller.js`
- Modify: `component/media/joomla.asset.json`
- Create: `docs/builder-engine.md`

**Interfaces:**
- Consumes: the reviewed runtime from PR #4.
- Produces: `com_decaroeditor.builder-engine`, `com_decaroeditor.builder-intents`, `XdecaroBuilderEngine` and the host-managed intent controller contract.

- [ ] **Step 1: Reuse the exact PR #4 runtime blobs**
  - Bring the two Builder JavaScript files forward without unrelated refactoring.

- [ ] **Step 2: Register independent Joomla assets**
  - Add both Builder script assets to `component/media/joomla.asset.json` without adding a dependency on `com_decaroeditor.editor`.

- [ ] **Step 3: Bring forward the Builder public-contract documentation**
  - Preserve the Editor/Core/consumer responsibility boundary and Forms migration safety rule.

- [ ] **Step 4: Run syntax and contract tests**
  - `node --check component/media/js/builder-engine.js`
  - `node --check component/media/js/builder-intent-controller.js`
  - `node tests/builder-contract-smoke.mjs`
  - Expected: PASS.

- [ ] **Step 5: Commit**
  - Commit message: `feat: consolidate shared visual builder engine`

### Task 3: Harden CI asset and alpha6 regression validation

**Files:**
- Modify: `.github/workflows/build.yml`

**Interfaces:**
- Consumes: alpha6 field bridge and all Joomla web assets.
- Produces: CI guards for missing asset targets, JavaScript syntax and preserved alpha6 public bridge behavior.

- [ ] **Step 1: Validate every declared local `com_decaroeditor/` asset target exists**
- [ ] **Step 2: Keep the existing field-bridge assertions for WeakSet idempotency, `scan`, textarea instance registration and form synchronization**
- [ ] **Step 3: Keep canonical Core namespace and version-coherence guards**
- [ ] **Step 4: Run the complete local-equivalent validation set available from CI scripts**
- [ ] **Step 5: Commit**
  - Commit message: `ci: harden editor and builder regression checks`

### Task 4: Version alpha7 coherently

**Files:**
- Modify: `VERSION`
- Modify: `component/decaroeditor.xml`
- Modify: `plugin/decaroeditor.xml`
- Modify: `package/pkg_decaroeditor.xml`
- Modify: `component/media/joomla.asset.json`
- Modify: `updates/com_decaroeditor.xml`
- Modify: `updates/pkg_decaroeditor.xml`
- Modify: `CHANGELOG.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: completed Builder consolidation.
- Produces: coherent `0.1.0-alpha7` metadata and documentation.

- [ ] **Step 1: Change every release/version field from `0.1.0-alpha6` to `0.1.0-alpha7`**
- [ ] **Step 2: Update update-feed download URLs to the alpha7 tag path while leaving checksums absent until artifacts exist**
- [ ] **Step 3: Add changelog entry describing Builder consolidation and preserved alpha6 bridge behavior**
- [ ] **Step 4: Update README current development version and current implementation bullets**
- [ ] **Step 5: Run version-coherence/build validations**
- [ ] **Step 6: Commit**
  - Commit message: `chore: prepare Editor 0.1.0-alpha7`

### Task 5: Final verification and pull request

**Files:**
- No product-code changes expected unless verification exposes a defect.

**Interfaces:**
- Consumes: completed alpha7 branch.
- Produces: reviewable PR against `main` with CI evidence.

- [ ] **Step 1: Verify branch diff contains only intended Builder, tests, CI, docs and alpha7 metadata changes**
- [ ] **Step 2: Open a pull request to `main` summarizing architecture, regression safeguards and out-of-scope Media Manager work**
- [ ] **Step 3: Inspect GitHub Actions checks and fix any failures at the root cause**
- [ ] **Step 4: Leave PR unmerged until review is complete**
