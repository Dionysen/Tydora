/**
 * 将落地页写入 website/site/index.html
 * HTML 内容内联在脚本中，无需依赖外部文件
 * 在 markdown-publish 构建后运行此脚本
 */
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dest = resolve(__dirname, "../website/site/index.html");

// Ensure the site directory exists
mkdirSync(resolve(__dirname, "../website/site"), { recursive: true });

// Copy icon files to site directory
const iconSrc = resolve(__dirname, "../src-tauri/icons/icon.png");
const iconDest = resolve(__dirname, "../website/site/icon.png");
try {
  writeFileSync(iconDest, readFileSync(iconSrc));
} catch (e) {
  console.log("⚠️ Icon file not found, skipping");
}

// Copy favicon to site directory
const faviconSrc = resolve(__dirname, "../dist/favicon.svg");
const faviconDest = resolve(__dirname, "../website/site/favicon.svg");
try {
  writeFileSync(faviconDest, readFileSync(faviconSrc));
} catch (e) {
  console.log("⚠️ Favicon file not found, skipping");
}

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tydora — 现代的桌面 Markdown 编辑器</title>
  <meta name="description" content="Tydora 是一个基于 Tauri v2 + React 19 构建的现代桌面 Markdown 编辑器，支持双模式编辑、双向链接、知识图谱、思维导图、白板画布与一键发布。">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <style>
    :root {
      --color-primary: #8a5cf5;
      --color-primary-light: #a68af9;
      --color-primary-dark: #6d3fd4;
      --color-primary-bg: rgba(138, 92, 245, 0.08);
      --color-primary-border: rgba(138, 92, 245, 0.18);
      --color-secondary: #06b6d4;
      --color-accent: #f472b6;
      --color-bg: #ffffff;
      --color-bg-alt: #fafafa;
      --color-bg-card: #ffffff;
      --color-text: #1a1a2e;
      --color-text-muted: #5c5c5c;
      --color-text-faint: #909090;
      --color-border: #e8e8e8;
      --color-gradient-start: #8a5cf5;
      --color-gradient-end: #4f46e5;
      --color-code-bg: #f5f3ff;
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 16px;
      --radius-xl: 20px;
      --radius-2xl: 28px;
      --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
      --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
      --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.12);
      --shadow-xl: 0 20px 60px rgba(0, 0, 0, 0.15);
      --font-sans: "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", sans-serif;
      --font-mono: "JetBrains Mono", "SF Mono", "Fira Code", "Consolas", monospace;
      --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      font-family: var(--font-sans);
      color: var(--color-text);
      background: var(--color-bg);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overflow-x: hidden;
    }

    /* ====== Navbar ====== */
    .navbar {
      position: fixed; top: 0; left: 0; right: 0;
      z-index: 9999;
      height: 72px;
      background: #ffffff;
      border-bottom: 1px solid rgba(138, 92, 245, 0.1);
      transition: all 0.4s var(--ease-smooth);
      display: flex;
      align-items: center;
    }
    .navbar.scrolled {
      background: #ffffff;
      box-shadow: 0 4px 30px rgba(138, 92, 245, 0.1);
    }
    .navbar-container {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .navbar-logo {
      font-size: 20px;
      font-weight: 800;
      color: var(--color-text);
      text-decoration: none;
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .navbar-logo img {
      width: 32px; height: 32px;
      border-radius: 8px;
      filter: drop-shadow(0 4px 16px rgba(138, 92, 245, 0.3));
    }
    .navbar-links {
      display: flex;
      gap: 36px;
      align-items: center;
    }
    .navbar-links a {
      text-decoration: none;
      color: var(--color-text-muted);
      font-size: 15px;
      font-weight: 500;
      transition: all 0.3s var(--ease-smooth);
      position: relative;
    }
    .navbar-links a:hover {
      color: var(--color-primary);
    }
    .navbar-links a::after {
      content: "";
      position: absolute;
      bottom: -6px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--color-primary), var(--color-gradient-end));
      transition: width 0.3s var(--ease-smooth);
      border-radius: 1px;
    }
    .navbar-links a:hover::after {
      width: 100%;
    }
    .navbar-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .navbar-github {
      width: 44px; height: 44px;
      border-radius: 50%;
      background: rgba(15, 15, 26, 0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      transition: all 0.3s var(--ease-smooth);
    }
    .navbar-github:hover {
      background: rgba(138, 92, 245, 0.1);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(138, 92, 245, 0.15);
    }
    .navbar-github svg {
      width: 20px; height: 20px;
      color: var(--color-text);
    }
    .navbar-download {
      padding: 10px 24px;
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
      color: white;
      border-radius: var(--radius-lg);
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      box-shadow: 0 6px 24px rgba(138, 92, 245, 0.35);
      transition: all 0.3s var(--ease-smooth);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .navbar-download:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 40px rgba(138, 92, 245, 0.5);
    }
    .navbar-download svg {
      width: 16px; height: 16px;
    }
    .navbar-toggle {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
    }
    .navbar-toggle svg {
      width: 24px; height: 24px;
      color: var(--color-text);
    }

    .hero {
      position: relative;
      overflow: hidden;
      padding: 120px 24px 100px;
      text-align: center;
      background: linear-gradient(135deg, #faf5ff 0%, #ede9fe 30%, #f5f3ff 60%, #faf5ff 100%);
    }
    .hero::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 60% 50% at 20% 50%, rgba(138, 92, 245, 0.12) 0%, transparent 60%),
        radial-gradient(ellipse 40% 60% at 80% 40%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse 50% 40% at 50% 80%, rgba(138, 92, 245, 0.06) 0%, transparent 50%);
      pointer-events: none;
    }
    .hero-content { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }

    .hero-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 16px; border-radius: 100px;
      background: white; border: 1px solid var(--color-primary-border);
      font-size: 14px; color: var(--color-primary); font-weight: 500;
      margin-bottom: 28px; letter-spacing: 0.01em;
    }
    .hero-badge .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--color-primary); }

    .hero h1 {
      font-size: clamp(44px, 7vw, 72px);
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.08;
      margin-bottom: 20px;
      background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 40%, var(--color-gradient-end) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero .subtitle {
      font-size: clamp(18px, 2.5vw, 22px);
      color: var(--color-text-muted);
      font-weight: 400;
      line-height: 1.5;
      margin-bottom: 40px;
      max-width: 560px;
      margin-left: auto; margin-right: auto;
    }
    .hero-actions {
      display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;
    }
    .btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 14px 28px; border-radius: var(--radius-md);
      font-size: 16px; font-weight: 600; text-decoration: none;
      cursor: pointer; transition: all 0.25s ease;
      border: none; font-family: inherit;
    }
    .btn-primary {
      background: var(--color-primary); color: white;
      box-shadow: 0 4px 16px rgba(138, 92, 245, 0.35);
    }
    .btn-primary:hover {
      background: var(--color-primary-dark);
      box-shadow: 0 6px 24px rgba(138, 92, 245, 0.45);
      transform: translateY(-1px);
    }
    .btn-outline {
      background: white; color: var(--color-primary);
      border: 1.5px solid var(--color-primary-border);
    }
    .btn-outline:hover {
      background: var(--color-primary-bg);
      border-color: var(--color-primary);
    }
    .btn svg { width: 18px; height: 18px; }

    .hero-meta {
      margin-top: 36px;
      display: flex; gap: 24px; justify-content: center; flex-wrap: wrap;
      font-size: 14px; color: var(--color-text-faint);
    }
    .hero-meta span { display: flex; align-items: center; gap: 5px; }

    .section {
      padding: 100px 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .section-header {
      text-align: center; margin-bottom: 64px;
    }
    .section-header .label {
      font-size: 13px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: var(--color-primary);
      margin-bottom: 12px;
    }
    .section-header h2 {
      font-size: clamp(28px, 4vw, 40px); font-weight: 800;
      letter-spacing: -0.02em; margin-bottom: 14px;
    }
    .section-header p {
      font-size: 17px; color: var(--color-text-muted);
      max-width: 560px; margin: 0 auto;
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }
    .feature-card {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 32px 28px;
      transition: all 0.3s ease;
    }
    .feature-card:hover {
      border-color: var(--color-primary-border);
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }
    .feature-icon {
      width: 48px; height: 48px;
      border-radius: var(--radius-sm);
      background: var(--color-primary-bg);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 20px;
    }
    .feature-icon svg { width: 24px; height: 24px; }
    .feature-card h3 {
      font-size: 18px; font-weight: 700; margin-bottom: 8px;
      letter-spacing: -0.01em;
    }
    .feature-card p {
      font-size: 15px; color: var(--color-text-muted);
      line-height: 1.65;
    }

    .tech-section {
      background: var(--color-bg-alt);
      padding: 100px 24px;
    }
    .tech-grid {
      max-width: 1000px; margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px;
    }
    .tech-item {
      background: white;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 20px 24px;
      text-align: center;
      transition: all 0.25s ease;
    }
    .tech-item:hover {
      border-color: var(--color-primary-border);
      box-shadow: var(--shadow-sm);
    }
    .tech-item .tech-name {
      font-weight: 700; font-size: 15px; margin-bottom: 4px;
      color: var(--color-text);
    }
    .tech-item .tech-role {
      font-size: 13px; color: var(--color-text-faint);
    }

    .links-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 14px;
    }
    .link-card {
      display: flex; align-items: center; gap: 14px;
      padding: 20px 24px;
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      text-decoration: none; color: inherit;
      transition: all 0.25s ease;
    }
    .link-card:hover {
      border-color: var(--color-primary-light);
      background: var(--color-primary-bg);
      transform: translateX(4px);
    }
    .link-card .link-icon {
      width: 40px; height: 40px; border-radius: var(--radius-sm);
      background: var(--color-primary-bg);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .link-card .link-icon svg { width: 20px; height: 20px; color: var(--color-primary); }
    .link-card .link-text { font-weight: 600; font-size: 15px; }
    .link-card .link-desc { font-size: 13px; color: var(--color-text-faint); margin-top: 2px; }

    .code-preview {
      max-width: 1200px; margin: 0 auto;
      background: #ffffff; border-radius: var(--radius-3xl);
      overflow: hidden;
      box-shadow: 0 40px 120px rgba(0, 0, 0, 0.15);
      transition: all 0.5s var(--ease-smooth);
      position: relative;
      display: flex;
      flex-direction: column;
    }
    .code-preview:hover {
      box-shadow: 0 50px 150px rgba(0, 0, 0, 0.2);
      transform: translateY(-4px);
    }
    .code-preview .titlebar {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 20px; background: #fafafa;
      border-bottom: 1px solid #e0e0e0;
      flex-shrink: 0;
    }
    .code-preview .titlebar .dot {
      width: 12px; height: 12px; border-radius: 50%;
      transition: all 0.3s var(--ease-smooth);
    }
    .code-preview:hover .titlebar .dot { transform: scale(1.2); }
    .dot-red { background: #ff5f56; box-shadow: 0 0 8px rgba(255, 95, 86, 0.4); }
    .dot-yellow { background: #ffbd2e; box-shadow: 0 0 8px rgba(255, 189, 46, 0.4); }
    .dot-green { background: #27c93f; box-shadow: 0 0 8px rgba(39, 201, 63, 0.4); }
    .code-preview .titlebar .title {
      margin-left: 16px; font-size: 13px; color: #6c7086;
      font-family: var(--font-mono);
      display: flex; align-items: center; gap: 8px;
    }
    .code-preview .titlebar .title::before {
      content: "";
      width: 16px; height: 16px;
      background: #8a5cf5;
      border-radius: 4px;
      box-shadow: 0 0 8px rgba(138, 92, 245, 0.3);
    }

    /* Docs Preview Styles */
    .code-preview.docs-preview {
      background: #ffffff;
    }
    .code-preview.docs-preview .docs-body {
      display: flex;
      flex: 1;
      min-height: 0;
      height: 500px;
    }
    .code-preview.docs-preview .docs-sidebar {
      width: 280px;
      background: #ffffff;
      border-right: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      flex-shrink: 0;
    }
    .code-preview.docs-preview .docs-search {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-bottom: 1px solid #e0e0e0;
      background: #fafafa;
    }
    .code-preview.docs-preview .docs-search svg {
      color: #6c7086;
      flex-shrink: 0;
    }
    .code-preview.docs-preview .docs-search input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      font-size: 14px;
      color: #222222;
      font-family: inherit;
    }
    .code-preview.docs-preview .docs-search input::placeholder {
      color: #a6adc8;
    }
    .code-preview.docs-preview .docs-nav {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    }
    .code-preview.docs-preview .nav-group {
      margin-bottom: 4px;
    }
    .code-preview.docs-preview .nav-group-title {
      display: flex;
      align-items: center;
      gap: 4px;
      width: 100%;
      padding: 6px 16px;
      border: none;
      background: transparent;
      font-size: 12px;
      font-weight: 600;
      color: #6c7086;
      cursor: pointer;
      text-align: left;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .code-preview.docs-preview .nav-group-title svg {
      color: #a6adc8;
    }
    .code-preview.docs-preview .nav-group-items {
      padding-left: 0;
    }
    .code-preview.docs-preview .nav-item {
      display: block;
      padding: 5px 16px 5px 36px;
      font-size: 13px;
      color: #5c5c5c;
      text-decoration: none;
      transition: all 0.14s ease;
    }
    .code-preview.docs-preview .nav-item:hover {
      background: rgba(138, 92, 245, 0.08);
      color: #222222;
    }
    .code-preview.docs-preview .nav-item.active {
      background: rgba(138, 92, 245, 0.15);
      color: #8a5cf5;
      font-weight: 500;
    }
    .code-preview.docs-preview .nav-items {
      margin-top: 8px;
    }

    /* Docs Content */
    .code-preview.docs-preview .docs-content {
      flex: 1;
      display: flex;
      overflow: hidden;
      min-width: 0;
    }
    .code-preview.docs-preview .docs-note {
      flex: 1;
      overflow-y: auto;
      padding: 32px 48px;
      min-width: 0;
    }
    .code-preview.docs-preview .docs-title {
      margin: 0 0 0.6em;
      font-size: 2em;
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.015em;
      color: #222222;
    }
    .code-preview.docs-preview .docs-body {
      font-size: 16px;
      line-height: 1.7;
      color: #222222;
    }
    .code-preview.docs-preview .docs-body p,
    .code-preview.docs-preview .docs-body ul,
    .code-preview.docs-preview .docs-body ol {
      margin: 1rem 0;
    }
    .code-preview.docs-preview .docs-body h2 {
      margin-top: 2.5rem;
      margin-bottom: 0;
      font-size: 1.462em;
      font-weight: 680;
      line-height: 1.2;
      letter-spacing: -0.011em;
      color: #222222;
    }
    .code-preview.docs-preview .docs-body ul,
    .code-preview.docs-preview .docs-body ol {
      padding-left: 1.75em;
    }
    .code-preview.docs-preview .docs-body li {
      margin: 0.15rem 0;
    }
    .code-preview.docs-preview .docs-body strong {
      font-weight: 600;
    }
    .code-preview.docs-preview .docs-body a {
      color: #8a5cf5;
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 1px;
      font-weight: inherit;
    }
    .code-preview.docs-preview .docs-body a:hover {
      color: #9b78f7;
    }
    .code-preview.docs-preview .docs-body a.wikilink {
      color: #8a5cf5;
    }
    .code-preview.docs-preview .docs-body blockquote {
      border-left: 2px solid #9873f7;
      padding: 0 0 0 24px;
      margin: 16px 0;
      background: transparent;
      color: inherit;
      font-style: italic;
      color: #5c5c5c;
    }
    .code-preview.docs-preview .docs-body code {
      font-family: var(--font-mono);
      font-size: 0.875em;
      background: #fafafa;
      border-radius: 4px;
      padding: 0.1em 0.35em;
      color: #5c5c5c;
    }

    /* TOC Sidebar */
    .code-preview.docs-preview .docs-toc {
      width: 260px;
      padding: 32px 24px;
      background: #fafafa;
      border-left: 1px solid #e0e0e0;
      overflow-y: auto;
      flex-shrink: 0;
    }
    .code-preview.docs-preview .docs-toc h3 {
      margin: 0 0 0.5rem;
      font-weight: 600;
      font-size: 0.6875rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #767676;
    }
    .code-preview.docs-preview .docs-toc nav {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .code-preview.docs-preview .docs-toc a {
      display: block;
      padding: 0.25rem 0;
      color: #5c5c5c;
      text-decoration: none;
      font-size: 0.8125rem;
      line-height: 1.4;
      transition: color 80ms ease;
    }
    .code-preview.docs-preview .docs-toc a:hover {
      color: #222222;
    }

    .footer {
      text-align: center;
      padding: 48px 24px;
      border-top: 1px solid var(--color-border);
      color: var(--color-text-faint);
      font-size: 14px;
      line-height: 1.8;
    }
    .footer a { color: var(--color-primary); text-decoration: none; }
    .footer a:hover { text-decoration: underline; }
    .footer .links { display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; margin-bottom: 16px; }

    @media (max-width: 960px) {
      .navbar-links { display: none; }
      .navbar-toggle { display: block; }
      .navbar-links.active {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 72px;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.98);
        padding: 24px;
        gap: 20px;
        box-shadow: 0 20px 60px rgba(138, 92, 245, 0.1);
        border-bottom: 1px solid rgba(138, 92, 245, 0.06);
      }
      .navbar-links.active a {
        padding: 12px 20px;
        border-radius: var(--radius-lg);
      }
      .navbar-links.active a:hover {
        background: rgba(138, 92, 245, 0.06);
      }
    }

    @media (max-width: 768px) {
      .hero { padding: 140px 20px 64px; }
      .section { padding: 64px 20px; }
      .tech-section { padding: 64px 20px; }
      .feature-grid { grid-template-columns: 1fr; }
      .links-grid { grid-template-columns: 1fr; }
      .tech-grid { grid-template-columns: repeat(2, 1fr); }
    }

    .floating-shapes { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
    .shape {
      position: absolute; border-radius: 50%;
      background: var(--color-primary);
      opacity: 0.04;
    }
    .shape-1 { width: 300px; height: 300px; top: -80px; left: -80px; }
    .shape-2 { width: 200px; height: 200px; bottom: -40px; right: 10%; }
    .shape-3 { width: 150px; height: 150px; top: 40%; right: -40px; opacity: 0.03; }
  </style>
</head>
<body>

<!-- ====== Navbar ====== -->
<nav class="navbar" id="navbar">
  <div class="navbar-container">
    <a href="#" class="navbar-logo">
      <img src="icon.png" alt="Tydora" width="32" height="32"/>
      Tydora
    </a>
    <div class="navbar-links">
      <a href="#features">功能</a>
      <a href="#tech">技术栈</a>
      <a href="index/" target="_blank">使用指南</a>
      <a href="关于/" target="_blank">关于</a>
    </div>
    <div class="navbar-right">
      <a href="https://github.com/zuorn/Tydora" class="navbar-github" target="_blank" aria-label="GitHub">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
      </a>
      <a href="https://github.com/zuorn/Tydora/releases" class="navbar-download" target="_blank">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        下载
      </a>
    </div>
    <button class="navbar-toggle" id="navbarToggle">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </button>
  </div>
</nav>

<section class="hero">
  <div class="floating-shapes">
    <div class="shape shape-1"></div>
    <div class="shape shape-2"></div>
    <div class="shape shape-3"></div>
  </div>
  <div class="hero-content">
    <div class="hero-badge">
      <span class="dot"></span> v0.0.10 — 现已支持 Windows / macOS / Linux
    </div>
    <h1>Tydora</h1>
    <p class="subtitle">一个现代的桌面 Markdown 编辑器，指尖上的礼物。基于 Tauri v2 + React 19 构建，为你带来沉浸式的写作与知识管理体验。</p>
    <div class="hero-actions">
      <a href="https://github.com/zuorn/Tydora/releases" class="btn btn-primary" target="_blank">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        立即下载
      </a>
      <a href="index/" class="btn btn-outline" target="_blank">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        浏览文档
      </a>
      <a href="https://github.com/zuorn/Tydora" class="btn btn-outline" target="_blank">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
        GitHub
      </a>
    </div>
    <div class="hero-meta">
      <span>⭐ Apache 2.0 开源</span>
      <span>🖥️ 跨平台支持</span>
      <span>⚡ Tauri v2 原生性能</span>
    </div>
  </div>
</section>

<section style="padding: 0 24px; margin-top: -80px; position: relative; z-index: 2;">
  <div class="code-preview docs-preview">
    <div class="titlebar">
      <span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span>
      <span class="title">快速开始.md — Tydora</span>
    </div>
    <div class="docs-body">
      <aside class="docs-sidebar">
        <div class="docs-search">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <input type="text" placeholder="Search page or heading..." />
        </div>
        <nav class="docs-nav">
          <div class="nav-group">
            <button class="nav-group-title">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 18 6-6-6-6"/>
              </svg>
              编辑器
            </button>
            <div class="nav-group-items">
              <a href="#" class="nav-item">Markdown语法</a>
              <a href="#" class="nav-item">编辑模式</a>
              <a href="#" class="nav-item">代码块</a>
              <a href="#" class="nav-item">表格操作</a>
              <a href="#" class="nav-item">Mermaid图表</a>
            </div>
          </div>
          <div class="nav-group">
            <button class="nav-group-title">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 18 6-6-6-6"/>
              </svg>
              导航与搜索
            </button>
            <div class="nav-group-items">
              <a href="#" class="nav-item">快速打开</a>
              <a href="#" class="nav-item">命令面板</a>
              <a href="#" class="nav-item">大纲面板</a>
            </div>
          </div>
          <div class="nav-group">
            <button class="nav-group-title">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 18 6-6-6-6"/>
              </svg>
              设置
            </button>
            <div class="nav-group-items">
              <a href="#" class="nav-item">通用设置</a>
              <a href="#" class="nav-item">编辑器设置</a>
              <a href="#" class="nav-item">快捷键设置</a>
            </div>
          </div>
          <div class="nav-group">
            <button class="nav-group-title">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 18 6-6-6-6"/>
              </svg>
              文件管理
            </button>
            <div class="nav-group-items">
              <a href="#" class="nav-item">仓库</a>
              <a href="#" class="nav-item">文件树</a>
              <a href="#" class="nav-item">文件操作</a>
            </div>
          </div>
          <div class="nav-group">
            <button class="nav-group-title">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 18 6-6-6-6"/>
              </svg>
              知识管理
            </button>
            <div class="nav-group-items">
              <a href="#" class="nav-item">Wiki链接</a>
              <a href="#" class="nav-item">知识图谱</a>
              <a href="#" class="nav-item">反向链接</a>
            </div>
          </div>
          <div class="nav-group">
            <button class="nav-group-title">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 18 6-6-6-6"/>
              </svg>
              主题
            </button>
            <div class="nav-group-items">
              <a href="#" class="nav-item">内置主题</a>
              <a href="#" class="nav-item">代码高亮主题</a>
            </div>
          </div>
          <div class="nav-items">
            <a href="#" class="nav-item">白板画布</a>
            <a href="#" class="nav-item">思维导图</a>
            <a href="#" class="nav-item">发布网站</a>
            <a href="#" class="nav-item active">快速开始</a>
            <a href="#" class="nav-item">快捷键速查</a>
            <a href="#" class="nav-item">关于</a>
          </div>
        </nav>
      </aside>
      <main class="docs-content">
        <article class="docs-note">
          <h1 class="docs-title">快速开始</h1>
          <div class="docs-body">
            <p>Tydora 是一款基于 Tauri v2 + React 19 构建的现代化桌面 Markdown 编辑器，支持 WYSIWYG 编辑、知识管理、思维导图、白板画布等功能。</p>
            <h2 id="安装">安装</h2>
            <ol>
              <li>从 <a href="https://github.com/zuorn/Tydora/releases" target="_blank">GitHub Releases</a> 下载最新版本</li>
              <li>运行安装程序，按照提示完成安装</li>
              <li>启动 Tydora</li>
            </ol>
            <h2 id="打开仓库">打开仓库</h2>
            <p>Tydora 使用"仓库（Vault）"概念管理笔记文件。首次使用时：</p>
            <ol>
              <li>点击侧栏底部的仓库切换器</li>
              <li>选择"添加仓库"</li>
              <li>选择一个文件夹作为你的笔记仓库</li>
              <li>侧栏将显示该文件夹的文件树</li>
            </ol>
            <blockquote>参见 <a href="#" class="wikilink">仓库</a> 了解更多仓库管理功能。</blockquote>
            <h2 id="创建笔记">创建笔记</h2>
            <ol>
              <li>在侧栏文件树中右键点击</li>
              <li>选择"新建文件"</li>
              <li>输入文件名（如 <code>我的第一篇笔记.md</code>）</li>
              <li>开始编写 Markdown 内容</li>
            </ol>
            <h2 id="基本编辑">基本编辑</h2>
            <p>Tydora 支持两种 <a href="#" class="wikilink">编辑模式</a>：</p>
            <ul>
              <li><strong>即时渲染（IR/WYSIWYG）</strong>：直接在编辑器中看到最终效果，所见即所得</li>
              <li><strong>源码模式（SV）</strong>：纯文本编辑，使用 CodeMirror 6 提供语法高亮</li>
            </ul>
            <p>按 <code>Ctrl+/</code> 切换编辑模式。</p>
          </div>
        </article>
        <aside class="docs-toc">
          <h3>On this page</h3>
          <nav>
            <a href="#安装">安装</a>
            <a href="#打开仓库">打开仓库</a>
            <a href="#创建笔记">创建笔记</a>
            <a href="#基本编辑">基本编辑</a>
          </nav>
        </aside>
      </main>
    </div>
  </div>
</section>

<section class="section" id="features">
  <div class="section-header">
    <div class="label">核心特性</div>
    <h2>你所需要的一切，开箱即用</h2>
    <p>从写作到知识管理，从可视化到发布，Tydora 覆盖了笔记工作的完整流程。</p>
  </div>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round">
          <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>
        </svg>
      </div>
      <h3>双模式编辑</h3>
      <p>WYSIWYG 所见即所得 (TipTap 3.x) 与源码模式 (CodeMirror 6)，Ctrl+/ 随心切换，无滞于形。</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      </div>
      <h3>WikiLink 双向链接</h3>
      <p>Obsidian 风格的 [[双向链接]]，支持反向链接面板、自动补全，让知识互联互通。</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="3"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><line x1="14.41" y1="10.59" x2="17.12" y2="7.88"/><line x1="6.88" y1="17.12" x2="9.59" y2="14.41"/>
        </svg>
      </div>
      <h3>知识图谱</h3>
      <p>基于 D3.js 的力导向图，可视化文档间的链接关系。点若列宿，线若虹霓，万象森然。</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      </div>
      <h3>思维导图</h3>
      <p>从 Markdown 标题层级自动生成交互式思维导图，Markmap 驱动，一图统览脉络分明。</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
        </svg>
      </div>
      <h3>白板画布</h3>
      <p>React Flow 无限画布，支持文本、笔记、图片、URL 等多种节点类型，对齐参考线，自由创作。</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <h3>8 款精选主题</h3>
      <p>Mint、Liquid Glass、Claude Code 等精选配色 + 自定义 CSS 主题导入 + 11 种代码高亮配色。</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round">
          <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
        </svg>
      </div>
      <h3>丰富内容支持</h3>
      <p>Mermaid 图表、Callout 提示块、Frontmatter 元数据、数学公式、任务列表、代码高亮等。</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      </div>
      <h3>一键发布</h3>
      <p>将 Vault 发布为静态网站，支持完整发布和仅公开笔记两种模式，内置预览服务器。</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round">
          <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      </div>
      <h3>多窗口架构</h3>
      <p>设置、图谱、思维导图、画布等独立窗口运行，支持多显示器，工作空间自由扩展。</p>
    </div>
  </div>
</section>

<section class="tech-section" id="tech">
  <div class="section-header">
    <div class="label">技术栈</div>
    <h2>现代技术，极致体验</h2>
    <p>前沿技术选型，保证高性能和出色的开发体验。</p>
  </div>
  <div class="tech-grid">
    <div class="tech-item">
      <div class="tech-name">Tauri v2</div>
      <div class="tech-role">桌面框架</div>
    </div>
    <div class="tech-item">
      <div class="tech-name">React 19</div>
      <div class="tech-role">前端框架</div>
    </div>
    <div class="tech-item">
      <div class="tech-name">TypeScript</div>
      <div class="tech-role">类型安全</div>
    </div>
    <div class="tech-item">
      <div class="tech-name">Rust</div>
      <div class="tech-role">后端核心</div>
    </div>
    <div class="tech-item">
      <div class="tech-name">TipTap 3.x</div>
      <div class="tech-role">WYSIWYG 编辑器</div>
    </div>
    <div class="tech-item">
      <div class="tech-name">CodeMirror 6</div>
      <div class="tech-role">源码编辑器</div>
    </div>
    <div class="tech-item">
      <div class="tech-name">Vite 6</div>
      <div class="tech-role">构建工具</div>
    </div>
    <div class="tech-item">
      <div class="tech-name">D3.js</div>
      <div class="tech-role">知识图谱</div>
    </div>
    <div class="tech-item">
      <div class="tech-name">Markmap</div>
      <div class="tech-role">思维导图</div>
    </div>
    <div class="tech-item">
      <div class="tech-name">React Flow</div>
      <div class="tech-role">白板画布</div>
    </div>
    <div class="tech-item">
      <div class="tech-name">Zustand</div>
      <div class="tech-role">状态管理</div>
    </div>
    <div class="tech-item">
      <div class="tech-name">Highlight.js</div>
      <div class="tech-role">代码高亮</div>
    </div>
  </div>
</section>

<section class="section">
  <div class="section-header">
    <div class="label">文档导航</div>
    <h2>快速上手 Tydora</h2>
    <p>从入门到精通，文档涵盖了所有你需要了解的内容。</p>
  </div>
  <div class="links-grid">
    <a href="快速开始/" class="link-card" target="_blank">
      <div class="link-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <div>
        <div class="link-text">快速开始</div>
        <div class="link-desc">安装、创建仓库、开始写作</div>
      </div>
    </a>
    <a href="编辑器/编辑模式/" class="link-card" target="_blank">
      <div class="link-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </div>
      <div>
        <div class="link-text">编辑模式</div>
        <div class="link-desc">WYSIWYG &amp; 源码模式详解</div>
      </div>
    </a>
    <a href="知识管理/wiki链接/" class="link-card" target="_blank">
      <div class="link-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      </div>
      <div>
        <div class="link-text">Wiki 链接</div>
        <div class="link-desc">双向链接与知识网络</div>
      </div>
    </a>
    <a href="知识管理/知识图谱/" class="link-card" target="_blank">
      <div class="link-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/></svg>
      </div>
      <div>
        <div class="link-text">知识图谱</div>
        <div class="link-desc">可视化笔记关系网络</div>
      </div>
    </a>
    <a href="白板画布/" class="link-card" target="_blank">
      <div class="link-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>
      </div>
      <div>
        <div class="link-text">白板画布</div>
        <div class="link-desc">无限画布自由创作</div>
      </div>
    </a>
    <a href="发布网站/" class="link-card" target="_blank">
      <div class="link-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      </div>
      <div>
        <div class="link-text">发布网站</div>
        <div class="link-desc">一键发布 Vault 为静态网站</div>
      </div>
    </a>
    <a href="快捷键速查/" class="link-card" target="_blank">
      <div class="link-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M6 16h.01M10 16h.01M14 16h.01"/></svg>
      </div>
      <div>
        <div class="link-text">快捷键速查</div>
        <div class="link-desc">所有键盘快捷键一览</div>
      </div>
    </a>
    <a href="主题/内置主题/" class="link-card" target="_blank">
      <div class="link-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/><path d="M12 2a10 10 0 0 0 0 20"/></svg>
      </div>
      <div>
        <div class="link-text">主题系统</div>
        <div class="link-desc">8 款内置主题 &amp; 自定义 CSS</div>
      </div>
    </a>
  </div>
</section>

<footer class="footer">
  <div class="links">
    <a href="https://github.com/zuorn/Tydora" target="_blank">GitHub</a>
    <a href="https://github.com/zuorn/Tydora/releases" target="_blank">Releases</a>
    <a href="https://github.com/zuorn/Tydora/blob/main/LICENSE" target="_blank">Apache 2.0</a>
    <a href="关于/" target="_blank">关于</a>
  </div>
  <p>Built with ❤️ using Tauri v2 &amp; React 19. &copy; 2024–2026 Tydora.</p>
</footer>

<script>
  // Navbar Scroll Effect
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
  
  // Navbar Toggle (Mobile)
  const navbarToggle = document.getElementById('navbarToggle');
  const navbarLinks = document.querySelector('.navbar-links');
  navbarToggle.addEventListener('click', () => {
    navbarLinks.classList.toggle('active');
    navbarToggle.classList.toggle('active');
  });
</script>

</body>
</html>
`;

writeFileSync(dest, html, "utf-8");
console.log("✅ Landing page written to website/site/index.html");

// Fix 404.html redirect: /index -> /index/ (trailing slash for GitHub Pages)
const notFoundPath = resolve(__dirname, "../website/site/404.html");
try {
  let notFound = readFileSync(notFoundPath, "utf-8");
  notFound = notFound.replace(/\/index\b(?!\/)/g, "/index/");
  writeFileSync(notFoundPath, notFound, "utf-8");
  console.log("✅ 404.html redirect fixed to /index/");
} catch {
  console.log("⚠️ 404.html not found, skipping redirect fix");
}
