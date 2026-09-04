---
title: About Inimark
tags: [getting-started]
---

# About Inimark

**Inimark** — write without end, think without bounds.

A quiet desk, built with Tauri v2 + React 19. Local-first, open source, and free. Writing need not end; thinking need not be fenced in. We made it small and beautiful — just enough room for ideas that keep unfolding.

## Product Philosophy

Inimark is not a feature checklist. It does two things:

- **Focus on editing**: WYSIWYG and source, one keystroke apart. A restrained interface. The tool steps back; the words stay.
- **Focus on thinking**: Bidirectional links, knowledge graphs, mind maps, and a whiteboard — see patterns when you need to, without building another bloated system.

All notes and files live in your local folders. No personal data collected, no cloud required.

> [!NOTE]
> Inimark is open source under the Apache License 2.0. Issues, discussions, and contributions are welcome on GitHub.

## Version Info

| Item | Details |
| --- | --- |
| Current Version | 0.2.5 |
| Build Framework | Tauri v2 |
| Frontend Framework | React 19 |
| Editor Engine | TipTap 3.x (WYSIWYG) + CodeMirror 6 (Source) |
| Supported Platforms | Windows / macOS / Linux |

## Check for Updates

Inimark supports automatic updates: on startup it checks for new versions in the background and prompts you to download if one is available.

Manual check:

1. Open Settings (`Ctrl+,`)
2. Switch to the "About" tab
3. Click "Check for Updates"

> [!TIP]
> Automatic updates rely on signed files on GitHub Releases. See [[09-blog/Auto-Update-Configuration]] for contributor setup.

## Feature Overview

**Editing**

- WYSIWYG (IR) and Source (SV) dual modes, toggle with `Ctrl+/`
- Typewriter mode, Frontmatter property panel
- Code blocks, math, Mermaid, callouts, tables

**Thinking**

- WikiLink bidirectional links and backlinks
- Knowledge graph (D3.js force-directed)
- Mind maps (from Markdown headings / lists)
- Whiteboard canvas (JSON Canvas format)

**Basics**

- Multi-vault, drag-and-drop file tree, multimedia preview
- Built-in themes and code highlighting, customizable shortcuts
- Quick open, command palette, outline panel

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Rust (Tauri v2) |
| Frontend | React 19 + TypeScript + Vite 6 |
| Editor | TipTap 3.x + CodeMirror 6 |
| Visualization | D3.js, markmap, Mermaid, React Flow |
| Plugins | tauri-plugin-fs / dialog / window-state / updater / process |

## Open Source License

Inimark is licensed under the [Apache License 2.0](LICENSE).

## Feedback

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Usage discussions and experience sharing

> [!TIP]
> When submitting an issue, include your OS version, Inimark version, and reproduction steps.

## Related Documents

- [[01-Getting-Started/01-Quick-Start]] — Getting started guide
- [[index]] — Documentation home
- [[01-Getting-Started/03-FAQ]] — Frequently asked questions
