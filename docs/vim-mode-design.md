# Tydora Vim 模式设计文档（LazyVim 风格）

> 目标：为 Tydora 增加一个贴近 LazyVim 体验的 Vim 模式，作为**独立模块**存在，默认关闭，开启时不破坏任何现有功能与快捷键体系。

---

## 一、设计目标


| # | 目标         | 说明                                                                                      |
| --- | -------------- | ------------------------------------------------------------------------------------------- |
| 1 | LazyVim 体验 | normal/insert/visual 三态、Space 作 Leader、which-key 风格快捷菜单、单键执行              |
| 2 | 独立模块     | 所有代码集中在`src/vim/`，对外只暴露最小入口，内部实现不外泄                              |
| 3 | 零侵入       | 不修改现有`shortcuts.json`、不删现有 `Ctrl+X` 快捷键、不开 Vim 模式时行为与现在 100% 一致 |
| 4 | 可开关       | 设置面板一键开关，默认关闭；关闭时 Vim 模块完全不加载、不监听事件                         |
| 5 | 双编辑器协调 | 源码模式（CodeMirror）用 `@replit/codemirror-vim`；所见即所得（TipTap）用 `vim-prose`，双模式均享完整 Vim 三态 |

---

## 二、现状盘点（勘探结论）

1. **编辑器**：双编辑器并存
   - 源码模式：[CodeMirrorEditor.tsx](file:///d:/code/Tydora/src/Editor/CodeMirrorEditor.tsx)，CodeMirror 6
   - 所见即所得：[TipTapEditor.tsx](file:///d:/code/Tydora/src/Editor/TipTapEditor.tsx)，TipTap/ProseMirror
2. **快捷键体系**：[shortcuts.json](file:///d:/code/Tydora/src/config/shortcuts.json) + [shortcuts.ts](file:///d:/code/Tydora/src/Editor/shortcuts.ts)，全 `Ctrl+X` 风格，存 `localStorage["zmd-shortcuts"]`，可在设置面板自定义
3. **文件树**：自研 [Sidebar.tsx](file:///d:/code/Tydora/src/Sidebar.tsx)，有右键 ContextMenu、`FileActions` 接口（新建/重命名/删除/复制/移动/打开），**无键盘快捷键**
4. **命令面板**：已有 [CommandPalette.tsx](file:///d:/code/Tydora/src/components/CommandPalette.tsx)，`Ctrl+P` 唤起，模糊搜索 + 键盘导航
5. **Vim 基础设施**：**完全没有**，`package.json` 无任何 vim 依赖

---

## 三、范围界定

### 3.1 本期做（In Scope）

- 完整三态 Vim 模态（normal / insert / visual）于 **CodeMirror 源码模式**
- LazyVim 风格键位映射（hjkl 移动、w/b 词移动、d/c/y 操作符、i/a/o 进入 insert、v/V 进入 visual 等）
- Space 作 Leader 的 which-key 风格快捷菜单（右下角弹出，背景透明，单键执行）
- `m` 前缀键：Markdown 格式化动作（mb=加粗, mi=斜体…）
- `g` / `z` 前缀键：Vim 原生命令（由 `@replit/codemirror-vim` 内置支持）
- 文件树 nvim-tree 风格快捷键（聚焦时 j/k/a/d/r/x/c/p/y 等）
- 窗口导航：`<leader>h/j/k/l` + `Ctrl+h/j/k/l` 焦点切换，`<leader>H/J/K/L` + `Ctrl+H/J/K/L` 窗格移动
- 设置面板 Vim 分组（开关、Leader 键、键位自定义）
- 模式指示器（状态栏 `-- INSERT --` / `-- NORMAL --` / `-- VISUAL --`）

### 3.2 本期不做（Out of Scope）

- ~~TipTap 所见即所得的完整模态编辑~~（已实现：接入 `vim-prose` 库，支持 normal/insert/visual 模态）
- 宏录制与回放（`q` 录制）
- 命令行模式（`:` ex 命令）的完整实现，仅做几个高频命令（`:w` `:q` `:x`）
- 多光标（`Ctrl-n` 选词）
- 与 Git/终端的 Vim 风格集成

### 3.3 边界原则

> **Vim 模式是叠加层，不是替换层。**

- 现有 `Ctrl+B`（加粗）等快捷键 **保留不动**
- Vim normal 态下 `Ctrl+X` 系列仍可用（与 Vim 不冲突，因 Vim 不用 Ctrl 修饰做主操作）
- Leader 菜单触发的动作，**复用**现有 `executeCommand` 与 CodeMirror 命令，不重复实现业务逻辑

---

## 四、整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                              │
│   <VimProvider enabled={vimEnabled}>                       │
│      ┌───────────────┐    ┌──────────────────────────┐      │
│      │  Sidebar.tsx  │    │  Editor (CM / TipTap)    │      │
│      │  ┌──────────┐ │    │  ┌────────────────────┐  │      │
│      │  │FileTreeVim│◄┼────┼──┤ VimAdapter (注入)  │  │      │
│      │  │  (聚焦时) │ │    │  │  - CM: codemirror- │  │      │
│      │  └──────────┘ │    │  │    vim 扩展         │  │      │
│      └───────┬───────┘    │  │  - TipTap: vim-prose│  │      │
│              │            │  │    扩展              │  │      │
│              │            │  └─────────┬──────────┘  │      │
│              │            └────────────┼─────────────┘      │
│              │                         │                    │
│              ▼                         ▼                    │
│      ┌──────────────────────────────────────────┐           │
│      │      LeaderMenu.tsx (which-key 风格)      │           │
│      │      右下角 · 背景完全透明                │           │
│      │      读 src/vim/config/leader.ts          │           │
│      └────────────────────┬─────────────────────┘           │
│                           │                                 │
│      ┌────────────────────▼─────────────────────┐          │
│      │   src/vim/  (独立模块，全部代码在此)       │          │
│      │   ├── index.ts        唯一对外入口         │          │
│      │   ├── VimProvider.tsx 模式状态 + 开关     │          │
│      │   ├── config/        键位/Leader 配置      │          │
│      │   ├── leader/        Leader 菜单组件       │          │
│      │   ├── codemirror/    CM vim 集成          │          │
│      │   ├── navigation/    窗口导航             │          │
│      │   ├── filetree/      文件树快捷键适配     │          │
│      │   └── settings/      设置面板             │          │
│      └────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 数据流

1. 用户在设置开启 Vim → `VimProvider.enabled = true`
2. `VimAdapter` 向 CodeMirror 注入 `codemirror-vim` 扩展 + 自定义 keymap
3. normal 态按 Space → `LeaderMenu` 弹出（右下角，背景透明），读 `leader.ts`
4. 按单键（如 `e`）→ 菜单查表 → 调用对应动作 → 关闭菜单
5. normal 态按 `m` → `LeaderMenu` 弹出 Markdown 格式化菜单 → 按 `b` 加粗
6. 文件树聚焦时 → `FileTreeVim` 拦截 keydown → 映射到 `FileActions`

---

## 五、模块目录结构

所有 Vim 相关代码集中在 `src/vim/`，**不散落到其他目录**。

```
src/vim/
├── index.ts                    # 唯一对外入口
├── VimProvider.tsx             # 模式状态 Context + 开关 + 配置加载
├── types.ts                    # Mode、LeaderItem、VimConfig 等类型
│
├── config/
│   ├── leader.ts               # Leader 菜单结构配置（TS 导出，避免 esbuild JSON 问题）
│   ├── leader.json             # Leader 配置备份（与 leader.ts 同步）
│   ├── prefixM.ts              # m 前缀键配置（Markdown 格式化动作）
│   └── configLoader.ts         # 加载 + 合并用户自定义（存 localStorage["zmd-vim-config"]）
│
├── leader/
│   ├── LeaderMenu.tsx          # which-key 风格菜单组件（右下角 · 透明背景）
│   ├── LeaderMenu.css          # 菜单样式
│   └── useLeader.ts            # Leader 触发/超时/键位匹配 hook（支持自定义 initialItems）
│
├── codemirror/
│   ├── vimExtension.ts         # 封装 @replit/codemirror-vim + 自定义 keymap 注入
│   └── markdownActions.ts      # CodeMirror 源码模式下的 Markdown 格式化动作
│
├── tiptap/
│   └── tiptapVimExtension.ts   # 封装 vim-prose 集成：条件注入 VimMode + mode 同步
│
├── navigation/
│   └── useWindowNavigation.ts  # Ctrl+h/j/k/l + Ctrl+H/J/K/L 窗口导航
│
├── filetree/
│   └── FileTreeVim.tsx         # 文件树 keydown 适配器（HOC）
│
└── settings/
    └── VimSettingsPanel.tsx    # 设置面板 Vim 分组
```

### 对外入口（`src/vim/index.ts`）

```ts
export { VimProvider, useVim } from "./VimProvider";
export { createVimExtension } from "./codemirror/vimExtension";
export type { VimAdapterOptions } from "./codemirror/vimExtension";
export { createTiptapVimExtensions, syncVimMode, mapVimMode } from "./tiptap/tiptapVimExtension";
export { FileTreeVim } from "./filetree/FileTreeVim";
export { useLeader } from "./leader/useLeader";
export type { UseLeaderOptions, UseLeaderReturn } from "./leader/useLeader";
export { LeaderMenu } from "./leader/LeaderMenu";
export { executeCodeMirrorAction } from "./codemirror/markdownActions";
export { useWindowNavigation } from "./navigation/useWindowNavigation";
export { loadVimConfig, saveVimConfig, VIM_CONFIG_KEY, DEFAULT_VIM_CONFIG } from "./config/configLoader";
export type { VimConfig, VimMode, VimState } from "./types";
```

---

## 六、模式系统（Mode System）

### 6.1 三态定义


| 模式       | 进入                   | 退出          | 行为                                                   |
| ------------ | ------------------------ | --------------- | -------------------------------------------------------- |
| **Normal** | `Esc`                  | `i/a/o` 等    | 不可输入文字；hjkl 移动；d/c/y 操作符；Space 弹 Leader；m 弹 Markdown 菜单 |
| **Insert** | `i/a/o/I/A/O`          | `Esc`         | 正常打字；Space=空格；现有 Ctrl+X 快捷键保留           |
| **Visual** | `v`（字符）/ `V`（行） | `Esc`/`y`/`d` | 选区高亮；操作符作用于选区                             |

### 6.2 状态管理

CodeMirror 的 vim 扩展自带模式状态（`cm.state.vim.mode`），`VimProvider` 通过订阅 CM 的 `vim-mode-change` 事件同步到 React Context，供状态栏与 Leader 菜单消费。

TipTap 的 vim-prose 通过 `getVimMode(editor)` 暴露模式，在 `editor.on('transaction')` 中读取并调用 `setMode` 同步到 VimProvider。

### 6.3 TipTap 的 Vim 模态（vim-prose）

TipTap 通过 `vim-prose` 库接入完整 Vim 模态（normal/insert/visual/replace/visual-line）。策略：

- `vim-prose` 的 `VimMode` extension 通过 `useEditor` 的 `deps: [vimEnabled]` 条件注入
- Vim 关闭时 `createTiptapVimExtensions(false)` 返回空数组，零侵入
- Vim 开启时 `VimMode` 注入 ProseMirror plugin，接管按键
- Leader 键统一为 **Space**（与 CodeMirror 一致），`useLeader` 在 capture 阶段拦截，vim-prose 收不到
- g/z 前缀用 passive 模式，which-key 仅作视觉引导，按键由 vim-prose 原生执行
- insert 模式只拦截 `Esc`/`Ctrl-c`，其余按键透传给 ProseMirror 原生处理
- 设计理念：**Paragraph = line**（段落节点 = Vim 行，`j/k` 在段落间跳转）

> 两种编辑器模式体验完全一致：Space 弹 Leader 菜单、`m` 弹 Markdown 菜单、`g`/`z` 前缀有 which-key 引导、`i/a/o/Esc` 切换模式。

---

## 七、which-key 快捷键体系

### 7.1 Leader 键（`<Leader>` = 空格）

Leader 键是用户自定义的特殊键，用于触发个人或插件定义的快捷键。默认将**空格键**设置为 Leader 键。所有以 Leader 开头的映射都是扩展功能。

**菜单 UI**：右下角弹出，背景完全透明，3 秒超时自动关闭，Esc 关闭。

| 快捷键 | 功能 |
| --- | --- |
| `<Leader>e` | 切换文件树（侧栏没有打开自动打开侧栏，侧栏打开关闭侧栏） |
| `<Leader>o` | 打开文件（快速打开面板） |
| `<Leader>f` | 查找当前文件中的符号（等同 Ctrl+F） |
| `<Leader>s` | 全局搜索文本（侧栏切换到搜索） |
| `<Leader>M` | 模式切换 源码/所见即所得 |
| `<Leader>\` | 水平分屏（等同 Ctrl+\） |
| `<Leader>-` | 垂直分屏（等同 Ctrl+-） |
| `<Leader>/` | 命令面板 |

### 7.2 窗格管理

| 快捷键 | 功能 |
| --- | --- |
| `<Leader>x` | 关闭当前窗格（未保存弹出保存提醒） |
| `<Leader>h` / `j` / `k` / `l` | 在窗口间移动焦点（左/下/上/右） |
| `<Leader>H` / `J` / `K` / `L` | 移动当前窗格到最左/最下/最上/最右 |
| `Ctrl+h` / `j` / `k` / `l` | 同 `<Leader>h` / `j` / `k` / `l` |
| `Ctrl+H` / `J` / `K` / `L` | 同 `<Leader>H` / `J` / `K` / `L`（仅适用于窗格） |

> 注：`<Leader>H/J/K/L` 使用 Shift+字母，大小写敏感匹配。

### 7.3 前缀键

前缀键是 Vim 本身定义的一类键，它们后面通常需要再按一个或多个键来构成完整命令。`g` 和 `z` 是 Vim 标准前缀，`m` 是 Tydora 自定义的 Markdown 前缀。

#### `g` — Vim 原生常用（由 `@replit/codemirror-vim` 内置支持）

| 快捷键 | 功能 |
| --- | --- |
| `gg` | 跳到文件首行 |
| `G` | 跳到文件末行 |
| `gJ` | 连接行但不插入空格 |
| `g0` / `g^` / `g$` | 跳转到屏幕行首/首个非空字符/行尾 |
| `g~` / `gu` / `gU` | 切换/转为小写/转为大写（配合移动命令） |
| `gf` | 打开光标下的文件 |
| `gx` | 打开光标下的 URL/文件（系统默认程序） |
| `g;` / `g,` | 跳转到较旧/较新的光标位置 |
| `g_` | 跳转到当前行最后一个非空字符 |

#### `z` — 滚动与光标定位（由 `@replit/codemirror-vim` 内置支持）

| 快捷键 | 功能 |
| --- | --- |
| `zz` | 将当前行置于屏幕中央 |
| `zt` | 将当前行置于屏幕顶部 |
| `zb` | 将当前行置于屏幕底部 |
| `z.` | 将当前行置于屏幕中央并移动光标到首个非空字符 |
| `z-` | 将当前行置于屏幕底部并移动光标 |

#### `m` — Markdown 格式化前缀（Tydora 自定义）

在 normal 模式下按 `m` 弹出 which-key 菜单，再按对应键执行格式化：

| 快捷键 | 功能 |
| --- | --- |
| `mb` | 加粗 |
| `mi` | 斜体 |
| `ms` | 删除线 |
| `me` | 行内代码 |
| `mk` | 超链接 |
| `m=` | 高亮 |
| `mc` | 代码块 |
| `mq` | 引用 |
| `m-` | 分隔线 |
| `mh` → `1`~`6` | H1~H6 标题 |
| `mh` → `0` | 段落 |
| `ml` → `u` | 无序列表 |
| `ml` → `o` | 有序列表 |
| `ml` → `c` | 任务列表 |
| `ml` → `t` | 切换任务状态 |

> `m` 前缀在 CodeMirror 源码模式与 TipTap 所见即所得模式 normal 态下均可用。

### 7.4 动作命名空间

`action` 字段用 `域.动作id` 格式，由分发器统一路由：


| 域         | 来源 | 分发路径 |
| ------------ | ------ | ---------- |
| `editor.*` | CodeMirror: `markdownActions.ts`；TipTap: `executeCommand` | 编辑器内直接执行 |
| `app.*`    | App.tsx 的 `vimAppHandlersRef` | 全局 `vim-app-action` 事件分发 |
| `vim.*`    | Vim 模块内部 | 内部处理 |

**关键：动作执行走现有通道，Vim 模块不重新实现业务逻辑。**

---

## 八、Normal 模式核心键位


| 键                      | 动作                                     | 说明                                 |
| ------------------------- | ------------------------------------------ | -------------------------------------- |
| `h` `j` `k` `l`         | 左下上右移动                             | cm-vim 内置                          |
| `w` `b` `e`             | 词移动                                   | cm-vim 内置                          |
| `0` `^` `$`             | 行首/首字符/行尾                         | cm-vim 内置                          |
| `gg` `G`                | 文件首/末                                | cm-vim 内置                          |
| `Ctrl-d` `Ctrl-u`       | 半屏下/上滚                              | cm-vim 内置                          |
| `i` `a` `o` `I` `A` `O` | 进入 insert（前/后/下行/行首/行末/上行） | cm-vim 内置                          |
| `v` `V`                 | 字符/行 visual                           | cm-vim 内置                          |
| `d` `c` `y` `p`         | 删除/改/复制/粘贴                        | cm-vim 内置                          |
| `u` `Ctrl-r`            | 撤销/重做                                | cm-vim 内置                          |
| `x` `X`                 | 删字符                                   | cm-vim 内置                          |
| `dd` `cc` `yy`          | 行操作                                   | cm-vim 内置                          |
| `Space`                 | **Leader 菜单**                          | 自定义，覆盖 cm-vim 默认（右移光标） |
| `m`                     | **Markdown 前缀菜单**                    | 自定义，覆盖 cm-vim 默认（set mark） |
| `:`                     | ex 命令行                                | 仅`:w` `:q` `:x` `:wq`               |
| `/` `n` `N`             | 搜索/下一个/上一个                       | cm-vim 内置，复用 CM 搜索            |

---

## 九、文件树键位（聚焦时，nvim-tree 风格）

点击文件树后可用：

| 键          | 动作                 |
| ------------- | ---------------------- |
| `j` `k`     | 下/上移动选中        |
| `l` / `Enter` | 打开文件 / 展开目录 |
| `h`         | 折叠目录 / 跳到父目录 |
| `a`         | 新建文件             |
| `A`         | 新建文件夹           |
| `r`         | 重命名               |
| `d`         | 删除                 |
| `y`         | 复制路径             |
| `q`         | 退出文件树（焦点回到编辑器） |

---

## 十、与现有功能的隔离策略

### 10.1 代码隔离

- 所有 Vim 代码在 `src/vim/`，**不修改** `src/Editor/`、`src/Sidebar.tsx`、`src/config/shortcuts.json`
- 对外通过 `index.ts` 的符号交互
- 文件树接入用 **HOC 包裹**：`FileTreeVim(Sidebar)`，在 App 层条件包裹
- App.tsx 仅添加：`vim-app-action` 事件监听、`useWindowNavigation` 调用、`VimSidebar` 包裹

### 10.2 配置隔离

- Vim 键位存 **独立** localStorage 键 `zmd-vim-config`，不碰 `zmd-shortcuts`
- 现有 `shortcuts.json` 一字不改
- Vim 的 `editor.*` action 通过 **运行时查表** 复用现有 shortcuts 的 id，而非复制键位

### 10.3 运行时隔离

- Vim 模式 **默认关闭**，关闭时：
  - `VimProvider.enabled = false` → 不注入 CM 扩展、不挂文件树 HOC、不渲染 Leader 菜单
  - 零事件监听、零开销
- 开启时：CM 的 vim 扩展是一个独立的 Extension，与现有 keymap 共存

### 10.4 回退保证

- 任何时候关闭 Vim 开关 → 立即恢复原状，无残留状态
- Vim 模块出 bug 不影响默认编辑流程（因默认关闭，且模块边界清晰）

---

## 十一、依赖与开关

### 11.1 新增依赖

```
@replit/codemirror-vim ^6.x
```

仅此一个。该库是 CodeMirror 6 的 vim 实现，与现有 CM6 版本兼容。

### 11.2 设置面板入口

在 [Settings.tsx](file:///d:/code/Tydora/src/Settings.tsx) 新增「Vim 模式」分组：


| 项                   | 类型           | 默认            |
| ---------------------- | ---------------- | ----------------- |
| 启用 Vim 模式        | 开关           | 关              |
| Leader 键            | 文本（单字符） | `Space`（源码/所见即所得统一） |
| 菜单超时             | 数字(ms)       | 3000            |

---

## 十二、实施路线图

### Phase 0 · 地基（模块骨架）✅ 已完成

- 创建 `src/vim/` 目录与 `index.ts`、`VimProvider.tsx`、`types.ts`
- `VimProvider` 实现 enabled/mode 状态 + Context
- 安装 `@replit/codemirror-vim`
- 设置面板加 Vim 开关
- App.tsx 注入 VimProvider

### Phase 1 · CodeMirror Vim 集成 ✅ 已完成

- `codemirror/vimExtension.ts` 封装 vim 扩展 + 条件注入
- 模式指示器
- 验收：开启 Vim 后，源码模式可用 hjkl/insert/visual；关闭后恢复

### Phase 2 · Leader 菜单组件 ✅ 已完成

- `leader/LeaderMenu.tsx` + `useLeader.ts`
- `config/leader.ts` 配置
- normal 态按 Space 弹菜单，右下角弹出，背景透明
- 验收：Leader 菜单可用

### Phase 3 · Leader 全量动作 ✅ 已完成

- 补全 leader.ts 所有分组（文件/窗口/列表/窗格管理等）
- `action` 分发器：`editor.*` 接 `executeCodeMirrorAction`/`executeCommand`，`app.*` 接 App handler
- 验收：Leader 菜单覆盖所有快捷键能力

### Phase 4 · TipTap Vim 模态接入 ✅ 已完成

- 引入 `vim-prose` 库，TipTap 接入完整 Vim 模态（normal/insert/visual）
- `useEditor` deps `[vimEnabled]` 条件注入 `VimMode` 扩展
- mode 同步：`editor.on('transaction')` → `getVimMode` → `setMode`
- Leader 键统一为 Space（移除 `tiptapLeaderKey` 配置）
- g/z/m 前缀 which-key 接入（与 CodeMirror 模式一致）
- 验收：所见即所得模式 `Space` 弹 Leader 菜单、`i/a/o/Esc` 切换模式、`hjkl` 移动

### Phase 5 · 文件树 Vim 快捷键 ✅ 已完成

- `filetree/FileTreeVim.tsx` HOC
- 在 App 层用 `FileTreeVim` 包裹 Sidebar（仅 enabled 时）
- 实现 j/k/h/l/Enter/a/A/r/d/y/q
- 验收：文件树聚焦时全键盘操作可用

### Phase 6 · 窗口导航 ✅ 已完成

- `navigation/useWindowNavigation.ts`：Ctrl+h/j/k/l + Ctrl+H/J/K/L
- App.tsx 实现 `focusPane` 和 `movePaneToEdge`
- `<Leader>h/j/k/l` 和 `<Leader>H/J/K/L` 通过 Leader 菜单触发
- 验收：全程无鼠标切换焦点

### Phase 7 · which-key 重构 ✅ 已完成

- 重构 Leader 键映射：`<Leader>e/o/f/s/m/\\/-/x` 等
- `m` 前缀键：Markdown 格式化动作（mb=加粗等）
- `g` / `z` 前缀键：Vim 原生（由 cm-vim 内置）
- LeaderMenu CSS：右下角定位 + 背景完全透明
- 大小写敏感匹配（区分 h 和 H）
- 验收：which-key 体系完整可用

### Phase 8 · 打磨（待实施）

- ex 命令（`:w` `:q` `:x`）
- 设置面板键位自定义 UI
- i18n、文档、边缘 case
- 验收：完整 LazyVim 体验

---

## 十三、风险与权衡


| 风险                                        | 影响 | 缓解                                                         |
| --------------------------------------------- | ------ | -------------------------------------------------------------- |
| `@replit/codemirror-vim` 与现有 CM 扩展冲突 | 中   | 用 Compartment 隔离扩展，已验证共存                            |
| TipTap vim-prose 切换时丢失撤销历史           | 低   | `useEditor` deps 重建 Editor；文档内容不丢失，撤销历史可接受  |
| Space 作 Leader 覆盖 cm-vim 默认右移        | 低   | cm-vim 支持自定义 keymap，Space 映射到 Leader 而非默认       |
| `m` 前缀覆盖 cm-vim 默认 set mark           | 低   | 设计如此；set mark 在 Markdown 编辑器中非高频操作            |
| 文件树 HOC 包裹影响现有 ContextMenu         | 低   | HOC 只加 keydown 监听，不改 ContextMenu 逻辑                 |
| Vim 与现有 Ctrl+X 快捷键冲突                | 低   | Vim 不用 Ctrl 修饰做主操作；Ctrl+X 在 normal/insert 都可用   |
| esbuild 对 JSON 静态导入失败                | 低   | 改用 TS 文件导出配置常量（leader.ts），避免 optimizeDeps 问题 |

---

## 十四、验收标准

### 14.1 零侵入验收

- [x] Vim 开关关闭时，仅 `src/vim/` 新增 + 设置面板入口 + App 条件注入
- [x] 关闭 Vim 后，所有现有快捷键、右键菜单、命令面板行为与开启前一致
- [x] `localStorage["zmd-shortcuts"]` 不被 Vim 模块读写

### 14.2 功能验收

- [x] 源码模式：normal/insert/visual 三态完整，hjkl/d/c/y/v/V 可用
- [x] `<Space>` 弹 Leader 菜单（右下角，透明背景），单键执行
- [x] `<Leader>e` 切换文件树，`<Leader>o` 打开文件，`<Leader>f` 查找，`<Leader>s` 全局搜索
- [x] `<Leader>\` 水平分屏，`<Leader>-` 垂直分屏，`<Leader>x` 关闭窗格
- [x] `<Leader>h/j/k/l` 焦点切换，`Ctrl+h/j/k/l` 同功能
- [x] `<Leader>H/J/K/L` 移动窗格，`Ctrl+H/J/K/L` 同功能
- [x] `m` 前缀：`mb` 加粗，`mi` 斜体，`mh1` H1 标题等
- [x] `g` / `z` 前缀：gg/G/zz/zt/zb 等（cm-vim 内置）
- [x] 文件树聚焦：j/k/h/l/a/A/r/d/y/q 全可用
- [x] TipTap 模式 `Space` 弹 Leader 菜单（vim-prose 完整模态）
- [x] 状态栏显示 `-- NORMAL/INSERT/VISUAL --`

### 14.3 模块化验收

- [x] `src/vim/` 之外的文件改动最小化（App.tsx、CodeMirrorEditor、TipTapEditor、Sidebar）
- [x] `src/vim/index.ts` 导出清晰
- [x] Vim 模块无对 `src/Editor`、`src/Sidebar` 内部实现的直接依赖（只通过 props/callbacks/事件）
