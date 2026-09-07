# Editor architecture

## Goal

Editor by xdecaro must be a reusable Joomla editor engine rather than a UI duplicated inside every xdecaro component.

## Layers

1. `com_decaroeditor` owns shared assets, configuration, diagnostics and the editor demonstration/workbench.
2. `plg_editors_decaroeditor` exposes the editor through Joomla's editor plugin API.
3. Other components use the Joomla editor field/plugin or the shared editor assets instead of copying JavaScript/CSS.
4. Future server-side media services (crop, optimization and derived image management) belong to the component and are consumed by the editor through authenticated Joomla endpoints.

## Content strategy

The canonical Joomla editor field remains HTML for compatibility with core articles and third-party extensions.

For xdecaro components that can store richer data, the editor may additionally persist a structured block document in a dedicated JSON field. HTML output must always be reproducible from supported block data and sanitized on the server.

## Security boundaries

JavaScript is never a security boundary. Server-side code must validate ACL, CSRF tokens, URLs, upload MIME types, file names and allowed HTML before persistent writes.

External embeds must use an allowlist. The initial UI recognizes YouTube, Vimeo and direct MP4 sources; arbitrary iframe HTML is not trusted.

## Media strategy

Image edits are non-destructive. Original media are preserved and future crop/optimization operations create derived files. The editor stores the relation between the original and the selected derivative.

## Responsive behavior

Desktop uses the reference three-column UI. Tablet reduces the properties panel to an off-canvas surface. Smartphone uses the central editor as the primary surface and opens blocks/properties only when needed.

## Release strategy

Development starts at `0.1.0-alpha1`. Version `1.0.0` is reserved for the first stable release after installation, editor-field integration, persistence, media handling, accessibility and responsive regression checks are complete.
