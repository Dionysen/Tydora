---
title: File Operations
tags: [files]
---

# File Operations

Tydora provides complete file management capabilities in the file tree and editor: create, rename, delete, move, copy path, and more.

> [!NOTE]
> The vast majority of operations can be performed via the file tree's right-click menu; common operations also have keyboard shortcuts.

## Creating a File

1. Right-click a target directory (or the root directory) in the file tree.
2. Select "New file".
3. Enter a filename, for example `note.md` (the `.md` can be omitted; Tydora appends it automatically).
4. Press `Enter` to confirm, and the editor immediately opens the new file.

## Creating a Folder

1. Right-click a target directory in the file tree.
2. Select "New folder".
3. Enter the folder name and press `Enter` to confirm.

## Renaming

### Method One: Right-Click Menu

1. Right-click the file or folder.
2. Select "Rename".
3. Enter the new name and press `Enter` to confirm.

### Method Two: Keyboard Shortcut

1. Select the file or folder.
2. Press `F2`.
3. Enter the new name and press `Enter` to confirm (`Esc` to cancel).

> [!TIP]
> After renaming a note file, Tydora attempts to update the `[[03-Knowledge-Management/01-Wiki-Links]]` pointing to it so that the links do not break. See [[03-Knowledge-Management/05-Link-Index]].

## Deleting

1. Right-click the file or folder.
2. Select "Delete".
3. Click "OK" in the confirmation dialog.

> [!WARNING]
> Deletion **cannot be undone**, and it recursively deletes all contents inside a folder. For important files, it is recommended to back them up first or place them under version control.

## Drag and Drop to Move

1. Press and hold a file or folder in the file tree.
2. Drag it to the target directory.
3. Release the mouse to complete the move.

## Copying the Path

1. Right-click the file.
2. Select "Copy path".
3. The file's full absolute path is copied to the clipboard, making it convenient to reference in the terminal, publish configurations, or conversations.

## Related Documents

- [[04-File-Management/02-File-Tree]] — File tree operations
- [[04-File-Management/04-File-Preview]] — File preview
- [[04-File-Management/01-Vaults]] — Vault management
- [[03-Knowledge-Management/05-Link-Index]] — Link updates after rename
