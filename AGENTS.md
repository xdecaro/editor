# Editor — Codex Repository Rules

## Xdecaro Core integration

Editor by xdecaro is part of the Xdecaro Joomla ecosystem and should use **Xdecaro Core** for infrastructure that is genuinely shared across multiple Xdecaro extensions.

Core is infrastructure. Editor is a separate product with its own editor domain and public integration API.

Before implementing reusable technical infrastructure, inspect whether it already exists in Core or clearly belongs there.

Good Core candidates include:

- shared design tokens and `.xdecaro-*` UI primitives;
- light/dark mode foundations;
- responsive administrator UI helpers;
- shared buttons, badges, cards, modals, alerts and loading states;
- shared Web Asset Manager registration;
- generic JavaScript utilities;
- Joomla-compliant AJAX/CSRF helpers;
- dependency/version checks;
- common diagnostics;
- Xdecaro extension registry;
- shared information/update UI.

Keep Editor-specific domain logic in this repository, including:

- the visual editor engine;
- block model and block registry;
- contextual block properties;
- content serialization/deserialization;
- editor history, undo and redo;
- intelligent paste cleaning;
- editor-specific keyboard behavior;
- image/video/embed block behavior;
- media editing and non-destructive crop behavior;
- slash commands;
- editor autosave/version-history behavior;
- Joomla editor plugin integration;
- editor-specific accessibility and interaction logic;
- optional AI editing actions.

Do not move the editor engine into Core merely because many Xdecaro products can use it.

Editor is a reusable product. Core is shared infrastructure. These are different responsibilities.

## Integration with other Xdecaro products

Forms, Courses, Competitions, Documents, Membership, Events and future components may consume Editor through a stable public Editor API/plugin contract.

Do not duplicate the editor engine inside consuming products.

Do not let Core depend on Editor.

Correct dependency direction may be:

`Forms / Courses / Competitions / Documents / Membership / Events -> Editor`

and independently:

`Editor -> Core`

Core itself must remain installable without Editor.

Avoid circular dependencies between Editor and consuming products.

## Public Editor API

Treat the Editor integration surface as a stable contract once published.

Before changing public:

- editor plugin behavior;
- initialization API;
- JavaScript events;
- block schema;
- serialized data format;
- asset identifiers;
- editor integration hooks;

inspect impact on all consuming components.

For incompatible changes prefer staged deprecation and a future major release.

## Security

Editor handles user-authored content and media, so security is critical.

Check where relevant:

- server-side ACL;
- Joomla CSRF tokens;
- input filtering;
- safe HTML sanitization;
- output escaping;
- XSS prevention;
- safe embeds;
- URL validation;
- upload validation;
- MIME type validation;
- filename/path safety;
- directory traversal;
- authorization for media operations.

Do not rely only on client-side sanitization or JavaScript validation.

The original Joomla textarea/content field must remain a trustworthy canonical form value when required by the integration architecture.

## Media

Media handling is Editor-domain functionality when it exists to support editing content.

Use Joomla Media Manager APIs where appropriate.

Non-destructive image operations must preserve originals and use controlled derivatives.

Do not create unsafe public filesystem paths or trust client-supplied MIME types.

## JavaScript

The editor is JavaScript-intensive. Avoid:

- duplicate listeners;
- global state leaks;
- duplicate editor initialization;
- duplicated AJAX calls;
- stale observers;
- lifecycle bugs when Joomla re-renders or reopens editor views;
- Console errors;
- editor instances that fail to dispose cleanly.

Keep shared generic helpers in Core when genuinely reusable, but keep editor state and editor behavior in Editor.

## CSS and responsive UI

Use Core design primitives where appropriate while preserving Editor-specific layout requirements.

The three-area editor interface and mobile interaction model remain Editor responsibilities.

Verify:

- desktop;
- tablet;
- smartphone;
- light mode;
- dark mode;
- keyboard operation;
- focus management;
- collapsible side panels;
- mobile properties panel;
- toolbar usability;
- content editing area overflow.

Do not force generic Core UI abstractions where they reduce editor usability.

## Dependency policy

If Core is mandatory, declare and enforce a documented minimum Core version through coherent package/manifests/update behavior.

Missing or incompatible Core versions must fail safely with a clear Joomla administrator message.

Do not assume Core APIs exist without checking them.

## Versioning and release stability

The current alpha/beta development phase may evolve rapidly, but public integration contracts should still be changed deliberately.

Use Semantic Versioning and keep manifests, package metadata, update server, changelog, tags and ZIP artifacts coherent.

Do not publish different code with the same version number.

## Regression rule

A Core-related change is complete only when affected Editor behavior remains verified.

Check as applicable:

- clean installation;
- update installation;
- Joomla editor plugin integration;
- original textarea synchronization;
- block insertion/editing;
- undo/redo;
- paste cleaning;
- image/video/embed behavior;
- media operations;
- assets loaded once;
- AJAX;
- ACL and CSRF;
- PHP errors/warnings;
- JavaScript Console;
- desktop/tablet/smartphone;
- light/dark mode;
- accessibility and keyboard use;
- at least one real consuming Xdecaro component when the public integration API changes.

Do not combine an opportunistic Core integration with unrelated large refactors.

## Working rule

When the user says **“procedi”**, execute the requested work directly after inspecting the relevant code and dependencies.

Do not ask for another confirmation when requirements are already clear.

If a proposed technical approach is weaker than a safer or more maintainable alternative, explain the issue and use or recommend the stronger approach.
