# 所见即所得（IR）模式 Vim 实现方案

> 目标：TipTap 所见即所得模式接入完整 Vim 模态（normal/insert/visual），与 CodeMirror 源码模式体验一致，Space 作 Leader 键，g/z/m 前缀 which-key 统一。

---

## 1. 调研结论

### 1.1 候选库对比

| 维度 | vim-prose | vim-prosemirror |
|---|---|---|
| 仓库 | [Kyle-Shanks/vim-prose](https://github.com/Kyle-Shanks/vim-prose) | [KevinChristian30/vim-prosemirror](https://github.com/KevinChristian30/vim-prosemirror) |
| 版本 | v0.3.1（2026-03） | 无 release（2026-07） |
| Commits | 12 | 7 |
| Tiptap 版本 | v3 | v3 |
| 模式 | normal/insert/replace/visual/visual-line | normal/insert/visual/visual-line/replace |
| Motions | h j k l 0 ^ $ gg G w b f F t T Ctrl-d/u/f/b | 同左 + W B E ge ; , { } % H M L + - _ g_ \| |
| Operators | d y c dd yy cc D Y C x p P r R J >> << | 同左 |
| Text Objects | iw aw i( a( i[ a[ i{ a{ i< a< i' a' i" a" i\` a\` | 同左 |
| Marks | m{char} '{char} | m{char} '{char} |
| Search | / n N * | / n N * |
| Dot Repeat | ✅ | ✅ |
| Count Prefix | ✅ | ✅ |
| Clipboard | 系统剪贴板 | 系统剪贴板 |
| 状态行 API | `getVimStatus(editor)` | `getVimStatus(editor)` |
| 设计理念 | Paragraph = line（适配富文本） | 跨平台（ProseMirror 文档位置解析） |

### 1.2 推荐：vim-prose

理由：
1. **更成熟** — 3 个版本发布，12 commits，有 CHANGELOG
2. **设计理念适配富文本** — 段落节点 = Vim 行，`j/k` 在段落间跳转
3. **Insert 模式透传** — insert 态只拦截 `Esc`/`Ctrl-c`，其余按键透传给 ProseMirror 原生处理，不影响富文本输入
4. **文档完善** — README 详细列出所有快捷键和设计说明
5. **API 简洁** — `VimMode` extension + `getVimMode()` / `getVimStatus()` 两函数

---

## 2. 技术架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────┐
│                  VimProvider                     │
│  config.enabled / mode / leaderKey / setMode     │
│                                                  │
│  ┌──────────────┐       ┌──────────────────┐   │
│  │ CodeMirror   │       │   TipTap          │   │
│  │ vimExtension │       │ tiptapVimExtension│   │
│  │              │       │                   │   │
│  │ @replit/     │       │ vim-prose         │   │
│  │ codemirror-  │       │ VimMode extension │   │
│  │ vim          │       │                   │   │
│  └──────┬───────┘       └────────┬──────────┘   │
│         │                        │               │
│         └───────┬────────────────┘               │
│                 │                                │
│     ┌───────────┴───────────┐                   │
│     │    useLeader (x4)      │                   │
│     │ Leader / m / g / z     │                   │
│     └───────────────────────┘                   │
└─────────────────────────────────────────────────┘
```

### 2.2 核心设计决策

#### 决策 1：动态注入策略 — useEditor deps 重建

vim-prose 的 `VimMode` extension 没有 `enabled` option，无法运行时开关。TipTap v3 也不支持像 CodeMirror 的 Compartment 那样动态 reconfigure。

**方案**：利用 `@tiptap/react` 的 `useEditor(options, deps)` 第二参数。当 `vimEnabled` 变化时，useEditor 重建 Editor 实例。

```typescript
const editor = useEditor({
  extensions: [
    StarterKit.configure({ ... }),
    // ...所有现有扩展
    ...(vimEnabled ? [VimMode] : []),  // 条件性注入
  ],
  // ...
}, [vimEnabled]);  // ← deps：vimEnabled 变化时重建
```

**代价**：切换 Vim 开关时丢失撤销历史。但文档内容不丢失（从 props 重新加载），且 Vim 开关不频繁切换，可接受。

#### 决策 2：Leader 键统一为 Space

当前 CodeMirror 用 `leaderKey`（Space），TipTap 用 `tiptapLeaderKey`（`;`）。

**变更**：移除 `tiptapLeaderKey` 配置，两种模式统一用 `leaderKey`（Space）。

vim-prose 的 normal 模式会拦截所有按键，但 `useLeader` 在 **capture 阶段**拦截 Space（`preventDefault + stopPropagation`），vim-prose 收不到 Space 事件。这与 CodeMirror 模式的架构完全一致：

```
用户按 Space (normal 态)
  → useLeader capture handler 拦截 Space → 弹出 Leader 菜单
  → vim-prose 收不到 Space（不会右移光标）

Leader 菜单打开期间
  → useLeader 拦截所有按键 → 匹配菜单项 → 执行动作 → 关闭菜单

Leader 菜单关闭后
  → 按键正常到达 vim-prose → Vim 模态处理（h/j/k/d/y/...）
```

#### 决策 3：mode 同步

vim-prose 通过 `getVimMode(editor)` 暴露当前模式。在 `editor.on('transaction')` 中读取模式，调用 `setMode` 同步到 VimProvider：

```typescript
editor.on('transaction', () => {
  const vimMode = getVimMode(editor);  // 'normal' | 'insert' | 'visual' | ...
  setMode(mapVimMode(vimMode));
});

// mapVimMode: 'visual' / 'visual-line' → 'visual'
```

`useLeader` 的 `active` 参数改为 `mode === "normal"`（只在 normal 态触发 Leader 菜单），与 CodeMirror 一致。

#### 决策 4：g / z / m 前缀 which-key 复用

现有 `prefixG.ts` / `prefixZ.ts` / `prefixM.ts` 配置直接复用于 TipTap：

| 前缀 | 模式 | passive | 说明 |
|---|---|---|---|
| `g` | normal | `true` | 菜单仅视觉引导，vim-prose 原生执行 `gg`/`G`/`zz` 等 |
| `z` | normal | `true` | 同上，`zz`/`zt`/`zb` 等 |
| `m` | normal | `false` | 主动拦截，执行 Markdown 格式化（`mb` 加粗等） |
| Leader (Space) | normal | `false` | 主动拦截，执行 Leader 动作 |

#### 决策 5：ESC 处理

vim-prose 内置 ESC 处理（insert → normal，visual → normal），不需要像 CodeMirror 那样额外注入 ESC keymap。

---

## 3. 文件变更清单

### 3.1 新建文件

| 文件 | 说明 |
|---|---|
| `src/vim/tiptap/tiptapVimExtension.ts` | 封装 vim-prose 集成：条件注入 VimMode、mode 同步、transaction 监听 |

### 3.2 修改文件

| 文件 | 变更 |
|---|---|
| `package.json` | 添加 `vim-prose` 依赖 |
| `src/vim/config/configLoader.ts` | 移除 `tiptapLeaderKey` 字段（统一用 `leaderKey`） |
| `src/vim/types.ts` | 移除 `VimConfig.tiptapLeaderKey` |
| `src/vim/VimProvider.tsx` | 注释更新：mode 不再恒为 insert，由 vim-prose 驱动 |
| `src/vim/index.ts` | 导出 `createTiptapVimConfig` |
| `src/Editor/TipTapEditor.tsx` | 接入 vim-prose：条件注入 VimMode、useEditor deps、mode 同步、Leader 键统一为 Space、g/z/m 前缀接入 |
| `src/vim/settings/VimSettingsPanel.tsx` | 移除"Leader 触发键（所见即所得模式）"配置项 |
| `docs/vim-mode-design.md` | 更新设计文档，补充 IR 模式 Vim 章节 |

### 3.3 不变的文件

| 文件 | 原因 |
|---|---|
| `src/vim/leader/useLeader.ts` | 通用 hook，已支持 `active` / `passive` / `initialItems`，无需改动 |
| `src/vim/config/leader.ts` | Leader 菜单配置不变 |
| `src/vim/config/prefixG.ts` / `prefixZ.ts` / `prefixM.ts` | 前缀配置不变，复用于 TipTap |
| `src/vim/codemirror/vimExtension.ts` | CodeMirror 侧不变 |
| `src/vim/codemirror/markdownActions.ts` | CodeMirror 侧不变 |
| `src/Editor/CodeMirrorEditor.tsx` | CodeMirror 侧不变 |

---

## 4. 实现步骤

### Phase A：安装依赖 + 类型适配

1. `npm install vim-prose`
2. 修改 `configLoader.ts`：移除 `tiptapLeaderKey`，`DEFAULT_VIM_CONFIG` 只保留 `enabled` / `leaderKey` / `menuTimeout`
3. 修改 `types.ts`：`VimConfig` 移除 `tiptapLeaderKey` 字段
4. 修改 `VimProvider.tsx`：value 中移除 `tiptapLeaderKey`，默认值移除 `tiptapLeaderKey`
5. 修改 `VimSettingsPanel.tsx`：移除 tiptapLeaderKey 配置 UI
6. tsc 验证

### Phase B：创建 tiptapVimExtension 封装

1. 创建 `src/vim/tiptap/tiptapVimExtension.ts`
2. 导出 `createTiptapVimExtensions(options)` — 返回条件性注入的扩展数组
3. 导出 `syncVimMode(editor, setMode)` — transaction 监听 + mode 同步
4. 导出 `mapVimMode(mode)` — vim-prose mode 字符串映射到 VimMode 类型

```typescript
// src/vim/tiptap/tiptapVimExtension.ts
import { VimMode, getVimMode } from 'vim-prose/tiptap';
import type { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/core';
import type { VimMode as AppVimMode } from '../types';

// vim-prose mode → 应用 VimMode 类型
export function mapVimMode(mode: string): AppVimMode {
  if (mode === 'normal' || mode === 'insert') return mode;
  // visual / visual-line / replace → visual（简化）
  return 'visual';
}

// 条件性返回 VimMode 扩展
export function createTiptapVimExtensions(enabled: boolean): Extension[] {
  return enabled ? [VimMode] : [];
}

// 监听 transaction 同步 mode
export function syncVimMode(
  editor: Editor,
  setMode: (mode: AppVimMode) => void
): () => void {
  const handler = () => {
    const mode = getVimMode(editor);
    setMode(mapVimMode(mode));
  };
  editor.on('transaction', handler);
  // 初始同步
  handler();
  return () => editor.off('transaction', handler);
}
```

### Phase C：TipTapEditor 接入

1. useEditor extensions 末尾条件性展开 `createTiptapVimExtensions(vimEnabled)`
2. useEditor 第二参数加 `[vimEnabled]` deps
3. useEffect 注册 `syncVimMode(editor, setMode)`，editor 变化时重注册
4. useLeader 调用变更：
   - Leader 菜单：`triggerKey` 改为 `leaderKey`（Space），`active` 改为 `mode === "normal"`
   - g 前缀：`passive: true`，`initialItems: prefixGConfig.items`
   - z 前缀：`passive: true`，`initialItems: prefixZConfig.items`
   - m 前缀：`passive: false`，`initialItems: prefixMConfig.items`
5. 渲染 4 个 LeaderMenu 实例（Leader / m / g / z）
6. dispatchAction 逻辑保持现有（`editor.*` → executeCommand，`app.*` → 全局事件）

### Phase D：验证 + 文档

1. tsc --noEmit 零错误
2. vite build 零错误
3. 更新 `docs/vim-mode-design.md`

---

## 5. 风险与注意事项

### 5.1 撤销历史丢失

**风险**：Vim 开关切换时 useEditor 重建，撤销历史丢失。

**缓解**：Vim 开关不频繁，切换时文档内容从 props 重新加载不丢失。如未来需要保留撤销历史，可考虑：
- 包裹 VimMode 为 ConditionalVimMode，通过 ProseMirror plugin 动态替换
- 或 fork vim-prose 添加 enabled option

### 5.2 vim-prose 的 `;` 键冲突

vim-prose 中 `;` 是"重复上次 f/F/t/T 查找"。移除 `tiptapLeaderKey`（`;`）后，`;` 恢复为 vim-prose 原生功能，符合预期。

### 5.3 TipTap 扩展与 vim-prose 的按键优先级

vim-prose 通过 ProseMirror plugin 的 `handleKeyDown` 处理按键。TipTap 的 `addKeyboardShortcuts` 也处理按键。两者优先级由 ProseMirror plugin 注册顺序决定。

**确保**：VimMode 放在 extensions 数组**末尾**，使其 ProseMirror plugin 注册在最前（ProseMirror 中越先注册的 plugin 优先级越高），能优先拦截 Vim 按键。

### 5.4 富文本节点与 Vim 行为

vim-prose 的设计理念是 "Paragraph = line"：
- `j/k` 在段落间跳转
- `dd` 删除整个段落
- `0`/`$` 跳到段落首/尾

这与 CodeMirror 源码模式（真实文本行）有差异，但符合富文本编辑的语义。用户在 IR 模式下操作的"行"就是段落，这是合理的行为。

### 5.5 TipTap 扩展禁用快捷键的兼容性

TipTapEditor 中已禁用了 StarterKit 内置的 bold/italic/code 等扩展的快捷键（`addKeyboardShortcuts` 返回空），避免与 Vim 按键冲突。vim-prose 接入后不会与这些扩展冲突。

### 5.6 vim-prose CSS

vim-prose 提供了 `vim-prose/style.css`（搜索高亮、模式指示器样式）。如不需要其内置样式可不引入，我们用自己的 which-key 菜单和状态指示器。

---

## 6. 预期效果

Vim 开启后，IR 模式下的操作体验：

| 操作 | 源码模式 (CodeMirror) | IR 模式 (TipTap + vim-prose) |
|---|---|---|
| 移动 | hjkl 行内/行间 | hjkl 段内/段间 |
| 插入 | i/a/o/Esc | i/a/o/Esc |
| 删除 | dd/dw/x | dd(删段落)/dw/x |
| 复制粘贴 | yy/p | yy/p |
| 搜索 | / n N | / n N |
| Leader 菜单 | Space → 弹菜单 | Space → 弹菜单 |
| m 前缀 | mb 加粗 | mb 加粗（toggleBold） |
| g 前缀 | gg/G（which-key 引导） | gg/G（which-key 引导） |
| z 前缀 | zz/zt/zb（which-key 引导） | zz/zt/zb（which-key 引导） |
| 模式切换 | Space+M | Space+M |
| ESC 返回 normal | ✅ | ✅（vim-prose 内置） |

两种模式体验一致，用户无需区分。
