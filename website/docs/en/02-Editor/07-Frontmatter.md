---
title: Frontmatter (Metadata)
tags: [Editor]
---

# Frontmatter (Metadata)

Frontmatter is a YAML metadata block placed at the **very beginning** of a Markdown file, wrapped with `---`. It does not affect the display of the body text, but adds structured information such as title, tags, date, and publish status to your notes.

> [!NOTE]
> Tydora provides a dedicated Frontmatter property panel at the top of the editor for viewing and copying metadata, allowing management without switching to Source View.

## Basic Syntax

Starting from the first line of the file, wrap YAML content with `---`:

```yaml
---
title: My Note Title
tags: [tag1, tag2]
date: 2024-01-01
---
```

The body content follows after.

## Supported Properties

| Property | Type | Description |
| --- | --- | --- |
| `title` | string | Document title (overrides the filename display) |
| `tags` | string\[\] | Tag list, e.g., `[reading, tech]` |
| `date` | string | Creation date, recommended format `YYYY-MM-DD` |
| `publish` | string | Publish status; `public` means the note is included in "Public Notes Only" publish mode |
| `author` | string | Author |
| `description` | string | Document description (used for SEO on published sites) |

> [!TIP]
> Tags participate in Tydora's tag indexing; you can filter notes by tag in the sidebar.

## Property Panel

Tydora provides a collapsible Frontmatter property panel at the top of the editor:

- **Collapsible**: Click to expand/collapse, taking no writing space when not in use
- **Sorted Display**: Common properties (`title`, `tags`, `date`, etc.) are shown with priority
- **One-click Copy**: Copy the complete YAML block to the clipboard for easy pasting into other files

## Publish Control

The `publish` property in Frontmatter determines whether a note participates in the "Public Notes Only" publish mode:

```yaml
---
title: Public Note
publish: public
---
```

- Set `publish: public` → Included in "Public Notes Only" mode
- Not set or set to other values → Included only in "Full Publish" mode

> See [[08-Advanced-Features/01-Publish-Website]] for differences between publish modes.

## Writing Guidelines

- Frontmatter **must be at the very beginning of the file**; no characters (including blank lines) may precede it
- Start with `---` and end with `---`
- Follow standard YAML syntax: strings can be quoted, arrays use `[ ]`, numbers and booleans are supported
- Property names are **case-sensitive** (lowercase recommended)

> [!WARNING]
> If the YAML syntax is incorrect (e.g., missing closing `---`, incorrect indentation), the Frontmatter may not be parsed, and the property panel will display abnormally.

## Related Documents

- [[02-Editor/02-Markdown-Syntax]] — Complete syntax support
- [[02-Editor/01-Editing-Modes]] — Editing mode introduction
- [[08-Advanced-Features/01-Publish-Website]] — Publishing and the `publish` property
