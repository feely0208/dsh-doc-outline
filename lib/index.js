import { createPlugin, pkgRootFrom } from '@deepwhale-cn/dsh-guard-core/plugin';
import { registerApi } from './api.js';

const base = createPlugin({
  name: 'doc-outline',
  pkgRoot: pkgRootFrom(import.meta.url),
  skillFile: 'skill/doc-outline.md',
  binFile: 'bin/cli.mjs',
  description: '深鲸文档结构：检查 Markdown 标题层级跳跃、重复标题、空标题与无结构文档',
  whenToUse: '当用户要检查文档结构/目录时使用：扫 .md/.txt 的标题，报层级跳跃、重复标题、无结构。',
});
export const name = base.name;
export const inject = [...base.inject, 'webServer'];
export function apply(ctx) {
  base.apply(ctx);
  try { if (ctx.webServer?.register) registerApi(ctx); } catch (e) { ctx.logger?.warn?.('[doc-outline] 面板出口注册失败: ' + (e?.message || e)); }
}
