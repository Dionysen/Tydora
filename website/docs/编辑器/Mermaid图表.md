---
title: Mermaid 图表
tags: [编辑器]
---
# Mermaid 图表

Tydora 集成了 Mermaid 图表引擎，支持在 Markdown 中直接绘制流程图、时序图、甘特图等多种图表。

## 基本语法

使用 `mermaid` 代码块编写图表：

````markdown
```mermaid
graph TD
    A[开始] --> B{判断}
    B -->|是| C[执行]
    B -->|否| D[退出]
```
````

## 支持的图表类型

### 流程图（Flowchart）

```mermaid
graph LR
    A[开始] --> B(处理)
    B --> C{判断}
    C -->|Y| D[完成]
    C -->|N| E[重试]
```

````markdown
```mermaid
graph LR
    A[开始] --> B(处理)
    B --> C{判断}
    C -->|Y| D[完成]
    C -->|N| E[重试]
```
````

### 时��图（Sequence Diagram）

````markdown
```mermaid
sequenceDiagram
    Alice->>Bob: 你好
    Bob-->>Alice: 你好！
    Alice->>Bob: 在做什么？
    Bob-->>Alice: 写代码
```
````

### 甘特图（Gantt Chart）

````markdown
```mermaid
gantt
    title 项目计划
    dateFormat  YYYY-MM-DD
    section 阶段
    设计           :a1, 2024-01-01, 7d
    开发           :a2, after a1, 14d
    测试           :a3, after a2, 7d
```
````

### 类图（Class Diagram）

````markdown
```mermaid
classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
```
````

### 状态图（State Diagram）

````markdown
```mermaid
stateDiagram-v2
    [*] --> 待处理
    待处理 --> 处理中
    处理中 --> 已完成
    处理中 --> 失败
    已完成 --> [*]
    失败 --> 待处理
```
````

## 编辑器功能

在 Mermaid 代码块中，编辑器提供：

- **实时预览**：编写代码时自动渲染图表预览
- **内嵌编辑器**：Mermaid 代码块内部使用专用编辑器
- **语法高亮**：Mermaid 语法自动高亮

## 样式主题

Mermaid 图表的配色会跟随应用主题自动调整，确保在浅色和深色模式下都有良好的可读性。

## 相关文档

- [[Markdown语法]] — 完整语法支持
- [[代码块]] — 代码块功能
