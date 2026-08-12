---
title: Vaults
tags: [files]
---

# Vaults

Tydora uses the "Vault" concept to manage note files. **Each vault is a local folder**, and all Markdown files, subfolders, images, and media within the vault are incorporated into the file tree, link index, and knowledge graph.

> [!NOTE]
> A vault only records the **path** of the folder; it does not move, copy, or modify any of your files. You can safely add an existing Markdown folder as a vault.

## Adding a Vault

1. Click the **vault switcher** at the bottom of the left sidebar (it shows the current vault name).
2. Select "Add vault".
3. Pick a folder in the system file picker (you can also create a new empty folder).
4. After confirming, the left file tree immediately loads the folder's contents.

## Switching Vaults

1. Click the vault switcher.
2. Click the target vault in the dropdown list.
3. The file tree and the currently open notes switch to that vault.

> [!TIP]
> Multiple vaults are suitable for separating notes by project, by topic, or by public/private. For example, one vault for work notes and one for your personal knowledge base.

## Removing a Vault

1. Click the vault switcher.
2. Hover over the target vault in the vault list and click the delete (trash) icon that appears.
3. Confirm removal.

> [!WARNING]
> Removing a vault **only removes Tydora's reference to it**; it does not delete the folder and files on disk. To completely delete them, operate in your file manager.

## Multi-Vault Management

- Manage multiple vaults simultaneously, isolating content by scenario
- Each vault independently maintains its file tree, link index, and recent-open records
- Switching vaults does not affect the data of other vaults

## Recently Opened Files

Each vault records the files it has recently opened separately, making it convenient to quickly return to the last editing position across different vaults.

## Filesystem Monitoring

Tydora monitors external changes in vault folders: when you add, rename, or delete files in your file manager, the file tree and link index **update automatically**, with no need to refresh manually.

> [!NOTE]
> Index updates triggered by external modifications are incremental, processing only the changed parts without stuttering the editor. See [[03-Knowledge-Management/05-Link-Index]] for details.

## Related Documents

- [[04-File-Management/02-File-Tree]] — File tree operations
- [[04-File-Management/03-File-Operations]] — File management
- [[05-Navigation-Search/01-Quick-Open]] — Quickly find files
- [[03-Knowledge-Management/05-Link-Index]] — Bidirectional link index
