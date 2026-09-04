<p align="center">
  <img src="website/landing/icon.png" alt="Inimark" width="96" />
</p>

---

**Inimark** — 无限书写，思维无界。

它不试图成为什么都有的工具箱，只是一张安静的书桌：先把字写好，再在需要时，让想法彼此相连、脉络显现。

🔗 [官网与文档](https://Dionysen.github.io/Inimark/)

---

## 专注编辑

所见即所得，源码随切随用。界面干净到只剩文字——工具退到幕后，光标所至，思绪便落在纸上。

![image.png](website/assets/image-20260815-171029.png)

---

## 专注思维

笔记可以彼此相连；需要整理时，展开图谱与导图；思绪铺不开时，还有无限白板。它们是思考的延伸，而不是另一套臃肿的系统。

![image.png](website/assets/image-20260815-171200.png)

![image.png](website/assets/image-20260815-171446.png)

---

## 快速开始

1. 从 [Releases](https://github.com/Dionysen/Inimark/releases) 下载并安装 Inimark

## 从源码运行

```bash
git clone https://github.com/zuorn/Inimark.git
cd Inimark
npm install

npm run tauri dev
npm run tauri build
```

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 前端 | React 19 + TypeScript + Vite 6 |
| 编辑器 | TipTap 3.x (WYSIWYG) + CodeMirror 6 (源码) |
| 后端 | Rust (Tauri v2) |
| 可视化 | D3.js (图谱) + markmap (思维导图) + React Flow (白板) |
| 插件 | tauri-plugin-fs / dialog / window-state / updater / process |

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

本项目使用 [Apache License 2.0](LICENSE) 许可证。