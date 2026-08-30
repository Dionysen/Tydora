---
title: Code Blocks
tags: [Editor]
---

# Code Blocks

Inimark provides full syntax highlighting support for code, covering **36 programming languages** by default, with line numbers and one-click copy.

## Creating Code Blocks

### Method 1: Markdown Syntax

Use three backticks to wrap code, and specify the language name for corresponding highlighting:

````markdown
```javascript
function hello() {
  console.log("Hello, Inimark!");
}
```
````

> [!TIP]
> Specifying a language (e.g., `js`, `python`, `rust`) enables the corresponding syntax highlighting; leaving it blank displays as plain text.

### Method 2: Shortcut

Press `Ctrl+U` to directly insert a code block.

### Method 3: Context Menu

1. Right-click in the editing area.
2. Select "Insert" → "Code Block."
3. Choose a programming language.

## Supported Languages

Covers mainstream languages, including but not limited to:

JavaScript, TypeScript, Python, Java, C / C++, Go, Rust, Ruby, PHP, Swift, Kotlin, SQL, HTML, CSS, Shell, JSON, YAML, Markdown, and more — **36 languages** in total.

## Inline Code

Use a single backtick to wrap code snippets, suitable for variable names, commands, etc. within body text:

```markdown
Use `console.log()` to output logs
```

> Shortcut: `Ctrl+E`.

## Line Numbers

Code blocks display line numbers by default for easy reference and citation. They can be turned off in [[07-Settings/02-Editor-Settings]].

## Copying Code

Hover over the top-right corner of a code block and click the **Copy** button that appears to copy the code content to the clipboard.

## Code Highlighting Themes

The color scheme of code blocks is independent of the application theme and can be switched in [[07-Settings/02-Editor-Settings]]. There are 11 highlighting themes in total:

- Light: Atom One Light, GitHub Light, VS Code Light, Solarized Light
- Dark: Atom One Dark, GitHub Dark, VS Code Dark, Nord, Monokai, Dracula, Solarized Dark

> You can also have it automatically switch between light/dark highlighting themes based on the application appearance. See [[06-Themes-and-Appearance/03-Code-Highlighting-Themes]].

## Related Settings

- [[07-Settings/02-Editor-Settings]] — Code highlighting themes and line number toggle
- [[06-Themes-and-Appearance/03-Code-Highlighting-Themes]] — Highlighting theme selection

## Related Documents

- [[02-Editor/02-Markdown-Syntax]] — Syntax details
- [[02-Editor/09-Context-Menu]] — Right-click operations
- [[02-Editor/04-Math-Formulas]] — Formula rendering
- [[02-Editor/05-Mermaid-Diagrams]] — Diagram code blocks
