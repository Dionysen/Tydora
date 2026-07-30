---
title: Markdown 语法支持
tags: [编辑器]
---

# Markdown 语法支持

Tydora 基于 TipTap 3.x + CodeMirror 6 引擎，支持完整的 CommonMark 与 GitHub 风格（GFM）语法，并扩展了 WikiLink、Callout、数学公式、Mermaid、脚注等多种能力。本页汇总写作时最常用的语法。

> [!NOTE]
> 以下示例既可在**即时渲染**模式下直接输入（会自动渲染），也可在**源码模式**下以纯文本编写。切换方式见 [[编辑模式]]。

## 基础语法

### 标题

```markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
```

> 快捷设置标题级别：`Ctrl+Alt+1` ~ `Ctrl+Alt+6`，`Ctrl+Alt+0` 恢复为正文段落。详见 [[设置/快捷键速查]]。

### 文本格式

```markdown
**加粗**
*斜体*
~~删除线~~
`行内代码`
==高亮文本==
```

### 列表

```markdown
- 无序列表项
- 另一项

1. 有序列表项
2. 另一项

- [ ] 未完成任务
- [x] 已完成任务
```

### 链接与图片

```markdown
[链接文本](https://example.com)
![图片描述](图片路径.png)
```

### 引用

```markdown
> 这是引用块
> 支持多行内容
```

### 代码块

使用三个反引号包裹，并标注语言以获得高亮：

````markdown
```javascript
function hello() {
  console.log("Hello, Tydora!");
}
```
````

> 详见 [[代码块]]。

## GFM 扩展

### 表格

```markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容 | 内容 | 内容 |
```

> 表格的创建与编辑也可以在即时渲染下用浮动工具栏完成，详见 [[表格操作]]。

### 自动链接

直接书写 URL 即可自动识别为链接：

```
https://example.com
```

### 任务列表

见上文「列表」中的 `- [ ]` / `- [x]` 语法。`Ctrl+Shift+J` 可切换任务完成状态。

## 扩展语法

### Callout 提示块

GitHub 风格的提示块，共 15 种类型，用引用块加 `[!TYPE]` 声明：

```markdown
> [!NOTE]
> 这是一个普通提示

> [!TIP]
> 这是一个小技巧

> [!WARNING]
> 这是一个警告
```

支持的类型：`NOTE`、`TIP`、`IMPORTANT`、`WARNING`、`CAUTION`、`ABSTRACT`、`INFO`、`SUCCESS`、`QUESTION`、`FAILURE`、`DANGER`、`BUG`、`EXAMPLE`、`QUOTE`、`FAQ`。

> 完整类型与折叠控制见 [[Callout块]]。

### 脚注

```markdown
正文内容需要补充说明[^1]

[^1]: 这是脚注的具体内容。
```

### 目录

在文中插入 `[toc]` 可生成当前文档的目录（依赖设置中的「目录」开关）。

```markdown
[toc]
```

### 上标与下标

```markdown
上标：X^2^
下标：H~2~O
```

### YAML Frontmatter

文件开头的 `---` 块用于定义元数据：

```yaml
---
title: 文档标题
tags: [标签1, 标签2]
date: 2024-01-01
---
```

> 详见 [[Frontmatter]]。

## 知识管理语法

### Wiki 链接

```markdown
[[笔记名]]
[[笔记名|显示别名]]
[[笔记名#标题]]
```

> 详见 [[Wiki链接]]。

### 嵌入内容

```markdown
![[笔记名]]
![[笔记名#标题]]
![[图片.png]]
```

> 详见 [[嵌入内容]]。

## 数学公式

支持 KaTeX 与 MathJax 双引擎：

```markdown
行内公式：$E=mc^2$

块级公式：
$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$
```

> 详见 [[数学公式]]。

## Mermaid 图表

```markdown
```mermaid
graph TD
    A[开始] --> B{判断}
    B -->|是| C[执行]
    B -->|否| D[退出]
```
```

> 详见 [[Mermaid图表]]。

## 相关文档

- [[数学公式]] — 公式详解
- [[代码块]] — 代码高亮
- [[表格操作]] — 表格编辑
- [[Callout块]] — 提示块类型
- [[Frontmatter]] — 元数据
- [[Wiki链接]] — 双向链接语法
- [[编辑模式]] — 编辑模式介绍
