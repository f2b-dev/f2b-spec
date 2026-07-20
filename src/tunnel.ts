import { z } from "zod";

/** 隧道状态 */
export const TunnelStatusSchema = z.enum([
  "provisioning",
  "active",
  "closed",
  "failed",
]);
export type TunnelStatus = z.infer<typeof TunnelStatusSchema>;

/**
 * 创建隧道：把沙箱内某端口暴露为可访问的预览 URL。
 * dev 可直接传 targetUrl；生产由数据面根据 sandboxId+port 解析。
 */
export const CreateTunnelSchema = z.object({
  sandboxId: z.string().min(1).max(64),
  port: z.number().int().min(1).max(65535),
  name: z.string().min(1).max(128).optional(),
  /** 开发态直连目标；生产忽略，由 tunnel 服务解析沙箱网络 */
  targetUrl: z.string().url().optional(),
  projectId: z.string().min(1).max(64).default("default"),
  ttlSec: z.number().int().positive().max(24 * 60 * 60).optional(),
});
export type CreateTunnelInput = z.infer<typeof CreateTunnelSchema>;

export const TunnelRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  sandboxId: z.string(),
  port: z.number().int(),
  projectId: z.string(),
  status: TunnelStatusSchema,
  /** 对外预览 URL（含 path 前缀） */
  publicUrl: z.string(),
  /** 上游目标（服务端可见；产品 API 可脱敏） */
  targetUrl: z.string(),
  error: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  expiresAt: z.string().nullable(),
  closedAt: z.string().nullable(),
});
export type TunnelRecord = z.infer<typeof TunnelRecordSchema>;
