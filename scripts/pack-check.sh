#!/usr/bin/env bash
# 1.0 前：本地/CI 打包审阅，**绝不** npm publish。
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf .pack-check && mkdir -p .pack-check
# 避免 file: 依赖污染 tarball 路径展示
pnpm pack --pack-destination .pack-check
TGZ=$(ls -1 .pack-check/*.tgz | head -1)
echo "packed: $TGZ"
tar -tzf "$TGZ" | head -80
# 拒绝常见泄密路径
if tar -tzf "$TGZ" | grep -E '(^package/\.env|/\.env\.|credentials|/data/|\.pem$|\.key$)' >/dev/null; then
  echo "pack-check: refuse — tarball contains sensitive-looking paths" >&2
  exit 2
fi
# 必须含契约面
tar -tzf "$TGZ" | grep -q 'package/openapi/sandbox-v1.yaml'
tar -tzf "$TGZ" | grep -q 'package/src/index.ts'
echo "PACK_CHECK_OK name=@f2b/spec"
rm -rf .pack-check
