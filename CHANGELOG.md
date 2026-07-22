# Changelog

本文件遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)。  
组织约定见 [f2b-meta RELEASE.md](https://github.com/f2b-dev/f2b-meta/blob/main/RELEASE.md)。

## [Unreleased]

### Added

- `pnpm pack:check`：1.0 前 tarball 审阅（不 publish）
- Spectral OpenAPI lint（`.spectral.yaml`）与 `pnpm lint:openapi` / `pnpm ci`
- 错误码 `check:errors` 与 OpenAPI / Zod 双源说明

### Changed

- devDependency `@stoplight/spectral-cli` 6.14.2 → 6.16.2
- OpenAPI servers 示例指向 `127.0.0.1:13287`

## [0.1.0] - 2026-07

- 初始契约：`openapi/sandbox-v1.yaml`、`openapi/tunnel-v1.yaml`、`errors/codes.json`、Zod `src/`
