---
title: Quick Start
tags: [getting-started]
---

# Quick Start

Write without end, think without bounds. This page gets you from installation to your first note in about 5 minutes.

> [!NOTE]
> Inimark uses "Vaults" to manage notes in local folders. All files stay on your disk — nothing goes through the cloud.

## 1. Installation

Go to [GitHub Releases](https://github.com/Dionysen/Inimark/releases).

1. Download the installer for your system:
   - **Windows**: `Inimark_x.x.x_x64-setup.exe`
   - **macOS**: `Inimark_aarch64.app.tar.gz` (Apple Silicon) or `Inimark_x64.app.tar.gz` (Intel)
   - **Linux**: `Inimark_amd64.AppImage`
2. Run the installer and follow the prompts.
3. Launch Inimark.

> [!TIP]
> Inimark checks for updates on first launch. You can also check manually in Settings → About.

## 2. Open a Vault

1. Click the **vault switcher** at the bottom of the left sidebar.
2. Select "Add Vault."
3. Choose a local folder (or create an empty one).
4. The **file tree** for that folder appears in the sidebar.

> [!ABSTRACT]
> Vaults only record folder paths — Inimark does not move or copy your files. You can add multiple vaults for different projects. See [[04-File-Management/01-Vaults]].

## 3. Create Your First Note

1. Right-click a folder in the **file tree**.
2. Choose "New File."
3. Enter a filename, e.g. `my-first-note` (the `.md` extension is optional).
4. Press `Enter` — the editor opens the file.
5. Start writing.

## 4. Basic Editing

Inimark offers two editing modes:

- **Live Preview (IR)**: WYSIWYG — great for daily writing.
- **Source Mode (SV)**: Plain Markdown — great for fine-tuning format.

Press `Ctrl+/` to switch anytime. See [[02-Editor/01-Editing-Modes]].

> [!TIP]
> For deep focus, enable **Typewriter Mode** in settings — the cursor stays centered.

## 5. Saving Files

- Manual save: `Ctrl+S`
- Auto-save: Enable in [[07-Settings/01-General-Settings]] — writes to disk ~1 second after you stop typing

> [!WARNING]
> File deletion is irreversible. Back up important notes.

## 6. Essential Shortcuts

| Shortcut | Function |
| --- | --- |
| `Ctrl+O` | [[05-Navigation-Search/01-Quick-Open]] |
| `Ctrl+P` | [[05-Navigation-Search/02-Command-Palette]] |
| `Ctrl+\` | Toggle sidebar |
| `Ctrl+/` | Switch editing mode |
| `Ctrl+G` | [[03-Knowledge-Management/04-Knowledge-Graph]] |
| `Ctrl+M` | [[08-Advanced-Features/02-Mind-Map]] |

Full list: [[07-Settings/04-Shortcut-Reference]].

## 7. Next Steps

After your first note, explore gradually:

1. **Keep writing** — [[02-Editor/02-Markdown-Syntax]] and [[02-Editor/10-Typewriter-Mode]]
2. **Connect ideas** — Use `[[Another Note]]` → [[03-Knowledge-Management/01-Wiki-Links]]
3. **See structure** — Press `Ctrl+G` for the knowledge graph, or `Ctrl+M` for a mind map
4. **Spread out** — Organize complex thoughts on the [[08-Advanced-Features/03-Whiteboard-Canvas]]

## Related Documents

- [[04-File-Management/01-Vaults]] — Vault management
- [[02-Editor/01-Editing-Modes]] — Editing modes in detail
- [[01-Getting-Started/02-About]] — Product philosophy
- [[01-Getting-Started/03-FAQ]] — FAQ
