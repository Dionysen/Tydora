---
title: Typora Themes
tags: [Themes]
---

# Typora Themes

Tydora supports importing and using **Typora CSS theme files**, allowing you to bring your familiar Typora visual style into Tydora.

> [!NOTE]
> The import entry is in the "Themes" tab of Settings. After importing, the theme will appear below the built-in theme list and can be switched to at any time.

## Import Method

1. Open Settings (`Ctrl+,`).
2. Switch to the "Themes" tab.
3. Click "Import Theme".
4. Select a Typora `.css` theme file.
5. After confirming, the theme is added to the list and immediately available for use.

## Theme File Location

Imported themes are saved in Tydora's **theme resource directory** (you can view and change this directory in [[07-Settings/01-General-Settings]]). You can manage the CSS files directly in that directory.

## Compatibility Notes

Tydora is built on the TipTap 3.x + CodeMirror 6 engine, which differs from Typora's rendering engine, so theme rendering may vary:

### Areas with Good Compatibility

- Color schemes (background, text, accent colors)
- Font settings
- Basic typography and layout
- Code block styles

### Areas That May Differ

- Complex CSS animations
- Styles relying on specific DOM structures
- Some custom component appearances

> [!TIP]
> If a certain style doesn't look ideal after import, you can directly edit the corresponding CSS file in the theme resource directory to fine-tune it. The changes will take effect after switching themes.

## Managing Themes

### Viewing Imported Themes

In the "Themes" tab of Settings, imported themes are listed alongside built-in themes.

### Deleting Themes

1. Hover over the target theme in the theme list.
2. Click the delete (trash) icon.
3. Confirm deletion.

> [!WARNING]
> Deleting a theme removes its file. Notes currently using that theme will fall back to the default theme.

## Related Settings

- [[07-Settings/01-General-Settings]] — Theme resource directory

## Related Documents

- [[06-Themes-Appearance/01-Built-in-Themes]] — Built-in theme list
- [[06-Themes-Appearance/03-Code-Highlight-Themes]] — Code highlight themes
