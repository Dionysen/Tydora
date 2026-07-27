---
title: Callout 提示块
tags: [编辑器]
---
# Callout 提示块

Tydora 支持 GitHub 风格的 Callout（标注块）语法，帮助你更好地组织和突出笔记中的重要内容。

## 基本语法

Callout 使用 Markdown 引用块扩展语法：

```markdown
> [!TYPE]
> 这是 Callout 的内容
```

## 类型列表

Tydora 提供 15 种内置 Callout 类型，各有独特的图标和配色：

| 类型 | 语法 | 用途 |
|------|------|------|
| NOTE | `[!NOTE]` | 一般性备注 |
| TIP | `[!TIP]` | 小技巧或建议 |
| IMPORTANT | `[!IMPORTANT]` | 重要信息 |
| WARNING | `[!WARNING]` | 警告信息 |
| CAUTION | `[!CAUTION]` | 需要注意的事项 |
| ABSTRACT | `[!ABSTRACT]` | 摘要或概述 |
| INFO | `[!INFO]` | 信息说明 |
| SUCCESS | `[!SUCCESS]` | 成功或正向信息 |
| QUESTION | `[!QUESTION]` | 问题 |
| FAILURE | `[!FAILURE]` | 失败或错误信息 |
| DANGER | `[!DANGER]` | 危险警告 |
| BUG | `[!BUG]` | Bug 相关 |
| EXAMPLE | `[!EXAMPLE]` | 示例 |
| QUOTE | `[!QUOTE]` | 引用内容 |
| FAQ | `[!FAQ]` | 常见问题 |

## 折叠控制

Callout 支持 `+` 和 `-` 修饰符控制默认折叠状态：

- `[!NOTE]+` — 默��展开
- `[!NOTE]-` — 默认折叠
- `[!NOTE]` — 默认展开

## 使用示例

```markdown
> [!TIP]
> 按 `Ctrl+S` 可以快速保存当前文件。

> [!WARNING]
> 删除文件后无法恢复，请谨慎操作。

> [!FAQ]- 
> **Q: 如何切换编辑模式？**
> 按 `Ctrl+/` 可以切换 IR / SV 模式。
```

## 相关文档

- [[Markdown语法]] — 完整语法支持
- [[编辑模式]] — 编辑模式介绍
