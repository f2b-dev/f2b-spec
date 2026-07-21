/** 控制面 / SDK 统一错误码 */
export const ErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  SANDBOX_NOT_FOUND: "SANDBOX_NOT_FOUND",
  SANDBOX_NOT_RUNNING: "SANDBOX_NOT_RUNNING",
  SANDBOX_ALREADY_TERMINAL: "SANDBOX_ALREADY_TERMINAL",
  INVALID_PATH: "INVALID_PATH",
  COMMAND_TIMEOUT: "COMMAND_TIMEOUT",
  COMMAND_FAILED: "COMMAND_FAILED",
  BACKEND_UNAVAILABLE: "BACKEND_UNAVAILABLE",
  /** 单机并发 running/provisioning 达上限 */
  CAPACITY_EXCEEDED: "CAPACITY_EXCEEDED",
  TUNNEL_NOT_FOUND: "TUNNEL_NOT_FOUND",
  TUNNEL_ALREADY_CLOSED: "TUNNEL_ALREADY_CLOSED",
  UNAUTHORIZED: "UNAUTHORIZED",
  INTERNAL: "INTERNAL",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export type ApiErrorBody = {
  code: ErrorCode;
  message: string;
  details?: unknown;
};

/** 灵境云 / F2B 统一错误类型（原 NovaError） */
export class F2bError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(
    code: ErrorCode,
    message: string,
    options?: { status?: number; details?: unknown; cause?: unknown },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = "F2bError";
    this.code = code;
    this.status = options?.status ?? statusForCode(code);
    this.details = options?.details;
  }

  toJSON(): ApiErrorBody {
    return {
      code: this.code,
      message: this.message,
      ...(this.details !== undefined ? { details: this.details } : {}),
    };
  }
}

export function statusForCode(code: ErrorCode): number {
  switch (code) {
    case ErrorCode.VALIDATION_ERROR:
    case ErrorCode.INVALID_PATH:
      return 400;
    case ErrorCode.UNAUTHORIZED:
      return 401;
    case ErrorCode.NOT_FOUND:
    case ErrorCode.SANDBOX_NOT_FOUND:
    case ErrorCode.TUNNEL_NOT_FOUND:
      return 404;
    case ErrorCode.TUNNEL_ALREADY_CLOSED:
      return 409;
    case ErrorCode.SANDBOX_NOT_RUNNING:
    case ErrorCode.SANDBOX_ALREADY_TERMINAL:
      return 409;
    case ErrorCode.COMMAND_TIMEOUT:
      return 408;
    case ErrorCode.BACKEND_UNAVAILABLE:
      return 503;
    case ErrorCode.CAPACITY_EXCEEDED:
      return 429;
    case ErrorCode.COMMAND_FAILED:
      return 422;
    default:
      return 500;
  }
}
