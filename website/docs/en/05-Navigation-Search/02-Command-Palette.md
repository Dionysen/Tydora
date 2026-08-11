---
title: Command Palette
tags: [Navigation & Search]
---

# Command Palette

The Command Palette lets you search for and execute virtually any command in Tydora using the keyboard — from formatting text to opening the graph view, switching modes, and more — without digging through menus.

> [!NOTE]
> Shortcut: `Ctrl+P`.

## Usage

1. Press `Ctrl+P` to open the Command Palette.
2. Type command keywords for fuzzy search.
3. Use the arrow keys to select, then press `Enter` to execute; or click the result.
4. Press `Esc` to close.

## Supported Commands

### Editing Commands

Undo, redo, cut, copy, paste, select all, etc.

### Formatting Commands

Bold, italic, strikethrough, inline code, code block, links, various heading levels, lists, task lists, etc.

### View Commands

Toggle edit mode, toggle sidebar, open mind map, open knowledge graph, typewriter mode, etc.

### File Commands

New file, save file, close file, quick open, etc.

### Mode Commands

Switch directly to "Live Preview" or "Source Code" mode.

## Search Scope

The Command Palette searches across all available commands, including:

- Regular commands from menus
- Commands with keyboard shortcuts
- Commands provided by editor extensions

> [!TIP]
> You can search using either Chinese or English keywords. For example, "graph", "mind", or "图谱" can all locate the command to open the knowledge graph.

## Recent Commands

The palette remembers your recently executed commands and pins them to the top, making repeated operations even faster.

## Difference from Quick Open

- Command Palette (`Ctrl+P`) searches for **commands**.
- Quick Open (`Ctrl+O`) searches for **files**.

> [!WARNING]
> In the default configuration, `Ctrl+P` is also bound to "Split Preview", but the Command Palette takes priority at runtime. See [[07-设置/04-快捷键速查]] for details.

## Related Documents

- [[05-导航与搜索/01-快速打开]] — File quick open
- [[07-设置/04-快捷键速查]] — Keyboard shortcut reference
- [[07-设置/03-快捷键设置]] — Custom keyboard shortcuts
