---
title: Image Settings
tags: [Settings]
---

# Image Settings

Image settings determine the **storage method, naming rules, and default behavior** when pasting or dragging images, letting you freely choose between "managed with repository" and "centralized storage".

> [!NOTE]
> Press `Ctrl+,` to open Settings, then switch to the "Image" tab.

## Storage Mode

### Repository Assets (Recommended)

Images are saved in a **designated folder within the current repository** (e.g., `assets/`).

- Pros: Images are managed, moved, and backed up together with the repository; links are less likely to break
- Cons: Repository size grows as more images are added

### Fixed Directory

Images are saved in a **fixed local directory**, decoupled from specific repositories.

- Pros: Multiple repositories can share the same image library
- Cons: Paths depend on the local environment; they may break when switching machines or moving directories

### Image Hosting

Images are uploaded to a **third-party image hosting service**, with only the web link kept in notes.

- Pros: Does not consume local or repository space
- Cons: Requires internet access; some hosting services may incur costs; depends on external service availability

## File Naming Format

Set the auto-generated filename when pasting / dragging images:

- `YYYYMMDDHHmmss` — e.g., `20240101120000.png`, uniquely named by timestamp
- `Random String` — e.g., `a1b2c3.png`, short and non-repeating
- `Original Filename` — Preserves the image's original filename

> [!TIP]
> For multi-person collaboration or traceability, "Original Filename" is more intuitive; for personal notes, "YYYYMMDDHHmmss" avoids naming collisions.

## Fixed Directory Path

When the storage mode is set to "Fixed Directory", set the image save path here.

## Paste Behavior

Set the default action when pasting images:

- **Auto-save to repository** — Directly write to disk and create a link
- **Ask for save location** — Prompt for confirmation each time
- **Insert reference only** — Do not copy the file; only insert a reference to an existing path

## Supported Formats

Pasting and dragging supports the following image formats:

- PNG
- JPG / JPEG
- GIF
- WebP
- BMP

> [!NOTE]
> For image preview methods, see [[04-文件管理/04-文件预览]]; for embedding images in notes, see [[03-知识管理/02-嵌入内容]].

## Related Documents

- [[04-文件管理/04-文件预览]] — Image preview
- [[04-文件管理/03-文件操作]] — File management
- [[07-设置/01-通用设置]] — Basic settings
