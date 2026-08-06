# Tydora 发布流程

本文档详细描述了 Tydora 的版本管理、Conventional Commits 规范、以及从提交代码到自动发布的完整自动化流水线。

---

## 目录

- [整体架构](#整体架构)
- [版本管理](#版本管理)
  - [VERSION 文件 —— 单一版本源](#version-文件--单一版本源)
  - [sync-version.mjs —— 版本同步脚本](#sync-versionmjs--版本同步脚本)
- [Conventional Commits —— 提交规范](#conventional-commits--提交规范)
  - [提交格式](#提交格式)
  - [可用类型](#可用类型)
  - [工具支持](#工具支持)
- [发布流水线](#发布流水线)
  - [Pipeline 一：Release Please（版本决策）](#pipeline-一release-please版本决策)
  - [Pipeline 二：Build & Release（构建发布）](#pipeline-二build--release构建发布)
- [配置文件速查](#配置文件速查)
- [日常开发工作流](#日常开发工作流)
- [操作指南](#操作指南)
  - [日常提交代码](#日常提交代码)
  - [检查提交是否合规](#检查提交是否合规)
  - [发布新版本](#发布新版本)
  - [手动触发构建](#手动触发构建)
  - [本地版本同步](#本地版本同步)
  - [本地生成 Changelog](#本地生成-changelog)

---

## 整体架构

Tydora 的发布系统由两条 GitHub Actions 工作流 + 本地工具链共同组成：

```
┌──────────────┐     ┌──────────────────┐     ┌───────────────────┐
│  开发者提交    │────▶│  Release Please   │────▶│  Build & Release   │
│ conventional  │     │  版本决策 & Tag    │     │  构建 & 发布资产     │
│   commits     │     │                  │     │                   │
└──────────────┘     └──────────────────┘     └───────────────────┘
     push main             merge PR               tag push (v*)
```

| 阶段 | 触发条件 | 做什么 | 产出 |
|------|---------|--------|------|
| **开发** | 本地 `npm run commit` | 生成规范的 commit | 带 Conventional Commits 的提交 |
| **Release Please** | push 到 `main` 分支 | 维护 Release PR，自动 bump 版本号 | Release PR → 合并后打 tag |
| **Build & Release** | push `v*` tag | 生成 Release Notes，跨平台构建，创建 GitHub Release | 安装包 + Release Notes |

---

## 版本管理

### VERSION 文件 —— 单一版本源

`VERSION` 文件是项目的**唯一版本源**（Single Source of Truth），包含纯文本版本号：

```
0.1.3
```

当需要进行本地版本更新时，修改此文件后运行同步脚本。

### sync-version.mjs —— 版本同步脚本

`scripts/sync-version.mjs` 负责将 `VERSION` 中的版本号同步到以下 4 个目标文件：

| 目标文件 | 路径 | 用途 |
|---------|------|------|
| `package.json` | 项目根目录 | npm 包版本 |
| `tauri.conf.json` | `src-tauri/` | Tauri 应用版本 |
| `Cargo.toml` | `src-tauri/` | Rust crate 版本 |
| `index.html` | `website/landing/` | 落地页版本显示 |

**用法：**

```bash
npm run sync-version
```

> **注意**：在 CI 流水线中，release-please 通过 `extra-files` 机制直接更新这些文件，无需手动运行此脚本。此脚本主要用于本地版本同步。

---

## Conventional Commits —— 提交规范

### 提交格式

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**示例：**

```
feat(editor): add split view support

- Left/right pane resizable via drag
- Saves split ratio to window state

Closes #42
```

### 可用类型

| 类型 | 图标 | 说明 | 影响版本 |
|------|------|------|---------|
| `feat` | 🚀 | 新功能 | MINOR |
| `fix` | 🐛 | Bug 修复 | PATCH |
| `perf` | ⚡ | 性能优化 | PATCH |
| `refactor` | ♻️ | 代码重构 | PATCH |
| `docs` | 📝 | 文档更新 | — |
| `style` | 💄 | 代码格式（不影响逻辑） | — |
| `test` | ✅ | 测试相关 | — |
| `ci` | 🔧 | CI/CD 配置 | — |
| `build` | 🔧 | 构建系统 | — |
| `chore` | 🏗️ | 杂项（依赖更新等） | — |

**关键规则：**

- `feat:` → 触发 **MINOR** 版本（0.1.x → 0.2.0）
- `fix:` → 触发 **PATCH** 版本（0.1.3 → 0.1.4）
- 其他类型 → 不触发版本变更
- 在 body 或 footer 中包含 `BREAKING CHANGE:` 或 `!:` → 触发 **MAJOR** 版本

### 工具支持

项目已集成以下工具来帮助遵循 Conventional Commits 规范：

| 工具 | 命令 | 用途 |
|------|------|------|
| **commitizen** | `npm run commit` | 交互式创建规范化提交 |
| **commitlint** | `npm run lint:commit` | 检查最近一次提交是否合规 |
| **git-cliff** | `npm run changelog` | 本地生成 CHANGELOG.md |

---

## 发布流水线

### Pipeline 一：Release Please（版本决策）

**工作流文件：** `.github/workflows/release-please.yml`  
**触发条件：** push 到 `main` 分支  
**配置文件：** `release-please-config.json` + `.release-please-manifest.json`

**执行流程：**

```
push to main（含 feat:/fix: 提交）
        │
        ▼
release-please 分析自上次发版以来的提交
        │
        ├── 无可发版变更 → 结束
        │
        └── 有可发版变更 →
              ┌─────────────────────────────────────────────┐
              │  创建/更新 Release PR                        │
              │                                             │
              │  标题: "chore(main): release 0.2.0"         │
              │  内容:                                       │
              │    • VERSION         ← 更新为新版本号         │
              │    • package.json    ← version 字段更新       │
              │    • tauri.conf.json ← version 字段更新       │
              │    • Cargo.toml      ← version 字段更新       │
              │    • CHANGELOG.md    ← 新增版本段             │
              └────────────┬────────────────────────────────┘
                           │
              开发者审查 PR 内容无误后，合并 PR
                           │
                           ▼
              release-please 执行：
              1. 创建 git tag（如 v0.2.0）
              2. 推送 tag 到 origin
                           │
                           ▼
              触发 Pipeline 二 → Build & Release
```

**关键行为：**

- Release PR 持续存在，每次 push 到 main 时自动更新（不创建新 PR）
- 可以**随时合并**，也可以在开发过程中忽略它
- 合并前可以在 PR 中预览即将发布的变更内容
- 如果一段时间没有任何 `feat:` 或 `fix:` 提交，PR 不会出现

---

### Pipeline 二：Build & Release（构建发布）

**工作流文件：** `.github/workflows/release.yml`  
**触发条件：** push `v*` tag（或 `workflow_dispatch` 手动触发）  
**配置文件：** `cliff.toml`

**执行流程：**

```
push v0.2.0 tag（由 release-please 自动创建）
        │
        ▼
并行矩阵构建（4 个平台）
        │
        ├── 1. checkout（fetch-depth: 0，获取完整历史）
        ├── 2. Setup Node.js + Rust + 前端依赖
        ├── 3. git-cliff 生成 Release Notes
        │      └── 从上次 tag 到当前 tag 的提交
        │      └── 按 feat/fix/perf 等类型分组
        └── 4. tauri-action 构建并创建 GitHub Release
               ├── Windows: .msi/.exe (NSIS)
               ├── macOS:   .dmg (Intel + Apple Silicon)
               └── Linux:   .deb/.rpm/.AppImage
```

**Release Notes 生成规则：**

1. `git-cliff` 读取当前 tag 与上一个 tag 之间的提交历史
2. 根据 `cliff.toml` 中的 `commit_parsers` 按类型分组
3. 符合 Conventional Commits 的提交会加上类型图标和提交短 hash
4. 不符合规范的提交归入「📦 Other Changes」

**Release Notes 示例：**

```markdown
# Tydora v0.2.0

### 🚀 Features
- Add split view support (a1b2c3d)
- Add dark mode theme (e4f5g6h)

### 🐛 Bug Fixes
- Fix crash when opening large files (i7j8k9l)
- Fix table rendering in preview (m0n1o2p)

### 📝 Documentation
- Update install guide (q3r4s5t)
```

---

## 配置文件速查

| 文件 | 位置 | 用途 |
|------|------|------|
| `release-please-config.json` | 项目根目录 | Release Please 配置（版本策略、extra-files） |
| `.release-please-manifest.json` | 项目根目录 | 当前版本清单（release-please 维护） |
| `cliff.toml` | 项目根目录 | git-cliff 配置（提交分组规则、模板） |
| `commitlint.config.js` | 项目根目录 | commitlint 规范配置 |
| `.github/workflows/release-please.yml` | 版本决策流水线 | Release PR + 自动 Tag |
| `.github/workflows/release.yml` | 构建发布流水线 | 跨平台构建 + 创建 Release |
| `VERSION` | 项目根目录 | 单一版本源 |
| `scripts/sync-version.mjs` | 本地版本同步脚本 |

---

## 日常开发工作流

```
                  ┌──────────────────────────────────────┐
                  │           日常开发循环                  │
                  │                                      │
                  │  1. 编写代码                           │
                  │  2. npm run commit（规范提交）          │
                  │  3. git push                          │
                  │  4. 循环...                            │
                  └─────────────┬────────────────────────┘
                                │
                  每当 push 到 main 分支
                                │
                                ▼
                  ┌──────────────────────────────────────┐
                  │        Release Please 检查             │
                  │                                      │
                  │  有新 feat/fix?                       │
                  │    ├── 是 → 更新 Release PR           │
                  │    └── 否 → 不做任何操作                │
                  └─────────────┬────────────────────────┘
                                │
                                ▼
                  ┌──────────────────────────────────────┐
                  │         准备发版（需要时）               │
                  │                                      │
                  │  1. 检查 Release PR 中的内容            │
                  │  2. 确认版本号是否正确                   │
                  │  3. 点击 "Merge pull request"         │
                  │                                      │
                  │  之后一切自动化：                        │
                  │  → Tag 创建 → 构建开始 → Release 创建     │
                  └──────────────────────────────────────┘
```

---

## 操作指南

### 日常提交代码

**方式 1：交互式（推荐）**

```bash
npm run commit
```

按提示依次选择 type、填写 scope 和 subject，自动生成规范的 commit message。

**方式 2：手动编写**

确保 commit message 遵循 Conventional Commits 格式：

```bash
git commit -m "feat(editor): add real-time collaboration"
git commit -m "fix(export): resolve PDF page break issue"
```

### 检查提交是否合规

```bash
# 检查最近一次提交
npm run lint:commit

# 检查最近 N 次提交
npx commitlint --from HEAD~3
```

### 发布新版本

1. 确认所有需要发布的变更已合并到 `main` 分支
2. 在 GitHub 仓库中找到 Release Please 自动创建的 PR：
   - 标题类似于 `chore(main): release 0.2.0`
   - 检查 PR 中的版本号和变更列表是否正确
3. 点击 **Merge pull request** 按钮
4. Release Please 会在合并后自动：
   - 创建 `v0.2.0` tag
   - 推送 tag
5. Tag 推送触发 Build & Release 工作流
6. 等待构建完成，在仓库的 Releases 页面查看结果

### 手动触发构建

前往 **Actions → Release → Run workflow**，即可手动触发构建（需提前有对应 tag）。

### 本地版本同步

如果在本地手动修改了 `VERSION` 文件：

```bash
npm run sync-version
```

该脚本会读取 `VERSION` 的内容并同步到所有相关文件。

### 本地生成 Changelog

需先安装 `git-cliff`（`cargo install git-cliff` 或参考 [安装文档](https://github.com/orhun/git-cliff#installation)）：

```bash
npm run changelog
```

生成的 `CHANGELOG.md` 包含自项目开始以来的完整变更历史。
