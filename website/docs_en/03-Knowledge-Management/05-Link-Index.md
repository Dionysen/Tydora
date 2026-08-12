---
title: Link Index
tags: [knowledge]
---

# Link Index

The link index is Tydora's **background service**, responsible for scanning the vault and building and maintaining the link relationships between all notes. It is the data foundation for [[03-Knowledge-Management/01-Wiki-Links]] autocomplete, the [[03-Knowledge-Management/03-Backlinks]] panel, the [[03-Knowledge-Management/04-Knowledge-Graph]], and [[05-Navigation-Search/01-Quick-Open]].

> [!ABSTRACT]
> You normally don't need to interact with the link index directly — it works silently in the background. This page explains its mechanism so you can understand why links "always resolve correctly".

## Features

- Automatically scans all notes in the vault
- Builds an **outlinks index**: which notes the current note links to
- Builds a **backlinks index**: which notes link to the current note
- Builds a **filename index**: the mapping from filenames to paths (supporting `[[Note Name]]` resolution and autocomplete)
- Supports **incremental updates**, avoiding repeated full scans

## How It Works

### Index Building

1. Scans the entire vault on startup
2. Parses all `[[03-Knowledge-Management/01-Wiki-Links]]` and `![[Embed]]` in Markdown files
3. Builds a bidirectional link relationship table

### Incremental Updates

- Watches filesystem changes (create / delete / rename / modify)
- Updates only the link relationships of the affected files
- When a file is renamed, attempts to update the links pointing to it so they do not break

### Index Contents

| Index type | Description |
| --- | --- |
| Outlinks | Which notes the current note links to |
| Backlinks | Which notes link to the current note |
| Filename | Filename → path mapping, supporting resolution and autocomplete |

## Performance Optimizations

- **Batch processing**: processes at most 50 files at a time to avoid occupying the main thread all at once
- **Background async**: index building runs in the background and does not block editing
- **Incremental first**: everyday editing only triggers small-scale updates

> [!TIP]
> With a very large vault, the initial index build on first startup may take a little time; afterwards it is always lightweight incremental updates.

## Use Cases

The link index provides data for the following features:

- [[03-Knowledge-Management/03-Backlinks]] panel display
- [[03-Knowledge-Management/04-Knowledge-Graph]] rendering
- [[03-Knowledge-Management/01-Wiki-Links]] autocomplete
- [[05-Navigation-Search/01-Quick-Open]] file search
- [[04-File-Management/02-File-Tree]] link repair after rename

## Related Documents

- [[03-Knowledge-Management/01-Wiki-Links]] — Wiki link syntax
- [[03-Knowledge-Management/03-Backlinks]] — Backlinks
- [[03-Knowledge-Management/04-Knowledge-Graph]] — Knowledge graph
