<p align="center">
  <img src="website/landing/icon.png" alt="Inimark" width="96" />
</p>

---

**Inimark** — write without end, think without bounds.

Not a toolbox that tries to do everything — a quiet desk. Write well first; when you need to, let ideas find each other and patterns emerge.

🔗 [Website & docs](https://Dionysen.github.io/Inimark/)

---

## Focus on editing

WYSIWYG and source, one keystroke apart. An interface pared to the words — the tool steps back; wherever the cursor lands, your thought lands on the page.

![image.png](website/assets/image-20260815-171029.png)

---

## Focus on thinking

Notes can link to each other. Unfold a graph or mind map when structure calls. Spread out on a canvas when lines aren't enough. Extensions for thinking — not another bloated system.

![image.png](website/assets/image-20260815-171200.png)

![image.png](website/assets/image-20260815-171446.png)

---

## Quick Start

1. Download and install Inimark from [Releases](https://github.com/Dionysen/Inimark/releases)

## Run from Source

```bash
git clone https://github.com/Dionysen/Inimark.git
cd Inimark
npm install

npm run tauri dev
npm run tauri build
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 + TypeScript + Vite 6 |
| Editor | TipTap 3.x (WYSIWYG) + CodeMirror 6 (Source) |
| Backend | Rust (Tauri v2) |
| Visualization | D3.js (Graph) + markmap (Mind Map) + React Flow (Canvas) |
| Plugins | tauri-plugin-fs / dialog / window-state / updater / process |

## Contributing

Issues and pull requests are welcome!

## License

This project is licensed under the [Apache License 2.0](LICENSE).