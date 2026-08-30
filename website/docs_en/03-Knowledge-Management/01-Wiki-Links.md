---
title: Wiki Links
tags: [knowledge]
---

# Wiki Links

Wiki links are the core of Inimark's knowledge management: using `[[Note Name]]` you can establish **bidirectional links** between notes, weaving scattered notes into a network. The syntax is consistent with Obsidian.

> [!NOTE]
> Typing `[[` triggers autocomplete, and you can filter target notes by entering keywords. Link resolution relies on [[03-Knowledge-Management/05-Link-Index]].

## Basic Syntax

### Link to a Note

```markdown
[[Note Name]]
```

Renders as a clickable link; clicking it jumps to the corresponding note.

### Link with an Alias

```markdown
[[Note Name|Display Text]]
```

Displays "Display Text" but points to "Note Name". Suitable for natural references within a sentence.

### Link to a Heading

```markdown
[[Note Name#Heading]]
```

Jumps directly to the specified heading position in the target note.

## Usage

1. Type `[[` in the editor.
2. Continue typing the note name (fuzzy matching is supported).
3. Select the target from the autocomplete list.
4. Press `Enter` to confirm, and the link is inserted.

> [!TIP]
> The candidate list shows matching file paths, so notes with identical names can still be distinguished accurately.

## Autocomplete

After typing `[[`, Inimark displays a list of matching notes:

- **Fuzzy search** supported: type a partial keyword to filter
- Real-time updates: filters as you type
- Keyboard operation: `↑` / `↓` to select, `Enter` to confirm, `Esc` to close

## Link to a Nonexistent Note

If the note a link points to does not yet exist, clicking the link will **automatically create** the new note and open it. This makes a "link first, fill in later" writing flow very smooth.

## Embedded Content

Adding `!` before `[[` embeds (rather than jumps to) the content of another note:

```markdown
![[Note Name]]
```

> See [[03-Knowledge-Management/02-Embedded-Content]] for details.

## Backlinks

When other notes link to the current note, the [[03-Knowledge-Management/03-Backlinks]] panel lists all the sources, helping you discover "who referenced me".

## Knowledge Graph

All `[[03-Knowledge-Management/01-Wiki-Links]]` relationships are aggregated into the [[03-Knowledge-Management/04-Knowledge-Graph]], presented as a visual network.

## Related Documents

- [[03-Knowledge-Management/02-Embedded-Content]] — Content embedding
- [[03-Knowledge-Management/03-Backlinks]] — Backlinks
- [[03-Knowledge-Management/04-Knowledge-Graph]] — Knowledge graph
- [[03-Knowledge-Management/05-Link-Index]] — Link index mechanism
