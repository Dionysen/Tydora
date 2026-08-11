---
title: Context Menu
tags: [Editor]
---

# Context Menu

**Right-clicking** in the editing area opens a context menu that centrally provides commonly used formatting and insertion commands. It complements the toolbar and keyboard shortcuts, serving as an efficient entry point for mouse-oriented users.

> [!NOTE]
> Most commands in the context menu also have corresponding keyboard shortcuts, with default bindings shown in parentheses. See the full list in [[07-Settings/04-Keyboard-Shortcuts]].

## Basic Operations

- **Undo** / **Redo** — Revert or restore the previous action
- **Cut** / **Copy** / **Paste** — Standard clipboard operations

## Formatting

| Command | Default Shortcut | Description |
| --- | --- | --- |
| Bold | `Ctrl+B` | Wraps selected text as bold |
| Italic | `Ctrl+I` | Wraps selected text as italic |
| Strikethrough | `Ctrl+D` | Wraps selected text as strikethrough |
| Inline Code | `Ctrl+E` | Wraps selected text as `inline code` |
| Highlight | `Ctrl+=` | Wraps selected text as `==highlight==` |

## Headings

After selecting text (or placing the cursor in a paragraph), you can quickly set it to heading levels 1–6, or convert back to a normal paragraph.

> Shortcuts: `Ctrl+Alt+1` ~ `Ctrl+Alt+6`, paragraph is `Ctrl+Alt+0`.

## Lists

- **Unordered List** — Bullet list (`Ctrl+L`)
- **Ordered List** — Numbered list (`Ctrl+O`, may be affected by global shortcuts, see [[07-Settings/04-Keyboard-Shortcuts]])
- **Task List** — Checkbox list (`Ctrl+J`)

## Block-level Elements

- **Blockquote** — Add a blockquote (also the carrier for Callouts, `Ctrl+;`)
- **Code Block** — Insert a code block (`Ctrl+U`)
- **Table** — Insert a table (`Ctrl+T`)
- **Horizontal Rule** — Insert a divider (`Ctrl+Shift+H`)

## Insert

- **Hyperlink** — Insert a link (`Ctrl+K`)
- **Image** — Insert an image (`Ctrl+Shift+I`)
- **Wiki Link** — Insert a <a data-note="03-Knowledge-Management/01-Wiki-Links">03-Knowledge-Management/01-Wiki-Links</a>

> [!TIP]
> When you want to batch-apply formatting, select a piece of text first and then right-click — the menu commands will act directly on the selection; if nothing is selected, they act on the block where the cursor is currently located.

## Related Documents

- [[02-Editor/02-Markdown-Syntax]] — Syntax details
- [[02-Editor/08-Table-Operations]] — Table editing
- [[02-Editor/03-Code-Blocks]] — Code blocks
- [[07-Settings/04-Keyboard-Shortcuts]] — Shortcut list
