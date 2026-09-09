# Changelog

All notable changes to Editor by xdecaro are documented here.

## 0.1.0-alpha5 — 2026-09-09

- Fixed the Joomla editor plugin so it consumes the canonical `xdecaro\Core` namespace instead of the deprecated compatibility namespace.
- Raised the plugin-side optional Core UI minimum to 1.3.0, matching the component adapter.
- Preserved standalone Editor behavior when Core is absent or incompatible.
- No editor-engine, block, media, history or content-format behavior changed.

## 0.1.0-alpha4 — 2026-09-09

- Migrated optional Core consumption to the canonical `xdecaro\Core` namespace introduced by Core 1.3.0.
- Raised both the public reference and shared UI integration minimum to Core 1.3.0.
- Preserved Editor standalone behavior and local design-token fallbacks when Core is absent or incompatible.
- Added a regression smoke guard that rejects runtime use of the deprecated `Xdecaro\Core` namespace.
- Preserved `com_decaroeditor`, `pkg_decaroeditor`, `plg_editors_decaroeditor` and all Editor namespaces.
- No editor-engine, block, media, history or content-format behavior changed.

## 0.1.0-alpha3 — 2026-09-08

- Added optional Core by xdecaro `1.1.0+` design-token foundation loading.
- Wrapped the administrator workbench and Joomla editor field in `.xdecaro-scope`.
- Bridged Editor surface, border, muted, primary, success, radius and shadow tokens to Core with complete local fallbacks.
- Preserved the existing Core `1.0.0+` entity-reference contract for backward compatibility.
- Added explicit Core UI availability detection and graceful failure handling.
- Added deterministic ZIP generation and SHA-256 checksums.
- Added the first real GitHub prerelease workflow for Editor packages.
- Kept the Editor engine, blocks, media behavior, history and JavaScript outside Core.

## 0.1.0-alpha2 — 2026-09-08

- Added the optional Xdecaro Core `1.0.0+` runtime adapter.
- Registered the adapter through the Joomla dependency-injection container.
- Added controlled behavior when Core is absent or incompatible.
- Added PHP syntax validation and the Core integration smoke test to CI.
- Documented the Editor/Core ownership and dependency boundaries.

## 0.1.0-alpha1 — 2026-09-07

- Added the initial Joomla component and editor plugin architecture.
- Added the first visual editor workbench and shared editor assets.
