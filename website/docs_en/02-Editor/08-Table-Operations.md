---
title: Table Operations
tags: [Editor]
---

# Table Operations

Tydora provides convenient table editing capabilities: you can write tables using standard Markdown syntax, or use the floating toolbar in Instant Rendering mode to visually add/delete rows and columns and adjust alignment.

> [!NOTE]
> Insert table shortcut: `Ctrl+T`. In Instant Rendering mode, placing the cursor inside a table will display a floating toolbar.

## Creating Tables

### Method 1: Markdown Syntax

```markdown
| Col1 | Col2 | Col3 |
|------|------|------|
| Content | Content | Content |
```

### Method 2: Shortcut

Press `Ctrl+T` to insert a default-sized table.

### Method 3: Context Menu

1. Right-click in the editing area.
2. Select "Insert" → "Table."
3. In the pop-up grid selector, drag to select the number of rows and columns, then click to confirm.

## Editing Tables

### In Instant Rendering Mode

- Place the cursor inside a table, and a **table floating toolbar** will appear above, allowing you to: insert rows/columns, delete the table, resize.
- Type directly in cells, and press Tab to move to the next cell.

### Adding and Deleting Rows/Columns

| Operation | Shortcut | Notes |
| --- | --- | --- |
| Insert row above | `Ctrl+Shift+F` | — |
| Insert row below | `Ctrl+Shift+.` | — |
| Insert column to the left | `Ctrl+Shift+G` | — |
| Insert column to the right | `Ctrl+Shift+=` | — |
| Delete row | `Ctrl+-` | — |
| Delete column | `Ctrl+Shift+-` | Can also delete via right-click |

### Cell Alignment

Use colons in the Markdown separator row to set alignment:

```markdown
| Left Aligned | Center Aligned | Right Aligned |
|:-------------|:-------------:|-------------:|
| Content      | Content       | Content      |
```

Shortcuts:

| Alignment | Shortcut |
| --- | --- |
| Left Align | `Ctrl+Shift+L` |
| Center Align | `Ctrl+Shift+C` |
| Right Align | `Ctrl+Shift+R` |

## Adjusting in Source View

In Source View mode, directly edit the pipe table; Tydora will maintain column alignment as you type for easier reading.

> [!TIP]
> When dealing with many columns, it is recommended to first use the floating toolbar in Instant Rendering mode to add columns, then use shortcuts for batch alignment — this is more efficient.

## Related Documents

- [[02-Editor/02-Markdown-Syntax]] — Detailed table syntax
- [[02-Editor/09-Context-Menu]] — Right-click operations
- [[07-Settings/04-Keyboard-Shortcuts]] — Table-related shortcuts
