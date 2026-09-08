# Xdecaro Core integration

Editor uses Xdecaro Core as an optional, domain-neutral integration layer. The editor engine, block schema, media behavior, history and content serialization remain owned by Editor.

The public cross-product reference contract remains compatible with Core `1.0.0+`. Shared design tokens and the Core foundation stylesheet are consumed only when Core `1.1.0+` is available.

## Runtime adapter

The Joomla dependency-injection container exposes:

`Xdecaro\Component\Decaroeditor\Administrator\Service\CoreIntegrationService`

The adapter provides:

- `isAvailable()` for the Core `1.0.0+` public reference contract;
- `isUiAvailable()` for the Core `1.1.0+` design foundation;
- `getInstalledVersion()` for controlled diagnostics;
- `useFoundation()` to enable Core design tokens without making them mandatory;
- `createContextReference()` to identify the entity whose content is being edited.

Editor remains usable when Core is absent, older than `1.1.0`, or unable to register its media assets. In those cases Editor keeps its local token fallbacks. Only a feature that explicitly requires a Core entity reference must stop, with a controlled message instead of a class-not-found fatal error.

## Design-system boundary

Editor wraps its administrator workbench and Joomla editor field in `.xdecaro-scope`. Its local CSS maps editor-specific tokens to Core tokens when available, while retaining fallback values for standalone use.

Core owns only shared foundation values such as surfaces, text, borders, primary/success colors, radii and shadows. Editor continues to own canvas layout, block selection, inline toolbar, slash menu, responsive sidebars and all editing behavior.

## Ownership

An editing context is owned by the component that supplied it. For example, an article context uses `com_content`, while a Membership context uses `com_decaromembership`. Editor must not infer private table names or claim ownership of the caller's entity.

Consuming components should use the Joomla editor plugin/public Editor API and pass stable integration context. They must not copy the Editor engine into their own repositories.

Dependency direction remains:

`Forms / Courses / Competitions / Documents / Membership / Events -> Editor -> Core`

Core never depends on Editor, and optional integrations must not introduce circular dependencies.
