# f2b-spec

灵境云 / **F2B** 跨产品契约仓。

| 路径 | 内容 |
|------|------|
| `openapi/sandbox-v1.yaml` | 沙箱产品 REST OpenAPI |
| `openapi/tunnel-v1.yaml` | 隧道 REST OpenAPI |
| `errors/codes.json` | 统一错误码与建议 HTTP 状态 |
| `src/` | `@f2b/spec` TypeScript（Zod schema + `F2bError`） |

## 原则

- **契约真相来源**：服务实现与 SDK 对齐本仓，禁止各仓私自漂移字段名。
- **品牌**：对外文档写「灵境云」；包名 `@f2b/*`。
- **1.0 前**：不发 npm registry；消费方使用 `file:` / git 依赖。

## 版本约定（semver）

包版本遵循 **semver**（当前 `0.x` / 预 1.0）。OpenAPI 文件名带 major 暗示（`*-v1.yaml`），与包版本说明同步维护。

| 变更类型 | 版本影响 | 示例 |
|----------|----------|------|
| 文档、注释、非导出笔误 | **patch** | README |
| 新增可选字段、新错误码、新兼容资源 | **minor** | SSE 事件字段、`TunnelRecord` |
| 删除/改名必填字段、改变错误语义 | **major** | 必填形态变更 |

### 破坏性变更流程

1. PR 标题或标签标明 `breaking`，并列出影响仓：`f2b-sandbox` / `f2b-sdk-*` / `f2b-web` / `f2b-mcp-gateway` / `f2b-tunnel`。
2. **先加后删**：可选新字段或双写 → 文档 deprecate → 再在后续版本删除。
3. **发布列车**：本仓合并 → 实现服务契约 CI 绿灯 → SDK 对齐 → web BFF → docs。
4. **1.0 前**：允许较快 breaking，但必须在本 README「变更」或 PR 描述写清迁移方式。
5. **1.0 后**：至少保留 **一个 minor 的 deprecation 窗口** 再删字段。

HTTP 服务侧与契约对齐：路径前缀 `/v1`；换 major 时新增 `/v2` 或并行资源，避免静默改语义。

## 本地

```bash
pnpm install
pnpm typecheck
```

其他仓开发期：

```json
"@f2b/spec": "file:../f2b-spec"
```

CI：push / PR 到 `main` 时跑 typecheck（见 `.github/workflows/ci.yml`）。

## 相关

- 组织：https://github.com/f2b-dev
- 沙箱服务：https://github.com/f2b-dev/f2b-sandbox
- 版本与发版（文档站）：https://github.com/f2b-dev/f2b-docs（`architecture/versioning`）
- 架构设计（迁移源 Nova）：`Nova/docs/superpowers/specs/2026-07-20-f2b-org-multi-repo-design.md`
