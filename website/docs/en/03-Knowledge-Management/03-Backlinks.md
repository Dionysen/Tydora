---
title: Backlinks
tags: [knowledge]
---

# Backlinks

The backlinks panel shows **which notes link to the current note**. It reverses "who I referenced" into "who referenced me", and is the key view for discovering hidden associations between notes.

> [!NOTE]
> Switch to the "Backlinks" tab in the left sidebar to view it. It relies on the [[03-Knowledge-Management/05-Link-Index]] background service, which is maintained in real time.

## Features

- **Real-time updates**: after adding / removing a link, backlinks refresh immediately
- **Context snippets**: not only shows the source note, but also displays the context sentences where the link appears
- **One-click jump**: click any entry to directly open the source note and locate the position

## Usage

1. Open any note.
2. Switch to the "Backlinks" tab at the top of the left sidebar.
3. View the list of all sources that reference the current note.
4. Click an entry to jump back to the source note.

## Use Cases

- **Discover hidden associations**: you may have forgotten that a note references the current content; backlinks help you recover it
- **Review references**: sort out "what content is supporting the current viewpoint"
- **Assess importance**: notes that are referenced more often tend to be more central
- **Find broken / orphan notes**: notes without backlinks may be "information silos" worth reviewing and supplementing with links

> [!TIP]
> Works best combined with the [[03-Knowledge-Management/04-Knowledge-Graph]]: backlinks show a "linear list", while the graph shows the "network structure".

## Link Index

Backlinks are powered by the [[03-Knowledge-Management/05-Link-Index]] service. Tydora automatically builds and maintains link relationships in the background, with no need to refresh manually.

## Related Documents

- [[03-Knowledge-Management/01-Wiki-Links]] — Wiki link syntax
- [[03-Knowledge-Management/05-Link-Index]] — Link index mechanism
- [[03-Knowledge-Management/04-Knowledge-Graph]] — Knowledge graph visualization
