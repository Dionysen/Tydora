# 内嵌终端（Embedded Terminal）功能实现总览

> 项目：Tydora（Tauri v2 + Vite + React 19 + TypeScript）
> 目标：让"终端"面板像"编辑器"面板一样，支持左右/上下分屏与混排，并接入现有分屏树。

## 一、架构决策

| 决策点 | 选择 | 理由 |
| --- | --- | --- |
| 布局归属 | 终端与编辑器**共用同一棵分屏树**（`splitLayout`） | 一套分屏/拖拽/折叠逻辑，零额外布局代码 |
| PTY 方案 | 真实交互式 PTY（`portable-pty`） | 不是伪终端/只读日志，可真实运行 shell |
| 前端渲染 | xterm.js + `@xterm/addon-fit` | 业界标准终端渲染 |
| 输出传输 | Tauri 事件 + **base64 字节流** | 避免半截多字节 UTF-8 序列在前端解码失败 |
| 持久化 | 终端会话**不持久化**（PTY 无法跨进程存活） | 重启后终端自然消失，无需恢复 |
| 分屏语义 | 终端分屏=新建独立 PTY（不共享） | 每个终端是独立 shell 会话 |

## 二、文件清单

### Rust 后端（`src-tauri/`）
- `src/commands/terminal_commands.rs`（新增）—— `TerminalManager`（`Mutex<HashMap<id, TerminalSession>>`）与各命令：
  - `spawn_terminal(app, manager, id, cwd, shell?)`：起 PTY + 独立读线程，base64 输出经 `terminal-output` 事件推送；进程退出/EOF 时推 `terminal-closed`。
  - `write_terminal(manager, id, data)` / `resize_terminal(manager, id, cols, rows)` / `kill_terminal(manager, id)`。
  - `default_shell()`：Windows 优先 `pwsh.exe` 回退 `cmd.exe`；其他用 `$SHELL` 回退 `bash`。
- `src/commands/mod.rs` —— 加 `pub mod terminal_commands;`
- `src/lib.rs` —— 注册 4 个命令 + `app.manage(TerminalManager::default());`
- `Cargo.toml` —— 加 `portable-pty = "0.8"`、`base64 = "0.22"`

### 前端（`src/`）
- `src/Terminal/terminalApi.ts`（新增）—— IPC 封装：`spawnTerminal/writeTerminal/resizeTerminal/killTerminal`、事件监听 `listenTerminalOutput/listenTerminalClosed`、`base64ToBytes` 等常量与类型。
- `src/Terminal/TerminalView.tsx`（新增）—— 单终端渲染组件：建 xterm、FitAddon、监听输出写屏、ResizeObserver→fit+resize、卸载→`killTerminal`+dispose；工具栏含左右/上下分屏 + 关闭按钮；浅/深两套 `XTERM_THEMES`。
- `src/Terminal/Terminal.css`（新增）—— `.terminal-pane/.terminal-toolbar/.terminal-body` 及 `terminal-theme-light/dark` 两套样式。
- `src/App.tsx`（集成）：
  - `Pane` 接口扩展 `{ id, kind: "editor"|"terminal", bufferId?, terminalId?, mode }`。
  - 派生 `isActiveTerminal` / `layoutHasTerminal`；`terminals` 登记表（`Record<terminalId,{id,cwd}>`）。
  - 助手：`defaultCwd / makeTerminalPane / spawnPaneBeside / handleOpenTerminalPane / handleSplitTerminalBeside / handleSplit(终端分支) / handleToggleTerminal`。
  - `renderPane`：终端分支返回 `<TerminalView>`。
  - `editor-panel` 渲染条件加 `layoutHasTerminal` 边界：纯终端（无 md 缓冲）也能渲染分屏树，不再落入欢迎页/CodeMirror 兜底。
  - 入口：命令面板加 `new-terminal`；顶栏 more 菜单加"新建终端"；快捷键 **Ctrl+`** 开/分屏终端（toggle）；放宽 `split-lr/split-tb` 守卫（编辑器 md 或终端均可触发）。
- `src/config/shortcuts.json` —— 加 `terminal-new`（app/editor/commandDisplay）。
- `src/i18n/locales/zh-CN.json` + `en-US.json` —— 加 `newTerminal` 三处文案。

## 三、关键边界处理

1. **渲染分支**：`!fileName && !content.trim() && !layoutHasTerminal` → 欢迎页；`isCurrentFileMarkdown || layoutHasTerminal` → 分屏树。保证"仅终端"场景渲染正确。
2. **孤儿清理**：`closePane` 在移除窗格后，过滤 `terminals` 表仅保留仍被剩余窗格引用的终端；PTY 实际 kill 由 `TerminalView` 卸载时的 `killTerminal` 兜底。
3. **主题切换**：`TerminalView` 的 `theme` 进入 effect 依赖，切换时重建终端以保证 xterm 配色正确（PTY 为临时会话，影响可控）。
4. **关闭窗口快捷键**：多面板时优先关闭当前激活面板（`closePane`），仅剩单面板才走窗口关闭流程。

## 四、验证结果

- ✅ 前端类型检查：`npx tsc --noEmit` → EXIT 0
- ✅ 后端编译：`cargo check`（含 portable-pty 编译）→ EXIT 0，无 warning
- ✅ xterm 依赖已安装（`@xterm/xterm`、`@xterm/addon-fit`）

## 五、手动测试清单

1. 命令面板（`Ctrl+P`）搜索"新建终端" → 应在当前面板旁出现终端。
2. 顶栏 more 菜单 → "新建终端"。
3. 按 `Ctrl+`` → 首次新建终端；再按（编辑器聚焦时）跳到已有终端；终端聚焦时再按无副作用。
4. 终端工具栏"左右/上下分屏"按钮 → 再开一个独立终端。
5. 编辑器打开 md 文件后，对该编辑器窗格点"左右分屏"，验证编辑器克隆（共享缓冲、联动）；对终端窗格点"左右分屏"，验证新建独立终端。
6. 混合布局：md 编辑器 + 终端 左右并排，终端可正常输入命令、看到彩色输出、resize 窗口自动 fit。
7. 关闭终端窗格（工具栏 X / 关闭快捷键）→ 终端进程退出，登记表中对应条目被清理，无孤儿 PTY 残留。
8. 切换应用浅/深主题 → 终端配色随之切换。
9. `Ctrl+\` / `Ctrl+-`：编辑器聚焦时正常分屏编辑器；终端聚焦时正常分屏终端。

## 六、已知限制 / 后续可优化

- 终端会话不跨重启持久化（设计如此）。
- 终端面板文案（工具栏按钮 title/aria-label）当前为硬编码中文，未走 i18n；如需多语言可再抽取。
- `TerminalView` 的 `cwd` 进入 effect 依赖，若外部把某 remaining 终端的 cwd 改成空串会触发重建；当前 `closePane` 不会改动 remaining 终端的 cwd，故安全。
