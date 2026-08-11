---
title: File Tree
tags: [files]
---

# File Tree

The **file tree** in the left sidebar displays the current vault's directories and files in a tree structure, and is your main entry point for browsing and managing notes.

## Features

- **Recursive display**: fully presents the hierarchy of folders and files
- **Directories collapsed by default**: expand / collapse freely to keep the interface clean
- **Directories first**: folders always come before files
- **Sorted by name**: items at the same level are sorted by filename in alphabetical / pinyin order

## Expand and Collapse

- Click the **arrow** in front of a directory to expand or collapse it
- **Double-click** a directory name to also expand / collapse it

## Right-Click Menu

Right-click on a file or directory to perform:

- **New file** — create a new file in the current directory
- **New folder** — create a subfolder in the current directory
- **Rename** — rename in place (inline)
- **Delete** — delete the file or folder (requires confirmation)
- **Copy path** — copy the file's full path to the clipboard

> [!WARNING]
> Deleting a folder deletes all of its contents as well, and it **cannot be undone**. Please operate with caution.

## Drag and Drop to Move

1. Press and hold a file or folder in the file tree.
2. Drag it onto the target directory.
3. Release the mouse to complete the move.

> [!NOTE]
> After moving a file, Tydora updates the link index to keep `[[03-Knowledge-Management/01-Wiki-Links]]` resolving correctly whenever possible. See [[03-Knowledge-Management/05-Link-Index]].

## Inline Rename

1. Right-click and choose "Rename", or simply press `F2`.
2. The filename becomes editable.
3. Type the new name and press `Enter` to confirm (press `Esc` to cancel).

## Working with Search

When the vault has many files, you can type keywords in the search box at the top of the file tree to quickly filter files.

> For more powerful global search, see [[05-Navigation-Search/01-Quick-Open]] and [[05-Navigation-Search/02-Command-Palette]].

## Related Documents

- [[04-File-Management/03-File-Operations]] — Detailed file management
- [[04-File-Management/04-File-Preview]] — File preview
- [[04-File-Management/01-Vaults]] — Vault management
