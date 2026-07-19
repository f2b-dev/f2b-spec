# f2b-spec

灵境云 / **F2B** 跨产品契约仓。

| 路径 | 内容 |
|------|------|
| `openapi/sandbox-v1.yaml` | 沙箱产品 REST OpenAPI |
| `errors/codes.json` | 统一错误码与建议 HTTP 状态 |
| `src/` | `@f2b/spec` TypeScript（Zod schema + `F2bError`） |

## 原则

- **契约真相来源**：服务实现与 SDK 对齐本仓，禁止各仓私自漂移字段名。
- **版本**：semver；破坏性变更先加字段 / 双写，再 deprecate。
- **品牌**：对外文档写「灵境云」；包名 `@f2b/*`。

## 本地

```bash
pnpm install
pnpm typecheck
```

其他仓开发期可：

```json
"@f2b/spec": "file:../f2b-spec"
```

## 相关

- 组织：https://github.com/f2b-dev
- 沙箱服务：https://github.com/f2b-dev/f2b-sandbox
- 架构设计（迁移源 Nova）：见 `Nova/docs/superpowers/specs/2026-07-20-f2b-org-multi-repo-design.md`
