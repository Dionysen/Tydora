---
title: Frontmatter（元数据）
tags: [编辑器]
---
# Frontmatter（元数据）

Tydora 支持 YAML Frontmatter，允许你在 Markdown 文件开头定义元数据。

## 基本语法

在文件开头使用 `---` 包裹 YAML 数据块：

```yaml
---
title: 我的笔记标题
tags: [标签1, 标签2]
date: 2024-01-01
---
```

## 支持的属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `title` | string | 文档标题 |
| `tags` | string[] | 标签列表 |
| `date` | string | 创建日期 |
| `publish` | string | 发布状态（`public` 表示公开） |
| `author` | string | 作者 |
| `description` | string | 文档描述 |

## 属性面板

Tydora 提供专用的 Frontmatter 属性面板：

- **可折叠面板**：在编辑器顶部显示当前文件的 Frontmatter
- **排序显示**：常用属性（title、tags、date 等）优先显示
- **一键复制**：复制完整的 YAML 块到剪贴板

## 发布控制

Frontmatter 中的 `publish` 属性控制发布行为：

```yaml
---
title: 公开笔记
publish: public
---
```

设置 `publish: public` 后，使用"仅公开笔记"模式发布网站时，该笔记会被包含。

## 编写规范

- Frontmatter 必须位于文件**最开头**
- 使用 `---` 开始和结束
- 支持标准 YAML 语法（字符串、数字、布尔值、数组、对象）
- 属性名区分大小写

## 相关文档

- [[Markdown语法]] — 完整语法支持
- [[编辑模式]] — 编辑模式介绍
