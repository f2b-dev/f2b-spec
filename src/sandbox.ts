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
  metadata: z.record(z.string()).optional(),
  projectId: z.string().min(1).max(64).default("default"),
});
export type CreateSandboxInput = z.infer<typeof CreateSandboxSchema>;

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
});
export type TemplateRef = z.infer<typeof TemplateRefSchema>;

export const BUILTIN_TEMPLATES: TemplateRef[] = [
  {
    id: "base",
    name: "Base Linux",
    description: "精简 Linux 环境，适合通用命令与脚本。",
    tags: ["linux", "shell"],
  },
  {
    id: "code-interpreter",
    name: "Code Interpreter",
    description: "预装 Python / Node 运行时，适合代码执行与数据分析。",
    tags: ["python", "node", "code"],
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
