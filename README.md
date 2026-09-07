# Editor

**Editor by xdecaro** is a modern visual content editor for Joomla 6.

The project is designed around a simple workflow:

**Write → Add content → Edit → Preview → Publish**

The editor must remain fast, visual, accessible and easy to use without requiring HTML or CSS knowledge.

## Current development version

**1.0.0-dev**

## Planned package

- Joomla component: `com_decaroeditor`
- Joomla package: `pkg_decaroeditor`
- Joomla editor plugin: `plg_editors_decaroeditor`
- Repository: `xdecaro/editor`

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

- autosave with visible state;
- undo and redo;
- version history;
- responsive preview for desktop, tablet and smartphone;
- contextual formatting toolbar;
- slash commands;
- keyboard navigation;
- light and dark mode.

## AI

AI features are optional enhancements and must never be required to use the editor. Planned actions include improve, shorten, expand, correct, translate, change tone, generate image alt text and suggest captions.

## Joomla integration

The editor core is intended to be reusable by Joomla Articles and other xdecaro components such as Courses, Competitions, Forms and future products. The implementation must avoid duplicating the editor engine inside each component.

All interface strings use Joomla language files. The technical default language is `en-GB`, with `it-IT` included from the first release and additional languages added without changing application logic.

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
