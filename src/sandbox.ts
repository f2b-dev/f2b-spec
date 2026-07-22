import { z } from "zod";

/** AI 沙箱状态 */
export const SandboxStatusSchema = z.enum([
  "provisioning",
  "running",
  "paused",
  "succeeded",
  "failed",
  "killed",
]);
export type SandboxStatus = z.infer<typeof SandboxStatusSchema>;

export const SandboxBackendKindSchema = z.enum(["fake", "cube"]);
export type SandboxBackendKind = z.infer<typeof SandboxBackendKindSchema>;

export const CreateSandboxSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  template: z.string().min(1).max(64).default("base"),
  timeoutMs: z.number().int().positive().max(24 * 60 * 60 * 1000).optional(),
  allowInternetAccess: z.boolean().default(false),
  /** 用户自定义标签（string→string）；控制面持久化，不进 guest 密钥 */
  metadata: z.record(z.string()).optional(),
  projectId: z.string().min(1).max(64).default("default"),
});
export type CreateSandboxInput = z.infer<typeof CreateSandboxSchema>;

/** PATCH 沙箱：延期 timeout、合并 metadata（活动态） */
export const UpdateSandboxSchema = z
  .object({
    /** 新的存活超时（从 startedAt 起算）；null 表示取消超时 */
    timeoutMs: z
      .number()
      .int()
      .positive()
      .max(24 * 60 * 60 * 1000)
      .nullable()
      .optional(),
    /** 浅合并进现有 metadata；值不可覆盖为非 string */
    metadata: z.record(z.string()).optional(),
  })
  .refine((v) => v.timeoutMs !== undefined || v.metadata !== undefined, {
    message: "at least one of timeoutMs, metadata required",
  });
export type UpdateSandboxInput = z.infer<typeof UpdateSandboxSchema>;

export const SandboxRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  template: z.string(),
  status: SandboxStatusSchema,
  projectId: z.string(),
  backend: SandboxBackendKindSchema,
  remoteId: z.string().nullable(),
  allowInternetAccess: z.boolean(),
  timeoutMs: z.number().int().nullable(),
  region: z.string(),
  cpu: z.string(),
  memory: z.string(),
  error: z.string().nullable(),
  /** 用户 metadata；缺省为空对象 */
  metadata: z.record(z.string()).default({}),
  createdAt: z.string(),
  updatedAt: z.string(),
  startedAt: z.string().nullable(),
  finishedAt: z.string().nullable(),
  durationSec: z.number().int().nonnegative(),
});
export type SandboxRecord = z.infer<typeof SandboxRecordSchema>;

export const RunCommandSchema = z.object({
  cmd: z.string().min(1).max(100_000),
  cwd: z.string().max(4096).optional(),
  timeoutMs: z.number().int().positive().max(30 * 60 * 1000).optional(),
  env: z.record(z.string()).optional(),
});
export type RunCommandInput = z.infer<typeof RunCommandSchema>;

export const CommandResultSchema = z.object({
  exitCode: z.number().int(),
  stdout: z.string(),
  stderr: z.string(),
  durationMs: z.number().int().nonnegative(),
});
export type CommandResult = z.infer<typeof CommandResultSchema>;

/** SSE 命令流事件（POST /v1/sandboxes/{id}/commands/stream） */
export const CommandStreamEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("stdout"), text: z.string() }),
  z.object({ type: z.literal("stderr"), text: z.string() }),
  z.object({ type: z.literal("result"), result: CommandResultSchema }),
  z.object({
    type: z.literal("error"),
    code: z.string(),
    message: z.string(),
  }),
]);
export type CommandStreamEvent = z.infer<typeof CommandStreamEventSchema>;

export const WriteFileSchema = z.object({
  path: z.string().min(1).max(4096),
  content: z.string().max(2_000_000),
  encoding: z.enum(["utf8", "base64"]).default("utf8"),
});
export type WriteFileInput = z.infer<typeof WriteFileSchema>;

export const ReadFileQuerySchema = z.object({
  path: z.string().min(1).max(4096),
  encoding: z.enum(["utf8", "base64"]).default("utf8"),
});
export type ReadFileQuery = z.infer<typeof ReadFileQuerySchema>;

/** DELETE /v1/sandboxes/{id}/files?path= */
export const DeleteFileQuerySchema = z.object({
  path: z.string().min(1).max(4096),
  /** 目录时删除其下全部条目（fake 前缀删除；Cube 视 envd） */
  recursive: z.boolean().optional().default(false),
});
export type DeleteFileQuery = z.infer<typeof DeleteFileQuerySchema>;

/** POST /v1/sandboxes/{id}/files/mkdir */
export const MkdirSchema = z.object({
  path: z.string().min(1).max(4096),
  /** 默认 true：创建中间目录 */
  recursive: z.boolean().optional().default(true),
});
export type MkdirInput = z.infer<typeof MkdirSchema>;

/** POST /v1/sandboxes/{id}/files/rename */
export const RenameFileSchema = z.object({
  from: z.string().min(1).max(4096),
  to: z.string().min(1).max(4096),
});
export type RenameFileInput = z.infer<typeof RenameFileSchema>;

export const FileEntrySchema = z.object({
  path: z.string(),
  name: z.string(),
  type: z.enum(["file", "dir"]),
  size: z.number().int().nonnegative().optional(),
});
export type FileEntry = z.infer<typeof FileEntrySchema>;

export const TemplateRefSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  image: z.string().optional(),
  tags: z.array(z.string()).default([]),
  popular: z.boolean().optional(),
});
export type TemplateRef = z.infer<typeof TemplateRefSchema>;

/** 创建时 template 字段取 id；与控制台目录对齐 */
export const BUILTIN_TEMPLATES: TemplateRef[] = [
  {
    id: "base",
    name: "Base Linux",
    description: "精简 Linux 根文件系统，适合通用命令与脚本执行。",
    image: "lingjing/base:latest",
    tags: ["linux", "shell"],
    popular: true,
  },
  {
    id: "code-interpreter",
    name: "Code Interpreter",
    description: "预装 Python、Node 等，适合 Agent 写代码与分析。",
    image: "lingjing/code-interpreter:latest",
    tags: ["python", "node", "data"],
    popular: true,
  },
  {
    id: "browser",
    name: "Browser (soon)",
    description: "带无头浏览器的模板，用于页面抓取与 UI 自动化（路线图）。",
    image: "lingjing/browser:preview",
    tags: ["browser", "preview"],
  },
];

/** 用量按 UTC 日聚合的一天桶 */
export const UsageDayBucketSchema = z.object({
  day: z.string(),
  sandboxHours: z.number().nonnegative(),
  commands: z.number().int().nonnegative(),
  durationMs: z.number().nonnegative(),
});
export type UsageDayBucket = z.infer<typeof UsageDayBucketSchema>;

/** GET /v1/usage 响应中的 usage 对象 */
export const UsageSummarySchema = z.object({
  days: z.number().int().positive(),
  totalDurationMs: z.number().nonnegative(),
  totalSandboxHours: z.number().nonnegative(),
  totalCommands: z.number().int().nonnegative(),
  byDay: z.array(UsageDayBucketSchema),
});
export type UsageSummary = z.infer<typeof UsageSummarySchema>;
