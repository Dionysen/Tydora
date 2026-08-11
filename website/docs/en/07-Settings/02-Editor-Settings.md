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

> You can always temporarily switch with `Ctrl+/`. See [[02-编辑器/01-编辑模式]] for details.

## Typewriter Mode

When enabled, the cursor always stays at the center of the screen. You can also toggle it at any time with `Ctrl+Alt+T`.

> See [[02-编辑器/10-打字机模式]] for details.

## Markdown Rendering

### Math Formulas

Enable / disable formula rendering and choose an engine:

- **KaTeX** — Fast, great compatibility (recommended)
- **MathJax** — More feature-rich

> See [[02-编辑器/04-数学公式]] for details.

### Code Highlighting

Enable / disable code syntax highlighting and choose a highlight theme.

> See [[06-主题与外观/03-代码高亮主题]] and [[02-编辑器/03-代码块]] for details.

### Mermaid Diagrams

Enable / disable real-time rendering of Mermaid diagrams.

> See [[02-编辑器/05-Mermaid图表]] for details.

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

- [[02-编辑器/01-编辑模式]] — Editing mode details
- [[02-编辑器/04-数学公式]] — Formula support
- [[02-编辑器/03-代码块]] — Code highlighting
- [[02-编辑器/05-Mermaid图表]] — Diagram rendering
- [[07-设置/01-通用设置]] — Basic settings
