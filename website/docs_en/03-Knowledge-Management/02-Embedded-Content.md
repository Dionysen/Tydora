---
title: Embedded Content
tags: [knowledge]
---

# Embedded Content

Embedding lets you display the content of **other notes or media** directly in the current note, rather than only placing a jump link. It is often used to reuse templates, aggregate materials, and centrally manage images.

> [!NOTE]
> The syntax is to prepend `!` to a Wiki link: `![[Note Name]]`.

## Basic Syntax

```markdown
![[Note Name]]
```

The current note will **inline-render** all the content of "Note Name".

## Embedding a Heading

Embed only a specific heading and its sub-content from the target note:

```markdown
![[Note Name#Heading]]
```

Suitable for extracting a single section from a long note for reuse.

## Embedding an Image

```markdown
![[image.png]]
```

Images in the vault are displayed directly at the current position (the standard `![alt](path)` syntax is also supported).

## Embedding Video / Audio

```markdown
![[video.mp4]]
![[audio.mp3]]
```

Video and audio files in the vault are rendered as inline players.

## Use Cases

- **Quoting paragraphs**: embed common descriptions and definitions from a "mother note" in multiple places; update one place and it changes everywhere
- **Centrally managing images**: store images uniformly in an `assets`-style folder and reference them via embedding in the body text
- **Content aggregation pages**: use embedding to combine multiple notes into a "daily / weekly report / index page"
- **Reusing templates**: embed a template note into a new note to quickly apply its structure

> [!TIP]
> Embedding works best combined with [[03-Knowledge-Management/01-Wiki-Links]]: use `[[Note]]` to jump and `![[Note]]` to inline, choosing as needed.

## Notes and Cautions

- Embedded content is **read-only** and cannot be edited directly in the current note
- Modifying the source note is **reflected synchronously** in all the places that embed it
- Multimedia files such as images, video, and audio can be embedded
- Deeply nested embedding (A embeds B, B embeds C) also expands normally

## Related Documents

- [[03-Knowledge-Management/01-Wiki-Links]] — Wiki link syntax
- [[04-File-Management/04-File-Preview]] — Multimedia file preview
- [[03-Knowledge-Management/03-Backlinks]] — Backlinks
