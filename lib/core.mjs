import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

export function run({ input = '', out = '' } = {}) {
  const dir = String(input || '').trim();
  if (!dir) return { ok: false, text: '请填写要检查的目录' };
  if (!existsSync(dir)) return { ok: false, text: '目录不存在：' + dir };
  const files = [];
  const 收 = (p) => {
    if (statSync(p).isDirectory()) { for (const n of readdirSync(p)) if (!n.startsWith('.')) 收(join(p, n)); return; }
    if (['.md', '.markdown', '.txt'].includes(extname(p).toLowerCase())) files.push(p);
  };
  收(dir);
  if (!files.length) return { ok: false, text: '没有找到 .md/.txt 文档' };
  const 问题 = [];
  let 总标题 = 0;
  for (const f of files) {
    const text = readFileSync(f, 'utf8');
    const rel = relative(dir, f);
    const 标题 = [];
    text.split('\n').forEach((l, i) => {
      const m = l.match(/^(#{1,6})\s+(.+)$/);
      if (!m) return;
      总标题 += 1;
      标题.push({ level: m[1].length, text: m[2].trim(), line: i + 1 });
    });
    if (!标题.length) { 问题.push({ f: rel, kind: '无标题', detail: '全文没有 Markdown 标题（#），结构不可导航' }); continue; }
    // 跳过层级
    for (let i = 1; i < 标题.length; i++) {
      if (标题[i].level > 标题[i - 1].level + 1) 问题.push({ f: rel, kind: '层级跳跃', detail: `第 ${标题[i].line} 行 H${标题[i - 1].level} → H${标题[i].level}「${标题[i].text}」` });
    }
    // 重复标题
    const 见 = new Map();
    for (const t of 标题) { const k = t.level + '|' + t.text; if (见.has(k)) 问题.push({ f: rel, kind: '重复标题', detail: `第 ${t.line} 行「${t.text}」与第 ${见.get(k)} 行重复` }); else 见.set(k, t.line); }
    // 空标题
    for (const t of 标题) if (!t.text) 问题.push({ f: rel, kind: '空标题', detail: `第 ${t.line} 行只有 #` });
  }
  const lines = ['文档结构体检：' + files.length + ' 个文件，' + 总标题 + ' 个标题', ''];
  if (!问题.length) lines.push('✅ 结构正常：无层级跳跃、无重复标题');
  else {
    lines.push('发现 ' + 问题.length + ' 处：');
    for (const p of 问题.slice(0, 60)) lines.push('  [' + p.kind + '] ' + p.f + ' —— ' + p.detail);
    if (问题.length > 60) lines.push('  … 还有 ' + (问题.length - 60) + ' 处');
  }
  return { ok: true, text: lines.join('\n') };
}
