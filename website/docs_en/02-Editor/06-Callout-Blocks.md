---
title: Callout Blocks
tags: [Editor]
---

# Callout Blocks

Callouts (annotation blocks), originating from GitHub's alert syntax, are a powerful tool for structured note-taking. Inimark supports **15** built-in types, each with a dedicated icon and color scheme, helping you highlight important content and distinguish information hierarchies.

> [!NOTE]
> Callouts appear as colored cards in Instant Rendering mode; in Source View mode they appear as blockquotes with `[!TYPE]`. The content is identical in both modes.

## Basic Syntax

Callouts are based on blockquote extensions, with `[!Type]` immediately following `>`:

```markdown
> [!NOTE]
> This is the content of the callout
```

## Type List

| Type | Syntax | Purpose |
| --- | --- | --- |
| NOTE | `[!NOTE]` | General remarks |
| TIP | `[!TIP]` | Tips or suggestions |
| IMPORTANT | `[!IMPORTANT]` | Important information |
| WARNING | `[!WARNING]` | Warning information |
| CAUTION | `[!CAUTION]` | Matters requiring attention |
| ABSTRACT | `[!ABSTRACT]` | Summary or overview |
| INFO | `[!INFO]` | Informational notes |
| SUCCESS | `[!SUCCESS]` | Success or positive information |
| QUESTION | `[!QUESTION]` | Questions |
| FAILURE | `[!FAILURE]` | Failure or error information |
| DANGER | `[!DANGER]` | Danger warning |
| BUG | `[!BUG]` | Bug-related |
| EXAMPLE | `[!EXAMPLE]` | Examples |
| QUOTE | `[!QUOTE]` | Quoted content |
| FAQ | `[!FAQ]` | Frequently asked questions |

## Collapse Control

Use `+` / `-` modifiers to control the default expanded state of a Callout:

```markdown
> [!NOTE]+      → Expanded by default
> [!NOTE]-      → Collapsed by default
> [!NOTE]       → Expanded by default (equivalent to +)
```

Click the title bar at any time to expand/collapse; when collapsed, only the title is shown.

## Usage Examples

```markdown
> [!TIP]
> Press `Ctrl+S` to quickly save the current file.

> [!WARNING]
> Deleted files cannot be recovered. Please proceed with caution.

> [!FAQ]-
> **Q: How do I switch editing modes?**
> Press `Ctrl+/` to switch between IR / SV modes.
```

Rendered effect:

> [!TIP]
> Press Ctrl+S to quickly save the current file.

> [!WARNING]
> Deleted files cannot be recovered. Please proceed with caution.

> [!FAQ]-
> Q: How do I switch editing modes? Press Ctrl+/ to switch between IR / SV modes.

## Multiple Paragraphs and Nesting

Callouts support multiple paragraphs, lists, code blocks, and other standard Markdown elements inside:

```markdown
> [!EXAMPLE]
> Below is a sample code snippet:
> ```js
> console.log("hello");
> ```
> You can also include lists:
> - Item one
> - Item two
```

> [!TIP]
> In Instant Rendering mode, place the cursor inside a Callout and use the "Blockquote" command from the context menu to quickly convert the current block into a Callout or adjust its type.

## Related Documents

- [[02-Editor/02-Markdown-Syntax]] — Complete syntax support
- [[02-Editor/01-Editing-Modes]] — Editing mode introduction
- [[02-Editor/09-Context-Menu]] — Right-click formatting commands
