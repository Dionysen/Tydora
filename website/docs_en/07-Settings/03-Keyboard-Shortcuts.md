---
title: Keyboard Shortcut Settings
tags: [Settings]
---

# Keyboard Shortcut Settings

Tydora comes with **40+ customizable** keyboard shortcuts. You can view all bindings in Settings, modify them to your preferred combinations, or reset them to defaults with one click.

> [!NOTE]
> Press `Ctrl+,` to open Settings, then switch to the "Shortcuts" tab. For the complete default list, see [[07-Settings/04-Shortcut-Reference]].

## Shortcut Groups

Shortcuts in Settings are grouped by function for easy navigation:

### Format

Bold, italic, strikethrough, inline code, code block, link, highlight, blockquote, horizontal rule, etc.

### List

Unordered list, ordered list, task list, increase / decrease indent, toggle task status.

### Headings

Heading levels 1–6, paragraph.

### Insert

Table, insert above / below.

### Table

Insert row / column, delete row / column, cell alignment.

### Edit

Undo, redo, select all (within code block).

### View

Toggle sidebar, fullscreen, typewriter mode, open mind map.

### Mode

Switch to instant rendering, switch to source code.

### System

Quick open, command palette, dismiss prompt.

## Customizing Shortcuts

1. Find the target command in the shortcut list.
2. Click the current shortcut combination.
3. Press the new key combination.
4. It saves automatically and takes effect immediately.

> [!TIP]
> No restart is needed after changes. If the new combination conflicts with an existing shortcut, the system will prompt you to confirm (see below).

## Resetting Shortcuts

Click the "Reset" button to restore **all** shortcuts to their default values. Individual commands can also be reset separately (usually via a "Restore Default" option when editing that item).

## Conflict Detection

If a newly set shortcut conflicts with an existing binding, the system will prompt for confirmation to avoid silent overwrites that break commands.

> [!WARNING]
> In the default configuration, `Ctrl+O` is shared by two commands (Quick Open / Ordered List). At runtime, the global command takes precedence. If you have reassigned the related commands, pay attention to the actual behavior. See [[07-Settings/04-Shortcut-Reference]] for details.

## Related Documents

- [[07-Settings/04-Shortcut-Reference]] — Shortcut quick reference
- [[05-Navigation-Search/02-Command-Palette]] — Command search
- [[07-Settings/01-General-Settings]] — Basic settings
