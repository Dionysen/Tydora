---
title: Quick Start
tags: [getting-started]
---

# Quick Start

1. Inimark is a modern desktop Markdown editor built with Tauri v2 + React 19. It features WYSIWYG live preview, dual-mode editing, WikiLink bidirectional links, a knowledge graph, mind maps, and a whiteboard canvas. This page gets you from installation to your first note in about 5 minutes.

> [!NOTE] If you've used Obsidian or Typora, many interactions in Inimark will feel familiar: the Vault concept, bidirectional link syntax, and WYSIWYG editing all share the same philosophy.

## 1. Installation

1. Go to the [GitHub Releases](https://github.com/zuorn/Inimark/releases) page.
2. Download the appropriate installer for your system:
   - **Windows**: `Inimark_x.x.x_x64-setup.exe`
   - **macOS**: `Inimark_aarch64.app.tar.gz` (Apple Silicon) or `Inimark_x64.app.tar.gz` (Intel)
   - **Linux**: `Inimark_amd64.AppImage`
3. Run the installer and follow the prompts.
4. Launch Inimark.

> [!TIP] After the first launch, Inimark checks for available updates automatically. You can also manually check in Settings at any time.

## 2. Open a Vault

Inimark uses the "Vault" concept to manage your notes. **Each vault corresponds to a local folder.** All Markdown files in the vault are included in the file tree, link index, and knowledge graph.

1. Click the **vault switcher** at the bottom of the left sidebar (showing the current vault name).
2. Select "Add Vault."
3. In the file picker, choose a folder as your note vault (or create an empty folder).
4. After confirmation, the left sidebar immediately shows the **file tree** for that folder.

> [!ABSTRACT] Vaults only record folder paths — Inimark does not move or copy your files. You can add multiple vaults at any time and manage them by project or topic. See .

## 3. Create Your First Note

1. In the left **file tree**, right-click a target folder (or the root directory).
2. Choose "New File."
3. Enter a filename, e.g., `my-first-note` (the `.md` extension can be omitted — Inimark adds it automatically).
4. Press `Enter` to confirm, and the editor opens the file.
5. Start writing in Markdown!

> [!TIP] Right-click empty space in the file tree to "New Folder" — organize your notes by category first to keep your knowledge from becoming chaos.

## 4. Basic Editing

Inimark offers two editing modes for different scenarios:

- **Live Preview (IR / WYSIWYG)**: See the final rendered result directly in the editor — what you see is what you get. Great for daily writing.
- **Source Mode (SV)**: Shows plain Markdown text with syntax highlighting powered by CodeMirror 6. Great for fine-tuning formatting.

> Press `Ctrl+/` to switch between the two modes at any time. See [[02-Editor/01-Editing-Modes]].

## 5. Saving Files

- Manual save: Press `Ctrl+S`.
- Auto-save: Enable "Auto Save" in [[07-Settings/01-General-Settings]]. After that, files are automatically written to disk about 1 second after you stop typing.

> [!WARNING] File deletion is irreversible — proceed with caution. For important notes, consider backing up or using version control (e.g., Git).

## 6. Quick Navigation

Master these shortcuts to boost your productivity:

| Shortcut | Function |
| --- | --- |
| `Ctrl+O` | [[05-Navigation-Search/01-Quick-Open]] — Open a file |
| `Ctrl+P` | [[05-Navigation-Search/02-Command-Palette]] — Search and execute commands |
| `Ctrl+\` | Toggle left sidebar |
| `Ctrl+/` | Switch editing mode (IR ↔ SV) |
| `Ctrl+G` | Open [[03-Knowledge-Management/04-Knowledge-Graph]] |
| `Ctrl+M` | Open [[08-Advanced-Features/02-Mind-Map]] |

> Full list: [[07-Settings/04-Shortcut-Reference]].

## 7. Next Steps

After writing your first note, explore further:

- Use `<a data-note="Another Note">Another Note</a>` to create bidirectional links → [[03-Knowledge-Management/01-Wiki-Links]]
- Open the backlinks panel on the right to see who references the current note → [[03-Knowledge-Management/03-Backlinks]]
- Press `Ctrl+G` to see your knowledge graph → [[03-Knowledge-Management/04-Knowledge-Graph]]
- Want to share? Publish as a website with one click → [[08-Advanced-Features/01-Publish-Website]]

## Related Documents

- [[04-File-Management/01-Vaults]] — Vault (multi-folder) management
- [[02-Editor/01-Editing-Modes]] — Editing modes in detail
- [[07-Settings/04-Shortcut-Reference]] — All keyboard shortcuts
- [[07-Settings/01-General-Settings]] — Auto-save and app settings
- [[01-Getting-Started/03-FAQ]] — Beginner FAQ