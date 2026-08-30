// Inimark 的 DSH 插件骨架（最小可加载版本）。
//
// 说明：
// - 本文件在 dsh/ 目录下，已被 Inimark 的 tsconfig（include 仅含 src）排除，
//   因此不会影响 Inimark 自身的 tsc / vite / tauri 构建。
// - `import type` 在编译时被擦除，运行时无 cordis 依赖；cordis 由 dsh 宿主提供。
//
// 想让 Inimark 真正给 DSH 智能体贡献能力时，在这里通过 ctx 注册工具 / 命令 / 服务。
// 参考：src/content/lessons/dev/02-write-tool/zh.mdx
import type { Context } from 'cordis'

export const name = 'inimark'

export function apply(ctx: Context) {
  // 最小骨架：加载即生效，目前不注册任何能力。
  // 示例（取消注释并补充实现即可启用）：
  // ctx.logger?.info('[inimark] plugin loaded')
}
