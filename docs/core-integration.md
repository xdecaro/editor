# Xdecaro Core integration

Editor uses Xdecaro Core as an optional, domain-neutral integration layer. The editor engine, block schema, media behavior, history and content serialization remain owned by Editor.

Minimum supported Core version for the current public reference contract: `1.0.0`.

## Runtime adapter

The Joomla dependency-injection container exposes:

`Xdecaro\Component\Decaroeditor\Administrator\Service\CoreIntegrationService`

The adapter provides:

- `isAvailable()` to verify that a compatible Core contract is loaded;
- `getInstalledVersion()` for controlled diagnostics;
- `createContextReference()` to identify the entity whose content is being edited.

Editor remains usable when Core is absent. Only a feature that explicitly needs a Core reference must stop, with a controlled message instead of a class-not-found fatal error.

## Ownership

An editing context is owned by the component that supplied it. For example, an article context uses `com_content`, while a Membership context uses `com_decaromembership`. Editor must not infer private table names or claim ownership of the caller's entity.

Consuming components should use the Joomla editor plugin/public Editor API and pass stable integration context. They must not copy the Editor engine into their own repositories.

Dependency direction remains:

`Forms / Courses / Competitions / Documents / Membership / Events -> Editor -> Core`

Core never depends on Editor, and optional integrations must not introduce circular dependencies.
