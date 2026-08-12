---
title: Knowledge Graph
tags: [knowledge]
---

# Knowledge Graph

The knowledge graph visualizes the link relationships between notes, helping you rise from the "single note" perspective to the "knowledge network" perspective and discover structure, cores, and islands.

> [!NOTE]
> Shortcut: `Ctrl+G`. The graph is rendered as a D3.js force-directed graph and can be opened in a separate window or in the main area (see "How to Open" below).

## Features

- D3.js-based **force-directed graph**: nodes attract / repel each other and automatically cluster together
- **Node size** reflects the number of links (the more it is referenced, the larger it is)
- **Edge thickness** reflects link frequency
- Supports zooming, dragging, and click-to-navigate

## How to Open

Press `Ctrl+G` to open the graph. Its behavior is determined by settings:

- If "Open in a new window" is enabled (the graph setting in [[07-Settings/05-Mindmap-Settings]]), it is displayed in a separate Tauri window, supporting multiple monitors
- Otherwise, it is displayed as a panel in the main area

## Reading the Graph

### Nodes

- The circle size indicates the number of links for that note
- Notes that are referenced more often have larger nodes and are more likely to be "core notes"
- Colors can represent note groupings (for example, by folder)

### Edges

- Represent the [[03-Knowledge-Management/01-Wiki-Links]] relationship between notes
- Edge thickness indicates the frequency of the link
- The arrow direction indicates the reference direction (A → B means A references B)

### Layout

- The force-directed graph automatically seeks a balanced layout
- Densely connected notes cluster together
- Isolated (unlinked) notes are scattered around the edges

## Usage

1. Press `Ctrl+G` to open the knowledge graph.
2. View the network of note relationships in the window.
3. **Click a node** to open the corresponding note.
4. Use the **mouse wheel** to zoom, and **drag nodes** to adjust the layout.
5. Hover over a node to display its title.

## Use Cases

- Get an overview of the **overall structure** of the knowledge network
- Identify **core notes** (those with the largest nodes)
- Discover **isolated notes** (those without edges) and go back to add links
- Understand the threads and clusters of the knowledge system

## Related Settings

- [[07-Settings/05-Mindmap-Settings]] — parameters such as graph node size, edge thickness, and force-directed strength

## Related Documents

- [[03-Knowledge-Management/01-Wiki-Links]] — Wiki link syntax
- [[03-Knowledge-Management/03-Backlinks]] — Backlinks
- [[03-Knowledge-Management/05-Link-Index]] — Link index mechanism
- [[08-Advanced-Features/02-Mindmap]] — Mind map
