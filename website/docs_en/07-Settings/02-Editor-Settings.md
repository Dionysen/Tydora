---
title: Editor Settings
tags: [Settings]
---

# Editor Settings

Editor settings manage **editing behavior, rendering options, and syntax highlighting** — the configurations that determine your detailed writing experience.

> [!NOTE]
> Press `Ctrl+,` to open Settings, then switch to the "Editor" tab.

## Default Editing Mode

Set the default mode when opening new files:

- **Instant Rendering (IR / WYSIWYG)** — What you see is what you get; recommended for daily writing
- **Source Code Mode (SV)** — Pure Markdown text; suitable for fine-tuning

> You can always temporarily switch with `Ctrl+/`. See [[02-Editor/01-Editing-Modes]] for details.

## Typewriter Mode

When enabled, the cursor always stays at the center of the screen. You can also toggle it at any time with `Ctrl+Alt+T`.

> See [[02-Editor/10-Typewriter-Mode]] for details.

## Markdown Rendering

### Math Formulas

Enable / disable formula rendering and choose an engine:

- **KaTeX** — Fast, great compatibility (recommended)
- **MathJax** — More feature-rich

> See [[02-Editor/04-Math-Formulas]] for details.

### Code Highlighting

Enable / disable code syntax highlighting and choose a highlight theme.

> See [[06-Themes-Appearance/03-Code-Highlight-Themes]] and [[02-Editor/03-Code-Blocks]] for details.

### Mermaid Diagrams

Enable / disable real-time rendering of Mermaid diagrams.

> See [[02-Editor/05-Mermaid-Diagrams]] for details.

### Footnotes

Enable / disable `[^1]` footnote syntax support.

### Table of Contents

Enable / disable the `[toc]` syntax. When enabled, `[toc]` in the document renders as the current document's table of contents.

## Word Count

When enabled, displays the current document's **word count, character count, and line count** somewhere in the editor (usually the bottom status bar), making it easy to track document length.

## Cache Settings

Provides a "Clear Cache" operation to resolve occasional rendering anomalies (e.g., styles not refreshing, diagrams not updating). If you encounter display issues, try clearing the cache first.

## XSS Filtering

When enabled, filters potentially malicious cross-site scripting (XSS) code in Markdown, improving security when opening untrusted notes. It is recommended to keep this enabled.

> [!WARNING]
> Disabling XSS filtering allows scripts in notes to execute. Only consider turning it off when you fully trust the source of your notes.

## Related Documents

- [[02-Editor/01-Editing-Modes]] — Editing mode details
- [[02-Editor/04-Math-Formulas]] — Formula support
- [[02-Editor/03-Code-Blocks]] — Code highlighting
- [[02-Editor/05-Mermaid-Diagrams]] — Diagram rendering
- [[07-Settings/01-General-Settings]] — Basic settings
