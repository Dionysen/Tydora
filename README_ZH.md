[![GitHub Stars](https://img.shields.io/github/stars/zuorn/Inimark?style=flat-square)](https://github.com/zuorn/Inimark)
[![Release](https://img.shields.io/github/v/release/zuorn/Inimark?style=flat-square)](https://github.com/zuorn/Inimark/releases)
[![License](<https://img.shields.io/badge/license-Apache%202.0-blue?style=flat-square>)](LICENSE)
[![Platform](<https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=flat-square>)]()
[![Tauri](https://img.shields.io/badge/Tauri-v2-blue?style=flat-square)](https://v2.tauri.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square)](https://react.dev/)
[![dsh.so security](https://www.dsh.so/badge/inimark.svg)](https://www.dsh.so/artifact/inimark)
[![dsh.so install](https://www.dsh.so/badge/install/inimark.svg)](https://www.dsh.so/artifact/inimark)

[中文](README_ZH.md) | English

![image.png](website/assets/image-20260815-172948.png)

---

**Inimark** — 无限书写，思维无界。

它不试图成为什么都有的工具箱，只是一张安静的书桌：先把字写好，再在需要时，让想法彼此相连、脉络显现。

🔗 [官网与文档](https://zuorn.github.io/Inimark/)

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

1. 从 [Releases](https://github.com/zuorn/Inimark/releases) 下载并安装 Inimark

## 从源码运行

```bash
git clone https://github.com/zuorn/Inimark.git
cd Inimark
npm install

npm run tauri dev
npm run tauri build
```

## 技术栈

| 层级   | 技术                                                        |
| ------ | ----------------------------------------------------------- |
| 前端   | React 19 + TypeScript + Vite 6                              |
| 编辑器 | TipTap 3.x (WYSIWYG) + CodeMirror 6 (源码)                  |
| 后端   | Rust (Tauri v2)                                             |
| 可视化 | D3.js (图谱) + markmap (思维导图) + React Flow (白板)       |
| 插件   | tauri-plugin-fs / dialog / window-state / updater / process |

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

本项目使用 [Apache License 2.0](LICENSE) 许可证。

## Star History

<a href="https://www.star-history.com/?repos=zuorn%2FInimark&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=zuorn/Inimark&type=date&theme=dark&legend=top-left&sealed_token=UbjlpYMAKlj9YxE9TrI3oZEpbMArNY0oRBtXdZ4GlQe9lQG0bgKmhoGnECO6aR-BCg34sIpFHJLyux4trfCJQVTOG2DIOa2HKERx9cCUMNhsoboxUFNz8g" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=zuorn/Inimark&type=date&legend=top-left&sealed_token=UbjlpYMAKlj9YxE9TrI3oZEpbMArNY0oRBtXdZ4GlQe9lQG0bgKmhoGnECO6aR-BCg34sIpFHJLyux4trfCJQVTOG2DIOa2HKERx9cCUMNhsoboxUFNz8g" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=zuorn/Inimark&type=date&legend=top-left&sealed_token=UbjlpYMAKlj9YxE9TrI3oZEpbMArNY0oRBtXdZ4GlQe9lQG0bgKmhoGnECO6aR-BCg34sIpFHJLyux4trfCJQVTOG2DIOa2HKERx9cCUMNhsoboxUFNz8g" />
 </picture>
</a>
