#!/bin/bash
set -uo pipefail
cd "$(dirname "$0")/.."
PASS=0; FAIL=0
ok(){ echo "  ✅ $1"; PASS=$((PASS+1)); }
bad(){ echo "  ❌ $1"; FAIL=$((FAIL+1)); }
T=$(mktemp -d)
printf '# 一\n### 跳过二级\n## 二\n## 二\n' > "$T/bad.md"
printf '# 一\n## 二\n### 三\n' > "$T/good.md"
OUT=$(node bin/cli.mjs --input "$T/bad.md" 2>&1)
echo "$OUT" | grep -q "层级跳跃" && ok "检出层级跳跃" || bad "漏层级跳跃：$OUT"
echo "$OUT" | grep -q "重复标题" && ok "检出重复标题" || bad "漏重复标题"
OUT2=$(node bin/cli.mjs --input "$T/good.md" 2>&1)
echo "$OUT2" | grep -q "结构正常" && ok "正常文档无问题" || bad "误报：$OUT2"
echo "  ────────────────────────────────────────"; echo "  通过 $PASS · 失败 $FAIL"; rm -rf "$T"; [ "$FAIL" -eq 0 ]
