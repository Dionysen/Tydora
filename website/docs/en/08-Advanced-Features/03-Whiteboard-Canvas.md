---
title: Whiteboard Canvas
tags: [feature]
---

# Whiteboard Canvas

The Whiteboard Canvas is built on **React Flow** and provides an **infinite canvas** where you can freely organize ideas, notes, images, media, and links using nodes — like spreading them out on paper, yet infinitely extendable and easily connected.

> [!NOTE]
> Whiteboard files are saved with the `.canvas` extension and use the Obsidian-compatible JSON Canvas format.

## Opening a Whiteboard

1. Right-click in the file tree and select "New Whiteboard"; or
2. Search for "Whiteboard" in the command palette (`Ctrl+P`) and create one; or
3. Open an existing `.canvas` file.

A whiteboard opens in the main area and participates in the file tree and recent files management like a normal note.

## Node Types

The whiteboard supports several node types to cover different organizational needs:

### Text Node

A freely editable text block, rendered instantly with the TipTap editor.

- Supports Markdown syntax
- Can be dragged and resized freely
- Suitable for annotations, explanations, and quick notes

### Note Card

References a Markdown file in the Vault.

- Displays the note's title and summary
- Click to jump to the original note
- Interoperates with the `[[03-Knowledge-Management/01-Wiki-Links]]` system

### File Reference

References media files such as images, videos, audio, and PDFs.

- Images display a thumbnail directly
- Videos / audio show a play icon
- PDFs show a file icon

### Image Node

Displays image content directly.

- Supports zooming and cropping
- Images can be dragged in from the Vault or locally

### URL Node

Embeds an external link.

- Displays the site title and description
- Click to open the link in your browser

### Group Node

Groups multiple nodes together.

- Drag a node into a group to add it
- Internal nodes follow when the group is moved
- Supports nested groups to build hierarchy

## Canvas Operations

| Action | Description |
| --- | --- |
| Wheel zoom | Zoom in / out the view |
| Middle-button drag | Pan the canvas |
| Right-button drag | Pan the canvas |
| Box selection | Hold and drag to select multiple nodes (hold `Shift` to add to selection) |
| Alignment guides | Alignment lines appear automatically when dragging nodes for tidy arrangement |

## Toolbar

The toolbar at the top of the whiteboard provides:

| Tool | Description |
| --- | --- |
| Select | Select and move nodes |
| Text | Add a text node |
| Note | Add a note card |
| Image | Add an image |
| Media | Add a media file |
| URL | Add a link node |
| Group | Create a group |
| Undo / Redo | Operation history |

## File Format

Whiteboards use the **JSON Canvas** format (`.canvas`), compatible with the Obsidian whiteboard format:

- **Cross-platform compatibility**: Interoperable between tools that support the format
- **Version controllable**: Pure-text JSON, suitable for inclusion in Git
- **Human-readable**: Can be viewed and hand-edited directly

## Pop-out Window Mode

A whiteboard can be opened in a separate Tauri window:

- Supports multiple monitors, so you can place the whiteboard on a secondary screen
- Operating it independently does not affect editing in the main window
- Window position and size are automatically saved and restored

> [!TIP]
- Use "Note Cards" to connect the whiteboard with your knowledge base: the whiteboard handles ideation and layout, while notes store the details; the two reference each other.

## Related Documents

- [[04-File-Management/02-File-Tree]] — File management
- [[01-Getting-Started/01-Quick-Start]] — Getting started guide
- [[03-Knowledge-Management/01-Wiki-Links]] — Bidirectional links
