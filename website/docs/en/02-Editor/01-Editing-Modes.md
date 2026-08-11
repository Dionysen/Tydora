---
title: Editing Modes
tags: [Editor]
---

# Editing Modes

Tydora supports two editing modes, corresponding to two different needs: "writing smoothly" and "viewing precisely." You can switch between them at any time during writing without affecting each other.

> [!NOTE]
> Press `Ctrl+/` to toggle between the two modes with one key. You can also specify a default mode in settings (see [[07-Settings/02-Editor-Settings]]).

## Two Modes

### Instant Rendering (IR / WYSIWYG)

In Instant Rendering mode, the Markdown syntax you type is **immediately rendered**, giving you a what-you-see-is-what-you-get experience. The underlying engine is powered by TipTap 3.x.

**Features:**

- Headings, bold text, lists, etc. are displayed directly in their formatted styles
- Supports drag-to-resize for images
- Natively supports rich elements such as Callout blocks, Mermaid diagrams, and code block highlighting
- Markdown markers at the cursor position are shown on demand and hidden when the cursor leaves
- Ideal for daily writing, note-taking, and quick editing

> [!TIP]
> Instant Rendering is the recommended mode for most scenarios. Its experience is closest to Typora / Obsidian's "Live Preview."

### Source View (SV)

Source View displays **pure Markdown text**, with professional syntax highlighting and editing experience provided by CodeMirror 6.

**Features:**

- Fully preserves all Markdown markers for precise control
- CodeMirror 6 syntax highlighting, supporting 36 programming languages
- Code folding, bracket matching, auto-completion
- Ideal for fine-tuning formatting, batch rewriting, and editing code blocks

## How to Switch

| Method | Action |
| --- | --- |
| Shortcut | `Ctrl+/` cycles between IR ↔ SV |
| Shortcut (direct) | `Ctrl+Alt+7` switches to Instant Rendering; `Ctrl+Alt+8` switches to Source View |
| Status Bar | Click the mode indicator on the bottom status bar (showing the current mode); it is clickable to switch |
| Settings | Set the default mode in [[07-Settings/02-Editor-Settings]] |

> [!NOTE]
> Switching modes does not change the file content — only the way it is presented and edited. What is saved is always standard Markdown text.

## Mode Comparison

| Feature | IR / WYSIWYG | SV (Source View) |
| --- | --- | --- |
| Formatted Display | Rendered immediately | Shows syntax markers |
| Syntax Visibility | Low (partial display at cursor) | High |
| Editing Experience | What You See Is What You Get | Full plain text control |
| Image Handling | Drag to resize | Shows markers and paths |
| Best For | Daily writing, reading | Fine-tuning, code editing |

## Complementary Features

- **Typewriter Mode**: Keeps the cursor centered at all times → [[02-Editor/10-Typewriter-Mode]]
- **Context Menu**: Quickly apply formatting in Instant Rendering → [[02-Editor/09-Context-Menu]]
- **Table Floating Toolbar**: Appears when hovering over a table in Instant Rendering → [[02-Editor/08-Table-Operations]]

## Related Settings

- [[07-Settings/02-Editor-Settings]] — Set the default editing mode
- [[02-Editor/10-Typewriter-Mode]] — Auto-centering cursor

## Related Documents

- [[02-Editor/02-Markdown-Syntax]] — Supported syntax
- [[02-Editor/09-Context-Menu]] — Formatting commands
- [[02-Editor/03-Code-Blocks]] — Code highlighting
- [[07-Settings/04-Keyboard-Shortcuts]] — Mode switching shortcuts
