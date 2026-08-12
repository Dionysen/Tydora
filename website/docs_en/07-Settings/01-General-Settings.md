---
title: General Settings
tags: [Settings]
---

# General Settings

General settings manage the application's **appearance, fonts, and auto-save** — the first place you should look after every installation.

> [!NOTE]
> Press `Ctrl+,` to open Settings, which defaults to the "General" tab.

## Appearance Mode

Configure the app's light / dark appearance:

- **Follow System** — Automatically match the operating system's appearance setting
- **Light** — Force light mode
- **Dark** — Force dark mode

> A single theme's look and feel changes with the appearance mode; dark themes (such as Mint Dark) look best in "Dark" mode. See [[06-Themes-Appearance/01-Built-in-Themes]].

## Font Settings

### Editor Font

Select the font used in the editor:

- System Default
- LXGW WenKai (Xiawu Wenkai, ideal for Chinese writing)
- Monospace (suitable for code and table alignment)
- Other system-installed fonts

### Font Size

Adjust the editor body font size, ranging from **12–32 px**. Drag the slider or enter a value directly.

> [!TIP]
> For Chinese writing, we recommend LXGW WenKai at 16–18 px; for code-heavy scenarios, use a monospace font.

## Auto-Save

When enabled, files are **automatically written to disk** approximately 1 second after you stop typing, eliminating the need to frequently press `Ctrl+S`.

### Delay Time

Set the auto-save wait duration (in seconds) to avoid triggering a write on every keystroke. The default value balances timeliness and performance.

> [!NOTE]
> Even with auto-save enabled, `Ctrl+S` can still be used for immediate saving.

## Theme Resource Directory

View and modify the storage location of theme files. Imported [[06-Themes-Appearance/02-Typora-Themes]] themes and custom themes are all saved in this directory, where you can directly manage their CSS files.

## Related Documents

- [[06-Themes-Appearance/01-Built-in-Themes]] — Theme selection
- [[07-Settings/02-Editor-Settings]] — Editor configuration
- [[07-Settings/03-Keyboard-Shortcuts]] — Keyboard shortcut configuration
- [[06-Themes-Appearance/02-Typora-Themes]] — Theme resource directory guide
