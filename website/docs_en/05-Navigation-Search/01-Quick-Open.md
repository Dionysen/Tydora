---
title: Quick Open
tags: [Navigation & Search]
---

# Quick Open

Quick Open lets you instantly locate and open any file in your repository using only the keyboard — the core feature for ditching the mouse and boosting navigation efficiency.

> [!NOTE]
> Shortcut: `Ctrl+O`.

## Usage

1. Press `Ctrl+O` to open the Quick Open panel.
2. Type filename keywords for **fuzzy search**.
3. Use the up/down arrow keys to select a result, then press `Enter` to open; or click the result directly.
4. Press `Esc` to close the panel.

## Fuzzy Search

Quick Open supports fuzzy matching — no need to type the full filename:

- Type `notes` → matches `my-notes.md`, `notes-management.md`
- Type `2024diary` → matches `2024-diary.md`
- Type `project readme` → matches `project/README.md` (cross-level matching works too)

> [!TIP]
> The search scope is **all files within the currently active repository**. To search another repository, switch repositories first (see [[04-File-Management/01-Vaults]]).

## Recent Files

When the panel opens, it displays a list of **recently opened files**, giving you one-click access to frequently used files without having to search every time.

## Relationship with Command Palette

- **Quick Open** (`Ctrl+O`) searches only **files**.
- **Command Palette** (`Ctrl+P`) searches only **commands**.

Together, these two let you perform nearly all operations using only the keyboard.

## Related Documents

- [[05-Navigation-Search/02-Command-Palette]] — Command search
- [[04-File-Management/01-Vaults]] — Repository management
- [[04-File-Management/02-File-Tree]] — File tree browsing
