# 白板画布快捷键清单（设置-快捷键面板）

目标：在「设置 - 快捷键」面板中新增「白板画布」分组的快捷键，使用户可以像编辑器的快捷键一样查看、修改、重置画布快捷键。

## 一、现状盘点

1. 画布快捷键定义在 `src/config/shortcuts.json` 的 `canvas` 段，共 8 项（undo / redo / redo-alt / copy / paste / select-all / deselect / arrow-move），由 `CanvasView.tsx` 直接硬编码引用，**未进入设置-快捷键面板**，用户无法自定义。
2. 设置-快捷键面板（`Settings.tsx` 的 `ShortcutsSettingsContent`）只管理 `editor` 数组，默认值来自 `shortcuts.json`，自定义结果存 `localStorage["zmd-shortcuts"]`，分组目前有：格式 / 列表 / 标题 / 插入 / 表格 / 编辑 / 视图 / 模式 / 系统等。
3. 另有 React Flow 内置、不经过配置的交互：Delete 删除、Shift 多选、Space 平移、滚轮缩放、Ctrl+滚轮缩放、双击创建文本卡片。

## 二、建议添加的快捷键清单

分为四组：A 现有功能纳入面板；B/C/D 为建议新增。

### A. 编辑类（现有功能，直接纳入，保持默认键）

| ID（建议） | 功能 | 默认键 | 说明 |
| --- | --- | --- | --- |
| canvas-undo | 撤销 | Ctrl+Z | 已实现 |
| canvas-redo | 重做 | Ctrl+Y | 已实现 |
| canvas-redo-alt | 重做（备选键位） | Ctrl+Shift+Z | 已实现，与上一项二选一触发 |
| canvas-copy | 复制选中节点 | Ctrl+C | 已实现 |
| canvas-paste | 粘贴 | Ctrl+V | 已实现（含图片/URL 粘贴） |
| canvas-select-all | 全选节点 | Ctrl+A | 已实现 |
| canvas-deselect | 取消选择 | Escape | 已实现 |
| canvas-delete | 删除选中节点 | Delete | React Flow 内置，改为可配置（deleteKeyCode） |
| canvas-move-up | 上移选中节点 | ArrowUp | 原 arrow-move 拆分；Shift 微调 1px，否则 15px |
| canvas-move-down | 下移选中节点 | ArrowDown | 同上 |
| canvas-move-left | 左移选中节点 | ArrowLeft | 同上 |
| canvas-move-right | 右移选中节点 | ArrowRight | 同上 |

### B. 插入类（新增，建议）

对应工具栏/右键菜单的节点创建操作。

| ID（建议） | 功能 | 建议默认键 | 说明 |
| --- | --- | --- | --- |
| canvas-add-text | 添加文本卡片 | Ctrl+Shift+T | T = Text |
| canvas-add-note | 添加笔记卡片 | Ctrl+Shift+N | N = Note |
| canvas-add-media | 添加媒体文件 | Ctrl+Shift+M | 含 .canvas 内嵌画布；避开编辑器 Ctrl+M（打开思维导图） |
| canvas-add-link | 添加链接 | Ctrl+Shift+K | 与编辑器超链接 Ctrl+K 同语义、加 Shift 区分 |
| canvas-add-group | 添加分组 | Ctrl+Shift+G | G = Group |

### C. 视图类（新增，建议）

对应画布右下角 Controls 组件的操作。

| ID（建议） | 功能 | 建议默认键 | 说明 |
| --- | --- | --- | --- |
| canvas-zoom-in | 放大 | Ctrl+= | 兼容 Ctrl+加号 |
| canvas-zoom-out | 缩小 | Ctrl+- | |
| canvas-fit-view | 适应视图 | Ctrl+Shift+F | F = Fit，避开编辑器 Ctrl+F（查找） |
| canvas-reset-zoom | 重置缩放 100% | Ctrl+0 | 可选；画布独立窗口，与编辑器「段落」Ctrl+0 不冲突 |

### D. 对齐类（新增，可选，仅多选时生效）

对应选中节点后出现的 AlignmentToolbar 六个按钮。若觉得键位过多，可只保留水平对齐三项，垂直对齐留在工具栏。

| ID（建议） | 功能 | 建议默认键 | 说明 |
| --- | --- | --- | --- |
| canvas-align-left | 左对齐 | Ctrl+Shift+L | |
| canvas-align-hcenter | 水平居中 | Ctrl+Shift+C | |
| canvas-align-right | 右对齐 | Ctrl+Shift+R | |
| canvas-align-top | 顶对齐 | Ctrl+Shift+E | 可选 |
| canvas-align-vcenter | 垂直居中 | Ctrl+Shift+O | 可选 |
| canvas-align-bottom | 底对齐 | Ctrl+Shift+B | 可选 |

## 三、冲突分析

1. 画布是独立窗口（CanvasWindow），与编辑器窗口的键盘事件互不干扰，因此与编辑器快捷键在运行时不冲突；但设置面板是统一的，为避免用户困惑，画布键位已尽量与编辑器已有的 Ctrl+K / Ctrl+T / Ctrl+M / Ctrl+O / Ctrl+P / Ctrl+F / Ctrl+Shift+L/C/R / Ctrl+Shift+G/E/B 等错开。
2. 画布内部：新增键位与现有 8 项不重复；Ctrl+Shift+M 只用于「添加媒体」，画布内无其他占用。
3. 方向键作为无修饰键组合录入：设置面板按键录制逻辑（`Settings.tsx` handleKeyDown）对 `e.key` 直接取键名，支持 ArrowUp/Down/Left/Right、Delete、Enter、Space 等，无需改造即可录制。

## 四、实现要点（供后续开发）

1. `src/config/shortcuts.json`：将 `canvas` 对象重构为数组 `{ id, label, keys, group }`，结构与 `editor` 对齐；`arrow-move` 拆成 4 个独立条目；`group` 建议用「画布」「画布插入」「画布视图」「画布对齐」，或统一为「画布」。
2. `src/Settings.tsx`：
   - `DEFAULT_SHORTCUTS` 改为 `[...editor, ...canvas]`；
   - `shortcutGroupNames` 增加画布分组文案；
   - `shortcutLabelMap` 补充画布各项 ID 的 i18n 标签；
   - 注意：当前 `handleKeyDown` 中 `if (e.key === "Escape")` 分支会先于录制逻辑执行（录制态按 Escape 会退出编辑），导致 **Escape 无法被录入为快捷键**。若要支持「取消选择 Escape」可自定义，需调整该分支（例如录制态按 Escape 时只退出录制、通过点击 ✕ 按钮退出）。
3. `src/Canvas/CanvasView.tsx`：从 `localStorage["zmd-shortcuts"]` 读取画布快捷键并 `matchShortcut`（保留 shortcuts.json 默认值兜底）；`deleteKeyCode` 改为读取配置后传给 ReactFlow；新增的插入/视图/对齐快捷键在此处注册 keydown 处理。
4. `src/i18n/locales/zh-CN.json` 与 `en.json`：补充 `settings.shortcuts.labels.*` 及画布分组名。
5. 可选的「打开白板」全局快捷键不在本次范围内，需要时可另立条目。

## 五、待用户确认的点

- 对齐类是否全部 6 项都要快捷键，还是只保留水平 3 项；
- 「重置缩放 Ctrl+0」是否需要；
- B/C 组默认键位是否接受（可在实现前调整）。
