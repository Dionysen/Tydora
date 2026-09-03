---
title: Frontmatter (Metadata)
tags: [Editor]
---

# Frontmatter (Metadata)

Frontmatter is a YAML metadata block placed at the **very beginning** of a Markdown file, wrapped with `---`. It does not affect the display of the body text, but adds structured information such as title, tags, and date to your notes.

> [!NOTE]
> Inimark provides a dedicated Frontmatter property panel at the top of the editor for viewing and copying metadata, allowing management without switching to Source View.

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
| `author` | string | Author |
| `description` | string | Document description |

> [!TIP]
> Tags participate in Inimark's tag indexing; you can filter notes by tag in the sidebar.

## Property Panel

Inimark provides a collapsible Frontmatter property panel at the top of the editor:

- **Collapsible**: Click to expand/collapse, taking no writing space when not in use
- **Sorted Display**: Common properties (`title`, `tags`, `date`, etc.) are shown with priority
- **One-click Copy**: Copy the complete YAML block to the clipboard for easy pasting into other files

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
