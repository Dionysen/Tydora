# 文档站主题配置

`website/docs-theme.config.json` 控制文档页如何从 Inimark 主题生成 `site-docs-theme.css`。

## 方式一：指定内置主题（推荐）

```json
{
  "light": "white",
  "dark": "mint-dark"
}
```

`light` / `dark` 可选值：

- **`landing`** — 与官网落地页一致的 Ink/Silver 黑白灰（默认）
- 应用内置主题 ID：`white`、`mint`、`mint-dark`、`modern-dark`、`claude-code`、`purple`、`hermes`、`next`、`slate`、`ocean`

内置色板来自 `src/themes/themeTokens.ts`，构建前会同步到 `website/shared/builtin-theme-colors.json`。

## 方式二：导入主题包

在应用 **设置 → 主题** 中导出主题包（`.json`），放到仓库后配置：

```json
{
  "light": "landing",
  "dark": "landing",
  "themePack": "website/shared/my-site-theme-pack.json"
}
```

当 `themePack` 非空时，文档站明暗色分别使用包内 `app.light` / `app.dark` 的变量，忽略 `light` / `dark` 字段。

## 重新生成

```bash
npm run generate:docs-theme
# 或完整文档构建（会自动生成）
npm run docs:build
```
